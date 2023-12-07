import { useEffect, useReducer, useRef, useState } from 'react'

// TODO: Get endpoint from configuration/env
const endpointUrl = 'http://localhost:3000/api'

const delay = async( ms ) => {
    return new Promise( ( r ) => setTimeout( r, ms ) )
}

export default function useFetch() {
    /** @type {[Record<string, any>, (prev) => prev ]} */
    const [ results, setResults ] = useState()
    const [ fetchSignal, setFetchSignal ] = useState( 0 )
    const prevQuery = useRef( '' )

    const requestData = useRef( {
        url: '',
        query: {},
        body: {},
        options: {},
    } )

    const initial = { isFetching: false, isComplete: false, isError: false, isInitialized: false }

    const updateFetchStatusReducer = ( state, action = {} ) => {
        switch ( action.status ) {
            case 'isComplete':
                return {
                    isFetching: false,
                    isComplete: true,
                    isError: false,
                    isInitialized: true,
                }
            case 'isError':
                return {
                    isFetching: false,
                    isComplete: false,
                    isError: true,
                    isInitialized: true,
                }
            case 'isFetching':
                return {
                    isFetching: true,
                    isComplete: false,
                    isError: false,
                    isInitialized: true,
                }
            default:
                return {
                    isFetching: false,
                    isComplete: false,
                    isError: false,
                    isInitialized: true,
                }
        }
    }

    /** @type {[any,any]} */
    const [ fetchStatus, updateFetchStatus ] = useReducer( updateFetchStatusReducer, initial )

    // useEffect( () => {
    // }, [] )

    useEffect( () => {
        if ( ! requestData.current.url ) {
            return
        }

        const fetchData = async() => {
            console.log( 'Fetchsignal = ', fetchSignal )
            if ( fetchStatus.isFetching ) {
                return
            }

            const query = { ...requestData.current.query }

            if ( query.filter ) {
                query.filter = JSON.stringify( requestData.current.query.filter )
            }

            const queryParams = new URLSearchParams( query )
            const queryString = queryParams.size ? `?${ queryParams }` : ''
            const requestEndpointUrl = endpointUrl + requestData.current.url
            const requestUrl = requestEndpointUrl + queryString

            // Abort if query has not changed
            const stringifiedQuery = JSON.stringify( requestData.current )
            if ( prevQuery.current === stringifiedQuery ) {
                return
            }
            prevQuery.current = stringifiedQuery

            console.log( 'Fetching URL:', requestUrl, ' Query:', query, ' Body:', requestData.current.options?.body )

            updateFetchStatus( { status: 'isFetching' } )

            // ! Testing !
            // Short delay for testing
            await delay( 1000 )

            try {
                const request = await fetch( requestUrl, requestData.current.options )
                const json = await request.json()

                if ( ! request.ok ) {
                    throw new Error( `${request.status } ${ request.statusText }.\nResponse body:\n${ JSON.stringify( json )}` )
                }

                console.log( `Fetched data for URL:`, requestUrl, '\n', json )
                setResults( json )
            }
            catch ( e ) {
                console.error( `FETCH ERROR:\n\n${ e}` )
                updateFetchStatus( { status: 'isError' } )

                return
            }
            updateFetchStatus( { status: 'isComplete' } )
        }

        fetchData()
    }, [ fetchSignal ] )

    const triggerFetch = () => setFetchSignal( ( prev ) => ++prev )

    return {
        get data() {
            return results
        },
        get isFetching() {
            return fetchStatus.isFetching
        },
        get isComplete() {
            return fetchStatus.isComplete
        },
        get isError() {
            return fetchStatus.isError
        },
        get isInitialized() {
            return fetchStatus.isInitialized
        },
        fetch(fetchUrl, params = {}, forceFetch = false) {
            return new Promise((resolve, reject) => {
                updateFetchStatus();

                requestData.current = {
                    url: fetchUrl,
                    options: params.options,
                    body: params.body,
                    query: params.query,
                };

                // Invalidate previous query
                if (forceFetch) {
                    prevQuery.current = '';
                }

            triggerFetch()
        });
    },
        refetch() {
            console.log( 'REFETCH???', fetchStatus.isInitialized, requestData.current )
            if ( fetchStatus.isInitialized ) {
                console.log( 'REFETCH!!!!!!!!!!!!!!!!!!!!', requestData.current )
                prevQuery.current = undefined
                triggerFetch()
            }
        },
        reset() {
            setResults( undefined )
            updateFetchStatus()
        },
    }
}

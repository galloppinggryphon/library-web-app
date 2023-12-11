import { useEffect, useReducer, useRef, useState } from 'react'

// TODO: Get endpoint from configuration/env

const endpointUrl = API_ENDPOINT_URL

// API_ENDPOINT_URL

const delay = async( ms ) => {
    return new Promise( ( r ) => setTimeout( r, ms ) )
}

/**
 * Wrapper for Window.fetch()
 *
 * @param {boolean} fetchJson Apply default headers for fetching JSON data
 * @param {Record<string,any>} defaultHeaders Apply headers to all fetch operations.
 */
export default function useFetch( fetchJson = true, defaultHeaders = undefined ) {
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

    defaultHeaders ??= {}
    if ( fetchJson ) {
        // Apply to defaultHeaders but don't overwrite
        Object.assign( defaultHeaders, {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        }, defaultHeaders )
    }

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
                return state
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
            if ( fetchStatus.isFetching ) {
                return
            }

            const { current } = requestData

            const query = { ...current.query }

            if ( query.filter ) {
                query.filter = JSON.stringify( current.query.filter )
            }

            const queryParams = new URLSearchParams( query )
            const queryString = queryParams.size ? `?${ queryParams }` : ''
            const requestEndpointUrl = endpointUrl + current.url
            const requestUrl = requestEndpointUrl + queryString

            // Abort if query has not changed
            const stringifiedQuery = JSON.stringify( current )
            if ( prevQuery.current === stringifiedQuery ) {
                return
            }
            prevQuery.current = stringifiedQuery

            // Apply header override
            const { options } = current

            console.log( 'Fetching URL:', requestUrl, ' Query:', query, ' Body:', options.body, ' Headers:', options.headers )

            updateFetchStatus( { status: 'isFetching' } )

            // ! Testing !
            // Short delay for testing
            await delay( 1000 )

            try {
                const request = await fetch( requestUrl, current.options )
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
        /**
         * @param {string} fetchUrl
         * @param {{options?: Record<string,any>, body?: Record<string,any>, query?: Record<string,any>}} params
         * @param {boolean} forceFetch
         */
        fetch( fetchUrl, params = {}, forceFetch = false ) {
            updateFetchStatus()

            params.options ??= {}
            params.options.headers = {
                ...defaultHeaders,
                ...params.options.headers ?? {},
            }

            requestData.current = {
                url: fetchUrl,
                options: params.options,
                body: params.body,
                query: params.query,
            }

            // Invalidate previous query
            if ( forceFetch ) {
                prevQuery.current = ''
            }

            triggerFetch()
        },
        refetch() {
            if ( fetchStatus.isInitialized ) {
                console.log('Fetching fresh results. URL:',)requestData.current.url
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

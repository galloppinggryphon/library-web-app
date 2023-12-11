// api/use-authentication.js
import authContext from './auth-context'
import { useContext, useEffect, useState } from 'react'
import useFetch from './use-fetch'

export default function useAuthentication() {
    const [ isLoading, setIsLoading ] = useState( true )
    const auth = useContext( authContext )
    const userAuth = useFetch()

    const { isTokenValid, isSessionValid, setIsSessionValid, isTokenExpired, setIsTokenExpired, isUserSignedOut, setIsUserSignedOut } = auth.flags

    useEffect( () => {
        if ( userAuth.userId !== null ) {
            setIsLoading( false )
        }
    }, [ auth.userId ] )

    // On sign in complete
    useEffect( () => {
        if ( userAuth.isComplete ) {
            if ( isLoading ) {
                setIsLoading( false )
            }

            if ( userAuth.data.success ) {
                const { data } = userAuth
                console.log( 'Signed in!', data )
                auth.setSession( { userId: data.user._id, token: data.token, expires: data.expires } )
                setIsSessionValid( true )
            }
        }
    }, [ userAuth.isComplete, isLoading ] )

    useEffect( () => {
        if ( userAuth.isError ) {
            auth.setSession( {} )
        }
    }, [ userAuth.isError ] )

    // Reset auth flags
    useEffect( () => {
        if ( ! isTokenValid && isSessionValid ) {
            setIsSessionValid( false )

            if ( ! isTokenExpired ) {
                setIsTokenExpired( true )
            }
            return
        }

        if ( isUserSignedOut ) {
            setIsUserSignedOut( false )
        }

        if ( isTokenExpired ) {
            setIsTokenExpired( false )
        }
    }, [ isTokenValid, isSessionValid, isTokenExpired, isUserSignedOut ] )

    return {
        _data: userAuth.data,
        _status: userAuth.status,

        get isReady() {
            return ! isLoading
        },
        get isTokenExpired() {
            return isTokenExpired
        },
        resetIsTokenExpired() {
            setIsTokenExpired( false )
        },
        get isSignedIn() {
            return isTokenValid
        },
        get signInError() {
            return userAuth.isError
        },
        get isSignInFailed() {
            return userAuth.isError
        },
        get isSigningIn() {
            return userAuth.isFetching
        },
        get isGettingStatus() {
            return isLoading
        },
        get userId() {
            return auth.userId
        },
        signIn( email, password, shortSession = false ) {
            console.log( 'Signing in with email and password:', email, password )
            const options = {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( { email, password, shortSession } ),
            }
            userAuth.fetch( `/auth/login`, { options }, true )
        },
        signOut() {
            try {
                auth.setSession( {} )
                setIsUserSignedOut( true )
            }
            catch ( error ) {
                console.error( 'Error during sign-out:', error )
            }
        },
    }
}

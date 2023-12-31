import { createContext } from 'react'
const authContext = createContext( {
    // Auth info
    userId: undefined,
    token: undefined,
    setSession: undefined,

    // Flags
    flags: {
        isSessionValid: false,
        isTokenExpired: false,
        isUserSignedOut: false,
        setIsTokenExpired: undefined,
        setIsSessionValid: undefined,
    },

} )
export default authContext

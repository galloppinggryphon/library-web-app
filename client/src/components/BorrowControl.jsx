import { Alert, Box, Button, CircularProgress, Link, Stack, Typography } from '@mui/material'
import useLibrary from '@/api/use-library'
import { useEffect, useState } from 'react'
import NavLink from './NavLink'

/**
 * @param {*} props
 */
export default function BorrowControl( { book, userId, isSignedIn } ) {
    const { _id: bookId } = book ?? {}

    const env = import.meta.env.MODE

    const library = useLibrary( userId )

    const handleBorrow = () => {
        library.borrow( bookId )
    }

    useEffect( () => {
        if ( bookId ) {
            library.getBookAvailability( bookId )
        }
        if ( userId && bookId ) {
            library.getBorrowStatus( bookId )
        }
    }, [ userId, bookId ] )

    if ( library.isCheckoutStatusChangePending || library.isCheckoutStatusCheckPending || library.isBookAvailabilityCheckPending ) {
        return <CircularProgress />
    }

    return (
        <Stack>
            <Box>
                <Typography variant="subtitle1" gutterBottom>
                    Available: { library.bookAvailability === -1 ? 'n/a' : library.bookAvailability }
                </Typography>
            </Box>
            <Stack direction="row" spacing={ 5 } alignItems="center" mt={ 3 }>
                {
                    library.isCheckedOutByUser && <>
                        <Alert severity='success' >Currently checked out</Alert>
                    </>
                }
                {
                    ! library.isCheckedOutByUser && <>
                        {
                            library.bookAvailability === 0 && <>
                                <Alert severity="warning">No copies available.</Alert>
                            </>
                        }
                        {
                            library.bookAvailability > 0 && <>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={ handleBorrow }
                                    size="large"
                                    { ...{ disabled: ! isSignedIn } }
                                >
                                    Borrow this book
                                </Button>
                            </>
                        }
                    </>
                }

                { ! isSignedIn && <>
                    <Typography fontSize="0.9em important">
                        <NavLink to="/signin">Sign in</NavLink> or <NavLink to="/signup">sign up</NavLink> to borrow books!
                    </Typography>
                </> }

            </Stack>
        </Stack>

    )
}

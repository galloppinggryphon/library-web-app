import { Alert, Box, Button, Link, Stack, Typography } from '@mui/material'
import useLibrary from '@/api/use-library'
import { useEffect, useState } from 'react'
import NavLink from './NavLink'

/**
 * @param {*} props
 */
export default function BorrowControl( { book, user } ) {
    const { bookId } = book ?? {}
    const library = useLibrary( user.userId )
    const [ availableCopies, setAvailableCopies ] = useState( -1 )

    const handleBorrow = () => {
        library.borrow( bookId )
    }

    useEffect( () => {
        if ( user.userId && bookId ) {
            library.getBorrowStatus( bookId )
        }
    }, [ user.userId, bookId ] )

    return (
        <Stack>
            <Box>
                <Typography variant="subtitle1" gutterBottom>
                    Available: { availableCopies === -1 ? 'n/a' : availableCopies }
                </Typography>
            </Box>
            <Stack direction="row" spacing={ 5 } alignItems="center" mt={ 3 }>
                {
                    library.request.isComplete && <>
                        <Alert severity='success' >You have checked out this book :)</Alert>
                    </>
                }
                {
                    library.isCheckedOutByUser && <>
                        <Alert severity='info' >Currently checked out</Alert>
                    </>
                }
                {
                    ! library.isCheckedOutByUser && isAvailable && <>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={ handleBorrow }
                            size="large"
                            { ...{ disabled: ! user.isSignedIn } }
                        >
                            Borrow this book
                        </Button>
                        { ! user.isSignedIn && <>
                            <Typography fontSize="0.9em important">
                                <NavLink to="/signin">Sign in</NavLink> or <NavLink to="/signup">sign up</NavLink> to borrow this book.
                            </Typography>
                        </> }
                    </>
                }
                {
                    ! availableCopies && ! isAvailable && <>
                        <Alert severity="warning">No copies available.</Alert>
                    </>
                }
            </Stack>
        </Stack>

    )
}
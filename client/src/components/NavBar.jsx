import React from 'react'
import {
    Menu,
    MenuItem,
    IconButton,
    Stack,
    useMediaQuery,
    Link,
    Box,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import NavLink from './NavLink'
import useAuthentication from '@/api/use-authentication'

export function NavBar() {
    const [ anchorEl, setAnchorEl ] = React.useState( null )
    const isMobile = useMediaQuery( '(max-width:1000px)' )
    const auth = useAuthentication()

    const handleClick = ( event ) => {
        setAnchorEl( event.currentTarget )
    }

    const handleClose = () => {
        setAnchorEl( null )
    }

    return (
        <Stack
            component="nav"
            className="main-menu"
            direction="row"
            justifyContent={ isMobile ? 'flex-end' : 'space-between' }
            flexGrow="1"
            width="100%"
        >
            { isMobile ? (
                <>
                    <IconButton
                        aria-label="menu"
                        aria-controls="simple-menu"
                        aria-haspopup="true"
                        onClick={ handleClick }
                    >
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        anchorEl={ anchorEl }
                        open={ Boolean( anchorEl ) }
                        onClose={ handleClose }
                    >
                        { /* Existing menu items */ }
                        <MenuItem onClick={ handleClose }>
                            <NavLink href="/">Home</NavLink>
                        </MenuItem>
                        <MenuItem onClick={ handleClose }>
                            <NavLink href="/explore">Explore Books</NavLink>
                        </MenuItem>
                        <MenuItem onClick={ handleClose }>
                            <NavLink href="/account">My Account</NavLink>
                        </MenuItem>
                        { auth.isSignedIn ? (
                            <MenuItem onClick={ () => auth.signOut() }>
                                <NavLink href="/">Sign out</NavLink>
                            </MenuItem>
                        ) : (
                            <MenuItem onClick={ handleClose }>
                                <NavLink href="/signin" variant="body2">
                                    Sign in
                                </NavLink>
                            </MenuItem>
                        ) }
                    </Menu>
                </>
            ) : (
                <Stack
                    direction="row"
                    spacing={ 5 }
                    alignItems="center"
                    justifyContent="space-between"
                    flexGrow="1"
                >
                    <Stack direction="row" spacing={ 5 } alignItems="center">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/explore">Explore Books</NavLink>
                        <NavLink to="/account">My Account</NavLink>
                    </Stack>
                    <Box alignSelf="flex-end">
                        { auth.isSignedIn ? (
                            <NavLink
                                asButton
                                variant="outlined"
                                onClick={ () => auth.signOut() }
                                sx={ { fontSize: '0.9em !important' } }
                            >
                                Sign out
                            </NavLink>
                        ) : (
                            <NavLink
                                asButton
                                variant="outlined"
                                to="/signin"
                                sx={ { fontSize: '0.9em !important' } }
                            >
                                Sign In
                            </NavLink>
                        ) }
                    </Box>
                </Stack>
            ) }
        </Stack>
    )
}

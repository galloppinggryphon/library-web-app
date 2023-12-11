import { Alert, Box, Stack, Container } from '@mui/material'
import { NavBar } from './NavBar'
import EtherealLogo from '@/assets/ethereal_logo_with_text.png'
import { useLocation } from 'react-router-dom'
import { useContext } from 'react'
import authContext from '@/api/auth-context'
import ToggleColourMode from './toggle-colour-mode'
import HeroSection from './HeroSection'

export default function Header() {
    const location = useLocation()
    const { flags } = useContext( authContext )

    const isHome = location.pathname === '/'

    return (
        <Stack
            id="header"
            mb={ 10 }
        >
            <Container>
                <Stack direction="row" spacing={ 10 } p={ 2 } pb={ { xs: 4, sm: 8 } } pt={ { xs: 4, sm: 8 } } alignItems="end">
                    <Box width="100%" maxWidth={ 200 }>
                        { /* Visually hidden header for screen readers */ }
                        <Box
                            component={ isHome ? 'h1' : 'span' }
                            className="visuallyhidden"
                        >
                            Ethereral
                        </Box>
                        <a href="/">
                            <img src={ EtherealLogo } alt="Ethereral" />
                        </a>
                    </Box>
                    <Stack direction="row" flexGrow="1">
                        <NavBar />
                    </Stack>
                </Stack>
                { flags.isUserSignedOut && (
                    <Box mb={ 4 }>
                        <Alert severity="info">You have been signed out.</Alert>
                    </Box>
                ) }
                { flags.isTokenExpired && ! flags.isUserSignedOut && (
                    <Box mb={ 4 }>
                        <Alert severity="warning">
                            Session has expired, please sign in again.
                        </Alert>
                    </Box>
                ) }
                { isHome && <HeroSection /> }
            </Container>
        </Stack>
    )
}

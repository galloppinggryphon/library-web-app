import { useEffect, useState } from 'react'
import {
    Autocomplete,
    Container,
    Box,
    Grid,
    Paper,
    TextField,
    Typography,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    CircularProgress,
    IconButton,
} from '@mui/material'
import useBookData from '@/api/use-book-data.js'
import NavLink from '@/components/NavLink.jsx'

import SearchIcon from '@mui/icons-material/Search'

const ExplorePage = () => {
    // Image folder is relative to /public
    const imageFolder = '/book-cover/'

    const [ searchValue, setSearchValue ] = useState( '' )
    const [ sortOrder, setSortOrder ] = useState( 'asc' ) // Default sorting order is ascending
    const [ sortBy, setSortBy ] = useState( 'title' ) // Default sorting type is title

    const [ isLoading, setIsLoading ] = useState( true )

    const bookRequest = useBookData()

    const handleSearchChange = ( e ) => {
        setSearchValue( e.target.value )
    }

    const handleSortToggle = () => {
        // Toggle between ascending and descending order
        setSortOrder( ( prevOrder ) => ( prevOrder === 'asc' ? 'desc' : 'asc' ) )
    }

    const handleSortTypeChange = ( event ) => {
        setSortBy( event.target.value )
    }

    const handleSearch = () => {
        bookRequest.getBooks( { sortBy, sortOrder, search: searchValue } )
        setIsLoading( true )
    }

    useEffect( () => {
        bookRequest.getBooks( { sortBy, sortOrder, search: searchValue } )
        setIsLoading( true )
    }, [ sortBy, sortOrder ] )

    useEffect( () => {
        if ( bookRequest.status.isComplete || bookRequest.status.isError ) {
            setIsLoading( false )
        }
    }, [ bookRequest.status.isComplete ] )

    return (
        <Container>
            <Container sx={ { mt: { xs: 3, sm: 0 } } }>
                <h1>Explore</h1>
            </Container>
            { bookRequest.status.isError && (
                <Paper>
                    <Box p={ 3 }>An error occurred</Box>
                </Paper>
            ) }
            { ! bookRequest.status.isError && Array.isArray( bookRequest.data ) && (
                <>
                    <Container>
                        <Stack
                            direction={ { xs: 'column', sm: 'row' } }
                            justifyContent="space-between"
                            alignItems="center"
                            mb={ 5 }
                            sx={ { flexWrap: 'wrap' } }
                        >
                            <TextField
                                id="standard-name"
                                label="Search by Author Or Title"
                                value={ searchValue }
                                onChange={ handleSearchChange }
                                InputProps={ {
                                    endAdornment: (
                                        <IconButton
                                            edge="end"
                                            color="primary"
                                            onClick={ handleSearch }
                                            disabled={ isLoading }
                                        >
                                            <SearchIcon />
                                        </IconButton>
                                    ),
                                } }
                                sx={ { width: { xs: '70%', sm: 400 } } }
                                disabled={ isLoading }
                            />

                            <Stack
                                direction="row"
                                justifyContent="end"
                                alignItems="center"
                            >
                                <Button
                                    disabled={ isLoading }
                                    onClick={ handleSortToggle }
                                    sx={ { marginLeft: { xs: '0', sm: '20px' } } }
                                >
                                    <Typography variant="body2">
                                        { sortOrder === 'asc'
                                            ? 'Sort Descending'
                                            : 'Sort Ascending' }
                                    </Typography>
                                </Button>
                                <FormControl
                                    sx={ {
                                        marginLeft: '10px',
                                        minWidth: '120px',
                                    } }
                                >
                                    <InputLabel id="sort-type-label">
                                        Sort Type
                                    </InputLabel>
                                    <Select
                                        labelId="sort-type-label"
                                        id="sort-type"
                                        value={ sortBy }
                                        label="Sort Type"
                                        onChange={ handleSortTypeChange }
                                        disabled={ isLoading }
                                    >
                                        <MenuItem value="title">Title</MenuItem>
                                        <MenuItem value="author">
                                            Author
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                        </Stack>
                    </Container>

                    { isLoading && (
                        <Container>
                            <CircularProgress />
                        </Container>
                    ) }
                    <Container style={ { margin: '0', padding: '0' } }>
                        { ! isLoading && ! bookRequest.data.length && (
                            <>
                                <Box bgcolor="#eee" p={ 2 }>
                                    <Typography fontSize="1.2em !important">
                                        No books matched your query.
                                    </Typography>
                                </Box>
                            </>
                        ) }
                        { ! isLoading && !! bookRequest.data.length && (
                            <Grid
                                container
                                spacing={ 0 }
                                columnSpacing={ { xs: 1, sm: 2, md: 3 } }
                            >
                                { bookRequest.data.map( ( item, index ) => (
                                    <Grid
                                        item
                                        xs={ 12 }
                                        sm={ 6 }
                                        md={ 4 }
                                        key={ index }
                                        style={ {
                                            padding: '10px',
                                            alignContent: 'center',
                                        } }
                                    >
                                        <Paper
                                            className="bookBlock"
                                            elevation={ 3 }
                                            style={ {
                                                padding: '20px',
                                                borderRadius: '10px',
                                            } }
                                        >
                                            <Typography
                                                variant="h6"
                                                className="titleBook"
                                            >
                                                { item.title }
                                            </Typography>
                                            <NavLink to={ `/book/${item.slug}` }>
                                                <img
                                                    height={ 400 }
                                                    width={ 180 }
                                                    src={
                                                        imageFolder +
                                                        item.thumbnail
                                                    }
                                                    alt="bookImage"
                                                    style={ {
                                                        display: 'block',
                                                        margin: 'auto',
                                                        marginTop: '15px',
                                                        marginBottom: '15px',
                                                    } }
                                                />
                                            </NavLink>
                                            <Typography
                                                variant="body2"
                                                className="bookAuthor"
                                            >
                                                Author: { item.author }
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                className="bookStock"
                                            >
                                                Available: { item.stock }
                                            </Typography>
                                        </Paper>
                                    </Grid>
                                ) ) }
                            </Grid>
                        ) }
                    </Container>
                </>
            ) }
        </Container>
    )
}

export default ExplorePage

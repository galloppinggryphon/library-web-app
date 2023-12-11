import { useEffect, useState } from 'react'
import useFetch from './use-fetch'
import useSecureFetch from './use-secure-fetch'

export default function useLibrary( userId ) {
    const [ isCheckedOutByUser, setisCheckedOutByUser ] = useState( false )

    /** Get user's borrow history */
    const loanHistory = useSecureFetch()
    /** Get status of a loan */
    const loanStatus = useSecureFetch()
    /** Borrow/return book */
    const loanControl = useSecureFetch()
    /** Check status of a book */
    const bookCheckouts = useSecureFetch()
    /** Check status of a book */
    const bookAvailability = useFetch()

    useEffect( () => {
        if ( loanControl.isComplete ) {
            // Todo - reconsider this
            // Refetch loan data (fetch is only executed if it has been initialized)
            bookAvailability.refetch()
            loanStatus.refetch()
            loanHistory.refetch()
            bookCheckouts.refetch()
        }
    }, [ loanControl.isComplete ] )

    useEffect( () => {
        if ( loanStatus.isComplete ) {
            const loanItem = loanStatus.data.length ? loanStatus.data[ 0 ] : null
            setisCheckedOutByUser( !! loanItem )
        }
    }, [ loanStatus.isComplete ] )

    const computeVirtualFields = ( item ) => {
        const loanDateInt = Date.parse( item.loanDate )
        const loanDate = new Date( loanDateInt ).toDateString()
        const dueDateInt = Date.parse( item.dueDate )
        const dueDate = new Date( dueDateInt ).toDateString()
        const returnDateInt = Date.parse( item.returnDate )
        const returnDate = returnDateInt ? new Date( returnDateInt ).toDateString() : ''
        const isOverdue = dueDateInt < Date.now()
        const isCheckedOut = ! returnDateInt

        const text = ! isCheckedOut ? 'Returned' : (
            isOverdue ? 'Overdue!' : `Checked Out`
        )

        const colour = ! isCheckedOut ? 'info' : (
            isOverdue ? 'error' : 'success'
        )

        const statusMeta = {
            text,
            colour,
        }

        const statusFields = {
            returnDateString: returnDate,
            dueDateString: dueDate,
            loanDateString: loanDate,
            isCheckedOut,
            isOverdue,
        }

        return {
            ...statusFields,
            statusMeta,
        }
    }

    return {
        request: {},
        get loans() {
            const data = ( loanHistory.isInitialized && loanHistory.data && [ ...loanHistory.data ] ) || []

            data.reverse().reduce( ( result, item ) => {
                const virtual = computeVirtualFields( item )
                Object.assign( item, virtual )
                return result
            }, data )

            return data
        },

        get isCheckedOutByUser() {
            return isCheckedOutByUser
        },
        get bookCheckouts() {
            return bookCheckouts.isComplete ? bookCheckouts.data : []
        },
        get bookCheckoutCount() {
            return bookCheckouts.isComplete ? bookCheckouts.data.length : -1
        },
        get isFetchingLoanHistory() {
            return loanHistory.isFetching
        },
        get checkoutDataAfterUpdate() {
            const data = loanControl.isComplete && loanControl.data
            const virtual = computeVirtualFields( data )
            Object.assign( data, virtual )
            return data
        },
        get isCheckoutStatusChangePending() {
            return loanControl.isFetching
        },
        get isCheckoutStatusChangeComplete() {
            return loanControl.isComplete
        },
        get isCheckoutStatusCheckPending() {
            return loanStatus.isFetching
        },
        get isBookAvailabilityCheckPending() {
            return bookAvailability.isFetching
        },
        get bookAvailability() {
            return bookAvailability.isComplete ? bookAvailability.data.available : -1
        },
        getBookAvailability( bookId ) {
            bookAvailability.fetch( `/availability/${ bookId}` )
        },
        getBookCheckouts( bookId ) {
            bookCheckouts.fetch( '/loans', { query: { bookId, isReturned: false } } )
        },
        getLoans( refetch = false ) {
            loanHistory.fetch( '/loans', { query: { userId } }, refetch )
        },
        getBorrowStatus( bookId ) {
            loanStatus.fetch( `/loans`, { query: { userId, bookId, isReturned: false } } )
        },
        borrow( bookId ) {
            const dueDate = new Date()
            const loanData = {
                bookId,
                userId,
                loanDate: Date.now(),
                dueDate: new Date().setDate( dueDate.getDate() + 14 ),
            }

            console.log( 'Borrowing book: ', loanData )

            const options = {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( loanData ),
            }

            loanControl.fetch( '/loans', { options } )
        },
        return( loanId ) {
            const options = {
                method: 'PUT',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify( { returnDate: Date.now() } ),
            }

            loanControl.fetch( `/loans/${ loanId}`, { options } )
        },
    }
}

// bookId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Book",
// },
// userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
// },
// loanDate: {
//     type: Date,
// },
// dueDate: {
//     type: Date,
// },
// returnDate: {
//     type: Date,
// },

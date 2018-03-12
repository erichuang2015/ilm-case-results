/*
** iLawyer Marketing Case Results Listing plugin.

** This is an immediately invoked function expression (IIFE). It runs on file load
** and uses `$` as a jQuery alias. All of this being wrapped in an IIFE makes it
** conflict-free with any other javascript libraries that might also use `$`.
** Due to the nature of IIFE, all functions/vars are private.
*/
;(function($) {

    'use strict'

    /*
    ** The CR template (case-results.php) loads using the WordPress loop, showing
    ** the five most recent Case Results. This script uses the WP REST API to
    ** live-update the content after dropdown selections OR prev/next buttons
    ** have been used, avoiding hard reloads.
    */

    const container = $('.results')
    const mainCats  = $('.main-cat')
    const subCats   = $('.sub-cat')
    const secondary = $('.bottom-wrap .filters')
    const featured  = $('.featured-category')
    const prev      = $('.results-prev')
    const next      = $('.results-next')
    const pageLinks = $('.pagination-numbers')
    const selectBox = $('.select-wrap ul')
    const pageCont = $('#page-container')

    let currentCat      = ''
    let catSlug         = ''
    let currentList     = ''
    let children        = ''
    let offset          = 0
    let totalPosts      = 0
    let resultCount     = 5
    let resultsURL      = ''
    let allCategories   = true
    let parentCategory  = true
    let externalSource  = false

    const path = window.location.protocol + '//' + window.location.hostname + '/wp-json/wp/v2/results'

    /*
    ** Scroll the window to results
    */
    const scrollUp = () => {
        $('html, body').animate({
            scrollTop: container.offset().top - 300
        }, 1000)
    }

    /*
    ** Get the total amount of posts so we know what we're
    ** Dealing with when it comes to offsets, etc.
    */
    const getTotalCPT = () => {
        $.getJSON(path + '?per_page=100', postTotalCallback)
    }

    const postTotalCallback = data => {
        totalPosts = data.length
        console.log('Total Posts: ', totalPosts)
        createPagination()
    }

    const createPagination = () => {

        let paginationContainer = $('.pagination-numbers')
        let amountOfLinks       = parseFloat( totalPosts / resultCount )
        let paginationHtml      = ''

        paginationContainer.empty()

        if ( amountOfLinks < 1 ) {
            paginationHtml += '<a href="#" data-page="1" class="page-number active">1</a>'
        }

        else {
            for ( var i = 1; i <= amountOfLinks; i++ ) {
                paginationHtml += '<a href="#" data-page="' + i + '" class="page-number">' + i + '</a>'
            }
        }

        paginationContainer.html( paginationHtml )
    }

    const updateResultsHTML = data => {
        /*
        ** Create an empty var, assign string values to it
        ** and output only once after all data has been looped
        */
        let resultsHTML = ''

        for ( let result of data ) {
            if ( result.content.rendered !== '' ) {
            resultsHTML += '<article class="case-result">'
            resultsHTML += '<div class="left">'
                resultsHTML += '<div class="text-wrap">'
                    resultsHTML += '<p class="amount">' + result.acf.case_result_amount + '</p>'
                    resultsHTML += '<small>' + result.acf.case_result_type + '</small>'
                resultsHTML += '</div>'
            resultsHTML += '</div>'
            resultsHTML += '<div class="right">'
                resultsHTML += '<h3 class="highlight">' + result.acf.case_highlight + '</h2>'
                resultsHTML += '<p>' + result.content.rendered + ' '
                resultsHTML += '<cite><span>&bull;</span> ' + result.title.rendered

                if ( result.acf.case_location ) {
                    resultsHTML += ', ' + result.acf.case_location
                }

                resultsHTML += '</cite></p>'

            resultsHTML += '</div>'
            resultsHTML += '</article>'
            }
        }

        container.html( resultsHTML )
    }

    const resultsUpdateComplete = () => {
        resultsURL = ''
        offset = parseInt(pageCont.attr('data-offset'))

        if ( offset !== 0 ) {
            resultsURL = '?offset=' + offset
            prev.removeClass('disabled')
        }

        else {
            prev.addClass('disabled')
        }

        history.pushState( { offset: offset }, "", resultsURL )
    }

    const updateResults = () => {

        let offset = pageCont.attr('data-offset')

        if ( pageCont.attr('data-offset') ) {
            offset = pageCont.attr('data-offset')
        }

        $.ajax({
            url: path + '?order=asc&per_page=' + resultCount + '&offset=' + offset,

            success: function( data ) {
                updateResultsHTML( data )
            },

            complete: function() {
                resultsUpdateComplete()
            },

            error: function() {
                console.log('AJAX request URL invalid or not found')
            }
        })
    }

    /*
    ** Event Handlers
    */

    /*
    ** If the offset is greater than or equal
    ** to totalPosts then stop, else add to it
    */
    next.on('click', function() {
        offset = offset >= totalPosts ? totalPosts : offset + resultCount
        pageCont.attr('data-offset', offset)
        scrollUp()

        updateResults()
    })

    /*
    ** If the offset is less than or equal to zero
    ** Then keep it at zero, else subtract from it
    */
    prev.on('click', function() {
        offset = offset <= 0 ? 0 : offset - resultCount
        pageCont.attr('data-offset', offset)
        scrollUp()

        updateResults()
    })

    /*
    ** Pagination Numbers
    ** Figure out which offset to apply
    ** by comparing page to offset values
    */
    pageLinks.on('click', 'a', function(e) {
        e.preventDefault()
        let self = $(this)
        let pageNum = self.attr('data-page')

        self.siblings().removeClass('active')
        self.toggleClass('active')

        offset = parseInt(resultCount * parseInt(pageNum-1))
        pageCont.attr('data-offset', offset)

        scrollUp()
        updateResults()
    })

    /*
    ** Load all results on page load.
    */
    allCategories = true
    getTotalCPT()
    createPagination()
    updateResults()

})(jQuery)

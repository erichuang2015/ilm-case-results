/*
** iLawyer Marketing Case Results Listing plugin.

** This is an immediately invoked function expression (IIFE). It runs on file load
** and uses `$` as a jQuery alias. All of this being wrapped in an IIFE makes it
** conflict-free with any other javascript libraries that might also use `$`.
** Due to the nature of IIFE, all functions/vars are private.
*/

;(function($) {

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

    let currentCat  = '38' // Magic Number, ID of default category
    let catSlug     = 'medical-malpractice' // Magic name!
    let offset      = 0
    let totalPosts  = 0
    let resultCount = 5
    let catNameDisplay = ''

    const path = window.location.protocol + '//' + window.location.hostname + '/wp-json/wp/v2/results'

    /*
    ** Get the total amount of posts so we know what we're
    ** Dealing with when it comes to offsets, etc.
    */
    const getTotalPosts = ( cat ) => {
        $.getJSON(path + '?parent=' +cat, postTotalCallback)
    }

    const postTotalCallback = ( data ) => {
        totalPosts = data.length
        createPagination()
    }

    const updateCurrentCategory = ( el ) => {
        currentCat = el.attr('data-id')
    }

    const updateCatSlug = ( el ) => {
        catSlug = el.attr('data-name')
    }

    const updateCatNameDisplay = ( el ) => {
        catNameDisplay = el.text()
        featured.text( catNameDisplay )
    }

    const activeCategory = ( el ) => {
        el.addClass('active')
        el.siblings().removeClass('active')
    }

    const processCategory = ( el ) => {

        activeCategory( el )
        updateCatSlug( el )
        updateCatNameDisplay( el )
        updateCurrentCategory( el )

        getTotalPosts( currentCat )
        updateResults( currentCat )
    }

    const resetSubCategories = () => {
        subCats.children().attr('class', '')
        subCats.children('[data-parent!="' + currentCat + '"]').addClass('hidden')
        subCats.children('li:first-child').removeClass('hidden')
    }

    const mainCatSelected = ( el ) => {

        processCategory( el )

        mainCats.attr('data-current', currentCat)
        secondary.addClass('active')
        subCats.removeClass('disabled')

        resetSubCategories()
    }

    const subCatSelected = ( el ) => {
        processCategory( el )
    }

    const resetFilters = () => {
        mainCats.children().removeClass('active')
        subCats.addClass('disabled')
        subCats.children().removeClass('active')
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

    const updateResultsHTML = ( data ) => {
        /*
        ** Create an empty var, assign string values to it
        ** and output only once after all data has been looped
        */
        let resultsHTML = ''

        for ( let result of data ) {
            resultsHTML += '<article class="case-result">'
            resultsHTML += '<h2 class="post-title">' + result.title.rendered + '</h2>'
            resultsHTML += result.content.rendered
            resultsHTML += '</article>'
        }

        container.html( resultsHTML )
    }

    const resultsUpdateComplete = () => {
        let resultsURL = ''

        if ( offset !== 0 ) {
            resultsURL = '?cat=' + catSlug + '&offset=' + offset
            prev.removeClass('disabled')
        }

        else {
            resultsURL = '?cat=' + catSlug
            prev.addClass('disabled')
        }

        history.pushState({ cat: currentCat, offset: offset }, "", resultsURL)
    }

    const updateResults = ( category = currentCat, offset = 0 ) => {

        $.ajax({

            url: path + '?per_page=' + resultCount + '&parent=' + category + '&offset=' + offset,
            dataType: 'json',

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
    ** Using a combination of popstate listeners and the History API
    ** we can support loading directly to results as well as updating
    ** results when forward/backward controls are used.
    */
    window.addEventListener('load', function() {
        if ( history.state ) {
            secondary.addClass('active')
            updateResults( history.state.cat, history.state.offset )
        }
    })

    /*
    ** Handlers for two "dropdowns" and
    ** previous/next pagination buttons
    ** Needs much refactor. Wowe.
    */
    mainCats.on('click', 'li', function() {

        mainCats.toggleClass('open')

        let self = $(this)

        /*
        ** Only fire if element has a name, indicating
        ** that it is a category and not the default
        ** "View All" list item
        */
        if ( self.attr('data-name') ) {

            /*
            ** Only fire an update if this is
            ** not the currently active category
            */
            if ( !self.hasClass('active') ) {
                mainCatSelected( self )
            }

        } else {
            resetFilters()
        }
    })

    subCats.on('click', 'li', function() {
        let self = $(this)

        subCats.toggleClass('open')

        /*
        ** Same requirements to fire as main cat
        */
        if ( self.attr('data-name') ) {

            if ( !self.hasClass('active') ) {
                subCatSelected( self )
            }

        }
    })

    next.on('click', function() {
        offset = offset + 5
        updateResults( currentCat, offset )
    })

    prev.on('click', function() {
        offset = offset <= 0 ? 0 : offset - 5;
        updateResults( currentCat, offset )
    })

    pageLinks.on('click', 'a', function(e) {
        e.preventDefault()
        let self = $(this)
        let pageNum = self.attr('data-page')

        offset = parseInt(resultCount * parseInt(pageNum-1))
        updateResults( currentCat, offset)
    })

// @ts-ignore
})(jQuery)

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
    const pageCont  = $('#page-container')

    let currentCat      = ''
    let catSlug         = ''
    let currentList     = ''
    let children        = ''
    let offset          = 0
    let totalPosts      = 0
    let resultCount     = 5
    let catNameDisplay  = ''
    let resultsURL      = ''
    let allCategories   = true
    let parentCategory  = true
    let externalSource  = false

    const path = window.location.protocol + '//' + window.location.hostname + '/wp-json/wp/v2/results'

    const externalRefferal = () => {

        /*
        ** Get the category name of the query string and match
        ** it to an ID of a list item in the select-wrap,
        ** then apply the ID to the original container
        */
        let catName = $('#page-container').attr('data-cat')

        catSlug = catName
        currentCat = $('li[data-name="' + catName + '"]').attr('data-id')
        pageCont.attr('data-id', currentCat)

        let selectedItem = $('li[data-name="'+catName+'"]')
            selectedItem.addClass('active')
            selectedItem.siblings('.active').removeClass('active')

        let selectedParentID = selectedItem.attr('data-parent')
        let selectedParent = $('.main-cat li[data-id="'+selectedParentID+'"]')
            selectedParent.addClass('active')
            selectedParent.siblings('.active').removeClass('active')

        featured.text( selectedItem.text() )
        $('.disabled').removeClass('disabled')

        if ( $('#page-container[data-offset]').length ) {
            offset = parseInt($('#page-container').attr('data-offset'))
        } else {
            offset = 0
        }
    }

    /*
    ** Get the total amount of posts so we know what we're
    ** Dealing with when it comes to offsets, etc.
    */
    const getTotalCPT = () => {
        $.getJSON(path + '?per_page=100', postTotalCallback)
    }

    const getTotalPosts = ( cat ) => {
        $.getJSON(path + '?per_page=100&parent=' +cat, postTotalCallback)
    }

    const postTotalCallback = data => {
        totalPosts = data.length
        createPagination()
    }

    const updateCurrentCategory = el => {

        if ( parentCategory ) {

            currentCat = el.attr('data-id')
            children = ''
            children += currentCat

            $('li[data-parent^='+currentCat+']').each(function() {
                let self = $(this)
                children += ','
                children += self.attr('data-id')
            })

            currentList = children
            pageCont.attr('data-id', currentList)
        }
        else {
            currentCat = el.attr('data-id')
            pageCont.attr('data-id', currentCat)
        }
    }

    const updateCatSlug = el => {
        catSlug = el.attr('data-name')
        pageCont.attr('data-name', catSlug)
    }

    const updateCatNameDisplay = el => {
        catNameDisplay = el.text()
        featured.text( catNameDisplay )
    }

    const activeCategory = el => {
        el.addClass('active')
        el.siblings().removeClass('active')
    }

    const processCategory = el => {

        activeCategory( el )
        updateCatSlug( el )
        updateCatNameDisplay( el )
        updateCurrentCategory( el )

        getTotalPosts( currentCat )
        createPagination()
        updateResults( currentCat )

    }

    const resetSubCategories = () => {
        subCats.children().attr('class', '')
        subCats.children('[data-parent!="' + currentCat + '"]').addClass('hidden')
        subCats.children('li:first-child').removeClass('hidden')
    }

    const mainCatSelected = el => {

        allCategories = false
        parentCategory = true
        pageCont.attr('data-offset', '0')
        processCategory( el )

        subCats.removeClass('disabled')
        resetSubCategories()
    }

    const subCatSelected = el => {
        parentCategory = false
        pageCont.attr('data-offset', '0')
        processCategory( el )
    }

    const resetFilters = () => {
        mainCats.children().removeClass('active')
        subCats.addClass('disabled')
        subCats.children().removeClass('active')
        featured.empty()
        allCategories = true

        if ( secondary.is(':visible') ) {
            secondary.slideToggle()
        }

        getTotalCPT()
        updateResults()
    }

    /*
    ** Scroll the window to results
    */
    const scrollUp = () => {
        $('html, body').animate({
            scrollTop: container.offset().top - 300
        }, 1000)
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
            resultsHTML += '<h2 class="post-title">' + result.title.rendered + '</h2>'
            resultsHTML += result.content.rendered
            resultsHTML += '</article>'
            }
        }

        container.html( resultsHTML )
    }

    const resultsUpdateComplete = () => {
        resultsURL = ''
        offset = parseInt(pageCont.attr('data-offset'))

        if ( offset !== 0 ) {
            resultsURL = '?cat=' + catSlug + '&offset=' + offset
            prev.removeClass('disabled')
        }

        else {
            resultsURL = '?cat=' + catSlug
            prev.addClass('disabled')
        }

        history.pushState(
            {
            catSlug: catSlug,
            catID: currentCat,
            offset: offset
            },
            "",
            resultsURL
        )
    }

    const updateResults = () => {

        let category    = pageCont.attr('data-id')
        let offset      = pageCont.attr('data-offset')

        if ( pageCont.attr('data-offset') ) {
            offset = pageCont.attr('data-offset')
        }

        if ( category === undefined || category === 'undefined' || allCategories ) {

            $.ajax({
                url: path + '?order=asc&per_page=' + resultCount,

                beforeSend: function() {
                    featured.empty()
                    if ( secondary.is(':visible') ) {
                        secondary.slideToggle()
                    }
                },

                success: function( data ) {
                    updateResultsHTML( data )
                },

                error: function() {
                    console.log('AJAX request URL invalid or not found')
                }
            })
        }

        else {
            $.ajax({
                url: path + '?order=asc&per_page=' + resultCount + '&parent=' + category + '&offset=' + offset,

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
    }

    /*
    ** Event Handlers
    */

    selectBox.on('click', 'li', function() {

        let self = $(this)

        if ( externalSource ) {
            externalSource = false
        }

        self.parent().toggleClass('open')

        /*
        ** Only fire if element has not first,
        ** indicating that it is a category and
        ** not the default "View All" list item
        */
        if ( self.not(':first-child') ) {

            /*
            ** Only fire an update if this is
            ** not the currently active category
            */
            if ( !self.hasClass('active') ) {

                if ( self.parent().hasClass('main-cat') ) {

                    mainCatSelected( self )

                    if ( !secondary.is(':visible') ) {
                        secondary.slideToggle()
                    }

                } else {
                    subCatSelected( self )
                }
            }

        } else {

            /*
            ** "View All" is the target, then reset
            */
            if ( self.parent().hasClass('main-cat') ) {
                resetFilters()
            }
        }
    })

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
    ** This runs on page load. If user got here
    ** with a direct URL, PHP should load attr's
    ** we check to know that and run the update.
    ** Otherwise, load all results.
    */
    if ( $('#page-container[data-cat]').length ) {
        externalSource = true
        externalRefferal()
    }

    if ( !externalSource ) {

        resetFilters()

    } else {

        allCategories = false
        parentCategory = false
        updateResults()

        if ( !secondary.is(':visible') ) {
            secondary.slideToggle()
        }

    }

})(jQuery)

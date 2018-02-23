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
    const selectBox = $('.select-wrap ul')

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

    const path = window.location.protocol + '//' + window.location.hostname + '/wp-json/wp/v2/results'

    /*
    ** Get the total amount of posts so we know what we're
    ** Dealing with when it comes to offsets, etc.
    */
    const getTotalCPT = () => {
        $.getJSON(path + '?per_page=100', postTotalCallback)
    }

    const getTotalPosts = cat => {
        $.getJSON(path + '?parent=' +cat, postTotalCallback)
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
                children += ', '
                children += self.attr('data-id')
            })

            currentList = children
        }
        else {
            currentCat = el.attr('data-id')
        }
    }

    const updateCatSlug = el => {
        catSlug = el.attr('data-name')
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

        if ( parentCategory ) {
            updateResults( currentList )
        } else {
            updateResults( currentCat )
        }


    }

    const resetSubCategories = () => {
        subCats.children().attr('class', '')
        subCats.children('[data-parent!="' + currentCat + '"]').addClass('hidden')
        subCats.children('li:first-child').removeClass('hidden')
    }

    const mainCatSelected = el => {

        allCategories = false
        parentCategory = true
        processCategory( el )

        mainCats.attr('data-current', currentCat)
        subCats.removeClass('disabled')

        resetSubCategories()
    }

    const subCatSelected = el => {
        parentCategory = false
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
        allCaseResults()
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
                if ( i === 1 ) {
                    paginationHtml += '<a href="#" data-page="' + i + '" class="page-number active">' + i + '</a>'
                } else {
                    paginationHtml += '<a href="#" data-page="' + i + '" class="page-number">' + i + '</a>'
                }
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

        if ( offset !== 0 ) {
            resultsURL = '?cat=' + catSlug + '&offset=' + offset
            prev.removeClass('disabled')
        }

        else {
            resultsURL = '?cat=' + catSlug
            prev.addClass('disabled')
        }
    }

    const allCaseResults = () => {
        $.ajax({
            url: path + '?per_page=' + resultCount,
            success: function( data ) {
                updateResultsHTML( data )
            },

            error: function() {
                console.log('AJAX request URL invalid or not found')
            }
        })
    }

    const updateAllCaseResults = ( offset = 0 ) => {

        $.ajax({
            url: path + '?per_page=' + resultCount + '&offset=' + offset,

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

    const updateResults = ( category = currentCat, offset = 0 ) => {

        if ( parentCategory ) {
            category = children
        }

        $.ajax({
            url: path + '?per_page=' + resultCount + '&parent=' + category + '&offset=' + offset,

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

    selectBox.on('click', 'li', function() {

        let self = $(this)
        self.parent().toggleClass('open')

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
            ** If this is the main category list and
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
        scrollUp()

        if ( allCategories ) {
            updateAllCaseResults( offset )
        } else {
            updateResults( currentCat, offset )
        }
    })

    /*
    ** If the offset is less than or equal to zero
    ** Then keep it at zero, else subtract from it
    */
    prev.on('click', function() {
        offset = offset <= 0 ? 0 : offset - resultCount
        scrollUp()

        if ( allCategories ) {
            updateAllCaseResults( offset )
        } else {
            updateResults( currentCat, offset )
        }
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
        scrollUp()

        if ( allCategories ) {
            updateAllCaseResults( offset )
        } else {
            updateResults( currentCat, offset )
        }
    })

    resetFilters()
// @ts-ignore
})(jQuery)

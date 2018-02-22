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

    const path = window.location.protocol + '//' + window.location.hostname + '/wp-json/wp/v2/results'

    /*
    ** Get the total amount of posts so we know what we're
    ** Dealing with when it comes to offsets, etc.
    */
    function getTotalPosts( cat ) {
        $.getJSON(path + '?parent=' +cat, postTotalCallback)
    }

    function postTotalCallback( data ) {
        totalPosts = data.length
        createPagination()
    }

    function createPagination() {
        let container = $('.pagination-numbers')
        let amountOfLinks = parseFloat( totalPosts / resultCount )
        let html = ''

        container.empty()

        if ( amountOfLinks < 1 ) {
            html += '<a href="#" data-page="1" class="page-number active">1</a>'
        }

        else {
            for ( var i = 1; i <= amountOfLinks; i++ ) {
                html += '<a href="#" data-page="' + i + '" class="page-number">' + i + '</a>'
            }
        }

        container.html(html)
    }

    // Default offset is zero and is not a required param
    const updateResults = ( category = currentCat, offset = 0 ) => {

        $.ajax({

            url: path + '?per_page=' + resultCount + '&parent=' + category + '&offset=' + offset,
            dataType: 'json',

            success: function( data ) {
                /*
                ** Create an empty var, assign string values to it
                ** and output only once after all data has been looped
                */
                let html = ''

                for ( let result of data ) {
                    html += '<article class="case-result">'
                    html += '<h2 class="post-title">' + result.title.rendered + '</h2>'
                    html += result.content.rendered
                    html += '</article>'
                }

                container.html(html)
            },

            complete: function() {

                let url = ''
                if ( offset !== 0 ) {
                    url = '?cat=' + catSlug + '&offset=' + offset
                    prev.removeClass('disabled')

                } else {
                    url = '?cat=' + catSlug
                    prev.addClass('disabled')
                }

                history.pushState({cat: currentCat, offset: offset}, "", url)
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
        let self = $(this)

        self.addClass('active')
        self.siblings().removeClass('active')
        subCats.children('.hidden').removeClass('hidden')
        mainCats.toggleClass('open')

        if ( self.attr('data-name') ) {
            let displayName = self.text()
            currentCat = self.attr('data-id')
            secondary.addClass('active')

            featured.text(displayName)

            mainCats.attr('data-current', currentCat)
            subCats.removeClass('disabled')
            subCats.children('[data-parent!="' + currentCat + '"]').addClass('hidden')
            subCats.children('li:first-child').removeClass('hidden')

            getTotalPosts( currentCat )
            updateResults( currentCat )
        } else {
            subCats.addClass('disabled')
        }
    })

    subCats.on('click', 'li', function() {
        let self = $(this)
        let displayName = self.text()
        featured.text(displayName)
        catSlug = self.attr('data-name')
        currentCat = self.attr('data-id')

        self.addClass('active')
        self.siblings().removeClass('active')
        subCats.toggleClass('open')

        getTotalPosts( currentCat )
        updateResults( currentCat )
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

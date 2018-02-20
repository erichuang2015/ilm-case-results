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
    const searchBtn = $('#cr-search')
    const prev      = $('.results-prev')
    const next      = $('.results-next')

    let currentCat  = '38' // Magic Number, ID of default category
    let offset      = 0
    let totalPosts  = 0
    let resultCount = 5

    const path = window.location.protocol + '//' + window.location.hostname + '/wp-json/wp/v2/case_results?per_page=' + resultCount

    /*
    ** Get the total amount of posts so we know what we're
    ** Dealing with when it comes to offsets, etc.
    */
    $.get( path, function( data, status, request ) {
        totalPosts = request.getResponseHeader('x-wp-total');
    })

    // Default offset is zero and is not a required param
    const updateResults = ( category = currentCat, offset = 0 ) => {

        $.ajax({

            url: path + '&parent=' +category+ '&offset=' +offset,

            beforeSend: function() {
                /*
                ** Scroll the window down to results
                */
                $('html, body').animate({
                    scrollTop: container.offset().top - 300
                }, 1000)
            },

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

                $(container).html(html)
            },

            complete: function() {

                let url = ''
                if ( offset ) {
                    url = currentCat + '?offset=' + offset

                    if ( offset === 0 ) {
                        $(prev).addClass('disabled').hide()
                    }

                } else {

                    url = currentCat
                    $(prev).removeClass('disabled').show()

                }

                history.pushState({currentCat: currentCat, offset: offset}, null, url)
            },

            error: function() { /* console.log('DANGER, WILL ROBINSON!') */ }
        })
    }

    /*
    ** Using a combination of popstate listeners and the History API
    ** we can support loading directly to results as well as updating
    ** results when forward/backward controls are used.
    */
    window.addEventListener('popstate', function(e) {
        if ( e.state === null ) {
            updateResults()
        } else {
            updateResults( e.state.CurrentCat, e.state.offset )
        }
    })

    /*
    ** Handlers for two "dropdowns" and
    ** previous/next pagination buttons
    ** Needs some refactoring
    */
    $(mainCats).on('click', 'li', function() {
        let self = $(this)
        self.addClass('active')
        self.siblings().removeClass('active')
        $(subCats).children('.hidden').removeClass('hidden')
        $(mainCats).toggleClass('open')

        if ( self.attr('data-name') ) {
            currentCat = self.attr('data-id')
            $(mainCats).attr('data-current', currentCat)
            $(subCats).removeClass('disabled')
            $(subCats).children('[data-parent!="' + currentCat + '"]').addClass('hidden')
            $(subCats).children('li:first-child').removeClass('hidden')
        } else {
            $(subCats).addClass('disabled')
        }
    })

    $(subCats).on('click', 'li', function() {
        let self = $(this)
        self.addClass('active')
        self.siblings().removeClass('active')

        $(subCats).toggleClass('open')
    })

    $(searchBtn).on('click', function() {
        const chosenCat = $(subCats).children('.active').data('id')
        currentCat = chosenCat
        offset = 0
        updateResults( chosenCat )
    })

    $(next).on('click', function() {
        offset = offset + 5
        updateResults( currentCat, offset )
    })

    $(prev).on('click', function() {
        offset = offset <= 0 ? 0 : offset - 5;
        updateResults( currentCat, offset )
    })

// @ts-ignore
})(jQuery)

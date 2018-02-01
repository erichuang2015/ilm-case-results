/*
** iLawyer Marketing Case Results Listing plugin.

** This is an immediately invoked function expression (IIFE). It runs on file load
** and uses `$` as a jQuery alias. All of this being wrapped in an IIFE makes it
** conflict-free with any other javascript libraries that might also use `$`
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

    let hash        = document.location.hash.replace('#', '')
    let currentCat  = 0
    let offset      = 0
    let totalPosts  = 0

    const path = window.location.protocol + '//' + window.location.hostname + '/wp-json/wp/v2/case_results?per_page=5'

    /*
    ** Get the total amount of posts so we know what we're
    ** Dealing with when it comes to offsets, etc.
    */
    $.get( path, function( data, status, request ) {
        totalPosts = request.getResponseHeader('x-wp-total');
    })

    // Default offset is zero and is not a required param
    function updateResults( category, offset = 0 ) {

        $.ajax({

            url: path + '&parent=' +category+ '&offset=' +offset,

            beforeSend: function() {
                // console.log('Retrieving ' +category+ ', offset by '+offset)
            },

            error: function() {
                // console.log('DANGER, WILL ROBINSON!')
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

                /*
                ** Once content is loaded, scroll the window down
                */
                $('html, body').animate({
                    scrollTop: container.offset().top - 300
                }, 1000)
            }
        })
    }

    /*
    ** Checking for a location hash on load is an attempt at creating "permalinks"
    ** for the CR categories - which are really just parent/child relationships
    */
    if ( document.location.hash ) {
        $('li[data-id="'+hash+'"]').addClass('active')
        $('.disabled').removeClass('disabled')
        updateResults( hash )
    }

    /*
    ** Handlers for two "dropdowns" and
    ** previous/next pagination buttons
    ** Needs some refactoring
    */
    $(mainCats).on('click', 'li', function() {
        let self = $(this)
        self.addClass('active')
        self.siblings().removeClass('active')
        $(mainCats).toggleClass('open')

        if ( self.attr('data-name') ) {
            $(mainCats).attr('data-current', currentCat)
            $(subCats).removeClass('disabled')
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

})(jQuery)

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
    const path = window.location.protocol + '//' + window.location.hostname + '/wp-json/wp/v2/case_results?per_page=5'
    const mainCats = $('.main-cat')
    const subCats = $('.sub-cat')
    const prev = $('.results-prev')
    const next = $('.results-next')

    let hash = document.location.hash.replace('#', '')
    let currentCat = 0
    let offset = 0

    function updateResults( category, offset ) {

        $.ajax({

            url: path + '&parent=' +category+ '&offset=' +offset,

            beforeSend: function() {
                // console.log('Retrieving ' +category+ ', offset by '+offset)
            },

            error: function() {
                console.log('DANGER, WILL ROBINSON!')
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
        updateResults( hash, 0 )
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
        currentCat = self.data('id')

        if ( self.attr('data-name') ) {
            $(mainCats).attr('data-current', currentCat)
            $(subCats).removeClass('disabled')
        } else {
            $(subCats).addClass('disabled')
        }
    })

    $(subCats).on('click', 'li', function() {
        let self = $(this)
        let id = self.data('id')
        currentCat = id

        self.addClass('active')
        self.siblings().removeClass('active')

        $(subCats).toggleClass('open')

        updateResults( currentCat, 0 )
        if ( $(self).attr('data-id') ) {
            window.location = '#'+id
        }
    })

    $(next).on('click', function() {
        offset = offset + 5
        updateResults( currentCat, offset )
    })

    $(prev).on('click', function() {
        offset = offset - 5
        if (offset <= 0) { offset = 0 }
        updateResults( currentCat, offset )
    })

})(jQuery)

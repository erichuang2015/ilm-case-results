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
    const pageCont = $('#page-container')

    const path = window.location.protocol + '//' + window.location.hostname + '/wp-json/wp/v2/results'

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

    const updateResults = () => {

        $.ajax({
            url: path + '?order=asc',

            success: function( data ) {
                updateResultsHTML( data )
            },

            error: function() {
                console.log('AJAX request URL invalid or not found')
            }
        })
    }

    /*
    ** Load all results on page load.
    */
    updateResults()

})(jQuery)

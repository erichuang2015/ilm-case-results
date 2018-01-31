;(function($) {

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
                console.log('DANGER WILL ROBINSON')
            },

            success: function( data ) {
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
                $('html, body').animate({
                    scrollTop: container.offset().top - 300
                }, 1000)
            }
        })
    }

    if ( document.location.hash ) {
        $('li[data-id="'+hash+'"]').addClass('active')
        $('.disabled').removeClass('disabled')
        updateResults( hash, 0 )
    }

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

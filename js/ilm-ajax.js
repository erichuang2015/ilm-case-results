
(function($) {

    const container = $('.results')
    const path = window.location.protocol + '//' + window.location.hostname + '/wp-json/wp/v2/case_results'
    const mainCats = $('.main-cat')
    const subCats = $('.sub-cat')

    let currentCat = ''

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

        updateResults( currentCat )
        if ( $(self).attr('data-id') ) {
            window.location = '#'+id
        }
    })

    $(document.location).on('change', updateResults())

    function updateResults( cat ) {
        $.ajax({
            url: path + '?parent=' +cat,

            success: function( data ) {

                let html = ''
                    html += '<p class="intro">// Top Featured Results</p>'

                for ( let result of data ) {
                    html += '<article class="case-result">'
                    html += '<h2 class="post-title">' + result.title.rendered + '</h2>'
                    html += result.content.rendered
                    html += '</article>'
                }

                $(container).html(html)
                $('html, body').animate({
                    scrollTop: container.offset().top - 70
                }, 1000,)
            }
        })
    }

    if ( document.location.hash ) {
        let cat = document.location.hash.replace('#', '')
        $('li[data-id="'+cat+'"]').addClass('active')
        $('.disabled').removeClass('disabled')
        updateResults( cat )
    }

})(jQuery);

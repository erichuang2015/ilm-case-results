<?php get_header(); ?>

    <?php
    /*
    ** Check if category and offset values are present
    ** If so, apply them to the HTML to be read in JS
    */

    if ( isset( $_GET['cat'] ) ) {
        $category = $_GET['cat'];
    }

    if ( isset( $_GET['offset'] ) ) {
        $offset = $_GET['offset'];
    }
    ?>
    <div
        id="page-container"
        class="clearfix full-width"
        <?php
        if ( $category ) { echo 'data-cat="' . $category . '"'; } else { echo 'data-cat="0"'; }
        if ( $offset ) { echo ' data-offset="' . $offset . '"'; } else { echo 'data-offset="0"'; }
        ?>
    >
		<div class="main-content">
			<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
                <div class="top-wrap">
                    <h1 class="page-title"><?php the_title();?></h1>
                </div>
                <div class="bottom-wrap">
                    <div class="container">
                        <div class="results"></div>

                        <div class="pagination">
                            <a class="results-prev">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10.6 19.8">
                                <path fill="#1e2327" d="M.1 9.9H0l9.9 9.9.7-.7-9.2-9.2h.1-.1L3.3 8 10.6.7 9.9 0l-8 8L0 9.9z"/>
                            </svg>
                            </a>
                            <a class="results-next">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10.6 19.8">
                                <path fill="#1e2327" d="M10.5 9.8h.1L.7 0 0 .7l9.2 9.1h-.1l.1.1-1.9 1.9L0 19.1l.7.7 8-8 1.9-1.9z"/>
                            </svg>
                            </a>
                            <div class="pagination-numbers">
                            </div>
                        </div>
                    </div>
                </div>
			<?php endwhile; else : ?>
				<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
			<?php endif; ?>
		</div>
	</div>
<?php get_footer();?>

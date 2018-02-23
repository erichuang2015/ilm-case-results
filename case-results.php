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
        if ( $category ) { echo 'data-cat="' . $category . '"'; }
        if ( $offset ) { echo ' data-offset="' . $offset . '"'; }
        ?>
    >
		<div class="main-content">
			<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
                <div class="top-wrap">
                    <h1 class="page-title"><?php the_title();?></h1>
                    <div class="filters">
                        <div class="select-wrap">
                            <p>Step 1: Select Main Practice Area</p>
                            <ul class="main-cat" data-current="none">
                                <li class="view-all active">View All</li>
                                <?php
                                /*
                                ** Get pages that have no parent, which
                                ** means that they are top-level
                                */
                                $results = new WP_Query(array(
                                    'post_type' => 'case_results',
                                    'post_parent' => 0,
                                    'posts_per_page' => -1,
                                    'orderby' => 'title',
                                    'order' => 'ASC'
                                ));

                                /*
                                ** Create a variable to hold child data
                                */
                                $childPages = '';

                                if ( $results->have_posts() ) : while ( $results->have_posts() ) : $results->the_post();

                                    /*
                                    ** If this result has children, loop over them all
                                    ** adding each to our empty variable of $childPages
                                    ** to be used elsewhere in the layout
                                    */
                                    $children = get_children(array(
                                        'post_parent' => $post->ID
                                    ));
                                    if ( $children ) :

                                        foreach ( $children as $child ) {
                                            $childPages .= '<li data-name="'.$child->post_name.'"';
                                            $childPages .= 'data-id="'.$child->ID.'"';
                                            $childPages .= 'data-parent="'.$post->ID.'">';
                                            $childPages .= get_the_title($child);
                                            $childPages .= '</li>';
                                        }
                                    /*
                                    ** After child data collection is done, output the parent
                                    ** as a list item with some filter identifying attributes
                                    */
                                    ?>
                                    <li data-name="<?php echo $post->post_name; ?>" data-id="<?php echo $post->ID; ?>">
                                        <?php the_title(); ?>
                                    </li>

                                    <?php endif; wp_reset_query(); ?>
                                <?php endwhile; endif; ?>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="bottom-wrap">
                    <div class="container">
                        <p class="intro">Top Featured Results <span class="featured-category"></span></p>
                        <div class="filters">
                            <div class="select-wrap">
                                <p>Step 2: Select Specific Practice Area</p>
                                <ul class="sub-cat disabled" data-current="none">
                                    <li class="view-all active">View All</li>
                                    <?php echo $childPages; ?>
                                </ul>
                            </div>
                        </div>

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

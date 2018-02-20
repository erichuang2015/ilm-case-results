<?php get_header();?>

	<div id="page-container" class="clearfix">
		<div class="main-content">
			<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
                <div class="top-wrap">
                    <h1 class="page-title"><?php the_title();?></h1>
                    <div class="filters">
                        <div class="select-wrap">
                            <p>Select a Main Practice Area</p>
                            <ul class="main-cat" data-current="none">
                                <li>Select</li>
                                <?php
                                $results = new WP_Query(array(
                                    'post_type' => 'case_results',
                                    'post_parent' => 0,
                                    'posts_per_page' => -1,
                                    'orderby' => 'title',
                                    'order' => 'ASC'
                                ));
                                $childPages = '';
                                if ( $results->have_posts() ) : while ( $results->have_posts() ) : $results->the_post();
                                    $children = get_children(array( 'post_parent' => $post->ID ));
                                    if ( $children ) : ?>

                                    <li data-name="<?php echo $post->post_name; ?>" data-id="<?php echo $post->ID; ?>"><?php the_title(); ?></li>
                                        <?php

                                            foreach ( $children as $child ) {
                                                $childPages .= '<li data-name="'.$child->post_name.'" data-id="'.$child->ID.'" data-parent="'.$post->ID.'">';
                                                $childPages .= get_the_title($child);
                                                $childPages .= '</li>';
                                            }
                                        ?>

                                    <?php endif; wp_reset_query(); ?>
                                <?php endwhile; endif; ?>
                            </ul>
                        </div>
                        <div class="select-wrap">
                            <p>Select a Specific Practice Area</p>
                            <ul class="sub-cat disabled" data-current="none">
                                <li>Select</li>
                                <?php echo $childPages; ?>
                            </ul>
                        </div>
                        <div class="select-wrap">
                            <button id="cr-search" class="button">Search</button>
                        </div>
                    </div>
                </div>
                <div class="bottom-wrap">
                    <div class="container">
                        <p class="intro">// Top Featured Results</p>
                        <div class="results">
                            <?php
                            $initial_results = new WP_Query(array(
                                'post_type' => 'case_results',
                                'post_parent' => 38,
                                'posts_per_page' => 5,
                                'orderby' => 'title',
                                'order' => 'ASC'
                            ));
                            if ( $initial_results->have_posts() ) : while ( $initial_results->have_posts() ) : $initial_results->the_post();
                            ?>
                            <article class="case-result">
                                <h2 class="post-title"><?php the_title(); ?></h2>
                                <?php the_content(); ?>
                            </article>
                        <?php endwhile; endif; ?>
                        </div>

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

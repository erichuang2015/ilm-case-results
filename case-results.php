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
                    </div>
                </div>
                <div class="bottom-wrap">
                    <div class="results">
                        <p class="intro">// Top Featured Results</p>
                        <?php
                        $initial_results = new WP_Query(array(
                            'post_type' => 'case_results',
                            'post_parent' => 0,
                            'posts_per_page' => -1,
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
                </div>
			<?php endwhile; else : ?>
				<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
			<?php endif; ?>
		</div>
	</div>
<?php get_footer();?>

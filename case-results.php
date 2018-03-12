<?php get_header(); ?>
    <div id="page-container" class="clearfix full-width">
		<div class="main-content">
			<?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
                <div class="top-wrap">
                    <h1 class="page-title"><?php the_title();?></h1>
                </div>
                <div class="bottom-wrap">
                    <div class="container">
                        <div class="results"></div>
                    </div>
                </div>
			<?php endwhile; else : ?>
				<p><?php _e( 'Sorry, no posts matched your criteria.' ); ?></p>
			<?php endif; ?>
		</div>
	</div>
<?php get_footer();?>

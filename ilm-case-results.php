<?php
/*
Plugin Name: iLawyer Case Results
Plugin URI: https://www.ilawyermarketing.com/
Description: Creates a "Case Results" custom post type and provides a page template.
Version: 0.0.1
Author: Jonathan Dewitt
Author URI: http://jondewitt.io/
License: GPL2
*/

// Require ACF Pro
function ilm_case_results_require_acf_pro() {
    if (
		is_admin() &&
		current_user_can( 'activate_plugins' ) &&
		!is_plugin_active( 'advanced-custom-fields-pro/acf.php' ) ) {

        add_action( 'admin_notices', 'ilm_case_results_plugin_dependency_notice' );

        deactivate_plugins( plugin_basename( __FILE__ ) );

        if ( isset( $_GET['activate'] ) ) {
            unset( $_GET['activate'] );
        }
    }
}

function ilm_case_results_plugin_dependency_notice() {
    echo '<div class="error"><p>Sorry, but this plugin requires Advanced Custom Fields PRO to be installed and active.</p></div>';
}
add_action( 'admin_init', 'ilm_case_results_require_acf_pro' );

class CaseResultsTemplate {

	/**
	 * A reference to an instance of this class.
	 */
	private static $instance;

	/**
	 * The array of templates that this plugin tracks.
	 */
	protected $templates;

	/**
	 * Returns an instance of this class.
	 */
	public static function get_instance() {

		if ( null == self::$instance ) {
			self::$instance = new CaseResultsTemplate();
		}

		return self::$instance;

	}

	/**
	 * Initializes the plugin by setting filters and administration functions.
	 */
	private function __construct() {

		$this->templates = array();


		// Add a filter to the attributes metabox to inject template into the cache.
		if ( version_compare( floatval( get_bloginfo( 'version' ) ), '4.7', '<' ) ) {

			// 4.6 and older
			add_filter(
				'page_attributes_dropdown_pages_args',
				array( $this, 'register_project_templates' )
			);

		} else {

			// Add a filter to the wp 4.7 version attributes metabox
			add_filter(
				'theme_page_templates', array( $this, 'add_new_template' )
			);

		}

		// Add a filter to the save post to inject out template into the page cache
		add_filter(
			'wp_insert_post_data',
			array( $this, 'register_project_templates' )
		);


		// Add a filter to the template include to determine if the page has our
		// template assigned and return it's path
		add_filter(
			'template_include',
			array( $this, 'view_project_template')
		);


		// Add your templates to this array.
		$this->templates = array(
			'case-results.php' => 'Case Results',
		);

	}

	/**
	 * Adds our template to the page dropdown for v4.7+
	 *
	 */
	public function add_new_template( $posts_templates ) {
		$posts_templates = array_merge( $posts_templates, $this->templates );
		return $posts_templates;
	}

	/**
	 * Adds our template to the pages cache in order to trick WordPress
	 * into thinking the template file exists where it doens't really exist.
	 */
	public function register_project_templates( $atts ) {

		// Create the key used for the themes cache
		$cache_key = 'page_templates-' . md5( get_theme_root() . '/' . get_stylesheet() );

		// Retrieve the cache list.
		// If it doesn't exist, or it's empty prepare an array
		$templates = wp_get_theme()->get_page_templates();
		if ( empty( $templates ) ) {
			$templates = array();
		}

		// New cache, therefore remove the old one
		wp_cache_delete( $cache_key , 'themes');

		// Now add our template to the list of templates by merging our templates
		// with the existing templates array from the cache.
		$templates = array_merge( $templates, $this->templates );

		// Add the modified cache to allow WordPress to pick it up for listing
		// available templates
		wp_cache_add( $cache_key, $templates, 'themes', 1800 );

		return $atts;

	}

	/**
	 * Checks if the template is assigned to the page
	 */
	public function view_project_template( $template ) {

		// Get global post
		global $post;

		// Return template if post is empty
		if ( ! $post ) {
			return $template;
		}

		// Return default template if we don't have a custom one defined
		if ( ! isset( $this->templates[get_post_meta(
			$post->ID, '_wp_page_template', true
		)] ) ) {
			return $template;
		}

		$file = plugin_dir_path( __FILE__ ). get_post_meta(
			$post->ID, '_wp_page_template', true
		);

		// Just to be safe, we check if the file exist first
		if ( file_exists( $file ) ) {
			return $file;
		} else {
			echo $file;
		}

		// Return template
		return $template;

	}

}
add_action( 'plugins_loaded', array( 'CaseResultsTemplate', 'get_instance' ) );


function print_results_page_list() {
    global $post;
    $type = get_post_type();

    if ( $type === 'case_result' && $post->post_parent )
        $childpages = wp_list_pages( 'sort_column=menu_order&title_li=&child_of=' . $post->post_parent . '&echo=0' );
    else
        $childpages = wp_list_pages( 'sort_column=menu_order&title_li=&child_of=' . $post->ID . '&echo=0' );
    if ( $childpages ) { $string = '<ul>' . $childpages . '</ul>'; }
    echo $string;
}

function ilm_case_results_scripts() {
	if ( is_page_template('case-results.php') ) {
		wp_enqueue_style('ilm-case-results-style', plugins_url( '/css/case-results.css', __FILE__ ), false, false, 'screen');
		wp_enqueue_script('ilm-case-results', plugins_url( '/js/ilm-case-results-min.js', __FILE__ ), array('jquery'), null, true);
	}
}
add_action('wp_enqueue_scripts', 'ilm_case_results_scripts');

function ilm_register_case_results() {

	$labels = array(
		"name" => __( "Case Results", "" ),
		"singular_name" => __( "Case Result", "" ),
	);

	$args = array(
		"label" => __( "Case Results", "" ),
		"labels" => $labels,
		"description" => "",
		"public" => true,
		"publicly_queryable" => true,
		"show_ui" => true,
		"show_in_rest" => true,
		"rest_base" => "results",
		"has_archive" => false,
		"show_in_menu" => true,
		"exclude_from_search" => false,
		"capability_type" => "page",
		"map_meta_cap" => true,
		"hierarchical" => true,
		"rewrite" => array( "slug" => "results", "with_front" => true ),
		"query_var" => true,
		"supports" => array( "title", "editor", "page-attributes", "custom-fields" ),
	);

	register_post_type( "case_results", $args );
}

add_action( 'init', 'ilm_register_case_results' );

if( function_exists('acf_add_local_field_group') ):

acf_add_local_field_group(array(
	'key' => 'group_5aa6db70a202b',
	'title' => 'Case Results',
	'fields' => array(
		array(
			'key' => 'field_5aa6db79c8488',
			'label' => 'Case Result Type',
			'name' => 'case_result_type',
			'type' => 'text',
			'instructions' => 'Auto Accident, Worker\'s Comp, Confidential, etc.',
			'required' => 0,
			'conditional_logic' => 0,
			'wrapper' => array(
				'width' => '',
				'class' => '',
				'id' => '',
			),
			'default_value' => '',
			'placeholder' => '',
			'prepend' => '',
			'append' => '',
			'maxlength' => '',
		),
		array(
			'key' => 'field_5aa6dc01c8489',
			'label' => 'Case Result Amount',
			'name' => 'case_result_amount',
			'type' => 'text',
			'instructions' => 'Type as you\'d like to display, ex: $1,000,000 OR $1M',
			'required' => 0,
			'conditional_logic' => 0,
			'wrapper' => array(
				'width' => '',
				'class' => '',
				'id' => '',
			),
			'default_value' => '',
			'placeholder' => '',
			'prepend' => '',
			'append' => '',
			'maxlength' => '',
		),
		array(
			'key' => 'field_5aa6dc35c848a',
			'label' => 'Case Highlight',
			'name' => 'case_highlight',
			'type' => 'text',
			'instructions' => 'Brief summary of case',
			'required' => 0,
			'conditional_logic' => 0,
			'wrapper' => array(
				'width' => '',
				'class' => '',
				'id' => '',
			),
			'default_value' => '',
			'placeholder' => '',
			'prepend' => '',
			'append' => '',
			'maxlength' => '',
		),
	),
	'location' => array(
		array(
			array(
				'param' => 'post_type',
				'operator' => '==',
				'value' => 'case_results',
			),
		),
	),
	'menu_order' => 0,
	'position' => 'normal',
	'style' => 'default',
	'label_placement' => 'top',
	'instruction_placement' => 'label',
	'hide_on_screen' => '',
	'active' => 1,
	'description' => '',
));

endif;

?>

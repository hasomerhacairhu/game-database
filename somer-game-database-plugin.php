<?php
/*
Plugin Name: Somer Game Database Plugin
Description: Plugin for displaying game database with filters and dialogs.
Version: 1.0
Author: Bedő Marci
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Enqueue assets: external libraries + our own CSS/JS.
function srd_enqueue_assets() {
    // External libraries (CSS & JS)
    wp_enqueue_style('jquery-ui-css', 'https://code.jquery.com/ui/1.13.2/themes/base/jquery-ui.css');
    wp_enqueue_style('datatables-css', 'https://cdn.datatables.net/1.13.1/css/jquery.dataTables.min.css');
    wp_enqueue_style('select2-css', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css');

    wp_enqueue_script('jquery');
    wp_enqueue_script('jquery-ui', 'https://code.jquery.com/ui/1.13.2/jquery-ui.js', array('jquery'));
    wp_enqueue_script('datatables', 'https://cdn.datatables.net/1.13.1/js/jquery.dataTables.min.js', array('jquery'));
    wp_enqueue_script('papaparse', 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js', array());
    wp_enqueue_script('select2', 'https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js', array('jquery'));

    // Our custom CSS and JS.
    wp_enqueue_style('srd-style', plugins_url('assets/css/somer-game-database.css', __FILE__));
    wp_enqueue_script('srd-script', plugins_url('assets/js/somer-game-database.js', __FILE__), array('jquery', 'datatables', 'papaparse', 'select2'), false, true);
}
add_action('wp_enqueue_scripts', 'srd_enqueue_assets');

// Include shortcode registration.
require_once plugin_dir_path(__FILE__) . 'includes/shortcode.php';

<?php
/**
 * Plugin Name: Scout Games Plugin
 * Plugin URI: https://somer.hu/
 * Description: Provides a shortcode [somer_game_database] that displays a Vue 3 + Vuetify interface to filter and view scout games from a Google Sheet.
 * Version: 1.0
 * Author: Bedő Marci
 * Author URI: https://somer.hu/
 * Text Domain: scout-games
 * Domain Path: /languages
 */

// If this file is called directly, abort.
if (!defined('ABSPATH')) {
    exit;
}

// Enqueue scripts and styles (Vue, Vuetify, PapaParse, custom JS).
function sg_enqueue_scripts() {
    // Make sure jQuery is loaded
    wp_enqueue_script('jquery');
    
    // Load Vue and libraries
    wp_enqueue_script('vue', 'https://unpkg.com/vue@3/dist/vue.global.js', [], '3.2.40', true);
    wp_enqueue_script('vuetify', 'https://cdn.jsdelivr.net/npm/vuetify@3/dist/vuetify.min.js', ['vue'], '3.0.0', true);
    wp_enqueue_script('papaparse', 'https://cdn.jsdelivr.net/npm/papaparse@5.3.2/papaparse.min.js', [], '5.3.2', true);

    // Enqueue the app template so scoutGamesAppTemplate is available
    wp_enqueue_script(
        'scout-games-app-template',
        plugins_url('/assets/js/scout-games-app-template.js', __FILE__),
        [],
        '1.0.' . rand(1, 1000),
        true
    );

    // Our custom code that initializes the Vue UI - add random version to avoid caching
    wp_enqueue_script(
        'scout-games-interface',
        plugins_url('/assets/js/scout-games-interface.js', __FILE__),
        ['jquery', 'vue', 'vuetify', 'papaparse', 'scout-games-app-template'],
        '1.0.' . rand(1, 1000), // Add random number for dev to avoid cache
        true
    );

    // Vuetify styles
    wp_enqueue_style('vuetify-css', 'https://cdn.jsdelivr.net/npm/vuetify@3/dist/vuetify.min.css', [], '3.0.0');
    
    // Material Design Icons
    wp_enqueue_style('mdi-css', 'https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css', [], '6.0.0');
    
    // Our custom styles
    wp_enqueue_style(
        'scout-games-css',
        plugins_url('/assets/css/scout-games.css', __FILE__),
        [],
        '1.0.' . rand(1, 1000) // Random version for dev
    );
}

// Create and register the [somer_game_database] shortcode
function sg_render_scout_games() {
    // Always enqueue our scripts when shortcode is used
    sg_enqueue_scripts();
    
    ob_start(); ?>
    <div id="scout-games-app">
        <!-- Loading spinner to show while Vue initializes -->
        <div class="loading-container">
            <div class="loading-spinner"></div>
        </div>
    </div>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            console.log('Shortcode rendered, mounting Vue app to #scout-games-app');
        });
    </script>
    <?php 
    return ob_get_clean();
}

// Register hooks - Always load the shortcode
add_shortcode('somer_game_database', 'sg_render_scout_games');

// For debugging - force scripts to load on all pages during development
// Remove this for production
function sg_debug_scripts() {
    if (current_user_can('administrator')) {
        sg_enqueue_scripts();
    }
}
// Uncomment this line during development if needed
// add_action('wp_enqueue_scripts', 'sg_debug_scripts');

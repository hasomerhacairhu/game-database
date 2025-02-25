<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function game_database_shortcode() {
    ob_start();
    include plugin_dir_path(__FILE__) . '../views/scout-games-interface.php';
    return ob_get_clean();
}
add_shortcode('game_database', 'game_database_shortcode');

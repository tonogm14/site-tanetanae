<?php
/**
 * Tane Tanae — View counter via REST API
 * Pegar al final de functions.php en el tema activo de WordPress.
 */

// 1. Exponer contador_visitas como campo legible en el REST API
add_action( 'init', function () {
    register_post_meta( 'post', 'contador_visitas', [
        'show_in_rest'      => true,
        'single'            => true,
        'type'              => 'integer',
        'default'           => 0,
        'sanitize_callback' => 'absint',
    ] );
} );

// 2. Endpoint público para incremento atómico de vistas
//    POST /wp-json/tt/v1/view/{post_id}
add_action( 'rest_api_init', function () {
    register_rest_route( 'tt/v1', '/view/(?P<id>[\d]+)', [
        'methods'             => 'POST',
        'permission_callback' => '__return_true',
        'args'                => [
            'id' => [ 'validate_callback' => function( $v ) { return is_numeric( $v ) && $v > 0; } ],
        ],
        'callback'            => function ( WP_REST_Request $request ) {
            $id      = (int) $request['id'];
            $current = (int) get_post_meta( $id, 'contador_visitas', true );
            $new     = $current + 1;
            update_post_meta( $id, 'contador_visitas', $new );
            return rest_ensure_response( [ 'views' => $new ] );
        },
    ] );
} );

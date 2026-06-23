<?php
/**
 * Tane Tanae — Cache bust al guardar/actualizar un post.
 *
 * Pega este código en functions.php del tema activo, o súbelo como plugin.
 *
 * Variables de entorno que debes configurar en WordPress (o como constantes aquí):
 *   TANETANAE_API_URL   → URL pública del servicio API en Railway
 *                         (ej. https://tanetanae-api.up.railway.app  o  https://api.tanetanae.com)
 *   TANETANAE_CACHE_SECRET → el mismo valor que WEBHOOK_SECRET en Railway
 */

add_action( 'save_post', 'tt_bust_cache_on_save', 10, 3 );

function tt_bust_cache_on_save( $post_id, $post, $update ) {
    // Ignorar revisiones y auto-saves
    if ( wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
        return;
    }

    // Solo posts publicados (incluye transiciones a publish)
    if ( $post->post_type !== 'post' ) return;
    if ( ! in_array( $post->post_status, [ 'publish', 'future' ], true ) ) return;

    $api_url = defined( 'TANETANAE_API_URL' )
        ? TANETANAE_API_URL
        : ( getenv( 'TANETANAE_API_URL' ) ?: 'https://api.tanetanae.com' );

    $secret  = defined( 'TANETANAE_CACHE_SECRET' )
        ? TANETANAE_CACHE_SECRET
        : ( getenv( 'TANETANAE_CACHE_SECRET' ) ?: '' );

    $slug = $post->post_name;
    if ( empty( $slug ) ) {
        $slug = sanitize_title( $post->post_title );
    }

    wp_remote_post(
        trailingslashit( $api_url ) . 'cache/bust',
        [
            'headers'  => [
                'Content-Type'      => 'application/json',
                'x-webhook-secret'  => $secret,
            ],
            'body'     => wp_json_encode( [ 'slug' => $slug ] ),
            'timeout'  => 5,
            'blocking' => false,   // No bloquea el guardado del editor
            'sslverify' => true,
        ]
    );

    error_log( "TT cache bust enviado para slug: $slug" );
}

<?php
/**
 * Plugin Name: Tane Tanae Comments
 * Description: Comentarios de texto puro (sin links) con endpoints REST propios.
 * Version:     1.0.0
 * Author:      Tane Tanae
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ── Bloquear links en cualquier comentario ────────────────
add_filter( 'preprocess_comment', function ( $data ) {
    if ( preg_match( '/(https?:\/\/|www\.)/i', $data['comment_content'] ) ) {
        wp_die(
            'Los comentarios no pueden contener enlaces.',
            'Comentario rechazado',
            [ 'response' => 400, 'back_link' => true ]
        );
    }
    $data['comment_content'] = wp_strip_all_tags( $data['comment_content'] );
    return $data;
} );

// ── REST endpoints ────────────────────────────────────────
add_action( 'rest_api_init', function () {

    // GET /wp-json/tt/v1/comments/:post_id
    register_rest_route( 'tt/v1', '/comments/(?P<post_id>\d+)', [
        'methods'             => 'GET',
        'callback'            => 'tt_get_comments',
        'permission_callback' => '__return_true',
    ] );

    // POST /wp-json/tt/v1/comment
    register_rest_route( 'tt/v1', '/comment', [
        'methods'             => 'POST',
        'callback'            => 'tt_post_comment',
        'permission_callback' => '__return_true',
        'args'                => [
            'post_id'     => [ 'required' => true, 'type' => 'integer' ],
            'author_name' => [ 'required' => true, 'type' => 'string', 'sanitize_callback' => 'sanitize_text_field' ],
            'content'     => [ 'required' => true, 'type' => 'string' ],
        ],
    ] );
} );

function tt_get_comments( $request ) {
    $post_id  = (int) $request['post_id'];
    $comments = get_comments( [
        'post_id' => $post_id,
        'status'  => 'approve',
        'order'   => 'ASC',
        'number'  => 100,
        'type'    => 'comment',
    ] );

    $result = array_map( function ( $c ) {
        return [
            'id'      => (int) $c->comment_ID,
            'author'  => $c->comment_author,
            'content' => $c->comment_content,
            'date'    => $c->comment_date,
        ];
    }, $comments );

    return rest_ensure_response( array_values( $result ) );
}

function tt_post_comment( $request ) {
    $post_id     = (int) $request['post_id'];
    $author_name = sanitize_text_field( $request['author_name'] );
    $content     = sanitize_textarea_field( $request['content'] );

    // Verificar que el post existe y tiene comentarios abiertos
    $post = get_post( $post_id );
    if ( ! $post || $post->comment_status !== 'open' ) {
        return new WP_Error( 'comments_closed', 'Los comentarios estan cerrados para esta nota.', [ 'status' => 403 ] );
    }

    // Bloquear links
    if ( preg_match( '/(https?:\/\/|www\.)/i', $content ) ) {
        return new WP_Error( 'link_not_allowed', 'Los comentarios no pueden contener enlaces.', [ 'status' => 400 ] );
    }

    // Longitud minima
    if ( mb_strlen( trim( $content ) ) < 5 ) {
        return new WP_Error( 'too_short', 'El comentario es muy corto.', [ 'status' => 400 ] );
    }

    // Longitud maxima
    if ( mb_strlen( $content ) > 1000 ) {
        return new WP_Error( 'too_long', 'El comentario no puede tener mas de 1000 caracteres.', [ 'status' => 400 ] );
    }

    $comment_id = wp_insert_comment( [
        'comment_post_ID'  => $post_id,
        'comment_author'   => $author_name,
        'comment_content'  => $content,
        'comment_approved' => 0,
        'comment_type'     => 'comment',
        'comment_agent'    => 'TaneTanae-Frontend/1.0',
    ] );

    if ( ! $comment_id ) {
        return new WP_Error( 'insert_failed', 'No se pudo guardar el comentario.', [ 'status' => 500 ] );
    }

    return rest_ensure_response( [ 'success' => true, 'pending' => true ] );
}

<?php
/**
 * Plugin Name: Tane Tanae Banners
 * Description: Gestiona los banners publicitarios desde el admin de WordPress.
 * Version:     1.1.0
 * Author:      Tane Tanae
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ── Secciones que pueden tener banner ────────────────────
function tt_banner_sections() {
    return [
        'hero'                => 'Home / Despues del Hero',
        'mas-noticias'        => 'Home / Despues de Mas Noticias del dia',
        'sucesos-deportes'    => 'Home / Despues de Sucesos y Deportes',
        'fueron-noticias'     => 'Home / Despues de Fueron Noticias',
        'indigena'            => 'Home / Despues de Pueblos del Delta',
        'internacional'       => 'Home / Despues de Internacional',
        'home-sidebar-top'    => 'Home Sidebar / Arriba (encima de Otras noticias)',
        'videos'              => 'Home Sidebar / Despues de Videos',
        'home-sidebar-bottom' => 'Home Sidebar / Abajo (debajo de Categorias)',
        'articulo-cuerpo'     => 'Articulo / Despues del cuerpo',
        'articulo-sidebar'    => 'Articulo Sidebar / En el sidebar',
        'categoria-top'       => 'Categoria / Arriba de la pagina',
        'categoria-bottom'    => 'Categoria / Abajo de la pagina',
    ];
}

// ── Encolar scripts del media uploader de WP ─────────────
add_action( 'admin_enqueue_scripts', function ( $hook ) {
    if ( $hook !== 'toplevel_page_tt-banners' ) return;
    wp_enqueue_media();
    wp_add_inline_script( 'jquery-core', tt_banners_uploader_js() );
} );

function tt_banners_uploader_js() {
    return <<<'JS'
jQuery(function($) {
    var mediaFrame;

    $(document).on('click', '.tt-upload-btn', function(e) {
        e.preventDefault();
        var $btn    = $(this);
        var $wrap   = $btn.closest('.tt-banner-block');
        var $input  = $wrap.find('.tt-image-url');
        var $preview = $wrap.find('.tt-preview');

        if ( mediaFrame ) {
            mediaFrame.off('select');
        }

        mediaFrame = wp.media({
            title:    'Seleccionar imagen del banner',
            button:   { text: 'Usar esta imagen' },
            multiple: false,
            library:  { type: 'image' }
        });

        mediaFrame.on('select', function() {
            var attachment = mediaFrame.state().get('selection').first().toJSON();
            var url = attachment.sizes && attachment.sizes.large
                ? attachment.sizes.large.url
                : attachment.url;
            $input.val(url);
            $preview.html('<img src="' + url + '" style="max-height:80px;margin-top:8px;border-radius:4px;border:1px solid #ddd;display:block;">');
        });

        mediaFrame.open();
    });

    $(document).on('click', '.tt-remove-btn', function(e) {
        e.preventDefault();
        var $wrap = $(this).closest('.tt-banner-block');
        $wrap.find('.tt-image-url').val('');
        $wrap.find('.tt-preview').html('');
    });
});
JS;
}

// ── Menú en el admin ──────────────────────────────────────
add_action( 'admin_menu', function () {
    add_menu_page(
        'Banners',
        'Banners',
        'manage_options',
        'tt-banners',
        'tt_banners_page',
        'dashicons-format-image',
        60
    );
} );

// ── Guardar ───────────────────────────────────────────────
function tt_banners_save() {
    if (
        ! isset( $_POST['tt_banners_nonce'] ) ||
        ! wp_verify_nonce( $_POST['tt_banners_nonce'], 'tt_save_banners' )
    ) return;

    foreach ( tt_banner_sections() as $slug => $label ) {
        $raw = $_POST['banner'][ $slug ] ?? [];
        update_option( "tt_banner_{$slug}", [
            'image_url' => esc_url_raw( $raw['image_url'] ?? '' ),
            'link_url'  => esc_url_raw( $raw['link_url']  ?? '' ),
            'enabled'   => isset( $raw['enabled'] ) ? 1 : 0,
            'new_tab'   => isset( $raw['new_tab']  ) ? 1 : 0,
        ] );
    }
}

// ── Página de administración ──────────────────────────────
function tt_banners_page() {
    tt_banners_save();
    $saved = isset( $_POST['tt_banners_nonce'] ) && wp_verify_nonce( $_POST['tt_banners_nonce'], 'tt_save_banners' );
    ?>
    <div class="wrap">
        <h1 style="font-size:22px;margin-bottom:6px">Banners del sitio</h1>
        <p style="color:#666;margin-bottom:20px;margin-top:0">
            Sube una imagen directamente o pega una URL. Deja el campo de imagen vacio para ocultar el banner.
        </p>

        <?php if ( $saved ) : ?>
        <div class="notice notice-success is-dismissible">
            <p><strong>Banners guardados correctamente.</strong></p>
        </div>
        <?php endif; ?>

        <style>
            .tt-banner-block { background:#fff; border:1px solid #ddd; border-radius:8px; padding:18px 20px; margin-bottom:16px; }
            .tt-banner-block h3 { margin:0 0 14px; font-size:13px; font-weight:600; color:#1d2327; display:flex; align-items:center; justify-content:space-between; }
            .tt-banner-block h3 .tt-status { font-size:11px; font-weight:600; padding:2px 10px; border-radius:20px; }
            .tt-banner-block h3 .tt-status.on  { background:#d4edda; color:#155724; }
            .tt-banner-block h3 .tt-status.off { background:#f0f0f0; color:#888; }
            .tt-banner-row { display:grid; grid-template-columns:110px 1fr; gap:8px 14px; align-items:start; margin-bottom:10px; }
            .tt-banner-row label { font-size:12px; font-weight:500; color:#555; padding-top:8px; }
            .tt-banner-row input[type=url], .tt-banner-row input[type=text] {
                width:100%; padding:6px 9px; border:1px solid #ccc; border-radius:4px; font-size:13px; box-sizing:border-box;
            }
            .tt-upload-btn { margin-top:6px; font-size:12px; }
            .tt-remove-btn { margin-top:6px; margin-left:6px; font-size:12px; color:#b32d2e; border-color:#b32d2e; }
            .tt-checks { display:flex; gap:24px; padding-top:4px; }
            .tt-checks label { font-size:13px; display:flex; align-items:center; gap:5px; cursor:pointer; font-weight:400; }
        </style>

        <form method="post" style="max-width:800px">
            <?php wp_nonce_field( 'tt_save_banners', 'tt_banners_nonce' ); ?>

            <?php foreach ( tt_banner_sections() as $slug => $label ) :
                $b = get_option( "tt_banner_{$slug}", [
                    'image_url' => '', 'link_url' => '', 'enabled' => 0, 'new_tab' => 0,
                ] );
                $active = ! empty( $b['image_url'] ) && ! empty( $b['enabled'] );
                $sid    = 'tt_' . str_replace( '-', '_', $slug );
            ?>
            <div class="tt-banner-block">
                <h3>
                    <span><?php echo esc_html( $label ); ?></span>
                    <span class="tt-status <?php echo $active ? 'on' : 'off'; ?>">
                        <?php echo $active ? 'Activo' : 'Inactivo'; ?>
                    </span>
                </h3>

                <div class="tt-banner-row">
                    <label>Imagen</label>
                    <div>
                        <input
                            type="url"
                            id="<?php echo $sid; ?>_img"
                            name="banner[<?php echo esc_attr( $slug ); ?>][image_url]"
                            value="<?php echo esc_attr( $b['image_url'] ); ?>"
                            placeholder="https://..."
                            class="tt-image-url"
                        >
                        <div class="tt-preview">
                            <?php if ( ! empty( $b['image_url'] ) ) : ?>
                                <img src="<?php echo esc_url( $b['image_url'] ); ?>"
                                    style="max-height:80px;margin-top:8px;border-radius:4px;border:1px solid #ddd;display:block">
                            <?php endif; ?>
                        </div>
                        <button type="button" class="button tt-upload-btn">
                            Subir / Seleccionar imagen
                        </button>
                        <?php if ( ! empty( $b['image_url'] ) ) : ?>
                        <button type="button" class="button tt-remove-btn">
                            Quitar
                        </button>
                        <?php endif; ?>
                    </div>
                </div>

                <div class="tt-banner-row">
                    <label>Enlace destino</label>
                    <input
                        type="url"
                        name="banner[<?php echo esc_attr( $slug ); ?>][link_url]"
                        value="<?php echo esc_attr( $b['link_url'] ); ?>"
                        placeholder="https://anunciante.com  (opcional)"
                    >
                </div>

                <div class="tt-banner-row">
                    <label>Opciones</label>
                    <div class="tt-checks">
                        <label>
                            <input type="checkbox"
                                name="banner[<?php echo esc_attr( $slug ); ?>][enabled]"
                                value="1"
                                <?php checked( $b['enabled'], 1 ); ?>>
                            Mostrar
                        </label>
                        <label>
                            <input type="checkbox"
                                name="banner[<?php echo esc_attr( $slug ); ?>][new_tab]"
                                value="1"
                                <?php checked( $b['new_tab'], 1 ); ?>>
                            Abrir en nueva pestana
                        </label>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>

            <div style="margin-top:4px">
                <?php submit_button( 'Guardar todos los banners', 'primary large', 'submit', false ); ?>
            </div>
        </form>
    </div>
    <?php
}

// ── REST API: GET /wp-json/tt/v1/banners ──────────────────
add_action( 'rest_api_init', function () {
    register_rest_route( 'tt/v1', '/banners', [
        'methods'             => 'GET',
        'callback'            => 'tt_get_banners_rest',
        'permission_callback' => '__return_true',
    ] );
} );

function tt_get_banners_rest() {
    $result = [];
    foreach ( tt_banner_sections() as $slug => $label ) {
        $b = get_option( "tt_banner_{$slug}", [
            'image_url' => '', 'link_url' => '', 'enabled' => 0, 'new_tab' => 0,
        ] );
        $result[ $slug ] = [
            'image_url' => (string) ( $b['image_url'] ?? '' ),
            'link_url'  => (string) ( $b['link_url']  ?? '' ),
            'enabled'   => (bool)   ( $b['enabled']   ?? false ),
            'new_tab'   => (bool)   ( $b['new_tab']   ?? false ),
        ];
    }
    return rest_ensure_response( $result );
}

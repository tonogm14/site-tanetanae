<?php
/**
 * Tane Tanae — Administrador de Banners del Home
 *
 * Pega este archivo en /wp-content/plugins/tt-banners/tt-banners.php
 * o copia el contenido directo en functions.php de tu tema.
 *
 * Plugin Name: Tane Tanae Banners
 * Description: Gestiona los banners publicitarios del home desde el admin de WordPress.
 * Version:     1.0.0
 * Author:      Tane Tanae
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// ── Secciones del home que pueden tener banner ────────────
function tt_banner_sections() {
    return [
        'hero'             => 'Después del Hero (noticias recientes)',
        'mas-noticias'     => 'Después de Más Noticias del día',
        'sucesos-deportes' => 'Después de Sucesos & Deportes',
        'fueron-noticias'  => 'Después de Fueron Noticias',
        'videos'           => 'Después de Videos',
        'indigena'         => 'Después de Pueblos del Delta',
        'internacional'    => 'Después de Internacional (Trinidad / Guyana)',
    ];
}

// ── Menú en el admin ──────────────────────────────────────
add_action( 'admin_menu', function () {
    add_menu_page(
        'Banners del Home',
        'Banners',
        'manage_options',
        'tt-banners',
        'tt_banners_page',
        'dashicons-format-image',
        60
    );
} );

// ── Página de administración ──────────────────────────────
function tt_banners_page() {
    if (
        isset( $_POST['tt_banners_nonce'] ) &&
        wp_verify_nonce( $_POST['tt_banners_nonce'], 'tt_save_banners' )
    ) {
        foreach ( tt_banner_sections() as $slug => $label ) {
            $raw = $_POST['banner'][ $slug ] ?? [];
            update_option( "tt_banner_{$slug}", [
                'image_url' => esc_url_raw( $raw['image_url'] ?? '' ),
                'link_url'  => esc_url_raw( $raw['link_url']  ?? '' ),
                'enabled'   => isset( $raw['enabled'] ) ? 1 : 0,
                'new_tab'   => isset( $raw['new_tab']  ) ? 1 : 0,
            ] );
        }
        echo '<div class="notice notice-success is-dismissible"><p><strong>Banners guardados correctamente.</strong></p></div>';
    }
    ?>
    <div class="wrap">
        <h1>🖼 Banners del Home</h1>
        <p style="color:#666;margin-bottom:24px">
            Sube la imagen a la <strong>Biblioteca de Medios</strong>, copia la URL y pégala aquí.
            Deja el campo de imagen en blanco para ocultar el banner.
        </p>

        <form method="post" style="max-width:780px">
            <?php wp_nonce_field( 'tt_save_banners', 'tt_banners_nonce' ); ?>

            <?php foreach ( tt_banner_sections() as $slug => $label ) :
                $b = get_option( "tt_banner_{$slug}", [
                    'image_url' => '',
                    'link_url'  => '',
                    'enabled'   => 0,
                    'new_tab'   => 0,
                ] );
                $active = ! empty( $b['image_url'] ) && ! empty( $b['enabled'] );
            ?>
            <div style="background:#fff;border:1px solid #ddd;border-radius:8px;padding:20px 24px;margin-bottom:20px;box-shadow:0 1px 3px rgba(0,0,0,.06)">

                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
                    <strong style="font-size:14px"><?php echo esc_html( $label ); ?></strong>
                    <span style="
                        font-size:11px;font-weight:600;padding:3px 12px;border-radius:20px;
                        background:<?php echo $active ? '#d4edda' : '#f0f0f0'; ?>;
                        color:<?php echo $active ? '#155724' : '#888'; ?>;
                    ">
                        <?php echo $active ? 'Activo' : 'Inactivo'; ?>
                    </span>
                </div>

                <table style="width:100%;border-collapse:collapse">
                    <tr>
                        <td style="width:130px;padding:6px 12px 6px 0;vertical-align:top;font-size:13px;color:#444;font-weight:500">
                            Imagen (URL)
                        </td>
                        <td style="padding:4px 0">
                            <input
                                type="url"
                                name="banner[<?php echo esc_attr( $slug ); ?>][image_url]"
                                value="<?php echo esc_attr( $b['image_url'] ); ?>"
                                placeholder="https://tanetanae.com/wp-content/uploads/banner.jpg"
                                style="width:100%;padding:7px 10px;border:1px solid #ccc;border-radius:4px;font-size:13px"
                            >
                            <?php if ( ! empty( $b['image_url'] ) ) : ?>
                                <div style="margin-top:8px">
                                    <img
                                        src="<?php echo esc_url( $b['image_url'] ); ?>"
                                        style="max-height:70px;border-radius:4px;border:1px solid #ddd"
                                        alt="Vista previa"
                                    >
                                </div>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:10px 12px 6px 0;vertical-align:top;font-size:13px;color:#444;font-weight:500">
                            Enlace destino
                        </td>
                        <td style="padding:8px 0 4px">
                            <input
                                type="url"
                                name="banner[<?php echo esc_attr( $slug ); ?>][link_url]"
                                value="<?php echo esc_attr( $b['link_url'] ); ?>"
                                placeholder="https://anunciante.com (dejar vacío si no lleva enlace)"
                                style="width:100%;padding:7px 10px;border:1px solid #ccc;border-radius:4px;font-size:13px"
                            >
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:10px 12px 6px 0;font-size:13px;color:#444;font-weight:500">Opciones</td>
                        <td style="padding:10px 0 4px;display:flex;gap:28px">
                            <label style="font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer">
                                <input
                                    type="checkbox"
                                    name="banner[<?php echo esc_attr( $slug ); ?>][enabled]"
                                    value="1"
                                    <?php checked( $b['enabled'], 1 ); ?>
                                >
                                Mostrar en el home
                            </label>
                            <label style="font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer">
                                <input
                                    type="checkbox"
                                    name="banner[<?php echo esc_attr( $slug ); ?>][new_tab]"
                                    value="1"
                                    <?php checked( $b['new_tab'], 1 ); ?>
                                >
                                Abrir en nueva pestaña
                            </label>
                        </td>
                    </tr>
                </table>
            </div>
            <?php endforeach; ?>

            <div style="margin-top:8px">
                <?php submit_button( 'Guardar todos los banners', 'primary large', 'submit', false ); ?>
            </div>
        </form>
    </div>
    <?php
}

// ── REST API: GET /wp-json/tt/v1/banners ──────────────────
// Consumido por el API de Express (con caché de 120s)
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
            'image_url' => '',
            'link_url'  => '',
            'enabled'   => 0,
            'new_tab'   => 0,
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

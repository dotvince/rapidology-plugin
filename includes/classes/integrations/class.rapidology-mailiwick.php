<?php

if (!class_exists('RAD_Dashboard')) {
    require_once(RAD_RAPIDOLOGY_PLUGIN_DIR . 'rapidology.php');
}

class rapidology_mailiwick extends RAD_Rapidology
{

    public function __contruct()
    {
        parent::__construct();
        $this->permissionsCheck();
    }

    public function draw_mailiwick_form($form_fields, $service, $field_values)
    {
        $form_fields .= sprintf( '
					<div class="rad_dashboard_account_row">
						<label for="%1$s">%2$s</label>
						<input type="password" value="%3$s" id="%1$s">%4$s
					</div>',
            esc_attr( 'api_key_' . $service ),
            __( 'API key', 'rapidology' ),
            ( '' !== $field_values && isset( $field_values['api_key'] ) ) ? esc_attr( $field_values['api_key'] ) : '',
            RAD_Rapidology::generate_hint( sprintf(
                '<a href="http://www.rapidology.com/docs#'.$service.'" target="_blank">%1$s</a>',
                __( 'Click here for more information', 'rapidology' )
            ), false
            )
        );
        return $form_fields;
    }

    /**
     * Retrieves the lists via Campaign Monitor API and updates the data in DB.
     * @return string
     */
    function get_mailiwick_lists( $api_key, $name ) {
        require_once( RAD_RAPIDOLOGY_PLUGIN_DIR . 'subscription/mailiwick/mailiwick.php' );

        $mailiwick = new Mailiwick_Rapidology($api_key);

        $retval = $mailiwick->call( 'lists' );

        if ( is_wp_error( $retval ) ) {
            return "Error connecting to Mailiwick: " . $retval->get_error_message();
        }

        $lists = $this->all_mailiwick_lists($retval);

        $this->update_account( 'mailiwick', sanitize_text_field( $name ), array(
            'lists'         => $lists,
            'api_key'       => sanitize_text_field( $api_key ),
            'is_authorized' => 'true',
        ) );

        return 'success';
    }

    /**
     * Format list data for saving to database
     *
     * @param $returnedLists
     *
     * @return array
     */
    private function all_mailiwick_lists( $returnedLists ) {
        $current_lists = array();
        foreach ( $returnedLists['items'] as $list ) {
            $current_lists[ $list['listId'] ]['listId']                = sanitize_text_field( $list['listId'] );
            $current_lists[ $list['listId'] ]['name']              = sanitize_text_field( $list['name'] );
            $current_lists[ $list['listId'] ]['growth_week']       = 0; //not using calculate_growth_rate() since subscriber counts are not available via API.
        }

        return $current_lists;
    }

    /**
     * Subscribes to Campaign Monitor list. Returns either "success" string or error message.
     * @return string
     */
    function subscribe_mailiwick( $api_key, $list_id, $email ) {

        if ( ! class_exists( 'Mailiwick_Rapidology' ) ) {
            require_once( RAD_RAPIDOLOGY_PLUGIN_DIR . 'subscription/mailiwick/mailiwick.php' );
        }

        $mailiwick = new Mailiwick_Rapidology( $api_key );

        $args = array(
            'listId'       => $list_id,
            'emailAddress' => $email,
            'ipAddress'    => $_SERVER['REMOTE_ADDR']

        );

        $retval = $mailiwick->call( 'subscribers', $args, 'POST' );

        if ( is_wp_error( $retval ) ) {
            $error_message = $retval->get_error_message();
        } else {
            $error_message = 'success';
        }

        return $error_message;
    }
}
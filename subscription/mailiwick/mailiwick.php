<?php

/**
 * Mailiwick API Class
 *
 * @version 1.0.0
 */
class Mailiwick_Rapidology {
    /** @var string  */
    private $api_key;

    /** @var string  */
    private $api_endpoint = "http://api.mailiwick.com/v1";

    /**
     * Create a new instance
     * @param string $api_key Your Mailiwick API key
     */
    function __construct($api_key) {
        $this->api_key = $api_key;
    }

    /**
     * Call an API method
     *
     * @param  string $endpoint The API endpoint to call, Example:  'tags'
     * @param  array  $args     An array of arguments to pass to the method that will be json-encoded
     * @param  string $method   GET OR POST
     * @return array|WP_Error   associative array of json decoded API response or WP_ERROR
     */
    public function call($endpoint, $args=array(), $method = 'GET') {
        return $this->makeRequest( $endpoint, $args, $method);
    }

    /**
     * Performs the request
     *
     * @param  string           $endpoint The API method to be called
     * @param  array            $args   Assoc array of parameters to be passed
     * @param  string           $method  Either GET or POST
     * @return array|WP_error   Assoc array of decoded result
     */
    private function makeRequest( $endpoint, $args=array(), $method ) {

        $request_url = $this->api_endpoint . "/" . $endpoint;

        $request_args = array_merge( array(
            'body'    => $args,
            'headers' => array(
                'Accept'  => 'application/json',
                'Api-Key' => $this->api_key
            ),
            'method'  => $method,
            'timeout' => 5,
        ), $args);

        $response    = wp_remote_request($request_url, $request_args);

        if ( is_wp_error( $response ) ) {
            return $response;
        } else {
            $response_body = wp_remote_retrieve_body( $response );
            $response_data = json_decode( $response_body, true );

            if ( is_null( $response_data ) ) {
                return false;
            } elseif ( ! 200 ==  $response['response']['code'] ) {
                return false;
            } else {
                return $response_data;
            }
        }
    }
}


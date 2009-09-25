<?php
/**
 * Application Controller for VIVIPOS.
 *
 */
App::import('Core', array('HttpSocket','CakeLog'));

class AppController extends Controller {

    /**
     * Holds the copy of SyncSettings
     *
     * @var array
     * @access public
     */
    var $syncSettings = array();

    /**
     * default index , eat all response
     */
    function index () {
        echo "";
        exit;
    }


    /**
     * machine authorization with http basic authorization.
     *
     * response server machine_id
     * 
     * @param string $client_machine_id
     */
    function auth($client_machine_id="") {

        $sync_settings =& $this->syncSettings;

        // return server's machine_id
        if ($sync_settings != null) {
            echo trim($sync_settings['machine_id']);

        }else {
            echo "";
        }
        exit;
    }
    
}
?>
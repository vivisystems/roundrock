<?php

App::import('Core', array('HttpSocket','CakeLog'));

class PromotionsController extends AppController {

    var $name = 'Promotions';

    var $uses = array('Promotion');
	
    var $components = array('SyncHandler', 'Security');

    var $syncSettings = array();

    function beforeFilter() {

        $this->syncSettings =& Configure::read('sync_settings');

        $sync_settings =& $this->syncSettings;


        $password = "rachir";
        if ($sync_settings != null) {
            $password = $sync_settings['password'];
        }

        $this->Security->loginOptions = array(
			'type'=>'basic',
			'realm'=>'VIVIPOS_API Realm'
            // 'prompt'=> false
        );
        $this->Security->loginUsers = array(
			'vivipos'=> $password
        );

        $this->Security->requireLogin();

    }

    /**
     * machine authorization with http basic authorization.
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


    function getPromotion ($key) {

        $value = $this->Promotion->getPromotions();

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $value
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }




}
?>
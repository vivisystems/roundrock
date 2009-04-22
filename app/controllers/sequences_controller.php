<?php

App::import('Core', array('HttpSocket','CakeLog'));

class SequencesController extends AppController {

    var $name = 'Sequences';

    var $uses = array('Sequence');
	
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


    function getSequence ($key) {

        $value = $this->Sequence->getSequence($key);

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $value
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }

    function resetSequence ($key, $value) {

        $value = $this->Sequence->resetSequence($key, $value);

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $value
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }

}
?>
<?php

App::import('Core', array('HttpSocket','CakeLog'));

class SyncsController extends AppController {

	var $name = 'Syncs';

    var $uses = null; //array('Sync', 'SyncRemoteMachine');
	
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

    /**
     * get all new datas and generate sql to client
     *
     * Server side
     *
     * @param string $client_machine_id
     */
    function pull($client_machine_id="") {

        try {
            set_time_limit(0);

            $datas = $this->SyncHandler->getServerData($client_machine_id);

            $result = array (
                   'success' => true,
                   'data' => $datas

            );

        }catch (Exception $e) {

            $result = array (
                   'success' => false,
                   'data' => false

            );
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'php'); // php response type

        echo $responseResult;
        
        exit;

    }


    function pull_commit($client_machine_id="") {

        try {
            // from POST method
            $requestData = $_REQUEST['request_data'];

            $requests = $this->SyncHandler->parseRequest($requestData, 'php');

            // save client machine 's last_synced datas
            $this->SyncHandler->saveLastSynced($client_machine_id, $requests);

            $result = array (
                   'success' => true,
                   'data' => $requests
            );

        }catch (Exception $e) {

            $result = array (
                   'success' => false,
                   'data' => false

            );
            
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'php'); // php response type

        echo $responseResult;

        exit;

    }

    /**
     * get all new datas and generate to server
     *
     *  Server side
     *
     * @param string $client_machine_id
     */
    function push($client_machine_id="") {

        try {

            set_time_limit(0);
            
            // from POST method
            $requestData = $_REQUEST['request_data'];

            $datas = $this->SyncHandler->parseRequest($requestData, 'php');

            $saveResult = $this->SyncHandler->saveClientData($client_machine_id, $datas);

            $result = array (
                   'success' => true,
                   'data' => $saveResult
            );

        }catch(Exception $e) {

            $result = array (
                   'success' => false,
                   'data' => false

            );

        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'php'); // php response type

        echo $responseResult;

        exit;

    }


	function index() {

		exit;
	}


	function sync_log() {
	}

}
?>
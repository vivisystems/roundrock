<?php

class SyncsController extends AppController {

    var $name = 'Syncs';

    var $uses = null; //array('Sync', 'SyncRemoteMachine');
	
    var $components = array('SyncHandler', 'Security');


    /**
     * beforeFilter
     *
     * discard truncate for basic auth
     *
     * @see app/AppController#beforeFilter()
     */
    function beforeFilter() {

        if ($this->params['action'] == 'truncate') return;
        
        parent::beforeFilter();
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

            // set php time limit to unlimimted
            set_time_limit(0);

            $datas = $this->SyncHandler->getServerData($client_machine_id, $_REQUEST);

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

            // set php time limit to unlimimted
            set_time_limit(0);

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

            // set php time limit to unlimimted
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

    function truncate($days=7) {

        // set php time limit to unlimimted
        set_time_limit(0);

        if ($days < 1) $days = 1;

        echo "truncate   $days \n\n\n";
        
        return $this->SyncHandler->truncateSync($days);

        exit;
    }


    function index() {

        exit;
    }


    function sync_log() {
    }

}

?>
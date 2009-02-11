<?php

App::import('Core', array('HttpSocket','CakeLog'));

class SyncClientsController extends AppController {

	var $name = 'SyncClients';

    var $uses = null;
	
	var $components = array('SyncHandler');

    var $syncSettings = array();

    var $authURL = "";

    var $pullURL = "";

    var $pullCommitURL = "";

    var $pushURL = "";


	function beforeFilter() {

        $this->syncSettings =& Configure::read('sync_settings');

        $this->authURL = $this->syncSettings['protocol'] . '://' .
               $this->syncSettings['hostname'] . ':' .
               $this->syncSettings['port'] . '/' .
               'syncs/auth/' .
               $this->syncSettings['machine_id'] ;

        $this->pullURL = $this->syncSettings['protocol'] . '://' .
               $this->syncSettings['hostname'] . ':' .
               $this->syncSettings['port'] . '/' .
               'syncs/pull/' .
               $this->syncSettings['machine_id'] ;

        $this->pullCommitURL = $this->syncSettings['protocol'] . '://' .
               $this->syncSettings['hostname'] . ':' .
               $this->syncSettings['port'] . '/' .
               'syncs/pull_commit/' .
               $this->syncSettings['machine_id'] ;

        $this->pushURL = $this->syncSettings['protocol'] . '://' .
               $this->syncSettings['hostname'] . ':' .
               $this->syncSettings['port'] . '/' .
               'syncs/push/' .
               $this->syncSettings['machine_id'] ;


	}

    function &getHttpSocket() {

        $password = $this->syncSettings['password'] ;
        $timeout = $this->syncSettings['timeout'] ;

        $http_config = array('request' => array(
                                                'auth' => array(
                                                               'method' => 'Basic',
                                                               'user'=>'vivipos',
                                                               'pass'=> $password
                                                                 )
                                                ),
                              'timeout' => $timeout
                             );
        // auth from server
        $http = new HttpSocket($http_config);
        return $http;

    }


    function client_pull() {

        $auth_url = $this->authURL ;
        $pull_url = $this->pullURL;
        $pull_commit_url = $this->pullCommitURL;

        $my_machine_id = $this->syncSettings['machine_id'] ;

        // auth from server
        $http =& $this->getHttpSocket();
        $server_machine_id = $http->get($auth_url);

        // maybe timeout or localhost
        if (empty($server_machine_id) || ($server_machine_id == $my_machine_id) ) {
            return false;
        }

        // get data from server
        $http =& $this->getHttpSocket();
        
        $responseData = $http->get($pull_url);

        // save to database
        $pullResult = $this->SyncHandler->parseResponse($responseData, 'php');

        if (!$pullResult['success']) {
            return false;
        }

        $saveResult = $this->SyncHandler->saveServerData($server_machine_id, $pullResult['data']);

        // commit to sync_remote_machines
        // call server 's pull commit with last_synced
        $lastSyncedData = array();
        foreach ($saveResult as $data) {
            $dbConfig = $data['datasource'];
            $lastSynced = $data['last_synced'];
            $count = $data['count'];
            if ($count > 0) $lastSyncedData[$dbConfig] = array('datasource' => $dbConfig ,
                                                                       'count' => $count,
                                                                       'last_synced' => $lastSynced );
        }
        
        // update pull commit
        if (count($lastSyncedData) > 0) {

            $http =& $this->getHttpSocket();

            $requestData = $this->SyncHandler->prepareRequest($lastSyncedData, 'php'); // php request type
            
            $responseData = $http->post($pull_commit_url, array('request_data'=>$requestData) );

            $pullCommitResult = $this->SyncHandler->parseResponse($responseData, 'php');

            if (!$pullCommitResult['success']) {
                return false;
            }
        }
        
        // success
        return $lastSyncedData;

    }

    function client_push() {

        $auth_url = $this->authURL ;
        $push_url = $this->pushURL;

        $my_machine_id = $this->syncSettings['machine_id'] ;

        // auth from server
        $http =& $this->getHttpSocket();
        $server_machine_id = $http->get($auth_url);

        // maybe timeout or localhost
        if (empty($server_machine_id) || ($server_machine_id == $my_machine_id) ) {
            return false;
        }

        $datas = $this->SyncHandler->getClientData($server_machine_id);
        $requestData = $this->SyncHandler->prepareRequest($datas, 'php'); // php request type

        // send push commit
        $http =& $this->getHttpSocket();
        
        $responseData = $http->post($push_url, array('request_data'=>$requestData) );

        $pushResult = $this->SyncHandler->parseResponse($responseData, 'php');

        if(!$pushResult['success']) {
            return false;
        }

        $lastSyncedData = array();
        foreach ($pushResult['data'] as $data) {
            $dbConfig = $data['datasource'];
            $lastSynced = $data['last_synced'];
            $count = $data['count'];
            if ($count > 0) $lastSyncedData[$dbConfig] = array('datasource' => $dbConfig,
                                                               'count' => $count,
                                                               'last_synced' => $lastSynced);
        }

        if (count($lastSyncedData) > 0) {

            // save lastSynced
            $result = $this->SyncHandler->saveLastSynced($server_machine_id, $lastSyncedData);
            
        }

        return $lastSyncedData;

    }


	function index() {

		exit;
	}


	function perform_sync() {

        $pull_result = $this->client_pull();
        $push_result = $this->client_push();

        return array('pull_result' => ($pull_result !== false), 'push_result' => ($push_result !== false) );
        
	}

}
?>
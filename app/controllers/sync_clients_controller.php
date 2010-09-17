<?php
App::import('Core', array('HttpSocket','CakeLog'));

class SyncClientsController extends AppController {

    var $name = 'SyncClients';

    var $uses = null;
	
    var $components = array('SyncHandler');

//    var $syncSettings = array();

    var $authURL = "";

    var $pullURL = "";

    var $pullCommitURL = "";

    var $pushURL = "";


    function beforeFilter() {

//        $this->syncSettings =& Configure::read('sync_settings');

        $baseURI = $this->syncSettings['protocol'] . '://' .
        $this->syncSettings['hostname'] . ':' .
        $this->syncSettings['port'] . '/' .
               'syncs';

        $this->authURL = $baseURI . '/auth/' . $this->syncSettings['machine_id'] ;
        $this->pullURL = $baseURI . '/pull/' . $this->syncSettings['machine_id'] ;
        $this->pullCommitURL = $baseURI . '/pull_commit/' . $this->syncSettings['machine_id'] ;
        $this->pushURL = $baseURI . '/push/' . $this->syncSettings['machine_id'] ;

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

        // set php time limit to unlimimted
        set_time_limit(0);

        $auth_url = $this->authURL ;
        $pull_url = $this->pullURL;
        $pull_commit_url = $this->pullCommitURL;

        $my_machine_id = $this->syncSettings['machine_id'] ;

        // auth from server
        $http =& $this->getHttpSocket();
        $server_machine_id = $http->get($auth_url);

        // maybe timeout or localhost
        if (empty($server_machine_id)) {
            return false;
        }

        if ($server_machine_id == $my_machine_id) {
            return true;
        }

        // get data from server
        $http =& $this->getHttpSocket();
        
        $responseData = $http->get($pull_url, $this->syncSettings);

        // save to database
        $pullResult = $this->SyncHandler->parseResponse($responseData, 'php');
        unset($responseData);
        
        if (!$pullResult['success']) {
            return false;
        }

        $saveResult = $this->SyncHandler->saveServerData($server_machine_id, $pullResult['data']);
        unset($pullResult);

        // commit to sync_remote_machines
        // call server 's pull commit with last_synced
        $lastSyncedData = array();
        foreach ($saveResult as $data) {
            $dbConfig = $data['datasource'];
            $lastSynced = $data['last_synced'];
            $count = $data['count'];
            if ($count > 0) {
                $lastSyncedData[$dbConfig] = array('datasource' => $dbConfig ,
                                                                       'count' => $count,
                                                                       'last_synced' => $lastSynced );
            }
        }
        
        // update pull commit
        if (count($lastSyncedData) > 0) {

            $http =& $this->getHttpSocket();

            $requestData = $this->SyncHandler->prepareRequest($lastSyncedData, 'php'); // php request type
            
            $responseData = $http->post($pull_commit_url, array('request_data'=>$requestData) );

            $pullCommitResult = $this->SyncHandler->parseResponse($responseData, 'php');

            unset($requestData);
            unset($responseData);

            if (!$pullCommitResult['success']) {
                return false;
            }

            unset($pullCommitResult);
        }
        
        // success
        return $lastSyncedData;

    }

    function client_push() {

        // set php time limit to unlimimted
        set_time_limit(0);

        $auth_url = $this->authURL ;
        $push_url = $this->pushURL;

        $my_machine_id = $this->syncSettings['machine_id'] ;

        // auth from server
        $http =& $this->getHttpSocket();
        $server_machine_id = $http->get($auth_url);

        // maybe timeout or localhost
        if (empty($server_machine_id)) {
            return false;
        }

        if ($server_machine_id == $my_machine_id) {
            return true;
        }

        $datas = $this->SyncHandler->getClientData($server_machine_id);
        $requestData = $this->SyncHandler->prepareRequest($datas, 'php'); // php request type
        unset($datas);
        
        // send push commit
        $http =& $this->getHttpSocket();
        
        $responseData = $http->post($push_url, array('request_data'=>$requestData) );
        unset($requestData);

        $pushResult = $this->SyncHandler->parseResponse($responseData, 'php');
        unset($responseData);

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
        unset($pushResult);

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

        // set php time limit to unlimimted
        set_time_limit(0);

        $pull_result = $this->client_pull();
        $push_result = $this->client_push();

        return array('pull_result' => ($pull_result !== false), 'push_result' => ($push_result !== false) );
        
    }

    
    function perform_sync_all() {

        // set php time limit to unlimimted
        set_time_limit(0);

        $pull_result = $this->client_pull();

        $auth_url = $this->authURL ;
        $push_url = $this->pushURL;

        $my_machine_id = $this->syncSettings['machine_id'] ;

        // auth from server
        $http =& $this->getHttpSocket();
        $server_machine_id = $http->get($auth_url);

        // maybe timeout or localhost
        if (empty($server_machine_id)) {
            return false;
        }

        if ($server_machine_id == $my_machine_id) {
            return true;
        }

        $preSum = 0 ;
        do {

            $datas = $this->SyncHandler->getClientDataCount($server_machine_id);

            $sum = array_sum(Set::classicExtract($datas, '{s}.count'));
            unset($datas);

            if ($sum <= 0) break;
            
            if ($preSum == $sum ) {
                // maybe push error , break and log
                CakeLog::write('warn', "sync_client sync_all: presum == sum, maybe push error.");
            }

            $push_result = $this->client_push();

            if ($push_result === false) break;

        }while ( $sum > 0);

        return array('pull_result' => ($pull_result !== false), 'push_result' => ($push_result !== false) );

    }

}
?>
<?php

App::import('Core', array('HttpSocket','CakeLog'));

class StocksController extends AppController {

    var $name = 'Stocks';

    var $uses = array('StockRecord','InventoryCommitment');

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
     * Get stock records by last modified and response format JSON
     *
     * @param <type> $lastModified 
     */
    function getLastModifiedRecords($lastModified = 0) {

        $result = array('status' => 'error', 'code' => 400 );

        $now = time();

        $stocks = $this->StockRecord->getLastModifiedRecords($lastModified);

        if (is_array($stocks)) {

            $result = array('status' => 'ok', 'code' => 200 );
            // $result['response_data'] = $stocks;
            $result['response_data'] = $this->SyncHandler->prepareResponse($stocks, 'bgz_json');

        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    function checkStockRecords() {

    // from POST method
        $requestData = $_REQUEST['request_data'];

        $requests = $this->SyncHandler->parseRequest($requestData, 'json');

        $result = array('status' => 'error', 'code' => 400 );

        if (is_array($requests)) {

            $stocks = $this->StockRecord->getLastModifiedRecords($lastModified);

            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $stocks;

        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    function decreaseStockRecords($lastModified = 0) {

        $requestData = $_REQUEST['request_data'];

        $requests = $this->SyncHandler->parseRequest($requestData, 'json');

        $result = array('status' => 'error', 'code' => 400 );

        if (is_array($requests)) {

            $lastModifiedInventory = $this->InventoryCommitment->getLastModified();

            $this->StockRecord->decreaseStockRecords($requests, $lastModifiedInventory);
        }

        $stocks = $this->StockRecord->getLastModifiedRecords($lastModified);

        if (is_array($stocks)) {

            $result = array('status' => 'ok', 'code' => 200 );
            //$result['response_data'] = $stocks;
            // $result['response_data'] = $stocks;
            $result['response_data'] = $this->SyncHandler->prepareResponse($stocks, 'bgz_json');


        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


}
?>
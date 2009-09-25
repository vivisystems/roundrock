<?php

class StocksController extends AppController {

    var $name = 'Stocks';

    var $uses = array('StockRecord','InventoryCommitment');

    var $components = array('SyncHandler', 'Security');


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

        $decreaseResult = false;

        if (is_array($requests)) {

            $lastModifiedInventory = $this->InventoryCommitment->getLastModified();

            $decreaseResult = $this->StockRecord->decreaseStockRecords($requests, $lastModifiedInventory);
        }

        if ($decreaseResult) {

            $stocks = $this->StockRecord->getLastModifiedRecords($lastModified);

            if (is_array($stocks)) {

                $result = array('status' => 'ok', 'code' => 200 );
                //$result['response_data'] = $stocks;
                // $result['response_data'] = $stocks;
                $result['response_data'] = $this->SyncHandler->prepareResponse($stocks, 'bgz_json');


            }
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


}
?>
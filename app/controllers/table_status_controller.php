<?php

class TableStatusController extends AppController {

    var $name = 'TableStatus';

    var $uses = array('Table','TableSetting', 'TableStatus', 'TableMark', 'Order');

    var $components = array('SyncHandler', 'Security');


    /**
     * get tables
     */
    function getTablesStatus($lastModified) {

    // clear expire status
        $this->TableStatus->clearExpireStatuses();
        $tables_status = $this->TableStatus->getTablesStatusWithOrdersSummary($lastModified);

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $this->SyncHandler->prepareResponse($tables_status, 'bgz_json')
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }

    /**
     * rebuild table status
     */
    function rebuildTableStatus() {

        $result = $this->TableStatus->rebuildTableStatus();

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $result
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }


    /**
     * mergeTable
     * @param <type> $masterTableId
     * @param <type> $slaveTableId 
     */
    function mergeTable($masterTableId, $slaveTableId) {

        if (empty($masterTableId) || empty($slaveTableId)) {
            exit;
        }

        $this->TableStatus->mergeTable($masterTableId, $slaveTableId);

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => true
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }


    /**
     * unmergeTable
     * @param <type> $tableId 
     */
    function unmergeTable($tableId) {

        if (empty($tableId)) {
            exit;
        }

        $this->TableStatus->unmergeTable($tableId);

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => true
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }


    /**
     * markTable
     * @param <type> $tableId
     * @param <type> $markId
     * @param <type> $clerk 
     */
    function markTable($tableId, $markId, $clerk, $expire = 0) {

        if (empty($tableId) || empty($markId)) {
            exit;
        }

        $this->TableStatus->markTable($tableId, $markId, $clerk, $expire);

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => true
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }


    /**
     * unmarkTable
     * @param <type> $tableId
     */
    function unmarkTable($tableId) {

        if (empty($tableId)) {
            exit;
        }

        $this->TableStatus->unmarkTable($tableId);

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => true
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }

    /**
     * markRegion
     * @param <type> $regionId
     * @param <type> $markId
     * @param <type> $clerk
     */
    function markRegion($regionId, $markId, $clerk) {

        if (empty($regionId) || empty($markId)) {
            exit;
        }

        $this->TableStatus->markRegion($regionId, $markId, $clerk);

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => true
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }


    /**
     * unmarkRegion
     * @param <type> $regionId
     */
    function unmarkRegion($regionId) {

        if (empty($regionId)) {
            exit;
        }

        $this->TableStatus->unmarkRegion($regionId);

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => true
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }

}
?>

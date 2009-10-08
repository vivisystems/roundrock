<?php

class OrderQueuesController extends AppController {

    var $name = 'OrderQueues';

    var $uses = array('OrderQueue');

    var $components = array('SyncHandler', 'Security');


    /**
     * Push Queue from vivipos client
     */
    function pushQueue() {

        $orderObject = array();

        if(!empty($_REQUEST['request_data'])) {
            // file_put_contents("/tmp/pushQueue.req", $_REQUEST['request_data']); // for debug
            $request_data = $_REQUEST['request_data'];
        }else {
            $request_data = "{}";
            // $request_data = file_get_contents("/tmp/pushQueue.req"); // for debug
        }

        $datas = json_decode($request_data, true);

        $saveResult = false;
        $machineId = $this->SyncHandler->getRequestClientMachineId();

        try {

            $saveResult = $this->OrderQueue->pushQueue($datas['id'], $datas);

        }catch (Exception $e) {
            $saveResult = false;
        }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $saveResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type
        echo $responseResult;
        exit;
    }

    function popQueue($id) {

        $result = null;

        $machineId = $this->SyncHandler->getRequestClientMachineId();

        try {

            $result = $this->OrderQueue->popQueue($id);

        }catch (Exception $e) {
            $result = null;
        }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $result
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type
        echo $responseResult;
        exit;
    }


    function getQueueSummaries($user, $mode) {
        
        $result = array();

        $machineId = $this->SyncHandler->getRequestClientMachineId();

        try {

            $result = $this->OrderQueue->getQueueSummaries($user, $mode);

        }catch (Exception $e) {
            $result = array();
        }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $result
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type
        echo $responseResult;
        exit;
    }

    function getUserQueueCount($user) {

        $count = 0;
        $machineId = $this->SyncHandler->getRequestClientMachineId();

        try {

            $count = $this->OrderQueue->getUserQueueCount($user);

        }catch (Exception $e) {
            $count = 0;
        }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $count
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type
        echo $responseResult;
        exit;
    }


    function removeUserQueue($user) {

        $count = 0;
        $machineId = $this->SyncHandler->getRequestClientMachineId();

        try {

            $count = $this->OrderQueue->getUserQueueCount($user);

            if ($count>0) {
                $this->OrderQueue->removeUserQueue($user);
            }

        }catch (Exception $e) {
            $count = 0;
        }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $count
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type
        echo $responseResult;
        exit;

    }


}
?>
<?php

App::import('Core', array('HttpSocket','CakeLog'));

class OrdersController extends AppController {

    var $name = 'Orders';

    var $uses = array('Order','OrderItem','OrderAddition','OrderPayment','OrderAnnotation','OrderItemCondiment','OrderPromotion','OrderObject');

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
     * Save Orders from vivipos client 
     * 
     * USE Backup formats
     * 
     */
    function saveOrdersFromBackupFormat() {

        $orderObject = array();

        if(!empty($_REQUEST['request_data'])) {
            // for debug
            file_put_contents("/tmp/saveOrder.req", $_REQUEST['request_data']);
            $request_data = $_REQUEST['request_data'];

        }else {
            $request_data = "{}";
            // for debug
            $request_data = file_get_contents("/tmp/saveOrder.req");
        }

        $datas = json_decode($request_data, true);

        $orderModel = new Order();

        $result = true;

        try {
            
            $orderModel->saveOrdersFromBackupFormat($datas);

        }catch (Exception $e) {

            $result = false;
        }


        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $result
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }


    function readOrderToBackupFormat($orderId) {

        $orderModel = new Order();
        $result = null;

        try {

            $result = $orderModel->readOrderToBackupFormat($orderId);

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


    function getOrderId() {

        $result = null;

       if(!empty($_REQUEST['request_data'])) {
            $conditions = $_REQUEST['request_data'];
            $orderModel = new Order();
            $condition = array('conditions' => $conditions, 'recursive' =>-1 , 'fields' => 'id' );
            $order = $orderModel->find('first', $condition);
            if($order) {
                $result = $order['Order']['id'];
            }
        }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $result
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;

    }

    function getOrdersSummary() {

        $result = null;

       if(!empty($_REQUEST['request_data'])) {
            $conditions = $_REQUEST['request_data'];
//            $conditions = "orders.check_no='999' AND orders.status=2";
            $conditions = str_replace("orders.", "Order.", $conditions);
            $orderModel = new Order();
            // $orderModel->unbindHasManyModels();
            $condition = array('conditions' => $conditions, 'recursive' =>0 );
            $orders = $orderModel->find('all', $condition);
            if($orders) {
                $result = $orders;
            }
       }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $result
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;

    }


    function getCheckList($conditions) {

        $orders = $this->Order->getCheckList($conditions);

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $this->SyncHandler->prepareResponse($orders, 'bgz_json')// $orders
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type
        // file_put_contents("/tmp/getCheckList", $responseResult);
        echo $responseResult;

        exit;


    }

    function unserializeOrder($order_id, $machine_id) {

        $lockFile = "/tmp/$order_id";

        $r = $this->beginTransactionByOrder($order_id, $machine_id);

        if ($r) {

            $order = $this->Order->unserializeOrder($order_id);

            $result = array('status' => 'ok', 'code' => 200 ,
                'value' => $order
            );
        }else {

            $lockedByMachineId = file_get_contents($lockFile);
            $result = array('status' => 'ok', 'code' => 200 ,
                'value' => array('LockedByMachineId'=>$lockedByMachineId)
            );
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type
        // file_put_contents("/tmp/serializeOrder", $responseResult);
        echo $responseResult;

        exit;

    }

    function beginTransactionByOrder($order_id, $machine_id) {

        $lockFile = "/tmp/$order_id";
        if (!file_exists($lockFile)) {
            file_put_contents($lockFile, $machine_id);
            return true;
        }

        $lockedByMachineId = file_get_contents($lockFile);

        if ($machine_id != $lockedByMachineId) return false;

        return true;

    }

    function commitTransactionByOrder($order_id) {

        $lockFile = "/tmp/$order_id";

        if (!file_exists($lockFile)) return true;

        unlink($lockFile);

    }

    function savePayment($data) {
        $orderObject = array();

        if($_REQUEST['request_data']) {
            $paymentObject = json_decode(str_replace("\\","",$_REQUEST['request_data']), true);

        // file_put_contents("/tmp/savePayment", serialize($paymentObject));
        }

        if ($paymentObject) {
            $setResult = $this->OrderPayment->savePayment($paymentObject);
        }else {
            $setResult = false;
        }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $setResult,
            'value' => $setResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;



        exit;
    }

    function saveLedgerPayment($data) {
        $orderObject = array();

        if($_REQUEST['request_data']) {
            $paymentObject = json_decode(str_replace("\\","",$_REQUEST['request_data']), true);

        // file_put_contents("/tmp/saveLedgerPayment", serialize($paymentObject));
        }

        if ($paymentObject) {
            $setResult = $this->OrderPayment->saveLedgerPayment($paymentObject);
        }else {
            $setResult = false;
        }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $setResult,
            'value' => $setResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;



        exit;
    }

    function updateOrderMaster($data) {

        $orderObject = array();

        if($_REQUEST['request_data']) {
            $orderObject = json_decode(str_replace("\\","",$_REQUEST['request_data']), true);

        // file_put_contents("/tmp/updateOrderMaster", serialize($orderObject));
        }

        if ($orderObject) {
            $setResult = $this->Order->updateOrderMaster($orderObject);
        }else {
            $setResult = false;
        }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $setResult,
            'value' => $setResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;



        exit;
    }

}
?>
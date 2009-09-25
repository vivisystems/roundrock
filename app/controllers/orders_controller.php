<?php

class OrdersController extends AppController {

    var $name = 'Orders';

    var $uses = array('Order','OrderItem','OrderAddition','OrderPayment',
    'OrderAnnotation','OrderItemCondiment','OrderPromotion','OrderObject',
    'TableOrderLock', 'Table', 'TableSetting');

    var $components = array('SyncHandler', 'Security');


    /**
     * Save Orders from vivipos client
     *
     * USE Backup formats
     */
    function saveOrdersFromBackupFormat() {

        $orderObject = array();

        if(!empty($_REQUEST['request_data'])) {
            // for debug
            //file_put_contents("/tmp/saveOrder.req", $_REQUEST['request_data']);
            $request_data = $_REQUEST['request_data'];
        }else {
            $request_data = "{}";
            // for debug
            //$request_data = file_get_contents("/tmp/saveOrder.req");
        }

        $datas = json_decode($request_data, true);

        $result = true;
        $machineId = $this->SyncHandler->getRequestClientMachineId();

        try {

            $this->Order->saveOrdersFromBackupFormat($datas);

            // update table orders and status
            $this->Table->updateOrdersFromBackupFormat($datas);

            // store or save , release order lock by machine id
            $this->TableOrderLock->releaseOrderLocksByMachineId($machineId);

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


    /**
     * readOrderToBackupFormat
     *
     * called from vivipos client recallOrder and lock
     *
     * @param <type> $orderId
     */
    function readOrderToBackupFormat($orderId) {

        $result = null;
        $machineId = $this->SyncHandler->getRequestClientMachineId();

        try {

            $locked = $this->TableOrderLock->isOrderLock($orderId, $machineId);

            if (!$locked) {
                $result = $this->Order->readOrderToBackupFormat($orderId);

                // lock order by recalled machineｓ
                if(!empty($result)) {
                    $this->TableOrderLock->setOrderLock($orderId, $machineId);
                }

            }else {
                $result = $this->TableOrderLock->getOrderLock($orderId);
            }

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


    /**
     * releaseOrderLock
     * 
     * @param <type> $orderId 
     */
    function releaseOrderLock($orderId) {

        try {

            $result = true;
            $this->TableOrderLock->releaseOrderLock($orderId);

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

    
    /**
     * getOrdersSummary
     */
    function getOrdersSummary() {

        $orders = null;

        if(!empty($_REQUEST['request_data'])) {
            $conditions = $_REQUEST['request_data'];
            //            $conditions = "orders.check_no='999' AND orders.status=2";
            $conditions = str_replace("orders.", "Order.", $conditions);
            $orderModel = new Order();
            // $orderModel->unbindHasManyModels();
            $condition = array('conditions' => $conditions, 'recursive' =>0 );
            $orders = $orderModel->find('all', $condition);
        }

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $this->SyncHandler->prepareResponse($orders, 'bgz_json')
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;

    }


    /**
     * voidOrder
     * 
     * @param <type> $orderId 
     */
    function voidOrder($orderId) {

        $result = null;
        $machineId = $this->SyncHandler->getRequestClientMachineId();

        if(!empty($_REQUEST['request_data'])) {
            // for debug
            //file_put_contents("/tmp/voidOrder.req", $_REQUEST['request_data']);
            $request_data = $_REQUEST['request_data'];
        }else {
            $request_data = "{}";
            // for debug
            //$request_data = file_get_contents("/tmp/voidOrder.req");
        }

        $data = json_decode($request_data, true);

        try {

            $locked = $this->TableOrderLock->isOrderLock($orderId, $machineId);

            if (!$locked) {

                $result = $this->Order->voidOrder($orderId, $data);

                // lock order by recalled machineｓ
                if(!empty($result)) {
                    $this->TableOrderLock->setOrderLock($orderId, $machineId);
                }

            }else {
                $result = false ;
            }

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


}
?>
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

    function saveOrder($data) {

        $orderObject = array();

	if($_REQUEST['request_data']) {
		$orderObject = json_decode(str_replace("\\","",$_REQUEST['request_data']), true);

		// file_put_contents("/tmp/saveOrder", serialize($orderObject));
	}

	if ($orderObject) {
		$setResult = $this->Order->saveOrder($orderObject);
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

    function unserializeOrder($order_id) {
        $order = $this->Order->unserializeOrder($order_id);

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $order
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type
//file_put_contents("/tmp/serializeOrder", $responseResult);
        echo $responseResult;

        

        exit;

    }

    function savePayment($data) {
        $orderObject = array();

	if($_REQUEST['request_data']) {
		$paymentObject = json_decode(str_replace("\\","",$_REQUEST['request_data']), true);

		file_put_contents("/tmp/savePayment", serialize($paymentObject));
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

		file_put_contents("/tmp/saveLedgerPayment", serialize($paymentObject));
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
<?php

App::import('Core', array('HttpSocket','CakeLog'));

class TableStatusController extends AppController {

    var $name = 'TableStatus';

    var $uses = array('Sequence','TableStatus','Table','TableRegion','TableBooking','TableOrder');
    // var $uses = array('Sequence','TableStatus');
	
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

function index() {

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


    function getTableStatusList($condition="") {

        $tables = $this->TableStatus->getTableStatusList();

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $tables
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }

    function setTableStatus2() {

		$tableObject = array();
		if($_REQUEST['request_data']) {
			$tableObject = json_decode($_REQUEST['request_data'], true);
			file_put_contents("/tmp/setTableStatus", serialize($tableObject));
		}

		if ($tableObject) {
			$setResult = $this->TableStatus->setTableStatus($tableObject);
		}else {
			$setResult = false;
		}

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $setResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;

        
    }
    
    function getTableStatuses($condition="") {

        $tables = $this->TableStatus->getTableStatuses($condition);

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $tables
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }

    
    function setTableStatus() {

	$tableObject = array();
	if($_REQUEST['request_data']) {
		$tableObject = json_decode(str_replace("\\","",$_REQUEST['request_data']), true);

		file_put_contents("/tmp/setTableStatus", serialize($tableObject));
	}

	if ($tableObject) {
		$setResult = $this->TableStatus->setTableStatus($tableObject);
	}else {
		$setResult = false;
	}

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $setResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;

        
    }
    
    function setTableHostBy($table_no=-1, $holdTableNo=-1) {
    		
	$setResult = $this->TableStatus->setTableHostBy($table_no, $holdTableNo);
	
        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $setResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }
    
    function touchTableStatus($table_no=-1) {
    		
	$setResult = $this->TableStatus->touchTableStatus($table_no);
	
        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $setResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }
    
    function removeCheck($table_no, $order_id) {

	$setResult = $this->TableStatus->removeCheck($table_no, $order_id);
	
        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $setResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }

    function getTableOrderCheckSum($order_id) {

        $getResult = $this->TableStatus->getTableOrderCheckSum($order_id);

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $getResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }

    function transTable() {

	$tableObject = array();
	if($_REQUEST['request_data']) {
		$tableObject = json_decode(str_replace("\\","",$_REQUEST['request_data']), true);

		file_put_contents("/tmp/transTable", serialize($tableObject));
	}

	if ($tableObject) {
		$setResult = $this->TableStatus->transTable($tableObject);
	}else {
		$setResult = false;
	}

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $setResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }

    function getTableOrders($condition="") {

        $orders = $this->TableStatus->getTableOrders($condition);

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $orders
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }

    function setTableMark() {

	$tableObject = array();
	if($_REQUEST['request_data']) {
		$tableObject = json_decode(str_replace("\\","",$_REQUEST['request_data']), true);

		file_put_contents("/tmp/setTableMark", serialize($tableObject));
	}

	if ($tableObject) {
                $table_no = $tableObject['table_no'];
                $markObj = $tableObject['markObj'];
		$setResult = $this->TableStatus->setTableMark($table_no, $markObj);
	}else {
		$setResult = false;
	}

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $setResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }

    function setTableMarks() {

	$tableObject = array();
	if($_REQUEST['request_data']) {
		$tableObject = json_decode(str_replace("\\","",$_REQUEST['request_data']), true);

		file_put_contents("/tmp/setTableMarks", serialize($tableObject));
	}

	if ($tableObject) {
                $tables = $tableObject['tables'];
                $markObj = $tableObject['markObj'];
		$setResult = $this->TableStatus->setTableMarks($tables, $markObj);
	}else {
		$setResult = false;
	}

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $setResult
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }

}
?>
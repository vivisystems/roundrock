<?php

App::import('Core', array('HttpSocket','CakeLog'));

class TableStatusController extends AppController {

    var $name = 'TableStatus';

    var $uses = array('Sequence','TableStatus');
	
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

    function setTableStatus() {

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

}
?>

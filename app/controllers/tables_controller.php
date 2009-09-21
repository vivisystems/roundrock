<?php

class TablesController extends AppController {

    var $name = 'Tables';

    var $uses = array('Table');
	
    var $components = array('SyncHandler', 'Security');


    /**
     * get tables
     */
    function getTables() {

        $tables = $this->Table->getTables();

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $tables
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }

}
?>
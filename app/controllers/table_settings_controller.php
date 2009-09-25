<?php

class TableSettingsController extends AppController {

    var $name = 'TableSettings';

    var $uses = array('TableSetting');
	
    var $components = array('SyncHandler', 'Security');


    /**
     *getTableSettings
     */
    function getTableSettings() {

        $settings = $this->TableSetting->getSettings();

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $settings
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }

}
?>
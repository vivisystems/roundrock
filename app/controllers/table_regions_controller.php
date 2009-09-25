<?php

class TableRegionsController extends AppController {

    var $name = 'TableRegions';

    var $uses = array('TableRegion');
	
    var $components = array('SyncHandler', 'Security');


    /**
     * getTableRegions
     */
    function getTableRegions() {

        $regions = $this->TableRegion->getRegions();

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $regions
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }

}
?>
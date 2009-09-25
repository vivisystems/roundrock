<?php

class TableMarksController extends AppController {

    var $name = 'TableMarks';

    var $uses = array('TableMark');
	
    var $components = array('SyncHandler', 'Security');


    /**
     * getTableMarks
     */
    function getTableMarks() {

        $marks = $this->TableMark->getMarks();

        $result = array('status' => 'ok', 'code' => 200 ,
            'response_data' => $marks
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }

}
?>
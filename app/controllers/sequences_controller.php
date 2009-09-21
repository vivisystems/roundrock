<?php

class SequencesController extends AppController {

    var $name = 'Sequences';

    var $uses = array('Sequence', 'Order');
	
    var $components = array('SyncHandler', 'Security');


    /**
     * getSequence
     * @param <type> $key 
     */
    function getSequence ($key) {

        $value = $this->Sequence->getSequence($key);

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $value,
            'response_data' => $value
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }

    function setSequence ($key, $value) {

        $value = $this->Sequence->setSequence($key, $value);

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $value,
            'response_data' => $value
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }


    function resetSequence ($key, $value) {

        $value = $this->Sequence->resetSequence($key, $value);

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $value,
            'response_data' => $value
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }

    function test () {
        print_r($this->Order->find('first'));
        exit;
    }

}
?>
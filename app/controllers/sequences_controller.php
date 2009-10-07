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

    /**
     * setSequence
     * @param <type> $key
     * @param <type> $value
     */
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


    /**
     * setSequenceMaxValue
     * @param <type> $key
     * @param <type> $value 
     */
    function setSequenceMaxValue ($key, $value) {

        $value = $this->Sequence->setSequenceMaxValue($key, $value);

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $value,
            'response_data' => $value
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }


    /**
     * resetSequence
     * @param <type> $key
     * @param <type> $value 
     */
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

    function getDateSequence ( $key, $initial = null ) {

        if ($initial == null) $initial = 0;

        $value = $this->Sequence->getSequence($key, $initial, false);

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $value,
            'response_data' => $value
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;
    }

}
?>

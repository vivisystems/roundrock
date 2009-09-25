<?php

class PromotionsController extends AppController {

    var $name = 'Promotions';

    var $uses = array('Promotion');
	
    var $components = array('SyncHandler', 'Security');


    /**
     * getPromotion
     * @param <type> $key 
     */
    function getPromotion ($key) {

        $value = $this->Promotion->getPromotions();

        $result = array('status' => 'ok', 'code' => 200 ,
            'value' => $value
        );

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json'); // php response type

        echo $responseResult;

        exit;


    }


}
?>
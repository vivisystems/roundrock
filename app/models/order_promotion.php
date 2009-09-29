<?php
App::import('Core', array('CakeLog'));

class OrderPromotion extends AppModel {
    var $name = 'OrderPromotion';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');

    function saveOrderPromotions ($promotions) {

        $this->begin();

        try {
            foreach ($promotions  as $promotion) {
                $this->id = $promotion['id'];
                $this->save($promotion);
            }
        }catch(Exception $e) {
            CakeLog::write('error', 'Exception saveOrderPromotions \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
        }
       
        $this->commit();

    }

}

?>
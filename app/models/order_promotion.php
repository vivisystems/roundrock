<?php
App::import('Core', array('CakeLog'));

class OrderPromotion extends AppModel {
    var $name = 'OrderPromotion';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');

    function saveOrderPromotions ($promotions) {

        $result = true;

        try {

            $this->begin();

            foreach ($promotions  as $promotion) {

                // check if $promotion is empty
                // if viviecr send empty object to web services, XXXX
                if (empty($promotion)) {
                    CakeLog::write('warning', 'saveOrderPromotions: Empty Order Promotion');
                    continue;
                }

                $this->id = $promotion['id'];
                $r = $this->save($promotion);

                $result = ($result & !empty($r));
            }

            $this->commit();

        }catch(Exception $e) {

            CakeLog::write('error', 'Exception saveOrderPromotions \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
            
            $this->rollback();
            $result = false;
        }

        return $result;

    }

}

?>
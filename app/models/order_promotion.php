<?php
App::import('Core', array('CakeLog'));

class OrderPromotion extends AppModel {
    var $name = 'OrderPromotion';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');

    function saveOrderPromotions ($promotions) {
        $this->begin();

        foreach ($promotions  as $promotion) {
            $this->id = $promotion['id'];
            $this->save($promotion);
        }

        $this->commit();

    }

}

?>
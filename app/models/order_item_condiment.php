<?php
App::import('Core', array('CakeLog'));

class OrderItemCondiment extends AppModel {
    var $name = 'OrderItemCondiment';
    var $useDbConfig = 'order';
    
    var $actsAs = array('Sync');


    function saveOrderItemCondiments($condiments) {
        $this->begin();

        foreach ($condiments as $condiment) {
            $this->id = $condiment['id'];
            $this->save($condiment);
        }

        $this->commit();
    }

}

?>

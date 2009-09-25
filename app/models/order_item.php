<?php
App::import('Core', array('CakeLog'));

class OrderItem extends AppModel {
    var $name = 'OrderItem';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');


    function saveOrderItems($items) {

        $this->begin();

        foreach ($items as $item) {
            $this->id = $item['id'];
            $this->save($item);
        }

        $this->commit();
        
    }
    
}

?>
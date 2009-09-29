<?php
App::import('Core', array('CakeLog'));

class OrderItemCondiment extends AppModel {
    var $name = 'OrderItemCondiment';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');


    function saveOrderItemCondiments($condiments) {

        $this->begin();

        try {
            foreach ($condiments as $condiment) {
                $this->id = $condiment['id'];
                $this->save($condiment);
            }
        }catch(Exception $e) {
            CakeLog::write('error', 'Exception saveOrderItemCondiments \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
        }

        $this->commit();
    }

}

?>
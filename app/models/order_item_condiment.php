<?php
App::import('Core', array('CakeLog'));

class OrderItemCondiment extends AppModel {
    var $name = 'OrderItemCondiment';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');


    function saveOrderItemCondiments($condiments) {
        
        $result = true;
        try {

            $this->begin();

            foreach ($condiments as $condiment) {

                $this->id = $condiment['id'];
                $r = $this->save($condiment);

                $result = ($result & !empty($r));
            }

            $this->commit();

        }catch(Exception $e) {

            CakeLog::write('error', 'Exception saveOrderItemCondiments \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
            
            $this->rollback();
            $result = false;
        }

        return $result;
    }

}

?>
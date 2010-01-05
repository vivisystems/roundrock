<?php
App::import('Core', array('CakeLog'));

class OrderItem extends AppModel {
    var $name = 'OrderItem';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');


    function saveOrderItems($items) {

        $result = true;

        try {

            $this->begin();

            foreach ($items as $item) {

                // check if $item is empty
                // if viviecr send empty object to web services, XXXX
                if (empty($item)) {
                    CakeLog::write('warning', 'saveOrderItems: Empty Order Item');
                    continue;
                }

                $this->id = $item['id'];
                $r = $this->save($item);

                $result = ($result & !empty($r));
            }

            $this->commit();

        }catch(Exception $e) {
            
            CakeLog::write('error', 'Exception saveOrderItems \n' .
                '  Exception: ' . $e->getMessage() . "\n" );

            $this->rollback();
            $result = false;
        }

        return $result;
    }

}

?>
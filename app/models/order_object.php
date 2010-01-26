<?php
App::import('Core', array('CakeLog'));

class OrderObject extends AppModel {
    var $name = 'OrderObject';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');


    function saveOrderObjects($objects) {

        $result = true;

        try {

            $this->begin();

            foreach ($objects as $object) {

                // check if object is empty
                // sometime viviecr will send empty order object to web services, XXXX
                if (empty($object)) {
                    CakeLog::write('warning', 'saveOrderObjects: Empty Order Object');
                    continue;
                }

                $this->id = $object['id'];
                $r = $this->save($object);

                $result = ($result & !empty($r));
            }

            $this->commit();

        }catch(Exception $e) {

            CakeLog::write('error', 'Exception saveOrderObjects \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
            
            $this->rollback();
            $result = false;
        }

        return $result;
    }
}

?>
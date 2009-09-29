<?php
App::import('Core', array('CakeLog'));

class OrderObject extends AppModel {
    var $name = 'OrderObject';
    var $useDbConfig = 'order';

    //    var $actsAs = array('Sync');


    function saveOrderObjects($objects) {

        $this->begin();

        try {
            foreach ($objects as $object) {
                $this->id = $object['id'];
                $this->save($object);
            }
        }catch(Exception $e) {
            CakeLog::write('error', 'Exception saveOrderObjects \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
        }

        $this->commit();

    }
}

?>
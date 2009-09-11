<?php
App::import('Core', array('CakeLog'));

class OrderObject extends AppModel {
    var $name = 'OrderObject';
    var $useDbConfig = 'order';

//    var $actsAs = array('Sync');


    function saveOrderObjects($objects) {

        $this->begin();

        foreach ($objects as $object) {
            $this->id = $object['id'];
            $this->save($object);
        }

        $this->commit();

    }
}

?>

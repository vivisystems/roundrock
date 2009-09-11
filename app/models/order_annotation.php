<?php
App::import('Core', array('CakeLog'));

class OrderAnnotation extends AppModel {
    var $name = 'OrderAnnotation';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');

    function saveOrderAnnotations ($annotations) {
        $this->begin();

        foreach ($annotations as $annotation) {
            $this->id = $annotation['id'];
            $this->save($annotation);
        }

        $this->commit();
    }
}

?>

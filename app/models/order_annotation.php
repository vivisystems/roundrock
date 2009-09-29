<?php
App::import('Core', array('CakeLog'));

class OrderAnnotation extends AppModel {
    var $name = 'OrderAnnotation';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');

    function saveOrderAnnotations ($annotations) {

        $this->begin();

        try {
            foreach ($annotations as $annotation) {
                $this->id = $annotation['id'];
                $this->save($annotation);
            }
        }catch(Exception $e) {
            CakeLog::write('error', 'Exception saveOrderAnnotations \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
        }

        $this->commit();
    }
}

?>
<?php
App::import('Core', array('CakeLog'));

class OrderAnnotation extends AppModel {
    var $name = 'OrderAnnotation';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');

    function saveOrderAnnotations ($annotations) {

        $result = true;
        try {

            $this->begin();

            foreach ($annotations as $annotation) {

                $this->id = $annotation['id'];
                $r = $this->save($annotation);

                $result = ($result & !empty($r));
            }

            $this->commit();

        }catch(Exception $e) {

            CakeLog::write('error', 'Exception saveOrderAnnotations \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
            
            $this->rollback();
            $result = false;
        }

        return $result;
    }
}

?>
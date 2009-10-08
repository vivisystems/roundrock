<?php
App::import('Core', array('CakeLog'));

class OrderAddition extends AppModel {
    var $name = 'OrderAddition';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');

    function saveOrderAdditions($additions) {
        
        $result = true;

        try {
    
            $this->begin();

            foreach ($additions as $addition) {
                $this->id = $addition['id'];
                $r = $this->save($addition);

                $result = ($result & !empty($r));
            }

            $this->commit();
            
        }catch(Exception $e) {

            CakeLog::write('error', 'Exception saveOrderAdditions \n' .
                '  Exception: ' . $e->getMessage() . "\n" );

            $this->rollback();
            $result = false;
        }

        return $result;
    }


}

?>
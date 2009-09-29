<?php
App::import('Core', array('CakeLog'));

class OrderAddition extends AppModel {
    var $name = 'OrderAddition';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');

    function saveOrderAdditions($additions) {
        
        $this->begin();

        try {
            foreach ($additions as $addition) {
                $this->id = $addition['id'];
                $this->save($addition);
            }
        }catch(Exception $e) {
            CakeLog::write('error', 'Exception saveOrderAdditions \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
        }

        $this->commit();
    }


}

?>
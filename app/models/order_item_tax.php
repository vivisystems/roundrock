<?php
App::import('Core', array('CakeLog'));

class OrderItemTax extends AppModel {
    var $name = 'OrderItemTax';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');


    function saveOrderItemTaxes($taxes) {

        $this->begin();

        try {
            foreach ($taxes as $tax) {
                $this->id = $tax['id'];
                $this->save($tax);
            }
        }catch(Exception $e) {
            CakeLog::write('error', 'Exception saveOrderItemTaxes \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
        }

        $this->commit();
    }

}

?>
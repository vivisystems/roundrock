<?php
App::import('Core', array('CakeLog'));

class OrderItemTax extends AppModel {
    var $name = 'OrderItemTax';
    var $useDbConfig = 'order';

    var $actsAs = array('Sync');


    function saveOrderItemTaxes($taxes) {

        $result = true;
        try {

            $this->begin();

            foreach ($taxes as $tax) {
                $this->id = $tax['id'];
                $r = $this->save($tax);

                $result = ($result & !empty($r));
            }

            $this->commit();

        }catch(Exception $e) {

            CakeLog::write('error', 'Exception saveOrderItemTaxes \n' .
                '  Exception: ' . $e->getMessage() . "\n" );

            $this->rollback();
            $result = false;
        }

        return $result;
    }

}

?>
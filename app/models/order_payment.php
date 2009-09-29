<?php
App::import('Core', array('CakeLog'));

class OrderPayment extends AppModel {
    var $name = 'OrderPayment';
    var $useDbConfig = 'order';
    var $actsAs = array('Sync');

    function saveOrderPayments($payments) {

        $this->begin();

        try {
            foreach ($payments as $payment) {
                $this->id = $payment['id'];
                $this->save($payment);
            }
        }catch(Exception $e) {
            CakeLog::write('error', 'Exception saveOrderPayments \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
        }

        $this->commit();

    }

}

?>
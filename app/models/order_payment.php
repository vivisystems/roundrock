<?php
App::import('Core', array('CakeLog'));

class OrderPayment extends AppModel {
    var $name = 'OrderPayment';
    var $useDbConfig = 'order';
    var $actsAs = array('Sync');

    function saveOrderPayments($payments) {

        $result = true;
        try {

            $this->begin();

            foreach ($payments as $payment) {
                $this->id = $payment['id'];
                $this->save($payment);

                $result = ($result & !empty($r));
            }

            $this->commit();
            
        }catch(Exception $e) {
            
            CakeLog::write('error', 'Exception saveOrderPayments \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
            
            $this->rollback();
            $result = false;
        }

        return $result;
    }

}

?>
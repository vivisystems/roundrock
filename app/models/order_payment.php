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

                // check if $payment is empty
                // if viviecr send empty object to web services, XXXX
                if (empty($payment)) {
                    CakeLog::write('warning', 'saveOrderPayments: Empty Order Payment');
                    continue;
                }

                $this->id = $payment['id'];
                $r = $this->save($payment);

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

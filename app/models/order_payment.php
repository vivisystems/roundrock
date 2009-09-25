<?php
App::import('Core', array('CakeLog'));

class OrderPayment extends AppModel {
    var $name = 'OrderPayment';
    var $useDbConfig = 'order';
    var $actsAs = array('Sync');

    function saveOrderPayments($payments) {

        $this->begin();

        foreach ($payments as $payment) {
            $this->id = $payment['id'];
            $this->save($payment);
        }

        $this->commit();

    }

    function savePayment($data) {

        try {

            $r = $this->save(data);

        }catch (Exception $e) {

            CakeLog::write('error', 'An error was encountered while saving payment ' .
                                  '  Exception: ' . $e->getMessage() . "\n" );
        }

        return $r;

    }

    function saveLedgerPayment($data) {

        try {

            $r = $this->save(data);

        }catch (Exception $e) {

            CakeLog::write('error', 'An error was encountered while saving ledger payment ' .
                                  '  Exception: ' . $e->getMessage() . "\n" );
        }

        return $r;

    }

}

?>
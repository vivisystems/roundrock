<?php
App::import('Core', array('CakeLog'));

class OrderPayment extends AppModel {
    var $name = 'OrderPayment';
    var $useDbConfig = 'order';

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

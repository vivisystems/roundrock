<?php
App::import('Core', array('CakeLog'));

class StockRecord extends AppModel {
    var $name = 'StockRecord';
    var $useDbConfig = 'default';

    function getLastModifiedRecords($lastModified = 0) {

        $stocks = $this->find('all', array('fields'=>'id,barcode,warehouse,quantity,modified', 'conditions'=> "modified > $lastModified"));
        return Set::classicExtract($stocks, '{n}.StockRecord');

    }

    function setStockRecords($datas=array()) {





    }

    function checkStockRecords($datas=array()) {

    }

    function decreaseStockRecords($datas=array()) {

        $now = time();
        $sql = "" ;

        foreach ($datas as $d) {
            $sql .= "UPDATE stock_records SET quantity=quantity-".$d['quantity'].", modified='".$now."' WHERE id = '".$d['id']."' ;\n";
        }

        file_put_contents('/tmp/aaa.sql', $sql);

        $datasource =& $this->getDataSource();

        try {

            $datasource->connection->beginTransaction();
            $datasource->connection->exec($sql);
            $datasource->connection->commit();

        }  catch(Exception $e) {
        // always rollback
            $datasource->connection->rollback();
            return false;

        }
        return true;

    }
}

?>

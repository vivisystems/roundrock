<?php
App::import('Core', array('CakeLog'));

class StockRecord extends AppModel {

    var $name = 'StockRecord';
    //var $useDbConfig = 'inventory';

    function getLastModifiedRecords($lastModified = 0) {

        $stocks = $this->find('all', array('fields'=>'id,barcode,warehouse,quantity,modified', 'conditions'=> "modified > $lastModified"));
        return Set::classicExtract($stocks, '{n}.StockRecord');

    }


    function setStockRecords($datas=array()) {


    }

    function checkStockRecords($datas=array()) {

    }

    /**
     *
     * @param <type> $ids
     * @return <type>
     */
    function checkRecordsExists($ids=array()) {

        try {

            $idString = implode("','", $ids);

            //$idString = '002005';
            //$sql = "SELECT id from stock_records WHERE id IN ('$idString')";

            $dd = $this->find('all', array('fields'=>'id', 'conditions' => "id IN ('$idString')", 'recursive'=>0));
            $idsExists = Set::classicExtract($dd, '{n}.StockRecord.id');


            // record not the same , create it.
            if (count($ids) != count($idsExists)) {

                $now = time();

                $idsDiff = array_diff($ids, $idsExists);

                $sql = "" ;

                for ($i =0 ; $i < count($idsDiff); $i++) {

                    //$sql .= "UPDATE stock_records SET quantity=quantity-".$d['quantity'].", modified='".$now."' WHERE id = '".$d['id']."' ;\n";

                    // auto create
                    $this->create();
                    $this->save(array('id'=> $idsDiff[$i], 'quantity'=>0));

                }
            }

        }catch (Exception $e) {
            CakeLog::write('error', 'Error checkRecordsExists ' .
                                  '  Exception: ' . $e->getMessage() . "\n" );

        }

        return ;

    }

    /**
     *
     * @param <type> $datas
     * @return <type> 
     */
    function decreaseStockRecords($datas=array(), $lastModifiedInventory) {

        $now = time();
        $sql = "" ;

        $ids = array();

        foreach ($datas as $d) {

            if ($d <= $lastModifiedInventory) continue;
            
            $ids[] = $d['id'];
            if ($d['quantity'] > 0) {
                $sql .= "UPDATE stock_records SET quantity=quantity-".$d['quantity'].", modified='".$now."' WHERE id = '".$d['id']."' ;\n";
            }else {
                $sql .= "UPDATE stock_records SET quantity=quantity+".abs($d['quantity']).", modified='".$now."' WHERE id = '".$d['id']."' ;\n";
            }
        }

        // check stock first
        $this->checkRecordsExists($ids);

        try {

            $datasource =& $this->getDataSource();
            $datasource->connection->beginTransaction();
            $datasource->connection->exec($sql);
            $datasource->connection->commit();

        }  catch(Exception $e) {

            CakeLog::write('error', 'Error decreaseStockRecords ' .
                                  '  Exception: ' . $e->getMessage() . "\n" );

            // always rollback
            $datasource->connection->rollback();
            return false;

        }
        return true;

    }
}

?>

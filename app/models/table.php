<?php
/**
 * Table Model
 *
 */
class Table extends AppModel {
    var $name = 'Table';
    var $useDbConfig = 'table';

    var $belongsTo = array('TableRegion');
    var $hasOne = array('TableStatus');
    var $hasMany = array('TableBooking', 'TableOrder');

    var $_tableNoToIds = false;
    var $_tableIdToNos = false;


    /**
     * getTableNoToIds mapping array
     *
     * @todo need cache ?
     * @return <type>
     */
    function getTableNoToIds () {
        if (!empty($this->_tableNoToIds)) return $this->_tableNoToIds;

        $tables = $this->find('all', array('recursive'=>-1, "fields"=>"id,table_no"));

        $this->_tableNoToIds = array();
        foreach($tables as $table) {
            $this->_tableNoToIds[$table['Table']['table_no']] = $table['Table']['id'];
            $this->_tableIdToNos[$table['Table']['id']] = $table['Table']['table_no'];
        }
        return $this->_tableNoToIds;
    }

    
    /**
     * getTableIdToNos mapping array
     *
     * @return <type>
     */
    function getTableIdToNos () {
        if (!empty($this->_tableIdToNos)) return $this->_tableIdToNos;

        $this->getTableNoToIds();
        return $this->_tableIdToNos;
    }

    /**
     * getTables
     *
     * @return <type>
     */
    function getTables() {

    // get setting as GeckoJS normal array
        $result = $this->find('all', array('recursive' => -1, 'order' => 'table_no asc'));
        return $result;

    }


    /**
     * updateOrdersFromBackupFormat
     *
     * @param <type> $datas
     * @return <type>
     */
    function updateOrdersFromBackupFormat($datas) {

        if (empty($datas['Order'])) return false ;

        $orders = json_decode($datas['Order'], true);
        if (!is_array($orders))  return false ;

        $arOrders = array_values($orders) ;
        // save table order
        $this->TableOrder->updateOrders($arOrders, $this->getTableNoToIds());

        // update table status 's order count
        $this->TableStatus->updateStatusByOrders($arOrders, $this->getTableNoToIds());

    // maintaince expire mark

    }


    /**
     * voidOrder
     *
     * @param <type> $datas
     * @return <type>
     */
    function voidOrder($orderId, $datas) {

        if (empty($orderId) || empty($datas['table_no'])) return false ;

        $arOrders = array();

        $arOrders[0] = datas;

        // save table order
        $this->TableOrder->updateOrders($arOrders, $this->getTableNoToIds());

        // update table status 's order count
        $this->TableStatus->updateStatusByOrders($arOrders, $this->getTableNoToIds());

    // maintaince expire mark

    }

}

?>
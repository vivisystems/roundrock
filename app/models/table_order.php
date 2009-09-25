<?php
/**
 * TableOrder Model
 */
class TableOrder extends AppModel {
    var $name = 'TableOrder';
    var $useDbConfig = 'table';
	

    /**
     * updateOrders
     *
     * @param <type> $orders
     * @param <type> $tableNoToIds 
     */
	function updateOrders($orders, $tableNoToIds) {
        $this->begin();

        foreach ($orders as $order) {
    
            $status = $order['status'];

            if ($status == '2') {
                $this->id = $order['id'];
                $order['table_id'] = $tableNoToIds[$order['table_no']];
                $this->save($order);
            }else {
                $this->remove($order['id']);
            }
        }

        $this->commit();
	}

}

?>
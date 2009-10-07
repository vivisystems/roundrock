<?php
App::import('Model', 'TableSetting');
App::import('Model', 'TableMark');
App::import('Model', 'TableBooking');

/**
 * TableStatus Model
 */
class TableStatus extends AppModel {
    var $name = 'TableStatus';
    var $useDbConfig = 'table';

    var $belongsTo = array('Table');
    var $hasMany = array('TableOrder'=>array('foreignKey'=>'table_id', 'order'=>'transaction_created'));


    /**
     * updateStatusByOrders
     *
     * @param <type> $orders
     * @param <type> $tableNoToIds
     */
    function updateStatusByOrders($orders, $tableNoToIds) {

        $this->begin();

        try {
            foreach ($orders as $order) {

                $status = intval($order['status']);
                $table_no = intval($order['table_no']);
                $table_id = $tableNoToIds[$table_no];

                $this->updateOrderStatusById($table_id, $table_no);

            }
        }catch(Exception $e) {
            CakeLog::write('error', 'Exception updateStatusByOrders \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
        }

        $this->commit();
    }


    function updateOrderStatusById($table_id, $table_no=false) {
        if (empty($table_id)) return false;

        if (empty($table_no)) {
            $tableIdToNos = $this->Table->getTableIdToNos();
            $table_no = $tableIdToNos[$table_id];
        }

        $result = $this->query("SELECT count(id), sum(no_of_customers), sum(total) FROM table_orders where table_id='".$table_id."'");

        if($result[0][0]) {
            $order_count = 0;
            $sum_total = 0.0;
            $sum_customers = 0;
            foreach($result[0][0] as $key => $value) {
                switch ($key) {
                    case 'count(id)':
                        $order_count = $value;
                        break;
                    case 'sum(no_of_customers)':
                        $sum_customers = $value;
                        break;
                    case 'sum(total)':
                        $sum_total = $value;
                        break;
                }
            }

            // need to update status data
            $data = array('id' => $table_id, 'table_id' => $table_id, 'table_no'=>$table_no, 'order_count'=>$order_count,
                'sum_total' => $sum_total, 'sum_customer' => $sum_customers,
                'modified' => (double)(microtime(true)*1000) );

            // check if customers is zero
            if ($sum_customers <= 0 && $order_count <= 0) {
                $data['status'] = 0;

                // process automark after submit
                $tableMark = new TableMark();
                $mark = $tableMark->getAutoMarkAfterSubmit();
                if($mark) {
                    $data['mark'] = $mark['name'];
                    $data['mark_op_deny'] = $mark['opdeny'];
                    $data['start_time'] = time();
                    $data['end_time'] = time() + $mark['period']*60;
                    $data['status'] = 3;
                }

            }else {
                $data['status'] = 1;
                $data['mark'] = '';
                $data['mark_op_deny'] = 0;
                $data['start_time'] = time();
                $data['end_time'] = time() + 86400 ; // XXX fake time
            }

            $this->id = $table_id;
            $this->save($data);
        }else {
        // update empty
            $data = array('status'=>0, 'id'=>$table_id, 'table_id'=> $table_id, 'table_no'=>$table_no,
                'order_count'=> 0, 'sum_total' => 0, 'sum_customer' => 0,
                'modified' => (double)(microtime(true)*1000));
            $this->id = $table_id;
            $this->save($data);
        }
    }


    /**
     * clearExpireStatuses
     */
    function clearExpireStatuses() {

        $now = time();

        $this->begin();

        try {
            $result = $this->find('all', array('conditions'=>"end_time <= $now AND status=3", 'recursive'=>-1));
            foreach($result as $value) {
                $status = $value['TableStatus'];
                if ($status['sum_customers'] == 0) {
                // reset to available
                    $data = array('status'=>0, 'mark' => '', 'mark_op_deny'=>0, 'mark_user'=>'',
                        'start_time'=>time(), 'end_time'=>time()+86400,
                        'modified' => (double)(microtime(true)*1000));
                    $this->id = $status['id'];
                    $this->save($data);
                }
            }
        }catch(Exception $e) {
            CakeLog::write('error', 'Exception clearExpireStatuses \n' .
                '  Exception: ' . $e->getMessage() . "\n" );
        }
        $this->commit();
    }



    /**
     * getTablesStatus from lastModified
     *
     * @param <type> $lastModified
     * @return <type>
     */
    function getTablesStatus($lastModified) {


        $result = $this->find('all', array('conditions'=>"modified > $lastModified", 'recursive'=>1));

        return $result;

    }

    /**
     * getTablesStatus from lastModified
     *
     * @param <type> $lastModified
     * @return <type>
     */
    function getTablesStatusWithOrdersSummary($lastModified) {

        $startTime = time();
        $endTime = time() + 86400;

        $this->bindModel(array(
            'hasMany'=>array('TableBooking'=> array('foreignKey'=>'table_id', 'order'=>'booking', 'conditions'=>"TableBooking.booking >= $startTime AND TableBooking.booking <= $endTime ")
            )
            )
        );

        $result = $this->getTablesStatus($lastModified);

        if (!$result) return $result;
        $orderModel = new Order();

        $tableCount = count($result);

        for ($i=0; $i < $tableCount ; $i++) {
            if (!is_array($result[$i]['TableOrder']) || count($result[$i]['TableOrder']) == 0) continue;

            $orderIds = Set::classicExtract($result[$i]['TableOrder'], '{n}.id');
            if (count($orderIds) == 0) continue;

            $conditions = "Order.id IN ('" . implode("','", $orderIds) . "')";
            $condition = array('conditions' => $conditions, 'recursive' =>0 );
            $orders = $orderModel->find('all', $condition);
            $ordersById = Set::combine($orders, '{n}.Order.id', '{n}');

            $result[$i]['OrdersById'] = $ordersById;
        }

        return $result;

    }


    /**
     * mergeTable
     *
     * @param <type> $masterTableId
     * @param <type> $slaveTableId
     */
    function mergeTable($masterTableId, $slaveTableId) {

        $masterTable = $this->Table->find('first', array('conditions'=> array("id"=>$masterTableId), 'fields'=>'table_no', 'recursive'=>-1));
        $slaveTable = $this->Table->find('first', array('conditions'=> array("id"=>$slaveTableId), 'fields'=>'table_no', 'recursive'=>-1));

        if (!$masterTable || !$slaveTable ) return false;

        $masterTableNo = $masterTable['Table']['table_no'];
        $slaveTableNo = $slaveTable['Table']['table_no'];

        $data = array('id'=> $slaveTableId, 'table_id'=> $slaveTableId, 'table_no'=> $slaveTableNo,
            'status'=>2, 'mark' => '', 'mark_op_deny'=>0, 'mark_user'=>'',
            'start_time'=>time(), 'end_time'=>time()+86400,
            'hostby'=> $masterTableNo,
            'modified' => (double)(microtime(true)*1000)
        );

        $this->id = $slaveTableId;
        $this->save($data);

        return true;
    }

    /**
     * unmergeTable
     *
     * @param <type> $table_id
     * @return <type>
     */
    function unmergeTable($tableId, $tableNo=false) {

        if(!$tableNo) {
            $table = $this->Table->find('first', array('conditions'=> array("id"=>$tableId), 'fields'=>'table_no', 'recursive'=>-1));
            if (!$table) return false;
            $tableNo = $table['Table']['table_no'];
        }

        $data = array('id'=> $tableId, 'table_id'=> $tableId, 'table_no'=> $tableNo,
            'status'=>0, 'mark' => '', 'mark_op_deny'=>0, 'mark_user'=>'',
            'start_time'=>time(), 'end_time'=>time()+86400,
            'hostby'=> 0,
            'modified' => (double)(microtime(true)*1000));

        $this->id = $table_id;
        $this->save($data);

        return true;
    }

    /**
     * markTable
     *
     * @param <type> $tableId
     * @param <type> $markId
     * @param <type> $clerk
     * @return <type>
     */
    function markTable($tableId, $markId, $clerk) {

        $table = $this->Table->find('first', array('conditions'=> array("id"=>$tableId), 'fields'=>'table_no', 'recursive'=>-1));

        if (!$table) return false;

        $tableMark = new TableMark();
        $mark = $tableMark->getMarkById($markId);

        if (!$mark) return false;

        $tableNo = $table['Table']['table_no'];

        $data = array('id'=> $tableId, 'table_id'=> $tableId, 'table_no'=> $tableNo,
            'status'=>3, 'mark' => $mark['name'] , 'mark_op_deny'=> $mark['opdeny'], 'mark_user'=> $clerk,
            'start_time'=>time(), 'end_time'=>time() + $mark['period']*60,
            'modified' => (double)(microtime(true)*1000)
        );

        $this->id = $tableId;
        $this->save($data);

        return true;

    }

    /**
     * unmarkTable
     *
     * @param <type> $tableId
     * @return <type>
     */
    function unmarkTable($tableId) {

        $table = $this->Table->find('first', array('conditions'=> array("id"=>$tableId), 'fields'=>'table_no', 'recursive'=>-1));

        if (!$table) return false;

        $tableNo = $table['Table']['table_no'];

        // unmergetable will reset all status. use it.
        return $this->unmergeTable($tableId, $tableNo);

    }

    /**
     * markRegion
     *
     * @param <type> $regionId
     * @param <type> $markId
     * @param <type> $clerk
     * @return <type>
     */
    function markRegion($regionId, $markId, $clerk) {

        if ($regionId == 'ALL' ) {
            $tables = $this->Table->find('all', array('fields'=>'id,table_no', 'recursive'=>-1));
        }else {
            $tables = $this->Table->find('all', array('conditions'=> array("table_region_id"=>$regionId), 'fields'=>'id,table_no', 'recursive'=>-1));
        }

        if (!$tables) return false;

        $tableMark = new TableMark();
        $mark = $tableMark->getMarkById($markId);

        if (!$mark) return false;

        foreach ($tables as $idx =>$table) {

            $tableId = $table['Table']['id'];
            $tableNo = $table['Table']['table_no'];

            $data = array('id'=> $tableId, 'table_id'=> $tableId, 'table_no'=> $tableNo,
                'status'=>3, 'mark' => $mark['name'] , 'mark_op_deny'=> $mark['opdeny'], 'mark_user'=> $clerk,
                'start_time'=>time(), 'end_time'=>time() + $mark['period']*60,
                'modified' => (double)(microtime(true)*1000)
            );

            $this->id = $tableId;
            $this->save($data);

        }

        return true;
    }

    /**
     * unmarkRegion
     *
     * @param <type> $regionId
     * @return <type>
     */
    function unmarkRegion($regionId) {

        if ($regionId == 'ALL' ) {
            $tables = $this->Table->find('all', array('fields'=>'id,table_no', 'recursive'=>-1));
        }else {
            $tables = $this->Table->find('all', array('conditions'=> array("table_region_id"=>$regionId), 'fields'=>'id,table_no', 'recursive'=>-1));
        }

        if (!$tables) return false;

        foreach ($tables as $idx =>$table) {

            $tableId = $table['Table']['id'];
            $tableNo = $table['Table']['table_no'];

           $this->unmergeTable($tableId, $tableNo);
        }

        return true;

    }

}

?>
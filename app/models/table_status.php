<?php

class TableStatus extends AppModel {
    var $name = 'TableStatus';
    var $useDbConfig = 'table';
    
    // var $belongsTo: array('Table');
    var $belongsTo = array('Table' =>  
                            array('className'  => 'Table',  
                                  'conditions' => '',  
                                  'order'      => '',  
                                  'foreignKey' => 'table_id'  
                            )  
                      );
        
    var $hasMany = array('TableBooking' , 'TableOrder' );


	function getTableStatuses($lastModified) {
		
		// $lastModified = 0; //1243000000;
		// $conditions = "modified > '" . $lastModified . "'";
                $conditions = "Table.active AND modified > '" . $lastModified . "'";

                $tableStatus = $this->find('all', array("conditions" => $conditions, "recursive" => 3, "order"=>array('TableStatus.table_no')));
		
		$tables = array();
		if ($tableStatus) {
			$tables = Set::classicExtract($tableStatus, '{n}.TableStatus');

		}
		

		return $tableStatus;

	}
	
	function setTableStatus($tableObject) {
	
		$table_no = $tableObject['table_no'];
	
		$conditions = "TableStatus.table_no='" . $table_no . "'";

		$tableStatusObjTmp = $this->find('first', array("conditions" => $conditions));
		
		// tableStatus record exist
		if ($tableStatusObjTmp) {

		    // update tableStatus record
		    $this->id = $tableStatusObjTmp['TableStatus']['id'];
		    
		    $tableStatusObjTmp['TableStatus']['modified'] = null;
		    
		    $retObj = $this->save($tableStatusObjTmp);
		    
                }

                // save TableOrder...
                $tableOrderObj = $this->TableOrder->find('first', array("conditions" => "TableOrder.id='" . $tableObject['order_id'] . "'"));

                if ($tableOrderObj) {
                    // update order
                    $this->TableOrder->id = $tableOrderObj['TableOrder']['id'];

                } else {
                    // add new one
                    $this->TableOrder->create();
                    $this->TableOrder->id = '';
                    // $tableObject['id'] = String::uuid();
                    $tableObject['id'] = $tableObject['order_id'];

                }

                $retObj = $this->TableOrder->save($tableObject);

                // remove old table order
                // $this->_removeOldFinishedTableOrder();
		
		return true;

	}

        function _removeOldFinishedTableOrder() {
            //
            $rmTime = time() - 86400; // one day ago...

            // $conditions = "TableOrder.order_id='" . $order_id . "'";
            $conditions = array("TableOrder.status<>2 AND TableOrder.modified<'" . rmTime . "'");
		
            // $retObj = $this->TableOrder->deleteAll(array("conditions" => $conditions));
            $retObj = $this->TableOrder->deleteAll($conditions);

            return $retObj;
        }
	
	function setTableHostBy($table_no, $holdTableNo) {

		$conditions = "TableStatus.table_no='" . $table_no . "'";

		$tableStatusObjTmp = $this->find('first', array("conditions" => $conditions));

		if ($holdTableNo == $table_no) {
		    $tableStatusObjTmp['TableStatus']['hostby'] = '';
		}
		else {
		    $tableStatusObjTmp['TableStatus']['hostby'] = $holdTableNo;
		}

		// tableStatus record exist
		if ($tableStatusObjTmp) {

		    // update tableStatus record
		    $this->id = $tableStatusObjTmp['TableStatus']['id'];
		    $tableStatusObjTmp['TableStatus']['modified'] = null;
		    $retObj = $this->save($tableStatusObjTmp);

		}

		return true;

	}
	
	
	function touchTableStatus($table_no) {
            // touch modified time...
            $conditions = "TableStatus.table_no='" . $table_no . "'";
            $tableStatusObjTmp = $this->find('first', array("conditions" => $conditions));

            // @todo maintain status field...
            if ($tableStatusObjTmp) {
		$this->id = $tableStatusObjTmp['TableStatus']['id'];
		$tableStatusObjTmp['TableStatus']['modified'] = null;
		$retObj = $this->save($tableStatusObjTmp);
                
            }
            return true;
        }
        
        function removeCheck($table_no, $order_id) {

            // $conditions = "TableOrder.order_id='" . $order_id . "'";
            $conditions = "TableOrder.id='" . $order_id . "'";
		
            // $retObj = $this->TableOrder->deleteAll(array("conditions" => $conditions));
            $retObj = $this->TableOrder->deleteAll(array("TableOrder.order_id" => $order_id));

            $this->touchTableStatus($table_no);

            return $retObj;

        }

        function getTableOrderCheckSum($order_id) {
            // $conditions = "TableOrder.order_id='" . $order_id . "'";
            $conditions = "TableOrder.id='" . $order_id . "'";

            $tableOrder = $this->TableOrder->find('all', array("conditions" => $conditions, "recursive" => 0));

            return $tableOrder;
        }

        function transTable($tableObject) {

            $this->setTableStatus($tableObject);

            $this->touchTableStatus($tableObject["org_table_no"]);

        }

        function getTableOrders($lastModified) {

		// $lastModified = 0; //1243000000;
		$conditions = "modified > '" . $lastModified . "'";

                $tableOrder = $this->TableOrder->find('all', array("conditions" => $conditions, "recursive" => 0, "order"=>array('TableOrder.modified')));
                // $tableStatus = $this->find('all');

		$orders = array();
		if ($tableOrder) {
			$orders = Set::classicExtract($tableStatus, '{n}.TableOrder');

		}


		return $tableOrder;

	}

        function setTableMark($table_no, $markObj) {

		$conditions = "TableStatus.table_no='" . $table_no . "'";

		$tableStatusObjTmp = $this->find('first', array("conditions" => $conditions));

		// tableStatus record exist
		if ($tableStatusObjTmp) {

		    // update tableStatus record
		    $this->id = $tableStatusObjTmp['TableStatus']['id'];
                    $tableStatusObjTmp['TableStatus']['modified'] = null;

		    if ($markObj['name']) {
                        $tableStatusObjTmp['TableStatus']['start_time'] = $markObj['start_time'];
                        $tableStatusObjTmp['TableStatus']['end_time'] = $markObj['end_time'];
                        $tableStatusObjTmp['TableStatus']['mark_user'] = $markObj['mark_user'];
                        $tableStatusObjTmp['TableStatus']['mark'] = $markObj['name'];
                        $tableStatusObjTmp['TableStatus']['mark_op_deny'] = $markObj['opdeny'];
                    } else {
                        $tableStatusObjTmp['TableStatus']['start_time'] = 0;
                        $tableStatusObjTmp['TableStatus']['end_time'] = 0;
                        $tableStatusObjTmp['TableStatus']['mark_user'] = '';
                        $tableStatusObjTmp['TableStatus']['mark'] = '';
                        $tableStatusObjTmp['TableStatus']['mark_op_deny'] = false;
                    }

		    $retObj = $this->save($tableStatusObjTmp);

                }

		return true;

	}

        function setTableMarks($tables, $markObj) {
                $this->begin();
                foreach ($tables as $table_no) {

                    $conditions = "TableStatus.table_no='" . $table_no . "'";

                    $tableStatusObjTmp = $this->find('first', array("conditions" => $conditions));

                    // tableStatus record exist
                    if ($tableStatusObjTmp) {

                        // update tableStatus record
                        $this->id = $tableStatusObjTmp['TableStatus']['id'];
                        $tableStatusObjTmp['TableStatus']['modified'] = null;

                        if ($markObj['name']) {
                            $tableStatusObjTmp['TableStatus']['start_time'] = $markObj['start_time'];
                            $tableStatusObjTmp['TableStatus']['end_time'] = $markObj['end_time'];
                            $tableStatusObjTmp['TableStatus']['mark_user'] = $markObj['mark_user'];
                            $tableStatusObjTmp['TableStatus']['mark'] = $markObj['name'];
                            $tableStatusObjTmp['TableStatus']['mark_op_deny'] = $markObj['opdeny'];
                        } else {
                            $tableStatusObjTmp['TableStatus']['start_time'] = 0;
                            $tableStatusObjTmp['TableStatus']['end_time'] = 0;
                            $tableStatusObjTmp['TableStatus']['mark_user'] = '';
                            $tableStatusObjTmp['TableStatus']['mark'] = '';
                            $tableStatusObjTmp['TableStatus']['mark_op_deny'] = false;
                        }

                        $retObj = $this->save($tableStatusObjTmp);

                    }

                }
                $this->commit();

		return true;

	}

}

?>

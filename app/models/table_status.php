<?php

class TableStatus extends AppModel {
    var $name = 'TableStatus';

	function getTableStatusList() {

		$aa = $this->find('all');

		$tables = array();
		if ($aa) {
			$tables = Set::classicExtract($aa, '{n}.TableStatus');
		}

		return $tables;

	}


	function setTableStatus($tableObject) {

        $order_id = $tableObject['order_id'];
        $conditions = "order_id='" . $order_id . "'";

        $tableStatusObjTmp = $this->find('first', array("conditions" => $conditions));

        // tableStatus record exist
        if ($tableStatusObjTmp) {

            if (empty($tableObject['sequence'])) {
                // remove tableStatus record
                $this->del($tableStatusObjTmp['TableStatus']['id']);
            } else {
                // update tableStatus record
                $this->id = $tableStatusObjTmp['TableStatus']['id'];
                $retObj = $this->save($tableObject);
            }

        } else {

            if (!empty($tableObject['sequence'])) {
                // add new tableStatus record
				$this->create();
				$tableObject['id'] = String::uuid();
                $retObj = $this->save($tableObject);
            }

        }
		return true;

	}


	
}

?>

<?php

class TableOrder extends AppModel {
    var $name = 'TableOrder';
    var $useDbConfig = 'table';
	
	function saveOrder($tableObject) {
		this.create();
		$tableObject['id'] = String::uuid();
		    
		$this->TableOrder->save($tableObject);
	}
}

?>

<?php

class Table extends AppModel {
    var $name = 'Table';
    var $useDbConfig = 'table';

    function getTables() {

        // get setting as GeckoJS normal array
        $result = $this->find('all', array('recursive' => -1, 'order' => 'table_no asc'));
        return $result;

    }
	
}

?>
<?php

class TableMark extends AppModel {
    var $name = 'TableMark';
    var $useDbConfig = 'table';
	
    function getMarks() {

        // get setting as GeckoJS normal array
        $result = $this->find('all', array('recursive' => -1, 'order' => 'id asc'));
        return $result;

    }
	
}

?>
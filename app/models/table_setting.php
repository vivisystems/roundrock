<?php

class TableSetting extends AppModel {
    var $name = 'TableSetting';
    var $useDbConfig = 'table';


    function getSettings() {

        // get setting as GeckoJS normal array
        //$result = Set::classicExtract($this->find('all', array('recursive' => -1)), '{n}.TableSetting');
        $result = $this->find('all', array('recursive' => -1));
        return $result;

    }
	
}

?>
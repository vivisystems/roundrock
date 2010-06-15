<?php
/**
 * TableRegion Model
 * 
 */
class TableRegion extends AppModel {
    var $name = 'TableRegion';
    //var $useDbConfig = 'table';

    var $hasMany = array('Table');


    /**
     * getRegions
     * 
     * @return <type> 
     */
    function getRegions() {

        // get setting as GeckoJS normal array
        $result = $this->find('all', array('recursive' => -1, 'order' => 'name asc'));
        return $result;

    }
	
}

?>

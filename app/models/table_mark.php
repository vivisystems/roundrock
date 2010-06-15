<?php
App::import('Model', 'TableSetting');

class TableMark extends AppModel {
    var $name = 'TableMark';
    //var $useDbConfig = 'table';


	/**
     * getMarks
     * 
     * @return <type>
     */
    function getMarks() {

        // get setting as GeckoJS normal array
        $result = $this->find('all', array('recursive' => -1, 'order' => 'id asc'));
        return $result;

    }

    
    /**
     * getMark
     * 
     * @param <type> $id
     * @return <type> 
     */
    function getMark($id) {
        $result = $this->findById($id);
        return $result;
    }


    /**
     * getMarkById will only return Mark array
     *
     */
    function getMarkById($id) {
        $mark = $this->getMark($id);
        if($mark) {
           return $mark['TableMark'];
        }else {
           return false;
        }
    }

    /**
     * getAutoMarkAfterSubmit
     *
     * @return <type> 
     */
    function getAutoMarkAfterSubmit() {
        
        $tableSetting = new TableSetting();
        $autoMark = $tableSetting->getSettingValue('AutoMarkAfterSubmit') ;

        $mark = $this->getMark($autoMark);

        if ($mark) {
            return $mark['TableMark'];
        }else {
            return false;
        }
    }
	
}

?>

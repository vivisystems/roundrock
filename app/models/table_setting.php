<?php
/**
 * TableSetting Model
 *
 */
class TableSetting extends AppModel {
    
    var $name = 'TableSetting';
    //var $useDbConfig = 'table';


    /**
     * getSettings
     *
     * @todo cached it.
     * @return <type>
     */
    function getSettings() {

        // get setting as GeckoJS normal array
        //$result = Set::classicExtract($this->find('all', array('recursive' => -1)), '{n}.TableSetting');
        $result = $this->find('all', array('recursive' => -1));
        return $result;

    }


    /**
     * getSetting
     *
     * @param <type> $key
     * @return <type>
     */
    function getSetting($key) {
        $result = $this->findById($key);
        return $result;
    }


    /**
     * getSettingValue
     *
     * @param <type> $key
     * @return <type> 
     */
    function getSettingValue($key) {
        $result = $this->getSetting($key);
        if($result) return $result['TableSetting']['value'];

        return '';
    }
	
}

?>

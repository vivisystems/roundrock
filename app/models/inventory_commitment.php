<?php
App::import('Core', array('CakeLog'));

class InventoryCommitment extends AppModel {

    var $name = 'InventoryCommitment';
    //var $useDbConfig = 'inventory';


    function getLastModified() {

        $inventory = $this->find('first', array('fields'=>'type,modified,', 'conditions'=> "type='inventory'", 'order'=>'created desc'));

        if (is_array($inventory)) {
            return (0 + $inventory['InventoryCommitment']['modified']);
        }else {
            return 0;
        }

    }
}

?>

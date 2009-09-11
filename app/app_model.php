<?php
/**
 * Application model for Cake.
 *
 */
class AppModel extends Model {

    function begin() {
        $db =& $this->getDataSource();
        $db->begin($this);
    }

    function commit() {
        $db =& $this->getDataSource();
        $db->commit($this);
    }

    function rollback() {
        $db =& $this->getDataSource();
        $db->rollback($this);
    }

}
?>
<?php
/**
 * Application model for Cake.
 *
 */
class AppModel extends Model {

    function begin() {
        $db =& $this->getDataSource();
        return $db->begin($this);
    }

    /**
     * Begin Exclusive lock only for sqlite
     * @return <type>
     *
     */
    function beginExclusive() {

        $db =& $this->getDataSource();

        // check datasource is sqlite ??
        if (!strcasecmp(get_class($db), 'sqlite')) {
            return $this->begin();
        }

        if (!$db->_transactionStarted && $db->execute('BEGIN EXCLUSIVE')) {
                $db->_transactionStarted = true;
                return true;
        }
        return false;
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
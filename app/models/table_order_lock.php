<?php

class TableOrderLock extends AppModel {
    var $name = 'TableOrderLock';
    var $useDbConfig = 'table';
	
    function getLocks() {

        // get setting as GeckoJS normal array
        $result = $this->find('all', array('recursive' => -1));
        return $result;

    }

    /**
     * is order locked by other machine 
     * 
     * @param <type> $orderId
     * @param <type> $machineId
     * @return <type> 
     */
    function isOrderLock($orderId, $machineId='') {

        $lock = $this->getOrderLock($orderId);

        if (empty($lock)) return false;

        return ($lock['TableOrderLock']['machine_id'] != $machineId);
    }

    function getOrderLock($orderId) {
        
        $conditions = array('id'=>$orderId);
        
        $result = $this->find('first', array('conditions' => $conditions) );

        return $result;
    }

    function setOrderLock($orderId, $machineId='', $locked=true) {

        if ($locked) {

            if (empty($machineId)) return ;
            
            // unsetall lock by machine id
            $this->releaseOrderLocksByMachineId($machineId);
            
            $this->id = $orderId;
            if (!$this->exists()) {
                $this->create();
            }
            $this->save(array('id'=>$orderId, 'machine_id'=>$machineId, 'machine_addr'=>env("REMOTE_ADDR")));
            
        }else {

            $this->delete($orderId);
            
        }
        
    }

    function releaseOrderLock($orderId) {
        
        $this->setOrderLock($orderId, '', false);
        
    }

    function releaseOrderLocksByMachineId($machineId='') {
        if (empty($machineId)) return;
        $this->deleteAll(array("machine_id"=>$machineId));
    }
	
}

?>
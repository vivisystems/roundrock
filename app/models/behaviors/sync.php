<?php
/**
 * Sync behavior class.
 */
class SyncBehavior extends ModelBehavior {
    
    var $config = "";
    var $syncModel = null;

    /**
     * Sets up the configuation for the model
     *
     * @param mixed $config
     * @return void
     * @access public
     */
    function setup(&$model, $config = array()) {
        
        if (is_string($config)) {
            $this->config = $config;
        }else {
            $this->config = $model->useDbConfig;
        }

    }

    /**
     *
     * @return Sync Model
     */
    function &getSync(&$model) {

        if ($this->syncModel == null) {
            $this->syncModel = new Sync(false, null, $this->config);
        }

        $this->syncModel->setDataSource($model->useDbConfig);
        
        return $this->syncModel;

    }

    /**
     * is sync active in sync_settings.ini
     *
     * @return boolean
     */
    function isActive() {

        $syncSettings =& Configure::read('sync_settings');

        return !empty($syncSettings['active']);

    }

    /**
     * return machine in sync_settings.ini
     *
     * @return string machine
     */
    function getMachineId() {

        $syncSettings =& Configure::read('sync_settings');
        return $syncSettings['machine_id'];

    }

    /**
     *
     * @param boolean $created True if this is a new record
     * @return void
     * @access public
     */
    function afterSave(&$model, $created) {

        // check if not active
        if(!$this->isActive()) return;

        $machineId = $this->getMachineId();
        if (empty($machineId)) return ;

        $sync =& $this->getSync($model);

        $data = array(
            'crud' => 'update',
            'machine_id' => $machineId,
            'from_machine_id' => $machineId,
            'method_id' => $model->id,
            'method_type' => $model->name,
            'method_table' => $model->table
        );

        if ($created) {
            $data['crud'] = 'create';
        }

        $sync->create();
        $sync->save($data);

        return true;

    }
    /**
     *
     *
     * @return void
     * @access public
     */
    function afterDelete(&$model) {

        // check if not active
        if(!$this->isActive()) return;

        $machineId = $this->getMachineId();
        if (empty($machineId)) return ;

        $sync =& $this->getSync($model);

        $data = array(
            'crud' => 'delete',
            'machine_id' => $machineId,
            'from_machine_id' => $machineId,
            'method_id' => $model->id,
            'method_type' => $model->name,
            'method_table' => $model->table
        );

        $sync->create();
        $sync->save($data);

        return true;

    }
}

?>
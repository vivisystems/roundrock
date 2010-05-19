<?php

App::import('Core', array('HttpSocket','CakeLog'));

/**
 * Request object for handling HTTP requests
 *
 * @package       cake
 * @subpackage    cake.cake.libs.controller.components
 *
 */
class SyncHandlerComponent extends Object {

    /**
     * Determines whether or not callbacks will be fired on this component
     *
     * @var boolean
     * @access public
     */
    var $enabled = true;
    /**
     * Holds the copy of SyncSettings
     *
     * @var array
     * @access public
     */
    var $syncSettings = array();

    var $statusFile = "/tmp/sync_server.status" ;

    var $uses = array('Sync', 'SyncRemoteMachine');

    /**
     * Constructor.
     *
     */
    function __construct() {
        parent::__construct();
    }
    /**
     * Initializes the component, gets a reference to Controller::$parameters.
     *
     * @param object $controller A reference to the controller
     * @return void
     * @access public
     */
    function initialize(&$controller) {
        App::import('Model', 'Sync');
        App::import('Model', 'SyncRemoteMachine');
        App::import('Core', array('HttpSocket','CakeLog'));

        $this->syncSettings =& Configure::read('sync_settings');

        // set syncSettings to controller
        $controller->syncSettings =& $this->syncSettings ;

        // if also have security component
        if($controller->Security != null) {

            $password = "rachir";
            if ($this->syncSettings != null) {
                $password = $this->syncSettings['password'];
            }else {
                $password = "rachir";
            }

            $controller->Security->loginOptions = array(
                    'type'=>'basic',
                    'realm'=>'VIVIPOS_API Realm'
                    // 'prompt'=> false
            );
            $controller->Security->loginUsers = array(
                    'vivipos'=> $password
            );
        }

    }

    /**
     * The startup method
     *
     * @param object $controller A reference to the controller
     * @return void
     * @access public
     */
    function startup(&$controller) {
    }


    /**
     *
     * @return <type>
     */
    function getSourceList() {

        $supportedSources = array();
        $datasources = ConnectionManager::sourceList();

        foreach($datasources as $ds ) {

            $datasource =& ConnectionManager::getDataSource($ds);

            $tables = $datasource->listSources();

            if (!in_array("syncs", $tables)) {
                continue;
            }else {
                $supportedSources[] = $ds;
            }
        }

        return $supportedSources;

    }


    /**
     *
     * @param <type> $machine_id
     * @param <type> $dbConfig
     * @param <type> $direction
     */
    function getLastSynced($machine_id, $dbConfig, $direction) {

        $syncRemoteMachine = new SyncRemoteMachine(false, null, $dbConfig); // id , table, ds
        $data = $syncRemoteMachine->find('first', array('conditions' => array('machine_id' => $machine_id)));

        if($data) {
            $lastSynced = $data['SyncRemoteMachine']['last_synced'];
        }else {
            if ($direction == 'pull') {
                // change cursor to last insert id
                $sync = new Sync(false, null, $dbConfig); // id , table, ds
                $lastSync = $sync->find('first', array('order' => array('Sync.id DESC')) );
                $lastSynced = ($lastSync) ? $lastSync['Sync']['id'] : 0;

                // insert machine setting
                $this->setLastSynced($machine_id, $dbConfig, $lastSynced);
                //$syncRemoteMachine->create();
                //$syncRemoteMachine->save(array('machine_id'=>$machine_id, 'last_synced'=>$lastSynced));

            }else {
                $lastSynced = 0;
            }
        }

        // write debug
        // CakeLog::write('debug', 'getLastSynced machine_id: ' . $machine_id . ' , dbConfig: ' . $dbConfig . ' , lastSynced: ' . $lastSynced);


        return $lastSynced;

    }



    /**
     *
     * @param <type> $machine_id
     * @param <type> $dbConfig
     * @param <type> $last_synced
     */
    function setLastSynced($machine_id, $dbConfig, $last_synced=0) {

        if(!is_numeric($last_synced)) $last_synced = 0;

        // write debug
        //CakeLog::write('debug', 'setLastSynced machine_id: ' . $machine_id . ' , dbConfig: ' . $dbConfig . ' , lastSynced: ' . $last_synced);

        $syncRemoteMachine = new SyncRemoteMachine(false, null, $dbConfig); // id , table, ds
        $data = $syncRemoteMachine->find('first', array('conditions' => array('machine_id' => $machine_id)));

        if($data) {

            $this->syncStatus('saving');

            $newData = array('last_synced'=> $last_synced);

            $syncRemoteMachine->id = $data['SyncRemoteMachine']['id'];
            $syncRemoteMachine->save($newData);

            $this->syncStatus('finished');

        }else {

            $this->syncStatus('saving');

            $newData = array('last_synced' => $last_synced, 'machine_id'=>$machine_id);

            $syncRemoteMachine->create();
            $syncRemoteMachine->save($newData);

            $this->syncStatus('finished');

        }

    }

    /**
     *
     * @param <type> $machine_id
     * @param <type> $last_synced
     */
    function saveLastSynced($machine_id, $datas) {

        foreach ($datas as $data) {

            $dbConfig = $data['datasource'];
            $lastSynced = $data['last_synced'];

            $this->setLastSynced($machine_id, $dbConfig, $lastSynced);

        }

        return true;
    }



    /**
     *
     * @param <type> $client_machine_id
     * @param <type> $dbConfig
     * @param <type> $syncs
     *
     */
    function processSyncSQL($machine_id, $dbConfig, &$syncs) {

        $outputBuffer = "";

        foreach($syncs as $sync) {

            $method_table = $sync['method_table'];
            $method_id = $sync['method_id'];
            $crud = $sync['crud'];

            // PDO Connection object
            $datasource =& ConnectionManager::getDataSource($dbConfig);


            // generate sync create sql
            $newSync = $sync;
            unset($newSync['id']);

            $newSync['from_machine_id'] = $machine_id;
            $newSync_count = count($newSync);
            $newSync_fields = array_keys($newSync);
            $newSync_values = array_values($newSync);

            $newSync_valuesInsert = array();

            for ($ni = 0; $ni < $newSync_count; $ni++) {
                $newSync_valuesInsert[] = $datasource->value($newSync_values[$ni], 'TEXT', false);
            }

            $newSync_sql = $this->renderStatement('create', array(
                    'table' => "syncs",
                    'fields'=>join(', ',$newSync_fields),
                    'values'=>join(', ',$newSync_valuesInsert)
                    )
            );

            //echo $newSync_sql . "\n";
            $outputBuffer .= $newSync_sql. "; \n";

            $table = $datasource->name($method_table);

            $defaultCondition = $datasource->conditions( $datasource->name('id') . ' = ' . $datasource->value($method_id, 'TEXT', false) );

            $sql = "";

            switch($crud) {
                case 'delete':

                    $sql = $this->renderStatement('delete', array(
                            'table' => $table,
                            'conditions' => $defaultCondition
                            )
                    );

                    // echo 'delete: ' . $sql . "\n";

                    break;

                case 'truncate':

                    $sql = $this->renderStatement('delete', array(
                            'table' => $table,
                            'conditions' => ''
                            )
                    );

                    // echo 'truncate: ' . $sql . "\n";

                    break;

                case 'create':

                // use native PDO Query
                    $stmt = $datasource->connection->query("SELECT * FROM {$method_table} WHERE id='{$method_id}'");
                    $result = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($result == null) continue;

                    $count = count($result);
                    $fields = array_keys($result);
                    $values = array_values($result);

                    $valuesInsert = array();

                    for ($i = 0; $i < $count; $i++) {
                        $valuesInsert[] = $datasource->value($values[$i], 'TEXT', false);
                    }

                    $sql = $this->renderStatement('create', array(
                            'table' => $table,
                            'fields'=>join(', ',$fields),
                            'values'=>join(', ',$valuesInsert)
                            )
                    );

                    // echo 'create: ' . $sql . "\n";

                    break;

                case 'update':

                // use native PDO Query
                    $stmt = $datasource->connection->query("SELECT * FROM {$method_table} WHERE id='{$method_id}'");
                    $result = $stmt->fetch(PDO::FETCH_ASSOC);

                    if ($result == null) continue;

                    $count = count($result);
                    $fields = array_keys($result);
                    $values = array_values($result);

                    $valuesUpdate = array();

                    for ($i = 0; $i < $count; $i++) {
                        $valuesUpdate[] = $datasource->name($fields[$i]) .' = '. $datasource->value($values[$i], 'TEXT', false);
                    }

                    $sql = $this->renderStatement('update', array(
                            'table' => $table,
                            'fields' => join(', ', $valuesUpdate),
                            'conditions'=> $defaultCondition
                            )
                    );

                    // echo 'update: ' . $sql . "\n";

                    break;
            }

            if(!empty($sql)) {
                $outputBuffer .= $sql. "; \n";
            }

        }

        return $outputBuffer;

    }

    /**
     * get datas
     *
     * data structure
     *
     * [ds] = array (
     *          datasource: ds,
     *          count: x,
     *          last_synced: y,
     *          sql: str
     *        );
     * [ds2] = array( .....);
     *
     * @param string $client_machine_id
     */
    function getData($machine_id, $direction="pull", $client_settings=array(), $type='all') {

        // set php time limit to unlimimted
        set_time_limit(0);

        $my_machine_id = $this->syncSettings['machine_id'];

        $datas = array();

        $datasources = $this->getSourceList();

        $batch_limit = $this->syncSettings['batch_limit'];

        foreach($datasources as $dbConfig ) {

            // ini data structure
            $data = array('datasource' => $dbConfig, 'count' => 0, 'last_synced' => 0, 'sql' => '');

            // force order only support push
            if ($dbConfig == 'order' && $direction == 'pull' && empty($client_settings['pull_order'])) {
                $datas[$dbConfig] = $data;
                continue;
            }

            // PDO Connection object
            $datasource =& ConnectionManager::getDataSource($dbConfig);

            // set model Sync 's useDbConfig
            $this->Sync->useDbConfig = $dbConfig;

            // getLastSynced
            $lastSynced = $this->getLastSynced($machine_id, $dbConfig, $direction);

            $sync = new Sync(false, null, $dbConfig); // id , table, ds


            $condition = array(
                    'conditions' => array(
                            'from_machine_id !=' => $machine_id,
                            'id >' => $lastSynced
                    ),
                    'order' => 'id asc'
            );
            // XXXX pull must pull all updated on master 2010/01
            if ($direction != 'pull') {
                $condition['limit'] = $batch_limit;

            }

            $results = $sync->find($type, $condition);

            if ($type == 'count') {

                $syncCount = $results;
                $newLastSynced = -1;
                $sql = '';

            }else {

                $syncs = Set::classicExtract($results, '{n}.Sync');

                $syncCount = count($syncs);

                if ($syncCount > 0) {

                    $newLastSynced = $syncs[$syncCount-1]['id'];

                    // process Sync SQL
                    $sql = $this->processSyncSQL($my_machine_id, $dbConfig, $syncs);

                }else {

                    $newLastSynced = 0;
                    $sql = "";

                }
            }


            $data['count'] = $syncCount;
            $data['last_synced'] = $newLastSynced;
            $data['sql'] = $sql;


            $datas[$dbConfig] = $data;
        }

        return $datas;

    }


    /**
     * save datas
     *
     * data structure
     *
     * [ds] = array (
     *          datasource: ds,
     *          count: x,
     *          last_synced: y,
     *          sql: str
     *        );
     * [ds2] = array( .....);
     *
     * @param string $client_machine_id
     */
    function saveData($machine_id, &$datas) {

        // set php time limit to unlimimted
        set_time_limit(0);

        $my_machine_id = $this->syncSettings['machine_id'];

        $result = array();

        $this->syncStatus('saving');

        foreach($datas as $data ) {

            if ($data['count'] <= 0) continue ;

            $dbConfig = $data['datasource'];

            // datasource not exists
            $cm =& ConnectionManager::getInstance();
            if(empty($cm->config->{$dbConfig})) continue;

            // PDO Connection object
            $datasource =& ConnectionManager::getDataSource($dbConfig);

            if (!is_object($datasource)) continue;

            // write debug
            //CakeLog::write('debug', 'saveData to ' . $dbConfig . "\n" . "  Data Count: ". $data['count']);

            try {

                if (!is_object($datasource->connection)) continue;

                $datasource->connection->beginTransaction();
                $datasource->connection->exec($data['sql']);
                $datasource->connection->commit();

                // setting result array
                $result[$dbConfig] = array('datasource' => $dbConfig, 'count' => $data['count'], 'last_synced' => $data['last_synced']);

            }  catch(Exception $e) {

                CakeLog::write('warning', 'Exception saveData to ' . $dbConfig . "\n" .
                        '  Exception: ' . $e->getMessage() . "\n" .
                        '  SQL: ' . $data['sql'] . "\n\n");

                // always rollback
                $datasource->connection->rollback();
                $result[$dbConfig] = array('datasource' => $dbConfig, 'count' => 0 , 'last_synced' => 0);

            }

        }

        $this->syncStatus('finished');

        return $result;
    }



    /**
     * get server datas to client
     *
     * <client call pull>
     *
     * @param string $client_machine_id
     */
    function getServerData($client_machine_id, $client_settings) {

        $datas = $this->getData($client_machine_id, "pull", $client_settings, 'all');

        return $datas;

    }


    /**
     * save server datas
     *
     * <client call pull>
     *
     * @param string $server_machine_id
     */
    function saveServerData($server_machine_id, &$datas) {

        //$my_machine_id = $this->syncSettings['machine_id'];

        // write debug
        //CakeLog::write('debug', 'saveServerData from ' . $server_machine_id );

        $result = $this->saveData($server_machine_id, $datas);

        return $result;

    }


    /**
     * get client datas to server
     *
     * <client call pull>
     *
     * @param string $server_machine_id
     */
    function getClientData($server_machine_id) {

        // write debug
        //CakeLog::write('debug', 'getClientData for ' . $server_machine_id );

        $datas = $this->getData($server_machine_id, "push", array(), 'all');

        return $datas;

    }


    /**
     * save client datas
     *
     * <client call pull>
     *
     * @param string $server_machine_id
     */
    function saveClientData($client_machine_id, &$datas) {

        $my_machine_id = $this->syncSettings['machine_id'];

        $result = $this->saveData($client_machine_id, $datas);

        return $result;

    }

    /**
     * get client datas count to server
     *
     * <client call pull>
     *
     * @param string $server_machine_id
     */
    function getClientDataCount($server_machine_id) {

        // write debug
        //CakeLog::write('debug', 'getClientData for ' . $server_machine_id );

        $datas = $this->getData($server_machine_id, "push", array(), 'count');

        return $datas;
    }


    /**
     * get Request Client Machine Id
     *
     * @return string  client's machine id or empty string
     */
    function getRequestClientMachineId() {
        return env('HTTP_X_VIVIPOS_MACHINE_ID');
    }

    /**
     *
     * @param <type> $result
     * @param <type> $type
     * @return <type>
     */
    function prepareResponse($result, $type='php') {

        $response = "";

        switch($type) {
            case 'php':
                $response = base64_encode(bzcompress(serialize($result)));
                break;

            case 'json':
                $response = json_encode($result);
                break;

            case 'bgz_json':
            // base64 gzip json
                $response = base64_encode(gzdeflate(rawurlencode(json_encode($result))));
                break;
        }

        return $response;

    }


    /**
     *
     * @param <type> $result
     * @param <type> $type
     * @return <type>
     */
    function prepareRequest($result, $type='php') {

        $response = "";

        switch($type) {
            case 'php':
                $response = base64_encode(bzcompress(serialize($result)));
                break;

            case 'json':
                $response = json_encode($result);
                break;
        }
        return $response;
    }


    /**
     *
     * @param <type> $request
     * @param <type> $type
     * @return <type>
     */
    function parseRequest($request, $type='php') {

        switch($type) {
            case 'php':
                $result = unserialize(bzdecompress(base64_decode($request)));
                break;

            case 'json':
                $result = json_decode($request, true);
                break;
        }

        return $result;
    }

    /**
     *
     * @param <type> $request
     * @param <type> $type
     * @return <type>
     */
    function parseResponse($request, $type='php') {

        switch($type) {
            case 'php':
                $result = unserialize(bzdecompress(base64_decode($request)));
                break;

            case 'json':
                $result = json_decode($request, true);
                break;
        }

        return $result;
    }


    /**
     * Renders a final SQL statement by putting together the component parts in the correct order
     *
     * @param <type> $type
     * @param <type> $data
     * @return <type>
     */
    function renderStatement($type, $data) {
        extract($data);

        switch (strtolower($type)) {
            case 'create':
                return "INSERT OR REPLACE INTO {$table} ({$fields}) VALUES ({$values})";
                break;

            case 'update':
                return "UPDATE {$table} SET {$fields} {$conditions}";
                break;

            case 'delete':
                return "DELETE FROM {$table} {$conditions}";
                break;
        }
    }


    /**
     * Truncate Old Sync logs
     *
     * @return <type>
     */
    function truncateSync($retain_days=7) {

        $datasources = $this->getSourceList();

        $retain_time = time() - 86400 * $retain_days;

        $rowCount = 0 ;

        $this->syncStatus('saving');

        foreach($datasources as $dbConfig ) {

            try {

                // PDO Connection object
                $datasource =& ConnectionManager::getDataSource($dbConfig);

                if (!is_object($datasource)) continue;

                // set model Sync 's useDbConfig
                $sync = new Sync(false, null, $dbConfig); // id , table, ds
                $syncRemoteMachine = new SyncRemoteMachine(false, null, $dbConfig); // id , table, ds

                // get maxId
                $maxSync = $sync->find('first', array('fields'=>array('id'), 'order'=>array('Sync.id DESC')));
                if($maxSync) {
                    $maxId = $maxSync['Sync']['id'];
                }
                $maxDelSync = $sync->find('first', array('fields'=>array('id'), 'order'=>array('Sync.id DESC'), 'conditions'=>array('Sync.created <'.$retain_time)));
                if ($maxDelSync) {
                    $maxDelId = $maxDelSync['Sync']['id'];

                    try {

                        $datasource->connection->beginTransaction();

                        // delete old syncs
                        $result = $datasource->execute("DELETE FROM syncs WHERE created < ". $retain_time);

                        if (is_object($result)) $rowCount += $result->rowCount();

                        // update syncRemoteMachines
                        $datasource->execute("UPDATE sync_remote_machines SET last_synced=0 WHERE ( last_synced <= ". $maxDelId . " or last_synced > " . $maxId . ")");

                        $datasource->connection->commit();

                    }catch (Exception $e) {
                        
                        CakeLog::write('warning', 'Exception saveData to ' . $dbConfig . "\n" .
                                '  Exception: ' . $e->getMessage() . "\n" .
                                '  SQL: ' . $data['sql'] . "\n\n");

                        // always rollback
                        $datasource->connection->rollback();

                    }
                    
                    // vacuum database
                    // $datasource->execute("VACUUM");

                }
            }catch(Exception $e) {

                CakeLog::write('warning', 'Exception truncateSync ' . $dbConfig . "\n" .
                        '  Exception: ' . $e->getMessage() . "\n");

            }

        }

        $this->syncStatus('finished');

        return $rowCount;

    }


    /**
     * Vacuum
     *
     * @return <type>
     */
    function vacuumSync() {

        $datasources = $this->getSourceList();

        $this->syncStatus('saving');

        $dbs = 0;
        foreach($datasources as $dbConfig ) {

            try {

                // PDO Connection object
                $datasource =& ConnectionManager::getDataSource($dbConfig);

                if (!is_object($datasource)) continue;

                    try {

                        // vacuum database
                        $datasource->execute("VACUUM");

                        $dbs++;

                    }catch (Exception $e) {

                        CakeLog::write('warning', 'Exception VACUUM to ' . $dbConfig . "\n" .
                                '  Exception: ' . $e->getMessage() . "\n");

                    }


            }catch(Exception $e) {

                CakeLog::write('warning', 'Exception vacuumSync ' . $dbConfig . "\n" .
                        '  Exception: ' . $e->getMessage() . "\n");

            }

        }

        $this->syncStatus('finished');

        return $dbs;

    }

    
    /**
     *
     * @param <type> $status
     */
    function syncStatus($status) {

        file_put_contents($this->statusFile, $status);

    }

}

?>
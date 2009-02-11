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
     */
    function getLastSynced($machine_id, $dbConfig) {


        $syncRemoteMachine = new SyncRemoteMachine(false, null, $dbConfig); // id , table, ds
        $data = $syncRemoteMachine->find('first', array('conditions' => array('machine_id' => $machine_id)));

        if($data) {
            $lastSynced = $data['SyncRemoteMachine']['last_synced'];
        }else {
            $lastSynced = 0;
        }

        return $lastSynced;

    }



    /**
     *
     * @param <type> $machine_id
     * @param <type> $dbConfig
     * @param <type> $last_synced
     */
    function setLastSynced($machine_id, $dbConfig, $last_synced) {

        $syncRemoteMachine = new SyncRemoteMachine(false, null, $dbConfig); // id , table, ds
        $data = $syncRemoteMachine->find('first', array('conditions' => array('machine_id' => $machine_id)));

        if($data) {

            $newData = array('last_synced'=> $last_synced);

            $syncRemoteMachine->id = $data['SyncRemoteMachine']['id'];
            $syncRemoteMachine->save($newData);

        }else {

            $newData = array('last_synced' => $last_synced, 'machine_id'=>$machine_id);

            $syncRemoteMachine->create();
            $syncRemoteMachine->save($newData);

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

                    $sql = $datasource->renderStatement('update', array(
                                                                        'table' => $table,
                                                                        'fields' => join(', ', $valuesUpdate),
                                                                        'conditions '=> $defaultCondition
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
    function getData($machine_id) {

        $my_machine_id = $this->syncSettings['machine_id'];

        $datas = array();

        $datasources = $this->getSourceList();

        $batch_limit = $this->syncSettings['batch_limit'];

        foreach($datasources as $dbConfig ) {

            // ini data structure
            $data = array('datasource' => $dbConfig, 'count' => 0, 'last_synced' => 0, 'sql' => '');

            // PDO Connection object
            $datasource =& ConnectionManager::getDataSource($dbConfig);

            // set model Sync 's useDbConfig
            $this->Sync->useDbConfig = $dbConfig;

            // getLastSynced
            $lastSynced = $this->getLastSynced($machine_id, $dbConfig);

            $sync = new Sync(false, null, $dbConfig); // id , table, ds

            $results = $sync->find('all', array(
                            'limit'=> $batch_limit,
                            'conditions' => array(
                                    'from_machine_id !=' => $machine_id,
                                    'id >' => $lastSynced
                    ),
                            'order' => 'id asc'
                )
            );
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

        $my_machine_id = $this->syncSettings['machine_id'];

        $result = array();

        foreach($datas as $data ) {

            if ($data['count'] <= 0) continue ;
            
            $dbConfig = $data['datasource'];

            // PDO Connection object
            $datasource =& ConnectionManager::getDataSource($dbConfig);

            /* Begin a transaction, turning off autocommit */
            $datasource->connection->beginTransaction();

            try {

                $datasource->connection->exec($data['sql']);

                $datasource->connection->commit();

                $result[$dbConfig] = array('datasource' => $dbConfig, 'count' => $data['count'], 'last_synced' => $data['last_synced']);

            }catch(Exception $e) {

                CakeLog::write('warning', 'Error saveData to ' . $dbConfig . "\n" .
                                          '  Exception: ' . $e->getMessage() );

                
                $result[$dbConfig] = array('datasource' => $dbConfig, 'count' => 0 , 'last_synced' => 0);

                $datasource->connection->rollBack();

            }

        }

        return $result;
    }



/**
 * get server datas to client
 *
 * <client call pull>
 *
 * @param string $client_machine_id
 */
    function getServerData($client_machine_id) {

        $datas = $this->getData($client_machine_id);

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

        $my_machine_id = $this->syncSettings['machine_id'];

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

        $datas = $this->getData($server_machine_id);

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
     *
     * @param <type> $result
     * @param <type> $type
     * @return <type>
     */
    function prepareResponse($result, $type='php') {

        $response = "";

        switch($type) {
            case 'php':
                $response = serialize($result);
                break;

            case 'json':
                $response = json_encode($result);
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
                $response = serialize($result);
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
                $result = unserialize($request);
                break;

            case 'json':
                $result = json_decode($request);
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
                $result = unserialize($request);
                break;

            case 'json':
                $result = json_decode($request);
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

}


?>
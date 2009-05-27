<?php
App::import('Core', array('HttpSocket','CakeLog'));

class SyncBaseShell extends Shell {
/**
 * List of tasks for this shell
 *
 * @var array
 */
    var $tasks = array();

/**
 * syncSettings
 *
 * @var syncSettings
 */
    var $syncSettings = array();

    /**
     * Startup method for the shell
     *
     */
    function startup() {

        $this->_loadDbConfig();

        $this->syncSettings =& Configure::read('sync_settings');

        $this->statusFile = "/tmp/sync_client.status" ;

        $this->http = new HttpSocket(array('timeout'=> 5));

    }

    function help() {

        $this->out("sync_base ", true);

    }

    /**
     * observerNotify
     * 
     * @param <type> $action
     * @param <type> $data 
     */
    function observerNotify($action="starting", $data="") {

    // notify vivipos client we are now syncing...
        switch($action) {
            case "starting":
                $url = "http://localhost:8888/observer?topic=sync_client_starting&data=".$data;
                break;

            case "finished":
                $url = "http://localhost:8888/observer?topic=sync_client_finished&data=".$data;
                break;
        }

        $this->syncStatus($action);
        $result = $this->http->get($url);

    }

    /**
     *
     */
    function connectAll() {

        $datasources = ConnectionManager::sourceList();

        foreach($datasources as $ds ) {

            $datasource =& ConnectionManager::getDataSource($ds);
            if(!$datasource->connected) $datasource->connect();

        }


    }

    /**
     * 
     */
    function closeAll() {

        $datasources = ConnectionManager::sourceList();

        foreach($datasources as $ds ) {

            $datasource =& ConnectionManager::getDataSource($ds);
            if($datasource->connected) $datasource->disconnect();

        }

    }
    
    /**
     *
     * @param <type> $status 
     */
    function syncStatus($status) {

        file_put_contents($this->statusFile, $status);

    }


    /**
     *
     * @return <type> 
     */
    function isSyncing() {

        $status = file_get_contents($this->statusFile);

        return (strcmp($status, "starting")==0);
    }

}
?>
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

    var $statusFile = "" ;

    var $requestFile = "" ;

    /**
     * Startup method for the shell
     *
     */
    function startup() {
        
        // load dbConfig
        $this->_loadDbConfig();

        $this->syncSettings = $this->readSyncSettings();

        $this->statusFile = "/tmp/sync_client.status" ;

        $this->requestFile = "/tmp/sync_client.request" ;

    }

    function help() {

        $this->out("sync_base ", true);

    }

    function readSyncSettings() {
        
        $syncSettings =& Configure::read('sync_settings');

        if(empty($syncSettings['process_type'])) {
            $syncSettings['process_type'] = 'php';
        }

        return $syncSettings;
    }


    /**
     * observerNotify
     * 
     * @param <type> $action
     * @param <type> $data 
     */
    function observerNotify($action="starting", $data="") {

        $this->syncStatus($action);

        return ;
        
        // notify vivipos client we are now syncing...
        switch($action) {
            case "starting":
                $url = "http://localhost:8888/observer?topic=sync_client_starting&data=".$data;
                break;

            case "finished":
                $url = "http://localhost:8888/observer?topic=sync_client_finished&data=".$data;
                break;
        }

        // notify observer
        $process = curl_init($url);
        curl_setopt($process, CURLOPT_TIMEOUT, 3);
        curl_setopt($process, CURLOPT_HTTPGET, 1);
        curl_exec($process);
        // close cURL resource
        curl_close($process);

        //$this->http = new HttpSocket(array('timeout'=> 5, 'stream_timeout' => 3));
        //$result = $this->http->get($url);

    }

    function connectAll() {

        $datasources = ConnectionManager::sourceList();

        foreach($datasources as $ds ) {
            $datasource =& ConnectionManager::getDataSource($ds);
            if(!$datasource->connected) $datasource->connect();
        }

    }

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

        if(!file_exists($this->statusFile)) return false;
        
        $status = file_get_contents($this->statusFile);

        return (strcmp($status, "starting")==0);
    }


    /**
     *
     * @return <type>
     */
    function isSyncingSuccess() {

        if(!file_exists($this->statusFile)) return false;

        $status = file_get_contents($this->statusFile);

        return (strcmp($status, "success")==0);
    }


    /**
     *
     * @return <type>
     */
    function removeSyncStatus() {

        if(file_exists($this->statusFile)){
            unlink($this->statusFile);
        }

        return true;

    }


    /**
     *
     * @return <type>
     */
    function isSyncRequest() {

        if(file_exists($this->requestFile)) return true;

        return false;

    }

    /**
     *
     * @return <type>
     */
    function addSyncRequest() {

        if(file_exists($this->requestFile)) return true;

        file_put_contents($this->requestFile, time() );

        return true;

    }


    /**
     *
     * @return <type>
     */
    function removeSyncRequest() {

        if(file_exists($this->requestFile)){
            unlink($this->requestFile);
        }
        
        return true;
        
    }


    /**
      * addSyncSuspend
      *
      * @return <type>
      */
    function addSyncSuspend() {

        $syncSettings = $this->readSyncSettings();

        $flagFile = "/tmp/sync_suspend_" .$syncSettings['machine_id'];

        if(file_exists($flagFile)) return true;

        file_put_contents($flagFile, time() );

        return true;

    }


    /**
      * removeSyncSuspend
      *
      * @return <type>
      */
    function removeSyncSuspend() {

        $syncSettings = $this->readSyncSettings();

        $flagFile = "/tmp/sync_suspend_" .$syncSettings['machine_id'];

        if(file_exists($flagFile)) {
            unlink($flagFile);
        }

        return true;

    }


    /***
     * check when admin request suspend
     */
    function isSuspend() {

        $syncSettings = $this->readSyncSettings();

        $flagFile = "/tmp/sync_suspend_" .$syncSettings['machine_id'];

        return file_exists($flagFile);

    }



}
?>
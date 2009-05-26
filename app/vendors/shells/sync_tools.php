<?php

class SyncToolsShell extends Shell {
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

        // set php time limit to unlimimted
        set_time_limit(0);

        $this->_loadDbConfig();

        $this->syncSettings =& Configure::read('sync_settings');

		$this->http = new HttpSocket(array('timeout'=> 5));

    }

    function help() {

        $this->out("sync_tools usage: ", true);
        $this->hr(false);
        $this->out("command:  truncate", true);
        $this->hr(false);
        $this->hr(false);
    	print_r($this->syncSettings);
        $this->hr(false);
        
    }

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

		$result = $this->http->get($url);

	}


    function test() {
        
        $this->out("sync_tools test", true);
        $this->hr(false);

            // PDO Connection object
            $datasource =& ConnectionManager::getDataSource("order");

            $sql = "insert into orders (id) values('" . uniqid() . "')";

            $this->out($sql);

            try {
             $datasource->connection->beginTransaction();

             $this->out('after begin');
                    // $stmt->execute();
		    $datasource->connection->exec($sql);

                    $this->out('after exec');
                    //usleep(250000);

                    $this->out('before commit');
                    $datasource->connection->commit();

                    $this->out('after commit');

            }catch(Exception $e) {
                    $this->out('Error saveData to order' . "\n" .
                                              '  Exception: ' . $e->getMessage() );

                    $this->out("rollback ??") ;
                    $datasource->connection->rollback();
            }
            $this->hr(false);
            $this->out('ednd....');
            sleep(60);
    }


    function truncate() {

        if (empty($this->syncSettings['retain_days'])) $retain_days = 7;
        else $retain_days = $this->syncSettings['retain_days'];

        $this->out("truncate syncs (days = " . $retain_days . " )", true);
        $this->hr(false);

        $shell =& $this;

		$this->observerNotify('starting');

        $truncateResult = $shell->requestAction("/syncs/truncate/${retain_days}");

		$this->observerNotify('finished', json_encode($truncateResult) );

        $this->out("truncate syncs ok (total remove " . $truncateResult . ")", true);
    }

}
?>

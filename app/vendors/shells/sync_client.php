<?php
App::import('Core', array('HttpSocket','CakeLog'));

require_once "System/Daemon.php";

// No PEAR, run standalone
System_Daemon::setOption("usePEAR", false);

// set Daemon Option
System_Daemon::setOption("appName", "sync_client");
System_Daemon::setOption("appDir", dirname(__FILE__));
System_Daemon::setOption("appDescription", "VIVIPOS Database Sync Client");
System_Daemon::setOption("authorName", "Rack Lin");
System_Daemon::setOption("authorEmail", "racklin@gmail.com");
System_Daemon::setOption("sysMaxExecutionTime", "0");
System_Daemon::setOption("sysMaxInputTime", "0");
System_Daemon::setOption("logVerbosity", System_Daemon::LOG_INFO);

class SyncClientShell extends Shell {
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

		$this->http = new HttpSocket(array('timeout'=> 5));

    }

    function help() {

        $this->out("sync_client usage: ", true);
        $this->hr(false);
    	print_r($this->syncSettings);
        
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

    function sync() {

        $this->out("sync_client usage: ", true);
        $this->hr(false);

        $shell =& $this;

		$this->observerNotify('starting');

		sleep(1);
        $syncResult = $shell->requestAction("/sync_clients/perform_sync");

		$this->observerNotify('finished', json_encode($syncResult));

        $this->hr(false);
        
        print_r($syncResult);
        
        $this->hr(false);

        $this->out("sync_client usage: ok", true);
    }


/**
 * start as daemon
 *
 */
    function start() {

        // set php time limit to unlimimted
        set_time_limit(0);

        $syncSettings =& Configure::read('sync_settings');

        $shell =& $this;

        System_Daemon::start();

        // What mode are we in?
        $mode = "'".(System_Daemon::isInBackground() ? "" : "non-" )."daemon' mode";

        // Log something using the Daemon class's logging facility
        System_Daemon::log(System_Daemon::LOG_INFO, System_Daemon::getOption("appName")." running in ".$mode." ".$syncSettings['hostname']);

        // This variable gives your own code the ability to breakdown the daemon:
        $runningOkay = true;

        $startHour = $syncSettings['start_hour'] + 0 ;
        $endHour = $syncSettings['end_hour'] + 0;

        $interval = $syncSettings['interval'];
        $error_retry = $syncSettings['error_retry'];

        $timeout = $syncSettings['timeout'];


        // While checks on 2 things in this case:
        // - That the Daemon Class hasn't reported it's dying
        // - That your own code has been running Okay
        while (!System_Daemon::isDying()/* && $runningOkay*/) {

            // is ok?
            $nowHour = date("H") + 0;

            // check starting / ending hour
            $runningOkay = ( $nowHour >= $startHour && $nowHour <= $endHour );

            // if error retries
            $tries = 0 ;

            while ( $runningOkay && ($tries < $error_retry)) {


                System_Daemon::log(System_Daemon::LOG_INFO, "requestAction perform_syncs, retries = " . $tries );
                
				$this->observerNotify('starting');			

                $syncResult = $shell->requestAction("/sync_clients/perform_sync");

				$this->observerNotify('finished', json_encode($syncResult));

                $successed = $syncResult['pull_result'] && $syncResult['push_result'];
                
                if ($successed) break;

                System_Daemon::log(System_Daemon::LOG_WARNING, "perform_sync not successed, retries = " . $tries );

                $tries++;

                // if error sleeping for a little bit and retry
                sleep($timeout);
                
            }

            // Relax the system by sleeping for a little bit
            if($runningOkay) {
                sleep($interval);
            }else {
                // if not runningOkay sleeping next day start_time
                $now = time();
                $nowStarTime = strtotime(date("Y-m-d H") . ":00:00");

                if ($nowHour < $startHour) {
                    $nextStartTime = strtotime(date("Y-m-d ") . "$startHour:00:00");
                }else if ($nowHour > $endHour){
                    // next day
                    $nextStartTime = $nowStarTime + 3600 * (24 - $nowHour + $startHour);
                }

                System_Daemon::log(System_Daemon::LOG_INFO, "not runningOkay in time, sleep " . ($nextStartTime - $now) );
                sleep($nextStartTime - $now);
            }
            
        }

        // Log something using the Daemon class's logging facility
        System_Daemon::log(System_Daemon::LOG_INFO, System_Daemon::getOption("appName")." stopping ".$syncSettings['hostname']);

        System_Daemon::stop();

    }

}
?>

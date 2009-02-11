<?php

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
System_Daemon::setOption("logVerbosity", System_Daemon::LOG_ERR);

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

    }

    function help() {

        $this->out("sync_client usage: ", true);
        $this->hr(false);
    	print_r($this->syncSettings);
        
    }


/**
 * start as daemon
 *
 */
    function start() {

        $syncSettings =& Configure::read('sync_settings');

        $shell =& $this;

        System_Daemon::start();

        // This variable gives your own code the ability to breakdown the daemon:
        $runningOkay = true;

        $startHour = $syncSettings['start_hour'] + 0 ;
        $endHour = $syncSettings['end_hour'] + 0;

        $interval = $syncSettings['interval'];
        $error_retry = $syncSettings['error_retry'];

        $timeout = $syncSettings['timeout'];

        // While checks on 3 things in this case:
        // - That the Daemon Class hasn't reported it's dying
        // - That your own code has been running Okay
        // - That we're not executing more than 3 runs
        while (!System_Daemon::isDying() && $runningOkay) {

            // What mode are we in?
            $mode = "'".(System_Daemon::isInBackground() ? "" : "non-" )."daemon' mode";

            // Log something using the Daemon class's logging facility
            // System_Daemon::log(System_Daemon::LOG_INFO, System_Daemon::getOption("appName")." running in ".$mode." ".$syncSettings['hostname']);

            // is ok?
            $nowHour = date("H") + 0;

            // check starting / ending hour
            $runningOkay = ( $nowHour >= $startHour && $nowHour <= $endHour );

            // System_Daemon::log(System_Daemon::LOG_INFO, "start  = " . $startHour . ",,, end  = " . $endHour);

            // if error retries
            $tries = 0 ;

            while ($tries < $error_retry) {

                $syncResult = $shell->requestAction("/sync_clients/perform_sync");

                $successed = $syncResult['pull_result'] && $syncResult['push_result'];

                // System_Daemon::log(System_Daemon::LOG_INFO, "successed = " . $successed );
                
                if ($successed) break;

                $tries++;

                // if error sleeping for a little bit and retry
                sleep($timeout);
            }

            // System_Daemon::log(System_Daemon::LOG_INFO, "perform_sync = " . var_dump($syncResult, true)) ;

            // Relax the system by sleeping for a little bit
            sleep($interval);
            
        }

        System_Daemon::stop();

    }

}
?>
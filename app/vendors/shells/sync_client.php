<?php
require_once "sync_base.php";

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

class SyncClientShell extends SyncBaseShell {

    /**
     * Startup method for the shell
     */
    function startup() {

        parent::startup();
    }

    /**
     * 
     */
    function help() {

        $this->out("sync_client usage: ", true);
        $this->hr(false);
        $this->out(" start: start daemon ", true);
        $this->out(" sync: sync once", true);
        $this->hr(false);
        print_r($this->syncSettings);

    }

    /**
     * 
     */
    function sync() {

        set_time_limit(0);

        $syncSettings =& Configure::read('sync_settings');

        $shell =& $this;

        if ($this->isSyncing()) {
            CakeLog::write('info', "other process issyncing.. sleep to next interval");
            return ;
        }

        $successed = false;

        try {
            CakeLog::write('debug', "observerNotify starting");
            $this->observerNotify('starting');

            CakeLog::write('info', "requestAction perform_sync");

            $syncResult = $shell->requestAction("/sync_clients/perform_sync");

            CakeLog::write('info', "requestAction perform_sync result: " . $syncResult['pull_result'] . "," . $syncResult['push_result']);

            CakeLog::write('debug', "observerNotify finished");

            $this->observerNotify('finished', json_encode($syncResult));

            $successed = $syncResult['pull_result'] && $syncResult['push_result'];

        }catch(Exception $e) {
            $successed = false;
        }

        if($successed) {
            CakeLog::write('info', "requestAction perform_sync success");
            $this->syncStatus('success');
        }else {
            $this->syncStatus('finished');
        }

        $this->out('syncing finished');
        
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

        // use shell script, so we don't need db connection
        $this->closeAll();

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


            // remove syncStatus
            $this->syncStatus('');
            //
            // is ok?
            $nowHour = date("H") + 0;

            // check starting / ending hour
            $runningOkay = ( $nowHour >= $startHour && $nowHour <= $endHour );

            // if error retries
            $tries = 0 ;

            while ( $runningOkay && ($tries < $error_retry)) {

                System_Daemon::log(System_Daemon::LOG_INFO, "requestAction perform_syncs, retries = " . $tries );

                $successed = false;
                
                // use shellexec to prevent db locked.
                $shell = ROOT.DS."sync_client";
                if (file_exists($shell)) {
                    $output = shell_exec ($shell . " sync");
                    echo $output;
                    $successed = $this->isSyncingSuccess();
                }

                if ($successed) break;

                System_Daemon::log(System_Daemon::LOG_WARNING, "perform_sync not successed, retries = " . $tries . ", sleep (" . $timeout . " secs)" );

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
                }else if ($nowHour > $endHour) {
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
<?php
require_once "sync_base.php";

require_once "System/Daemon.php";

// No PEAR, run standalone
System_Daemon::setOption("usePEAR", false);

// set Daemon Option
System_Daemon::setOption("appName", "irc_client");
System_Daemon::setOption("appDir", dirname(__FILE__));
System_Daemon::setOption("appDescription", "VIVIPOS IRC Client");
System_Daemon::setOption("authorName", "Rack Lin");
System_Daemon::setOption("authorEmail", "racklin@gmail.com");
System_Daemon::setOption("sysMaxExecutionTime", "0");
System_Daemon::setOption("sysMaxInputTime", "0");
System_Daemon::setOption("logVerbosity", System_Daemon::LOG_INFO);

class IrcClientShell extends SyncBaseShell {

/**
 * Startup method for the shell
 */
    function startup() {

        parent::startup();

        $this->statusFile = "/tmp/irc_client.status" ;

        $this->requestFile = "/tmp/irc_client.request" ;

    }

    /**
     *
     */
    function help() {

        $this->out("irc_client usage: ", true);
        $this->hr(false);
        $this->out(" start: start irc client daemon ", true);
        $this->out(" sync: get package once", true);
        $this->hr(false);
        print_r($this->syncSettings);
        $this->hr(false);
        
    }

    /**
     * sync for shell script
     */
    function sync() {

        $syncSettings = $this->readSyncSettings();

        if ($this->isSyncing()) {
            //CakeLog::write('debug', "irc_client sync: other process issyncing.. ");
            return ;
        }

        try {
            $this->addSyncRequest();
            //CakeLog::write('debug', "irc_client sync: addSyncRequest... ");
            
        }catch(Exception $e) {
        }

    }



    /**
     *
     *  Polling to waiting sync request flag
     * @param <type> $timeout
     * @return <type>
     */
    function waitForRequest($timeout) {

        $start = 0;

        while ($start < $timeout ) {

            // if sync Request , break while
            if ( $this->isSyncRequest() ){

                //CakeLog::write('debug', "waitForRequest: isSyncRequest break waiting");
                
                $this->removeSyncRequest();
                break;
            }

            sleep(1);
            $start++;
        }

        return true;
        
    }


    /**
     * sync for shell script
     */
    function startSyncing() {

        set_time_limit(0);

        $syncSettings = $this->readSyncSettings();

        if ($this->isSyncing()) {
            //CakeLog::write('debug', "other process issyncing.. sleep to next interval");
            return ;
        }

        $successed = false;

        try {

            //CakeLog::write('debug', "requestAction downloadPackages");

            $syncResult = $this->requestAction("/irc/downloadPackages");

            //CakeLog::write('debug', "requestAction downloadPackages result: " . $syncResult);

            $successed = $syncResult;

        }catch(Exception $e) {
            $successed = false;
        }

        if($successed) {
            //CakeLog::write('info', "requestAction downloadPackages success");
            $this->syncStatus('success');
        }else {
            $this->syncStatus('finished');
        }

        if ($successed) {
            $this->out('syncing successed and finished');
        }else {
            $this->out('syncing finished');
        }

    }


    /**
     * removeExpirePackages
     */
    function removeExpirePackages($expireDays) {
        $result = $this->requestAction("/irc/removeExpirePackages/".$expireDays, array('skipAuth'=>true, 'skipExit'=>true));
    }


    /**
     * start as daemon
     *
     */
    function start() {

    // set php time limit to unlimimted
        set_time_limit(0);

        /*
         * read sync settings and process_type
         */
        $syncSettings = $this->readSyncSettings();

        $active = true; // always check master irc
        $interval = empty($syncSettings['irc_interval']) ? 86400 : $syncSettings['irc_interval'];
        $error_retry = $syncSettings['error_retry'];
        $timeout = $syncSettings['timeout'];
        $hostname = empty($syncSettings['irc_hostname']) ? 'localhost' : $syncSettings['irc_hostname'];
        $expireDays = empty($syncSettings['irc_expire_days']) ? 30 : $syncSettings['irc_expire_days'];

        // remove expire irc packages before start process.
        $this->removeExpirePackages($expireDays);

        $shell =& $this;

        // use shell script, so we don't need db connection
        if ($process_type == 'shell') {
            $this->closeAll();
        }

        System_Daemon::start();

        // What mode are we in?
        $mode = "'".(System_Daemon::isInBackground() ? "" : "non-" )."daemon' mode";

        // Log something using the Daemon class's logging facility
        System_Daemon::log(System_Daemon::LOG_INFO, System_Daemon::getOption("appName")." running in ".$mode." ".$syncSettings['hostname']);

        // This variable gives your own code the ability to breakdown the daemon:
        $runningOkay = true;


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
            $runningOkay = true;

            // if error retries
            $tries = 0 ;

            while ( $runningOkay && ($tries < $error_retry)) {

                System_Daemon::log(System_Daemon::LOG_DEBUG, "requestAction downloadPackages, retries = " . $tries );

                if ($hostname == 'localhost' || $hostname == '127.0.0.1' || empty($active) ) break;

                $successed = false;

                if ($process_type == 'shell') {
                    // use shellexec to prevent db locked.
                    $shellScript = ROOT.DS."irc_client";
                    if (file_exists($shellScript)) {
                        $output = shell_exec ($shellScript . " startSyncing");
                        echo $output;
                        $successed = $this->isSyncingSuccess();
                    }
                }else {
                    $this->startSyncing();
                    $successed = $this->isSyncingSuccess();
                }

                if ($successed) break;

                System_Daemon::log(System_Daemon::LOG_WARNING, "downloadPackages not successed, retries = " . $tries . ", sleep (" . $timeout . " secs)" );

                $tries++;

                // if error sleeping for a little bit and retry
                sleep($timeout);

            }

            // Relax the system by sleeping for a little bit
            if($runningOkay) {
                $this->waitForRequest($interval);
                //sleep($interval);
            }

        }

        // Log something using the Daemon class's logging facility
        System_Daemon::log(System_Daemon::LOG_INFO, System_Daemon::getOption("appName")." stopping " . $hostname);

        System_Daemon::stop();

    }

}
?>
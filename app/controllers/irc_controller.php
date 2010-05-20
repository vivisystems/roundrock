<?php

class IrcController extends AppController {

    var $name = 'Irc';

    var $uses = null;

    var $components = array('SyncHandler', 'Security', 'Irc');


    /**
     * Get HttpSocket Object with preconfig auth mode and password
     *
     * @return HttpSocket
     */
    function &getHttpSocket() {

        $password = $this->syncSettings['password'] ;
        $timeout = $this->syncSettings['timeout'] ;

        $http_config = array('request' => array(
                        'auth' => array(
                                'method' => 'Basic',
                                'user'=>'vivipos',
                                'pass'=> $password
                        )
                ),
                'timeout' => $timeout
        );
        // auth from server
        $http = new HttpSocket($http_config);
        return $http;

    }


    /**
     * beforeFilter
     *
     * discard downloadPackages / downloadFile for basic auth
     *
     * @see app/AppController#beforeFilter()
     */
    function beforeFilter() {

        // downloadPackages call by background php , skip auth
        if ($this->params['action'] == 'downloadPackages' || $this->params['action'] == 'downloadFile') return;

        if ($this->params['action'] == 'removeExpirePackages' && $this->params['skipAuth']) return ;

        parent::beforeFilter();
    }


    /**
     * Return all IRC packages and status
     *
     * Called by VIVIECR - Sync Setting
     *
     * @param $file
     * @return unknown_type
     */
    function getPackage($file) {

        $result = array('status' => 'error', 'code' => 400 );

        $package = $this->Irc->getPackage($file);

        if (is_array($package)) {
            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $package;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * Return all IRC packages and status
     *
     * Called by VIVIECR - Sync Setting
     *
     * @return unknown_type
     */
    function getPackages() {

        $result = array('status' => 'error', 'code' => 400 );

        $packages = $this->Irc->getPackages();

        if (is_array($packages)) {
            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $packages;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * Create IRC Package
     *
     * Called by VIVIECR - Sync Setting
     *
     * @return unknown_type
     */
    function createPackage() {

        $result = array('status' => 'error', 'code' => 400 );

        $success = false;

        $modules = $_REQUEST['modules'];
        $moduleLabels = $_REQUEST['module_labels'];
        $activation = $_REQUEST['activation'];
        $description = $_REQUEST['description'];
        $workgroup = $_REQUEST['workgroup'];

        $success = $this->Irc->createPackage($activation, $modules, $description, $moduleLabels, $workgroup);

        if ($success) {
            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $success;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * Remove IRC Package and status
     *
     * Called by VIVIECR - Sync Setting
     *
     * @param $file
     * @return unknown_type
     */
    function removePackage($file) {

        $result = array('status' => 'error', 'code' => 400 );

        $success = false;

        $success = $this->Irc->removePackage($file);

        if ($success) {
            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $success;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * Get Last Error Package Message
     *
     * Called by VIVIECR - Sync Setting
     *
     * @param $file
     * @return unknown_type
     */
    function getLastErrorPackageMessage() {

        $result = array('status' => 'error', 'code' => 400 );

        $messages = array();

        $lastErrorPackage = $this->Irc->getLastErrorPackage();

        if ($lastErrorPackage) {
            $logs = $this->Irc->readUnpackPackageLog($lastErrorPackage);
            foreach($logs as $log) {
                if (!$log['success']) $messages[] = $log;
            }
        }

        $result = array('status' => 'ok', 'code' => 200 );
        $result['response_data'] = array('last_error_package'=>$lastErrorPackage, 'logs'=>$messages);

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * Check available updates for this terminal
     *
     * ignore package if created by self
     *
     * Called by VIVIECR - Startup / Setting Events
     *
     * @param String $workgroup
     * @return unknown_type
     */
    function checkAvailableUpdates($workgroup="") {

        $result = array('status' => 'error', 'code' => 400 );

        $now = time();

        $machineId = $this->SyncHandler->getRequestClientMachineId();

        $lastErrorPackage = $this->Irc->getLastErrorPackage();

        if (empty($lastErrorPackage)) {
            
            $packages = $this->Irc->getPackages();

            $availablePackages = array();

            foreach($packages as $package) {
                if ($package['activation'] <= $now && empty($package['unpacked']) && $package['created_machine_id'] != $machineId) {

                    // check workgroup
                    if ( empty($workgroup) || empty($package['workgroup']) ) {
                        $availablePackages[$package['created']] = $package;
                    }else if ( strcasecmp(chop($workgroup), chop($package['workgroup'])) == 0 ) {
                        $availablePackages[$package['created']] = $package;
                    }
                    
                }
            }

            ksort($availablePackages);
            $ksortedPackages = array_values($availablePackages);

            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $ksortedPackages;

        }else {

            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = false;

        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * Apply available updates
     *
     *
     * Called by VIVIECR - Startup / Setting Events
     *
     * @param String $workgroup
     * @return unknown_type
     */
    function applyAvailableUpdates($workgroup="") {

        $now = time();

        $machineId = $this->SyncHandler->getRequestClientMachineId();

        $packages = $this->Irc->getPackages();

        $availablePackages = array();

        foreach($packages as $package) {
            if ($package['activation'] <= $now && empty($package['unpacked']) && $package['created_machine_id'] != $machineId) {

                // check workgroup
                if ( empty($workgroup) || empty($package['workgroup']) ) {
                    $availablePackages[$package['created']] = $package;
                }else if ( strcasecmp(chop($workgroup), chop($package['workgroup'])) == 0 ) {
                    $availablePackages[$package['created']] = $package;
                }

            }
        }

        ksort($availablePackages);
        $ksortedPackages = array_values($availablePackages);

        $files = array();

        foreach ($ksortedPackages as $package) {
            $files[] = $package['file'];
        }

        // use web services but function call
        return $this->unpackPackages(implode(",",$files));

        exit;

    }


    /**
     * Unpack IRC Package and updating master updated status.
     *
     * @param $file
     * @return unknown_type
     */
    function unpackPackage($file) {

        $ircURL = $this->syncSettings['protocol'] . '://' .
                $this->syncSettings['irc_hostname'] . ':' .
                $this->syncSettings['port'] . '/irc/';

        $updatePackageStatusURL = $ircURL . 'updatePackageStatus' . '/';

        $result = array('status' => 'error', 'code' => 400 );

        $success = false;

        $success = $this->Irc->unpackPackage($file);

        if ($success) {

            $http =& $this->getHttpSocket();

            // update master status
            $updateURL = $updatePackageStatusURL . $this->syncSettings['machine_id'] . "/" . $file ."/updated";

            $http =& $this->getHttpSocket();
            $result2 = $http->get($updateURL, 0);

            // free http resource
            unset($http);

            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $success;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * Unpack IRC Packages and updating master updated status.
     *
     * @param $files
     * @return unknown_type
     */
    function unpackPackages($files="") {

        $ircURL = $this->syncSettings['protocol'] . '://' .
                $this->syncSettings['irc_hostname'] . ':' .
                $this->syncSettings['port'] . '/irc/';

        $updatePackageStatusURL = $ircURL . 'updatePackageStatus' . '/';

        $result = array('status' => 'error', 'code' => 400 );

        $success = false;

        if (strlen($files) > 0) {
            $arFiles = explode(",", $files);
        }else {
            $arFiles = array();
        }

        $successFiles = $this->Irc->unpackPackages($arFiles);

        $success = (count($arFiles) == count($successFiles));

        if (count($successFiles) > 0) {

            foreach ($successFiles as $file) {

                $http =& $this->getHttpSocket();

                // update master status
                $updateURL = $updatePackageStatusURL . $this->syncSettings['machine_id'] . "/" . $file ."/updated";

                $http =& $this->getHttpSocket();
                $result2 = $http->get($updateURL, 0);

                // free http resource
                unset($http);
            }

        }

        $result = array('status' => 'ok', 'code' => 200 );
        $result['response_data'] = $success;

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * Create IRC package with full settings
     *
     * @return unknown_type
     */
    function createFullPackage() {

        $result = array('status' => 'error', 'code' => 400 );

        $success = false;

        $activation = (empty($_REQUEST['activation'])) ? time() : $_REQUEST['activation'];
        $description = (empty($_REQUEST['description'])) ? 'FULL MODULES' : $_REQUEST['description'];
        $workgroup = (empty($_REQUEST['workgroup'])) ? '' : $_REQUEST['workgroup'];

        $success = $this->Irc->createPackage($activation, '', $description, '', $workgroup);

        if ($success) {
            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $success;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * getAvailablePackagesList
     *
     * slave/master background services
     */
    function getAvailablePackagesList($lastDownloaded) {

        $result = array('status' => 'error', 'code' => 400 );

        $lastDownloadedTime = (int) $lastDownloaded;

        $packages = $this->Irc->getPackages();

        $availablePackages = array();

        foreach($packages as $package) {
            if ($package['created'] > $lastDownloadedTime) {
                $availablePackages[$package['created']] = $package;
            }
        }

        ksort($availablePackages);
        $ksortedPackages = array_values($availablePackages);

        if (true) {

            $result = array('status' => 'ok', 'code' => 200 );
            // $result['response_data'] = $stocks;
            $result['response_data'] = $ksortedPackages;

        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;

    }


    /**
     * downloadFile
     *
     * slave/master background services
     */
    function downloadFile($tbzFile) {

        $file = $this->Irc->ircPackagePath."/queues/".$tbzFile;

        if (file_exists($file)) {
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename='.basename($file));
            header('Content-Transfer-Encoding: binary');
            header('Expires: 0');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Pragma: public');
            header('Content-Length: ' . filesize($file));
            ob_clean();
            flush();
            readfile($file);
        }else {
            header("HTTP/1.0 404 Not Found");
        }

        exit;

    }


    /**
     * updatePackageStatus
     *
     * slave/master background services
     *
     * @param $machineId
     * @param $tbzFile
     * @param $status
     * @return unknown_type
     */
    function updatePackageStatus($machineId, $tbzFile, $status="downloaded") {

        $result = array('status' => 'error', 'code' => 400 );

        $success = false;

        $success = $this->Irc->updatePackageStatus($machineId, $tbzFile, $status);

        if ($success) {
            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $success;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;
        exit;


    }


    /**
     * Check master available packages and download it.
     *
     * call master getAvailablePackagesList
     * if packages exists
     * call master downloadFile and updatePackageStatus
     *
     */
    function downloadPackages() {

        $lastDownloaded = $this->Irc->getLastDownloaded();

        $http =& $this->getHttpSocket();

        $ircURL = $this->syncSettings['protocol'] . '://' .
                $this->syncSettings['irc_hostname'] . ':' .
                $this->syncSettings['port'] . '/irc/';

        $getAvailablePackagesListURL = $ircURL . 'getAvailablePackagesList' . '/' . $lastDownloaded;
        $downloadFileURL = $ircURL . 'downloadFile' . '/';
        $updatePackageStatusURL = $ircURL . 'updatePackageStatus' . '/';

        $result = json_decode($http->get($getAvailablePackagesListURL, 0), true);

        // free http resource
        unset($http);

        $availablePackages = $result['response_data'];

        // return as success status
        if(count($availablePackages) <= 0) return true;

        // create working directory
        $workingDir = $this->Irc->getWorkingDir();
        if(!$workingDir) return false;

        foreach($availablePackages as $package) {

            $tbzFile = $package['file'];
            $tbzMd5 = $package['checksum'];
            $tbzCreated = $package['created'];

            $saveTbzFile = $workingDir ."/". $tbzFile;

            $downloadURL = $downloadFileURL . $tbzFile;

            try {

                // using curl download file
                $result = $this->Irc->curlDownloadFile($downloadURL, $saveTbzFile);

                // checksum
                $md5File = md5_file($saveTbzFile);

                if($tbzMd5 == $md5File) {

                    // save description file and let master know
                    $saveDescFile = $saveTbzFile .".json";

                    if (!empty($package['unpacked'])) {
                        $package['unpacked'] = false;
                    }

                    // write ircPackageDesc
                    file_put_contents($saveDescFile, json_encode($package));

                    $this->Irc->movePackageToQueue($saveTbzFile, $saveDescFile);

                    $this->Irc->setLastDownloaded($tbzCreated);

                    // update master status
                    $updateURL = $updatePackageStatusURL . $this->syncSettings['machine_id'] . "/" . $tbzFile ."/downloaded";

                    $http =& $this->getHttpSocket();
                    $result2 = $http->get($updateURL, 0);

                    // free http resource
                    unset($http);


                }else {

                    // remove tmp file
                    if (file_exists($file)) {
                        @unklink($file);
                    }
                }

            }catch (Exception $e) {

                CakeLog::write('warning', "Exception downloadPackages [$fileURL] to [$file]\n" .
                        '  Exception: ' . $e->getMessage() . "\n");

                // remove tmp file
                if (file_exists($file)) {
                    @unklink($file);
                }
            }

        }

        $this->Irc->removeWorkingDir($workingDir);

        return true;

    }


    /**
     * removeExpirePackages
     * @param <type> $expireDays
     */
    function removeExpirePackages($expireDays=0) {

        $result = array('status' => 'error', 'code' => 400 );

        $success = false;

        $success = $this->Irc->removeExpirePackages($expireDays);

        if ($success) {
            $result = array('status' => 'ok', 'code' => 200 );
            $result['response_data'] = $success;
        }

        $responseResult = $this->SyncHandler->prepareResponse($result, 'json');

        echo $responseResult ;

        if (!$this->params['skipExit']) {
            exit;
        }

    }

}
?>
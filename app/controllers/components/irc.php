<?php
App::import('Core', array('HttpSocket','CakeLog'));

/**
 * Request object for handling Irc
 *
 */
class IrcComponent extends Object {

    /**
     * Holds the copy of SyncSettings
     *
     * @var array
     * @access public
     */
    var $syncSettings = array();

    var $databasesPath = "/data/databases";

    var $backupsPath = "/data/backups";

    var $profilePath = "/data/profile";

    var $extensionsPath = "/data/profile/extensions";

    var $ircPackagePath = "/data/irc_packages";

    var $ircManifests = array();

    var $prefsJs = "";

    var $sqlite3Bin = "/usr/bin/sqlite3";

    var $tarBin = "/bin/tar";

    var $workingDir = "";



    /**
     * Constructor.
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

        $this->syncSettings =& Configure::read('sync_settings');

        // set syncSettings to controller
        $controller->syncSettings =& $this->syncSettings ;

        $this->databasesPath = Configure::read('DATABASE_PATH');
        $this->profilePath = Configure::read('PROFILE_PATH');
        $this->extensionsPath = Configure::read('PROFILE_PATH') . "/extensions";
        $this->ircPackagePath = Configure::read('DATA_PATH') . "/irc_packages";
        $this->backupsPath = Configure::read('DATA_PATH') . "/backups";

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
    function getIrcManifests() {

        if (count($this->ircManifests)) return $this->ircManifests;

        $extensionsDir = new Folder($this->extensionsPath);
        $ircManifestXmls = $extensionsDir->findRecursive("irc_manifest.xml");

        foreach ( $ircManifestXmls as $xmlfile) {
            $this->parseIrcManifest($xmlfile);
        }

        return $this->ircManifests;

    }


    /**
     *
     * @param <type> $xmlfile
     */
    function parseIrcManifest($xmlfile) {

        $xmlObj = simplexml_load_file($xmlfile);

        foreach ($xmlObj->module as $module) {

            $moduleArray = get_object_vars($module);

            $name = $moduleArray['@attributes']['name'];

            $reboot = false;
            if(isset($moduleArray['@attributes']['reboot'])) $reboot = ($this->boolVal($moduleArray['@attributes']['reboot']) == 1);

            $actions = array();
            foreach ($module->action as $action) {
                $actions[] = get_object_vars($action);
            }

            $this->ircManifests[$name] = array('name'=>$name, 'reboot'=>$reboot, 'actions'=>$actions);

        }


    }


    /**
     *
     * @return <type>
     */
    function getPrefsJs() {

        if (!empty($this->prefsJs)) return $this->prefsJs;

        if (file_exists($this->profilePath."/prefs.js")) {
            //$prefsJs = file_get_contents("/data/profile/prefs.js");
            $prefsJs = file($this->profilePath."/prefs.js");
            $this->prefsJs = $prefsJs;
            return $this->prefsJs;
        }else {
            return "";
        }

    }


    /**
     *
     * @param <type> $newPrefsJs
     */
    function appendPrefsJs($newPrefsJs) {

        if (file_exists($this->profilePath."/prefs.js")) {

            file_put_contents($this->profilePath."/prefs.js", $newPrefsJs, FILE_APPEND);

            // make getPrefsJs to reload
            $this->prefsJs = "" ;

        }

        if (file_exists($this->profilePath."/user.js")) {

            file_put_contents($this->profilePath."/user.js", $newPrefsJs, FILE_APPEND);

        }

    }


    /**
     *
     * @return <type>
     */
    function getWorkingDir() {

        if (!empty($this->workingDir)) return $this->workingDir ;

        if(!is_dir($this->ircPackagePath)) {
            if (!mkdir($this->ircPackagePath, 0775)) return false;
        }

        if(!is_dir($this->ircPackagePath."/tmp")) {
            if (!mkdir($this->ircPackagePath."/tmp", 0775)) return false;
        }

        $workingDir = $this->ircPackagePath . "/tmp/" .uniqid("A");

        if(!is_dir($workingDir)) {
            if (!mkdir($workingDir, 0775)) return false;
        }

        // dbs
        if(!is_dir($workingDir."/dbs")) {
            if (!mkdir($workingDir."/dbs", 0775)) return false;
        }

        // files
        if(!is_dir($workingDir."/files")) {
            if (!mkdir($workingDir."/files", 0775)) return false;
        }

        // prefs
        if(!is_dir($workingDir."/prefs")) {
            if (!mkdir($workingDir."/prefs", 0775)) return false;
        }

        $this->workingDir = $workingDir;

        return $workingDir;
    }


    /**
     *
     * @param <type> $workingDir
     * @return <type>
     */
    function removeWorkingDir($workingDir) {

        $workingDir = $this->workingDir;

        if (!empty($workingDir) && $workingDir != '.' && $workingDir != '..') {

            $folder = new Folder($workingDir);
            return $folder->delete();

        }else {
            return false;
        }

    }


    /**
     * Copy database or prefs.js to backup directory if not exists
     *
     * @param $type
     * @param $file
     * @return unknown_type
     */
    function copyToBackup($type="prefs", $file) {

        $backupDir = $this->backupsPath . "/irc_backup";
        $dataDir = $backupDir . "/data";
        $databaseDir = $dataDir . "/databases";
        $profileDir = $dataDir . "/profile";

        // init dirs
        if(!is_dir($backupDir)) {
            if (!mkdir($backupDir, 0775)) return false;
        }
        if(!is_dir($dataDir)) {
            if (!mkdir($dataDir, 0775)) return false;
        }
        if(!is_dir($databaseDir)) {
            if (!mkdir($databaseDir, 0775)) return false;
        }
        if(!is_dir($profileDir)) {
            if (!mkdir($profileDir, 0775)) return false;
        }

        switch($type) {
            default:
            case 'pref':
                $source = $this->profilePath ."/prefs.js";
                $target = $profileDir . "/prefs.js";

                if (!file_exists($target)) {
                    copy($source, $target);
                }
                break;

            case 'db':
                $source = $file;
                $sourceDirname = dirname($source);
                $targetDir = $backupDir . $sourceDirname;
                $target = $targetDir ."/".basename($source);

                if (!file_exists($target)) {
                    mkdir ($targetDir, 0775, true);
                    copy($source, $target);
                }
                break;
        }

        return true;

    }


    /**
     * Create backup tbz packages(databases.tbz/profile.tbz)
     *
     * @param $type
     * @param $file
     * @return unknown_type
     */
    function createTbzBackup($type="prefs", $file) {

        $backupDir = $this->backupsPath . "/irc_backup";
        $dataDir = $backupDir . "/data";
        $databaseDir = $dataDir . "/databases";
        $profileDir = $dataDir . "/profile";

        // create databases.tbz
        if (is_dir($databaseDir)) {
            chdir($databaseDir);
            $tbzFile = $backupDir ."/databases.tbz";

            $cmd = sprintf("%s -cjf %s .", $this->tarBin, $tbzFile);
            $result = shell_exec($cmd);

        }

        // create profile.tbz
        if (is_dir($profileDir)) {
            chdir($profileDir);
            $tbzFile = $backupDir ."/profile.tbz";

            $cmd = sprintf("%s -cjf %s .", $this->tarBin, $tbzFile);
            $result = shell_exec($cmd);

        }

        $folder = new Folder($dataDir);
        return $folder->delete();

    }


    /**
     * Move Package From tmp to queue directory
     *
     * @param <type> $tbzFile
     * @param <type> $tbzDescFile
     * @return <type>
     */
    function movePackageToQueue($tbzFile, $tbzDescFile) {

        if(!is_dir($this->ircPackagePath)) {
            if (!mkdir($this->ircPackagePath, 0775)) return false;
        }
        if(!is_dir($this->ircPackagePath."/queues")) {
            if (!mkdir($this->ircPackagePath."/queues", 0775)) return false;
        }

        rename($tbzFile, $this->ircPackagePath."/queues/" . basename($tbzFile));
        rename($tbzDescFile, $this->ircPackagePath."/queues/" . basename($tbzDescFile));


    }


    /**
     *
     * @param <type> $workingDir
     * @param <type> $action
     * @param <type> $mode
     * @return <type>
     */
    function processAction($workingDir, $action, $mode='create') {

        if(empty($action)) return false;

        $result = false;

        switch ($action['type']) {
            case 'db':
                $result = $this->processDbAction($workingDir, $action, $mode);
                break;

            case 'pref':
                $result = $this->processPrefAction($workingDir, $action, $mode);
                break;

            case 'file':
                $result = $this->processFileAction($workingDir, $action, $mode);
                break;

            case 'script':
                $result = $this->processScriptAction($workingDir, $action, $mode);
                break;

        }

        return $result;

    }


    /**
     *
     * @param <type> $workingDir
     * @param <type> $action
     * @param <type> $mode
     * @return <type>
     */
    function processDbAction($workingDir, $action, $mode='create') {

        $database = $action['database'];
        $table = $action['table'];

        $result = false;

        switch($mode) {
            default:
            case 'create':

                if (strpos($database, '/') === false) {
                    $databaseFile = $this->databasesPath ."/" . $action['database'];
                }else {
                    $databaseFile = $action['database'];
                }

                $exportFile = $workingDir ."/dbs/" . urlencode($database) . "__" . urlencode($table) . ".csv";

                //$versionSql = "pragma user_version";
                $tableSchemaSql = ".schema $table";
                $cmdSql = sprintf("%s %s \"%s\"", $this->sqlite3Bin, $databaseFile, $tableSchemaSql);
                $returnStr = shell_exec($cmdSql);
                if (preg_match("/^Error/i", $returnStr)) {
                    return false;
                }
                $version = md5(chop($returnStr));

                $sql = "SELECT * FROM $table" ;
                $cmd = sprintf("%s -list %s \"%s\" > %s", $this->sqlite3Bin, $databaseFile, $sql, $exportFile);
                $result = shell_exec($cmd);

                $action['database_version'] = $version;
                $action['database_file'] = $databaseFile;
                $action['export_file'] = basename($exportFile);

                $result = $action;

                break;

            case 'unpack':


                $databaseFile = $action['database_file'];
                $masterDatabaseVersion = $action['database_version'];
                $exportFile = $workingDir ."/dbs/". $action['export_file'];

                //$versionSql = "pragma user_version";
                $tableSchemaSql = ".schema $table";
                $cmdSql = sprintf("%s %s \"%s\"", $this->sqlite3Bin, $databaseFile, $tableSchemaSql);
                $version = md5(chop(shell_exec($cmdSql)));

                if ($masterDatabaseVersion != $version) return false;

                // backup first
                $this->copyToBackup('db', $databaseFile);

                // delete old datas
                $deleteSql = "DELETE FROM $table" ;
                $cmdDelSql = sprintf("%s %s \"%s\" 2>&1", $this->sqlite3Bin, $databaseFile, $deleteSql);
                $returnStr = shell_exec($cmdDelSql);
                if (preg_match("/^Error/i", $returnStr)) {
                    return false;
                }

                // import new datas
                $sql = ".import $exportFile {$table}" ;
                $cmd = sprintf("%s -list %s \"%s\" 2>&1 ", $this->sqlite3Bin, $databaseFile, $sql);
                $returnStr = shell_exec($cmd);
                if (preg_match("/^Error/i", $returnStr)) {
                    return false;
                }

                $result = true;

                break;
        }

        return $result;


    }


    /**
     *
     * @param <type> $workingDir
     * @param <type> $action
     * @param <type> $mode
     * @return <type>
     */
    function processPrefAction($workingDir, $action, $mode='create') {

        $prefsJs = $this->getPrefsJs();

        $result = false;

        switch($mode) {
            default:
            case 'create':

                $key = $action['key'];
                $pattern = '/user_pref\("'.$key.'/';

                $results = preg_grep($pattern, $prefsJs);

                if (count($results)) {

                    $exportFile = $workingDir ."/prefs/" . $key . ".js";
                    file_put_contents($exportFile, implode("", $results));
                    $action['export_file'] = basename($exportFile);

                    $result = $action;

                }

                break;

            case 'unpack':

                // backup first
                $this->copyToBackup('pref', '');

                $exportFile = $workingDir ."/prefs/". $action['export_file'];
                $newPrefs = file_get_contents($exportFile);
                $this->appendPrefsJs($newPrefs);

                $result = true;

                break;
        }

        return $result;

    }


    /**
     *
     * @param <type> $workingDir
     * @param <type> $action
     * @param <type> $mode
     * @return <type>
     */
    function processFileAction($workingDir, $action, $mode='create') {

        $file = $action['file'] ;

        $result = false;

        switch($mode) {
            
            default:
            case 'create':

                $exportFile = $workingDir ."/files/" . urlencode($file). ".tar";
                $cmd = sprintf("%s -cf %s %s", $this->tarBin, $exportFile, $file);

                $output = array(); $returnVal = 0;
                exec($cmd, $output, $returnVal);

                if ($returnVal == 0) {
                    $action['export_file'] = basename($exportFile);
                    $result = $action;
                }

                break;

            case 'unpack':

                $exportFile = $workingDir ."/files/". $action['export_file'];
                $cmd = sprintf("%s -xmf %s -C /", $this->tarBin, $exportFile);

                $output = array(); $returnVal = 0;
                exec($cmd, $output, $returnVal);

                $result = ($returnVal == 0);
                
                break;

        }

        return $result;

    }


    /**
     *
     * @param <type> $workingDir
     * @param <type> $action
     * @param <type> $mode
     * @return <type>
     */
    function processScriptAction($workingDir, $action, $mode='create') {

        $file = $action['file'] ;

        if (!file_exists($file)) return false;

        $cmd = "/bin/sh " . $file ;

        $result = shell_exec($cmd);

        if (!empty($result)) {
            return json_decode($result, true);
        }else {
            return false;
        }

    }


    /**
     *
     * @param <type> $activation
     * @param <type> $workingDir
     * @param <type> $restoreActions
     * @return <type>
     */
    function createTbzPackage($activation, $workingDir, $restoreActions) {

        $now = date("YmdHis", $activation);

        $actionsFile = $workingDir ."/actions.json";

        file_put_contents($actionsFile, json_encode($restoreActions));

        chdir($workingDir);

        $tbzFile = $workingDir ."/../" . $now.".tbz";
        $cmd = sprintf("%s -cjf %s .", $this->tarBin, $tbzFile);

        $result = shell_exec($cmd);

        return $tbzFile;
    }


    /**
     *
     * @param <type> $workingDir
     * @param <type> $tbzFile
     * @return <type>
     */
    function unpackTbzPackage($workingDir, $tbzFile) {

        $cmd = sprintf("%s -xjf %s -C %s", $this->tarBin, $tbzFile, $workingDir);

        $result = shell_exec($cmd);

        $unpackActions = array();

        $actionsFile = $workingDir ."/actions.json";

        if (file_exists($actionsFile)) {
            $unpackActions = json_decode(file_get_contents($actionsFile), true);
        }

        return $unpackActions;

    }


    /**
     *
     * @param <type> $tbzFile
     * @param <type> $unpackLogs
     * @return <type>
     */
    function saveUnpackPackageLog($tbzFile, $unpackLogs) {

        // saved and mark done
        $packagesQueuePath = $this->ircPackagePath."/queues/";

        $tbzUnpackLogFile = $tbzFile . ".unpacklog.json";

        // lock statusFile
        $fp = fopen($tbzUnpackLogFile, "w");

        if (flock($fp, LOCK_EX)) {
            file_put_contents($packagesQueuePath.$tbzUnpackLogFile, json_encode($unpackLogs));
            flock($fp, LOCK_UN);
        }else {
            // error log
        }
        
        fclose($fp);

        return true;

    }


    /**
     *
     * @param <type> $tbzFile
     * @param <type> $unpackLogs
     * @return <type>
     */
    function readUnpackPackageLog($tbzFile) {

        // saved and mark done
        $packagesQueuePath = $this->ircPackagePath."/queues/";

        $tbzUnpackLogFile = $packagesQueuePath . $tbzFile . ".unpacklog.json";

        if (!file_exists($tbzUnpackLogFile)) return false;

        return json_decode(file_get_contents($tbzUnpackLogFile), true);

    }


    /**
     *
     * @param <type> $machineId
     * @param <type> $tbzFile
     * @param <type> $updateStatus
     * @return <type>
     */
    function updatePackageStatus($machineId, $tbzFile, $updateStatus) {

        $packagesQueuePath = $this->ircPackagePath."/queues/";

        $statusFile = $packagesQueuePath . $tbzFile . ".status.json";

        $status = array();

        if (file_exists($statusFile)) {

            // lock statusFile
            $fp = fopen($statusFile, "r");

            if (flock($fp, LOCK_EX)) {
                $status = json_decode(file_get_contents($statusFile), true);
                flock($fp, LOCK_UN); // release the lock
            }else {
                // error lock file
            }
            fclose($fp);
        }

        if(empty($status[$machineId])) {
            $status[$machineId] = array( $updateStatus => time() , 'machine_id' => $machineId);
        }else {
            $status[$machineId][$updateStatus] = time();
        }

        // lock statusFile
        $fp = fopen($statusFile, "w");

        if (flock($fp, LOCK_EX)) {
            file_put_contents($statusFile, json_encode($status));
            flock($fp, LOCK_UN); // release the lock
        }else {
            // error lock file
        }
        fclose($fp);

        return true;

    }

    
    /**
     * getPackage
     * @param String file
     * @return <type>
     */
    function getPackage($file) {

        $packagesQueuePath = $this->ircPackagePath."/queues/";

        $jsonFile = $file. ".json";

        if (file_exists($packagesQueuePath.$jsonFile)) {

            $packageDesc = json_decode(file_get_contents($packagesQueuePath.$jsonFile), true);

            $packageStatusFile = $packagesQueuePath . $packageDesc['file'].".status.json";
            $packageUnpackLogFile = $packagesQueuePath . $packageDesc['file'].".unpacklog.json";

            if (file_exists($packageStatusFile)) {
                $packageDesc['status'] = array_values(json_decode(file_get_contents($packageStatusFile), true));
            }

            if (file_exists($packageUnpackLogFile)) {
                $packageDesc['unpacked'] = true;
            }

            return $packageDesc;

        }

        return false;
    }


    /**
     * getPackages
     * @return <type>
     */
    function getPackages() {

        $packages = array();

        $packagesQueuePath = $this->ircPackagePath."/queues/";

        $folder = new Folder($packagesQueuePath);

        $jsonFiles = $folder->find(".*\.tbz\.json", true);

        foreach ( $jsonFiles as $jsonFile) {

            $packageDesc = json_decode(file_get_contents($packagesQueuePath.$jsonFile), true);

            $packageStatusFile = $packagesQueuePath . $packageDesc['file'].".status.json";
            $packageUnpackLogFile = $packagesQueuePath . $packageDesc['file'].".unpacklog.json";

            if (file_exists($packageStatusFile)) {
                $packageDesc['status'] = array_values(json_decode(file_get_contents($packageStatusFile), true));
            }

            if (file_exists($packageUnpackLogFile)) {
                $packageDesc['unpacked'] = true;
            }

            $packages[] = $packageDesc;
        }

        return $packages;
    }


    /**
     *
     * @param <type> $activation
     * @param <type> $modules
     * @param <type> $description
     * @param <type> $moduleLabels
     * @return <type>
     */
    function createPackage($activation, $modules="", $description="", $moduleLabels="", $workgroup="") {

        $now = time();

        $ircManifests = $this->getIrcManifests();

        // set default modules
        if (!empty($modules)) {
            $selectedModules = explode(",", $modules);
        }else {
            $selectedModules = array_keys($ircManifests);
            $modules = implode(",", $selectedModules);
        }

        if (empty($moduleLabels)) {
            $moduleLabels = implode(",", $selectedModules);
        }

        // create working directory
        $workingDir = $this->getWorkingDir();
        if(!$workingDir) return false;

        $restoreActions = array() ;
        $reboot = false;

        // forloop each selected modules
        foreach ($selectedModules as $moduleName) {

            // get irc actions for module
            $module = $ircManifests[$moduleName];
            $actions = $module['actions'];

            // is this module need reboot
            $reboot |= $module['reboot'];

            // process actions
            foreach($actions as $action) {
                $actionResult = $this->processAction($workingDir, $action);
                if(!empty($actionResult) && is_array($actionResult)) {
                    array_push($restoreActions, $actionResult);
                }
            }

        }

        // create finally tbz files
        $tbzFile = $this->createTbzPackage($activation, $workingDir, $restoreActions);
        $tbzMd5 = md5_file($tbzFile);

        $machine_id = $this->syncSettings['machine_id'];

        $ircPackageDesc = array(
                'created' => $now,
                'created_machine_id' => $machine_id,
                'modules' => $modules,
                'module_labels' => $moduleLabels,
                'activation' => $activation,
                'workgroup' => $workgroup,
                'description' => $description,
                'file' => basename($tbzFile),
                'checksum' => $tbzMd5,
                'filesize' => filesize($tbzFile),
                'reboot' => $reboot
        );

        $tbzDescFile = $tbzFile .".json";

        // lock statusFile
        $fp = fopen($tbzDescFile, "w");
        if (flock($fp, LOCK_EX)) {
            // write ircPackageDesc
            file_put_contents($tbzDescFile, json_encode($ircPackageDesc));
            flock($fp, LOCK_UN);
        }else {
            // error log
        }
        fclose($fp);

        $this->movePackageToQueue($tbzFile, $tbzDescFile);

        $this->removeWorkingDir($workingDir);

        return basename($tbzFile);
    }


    /**
     *
     * @param <type> $file
     * @return <type>
     */
    function removePackage($file) {

        $packagesQueuePath = $this->ircPackagePath."/queues/";

        $tbzFile = $packagesQueuePath . $file;
        $tbzDescFile = $tbzFile . ".json";
        $tbzLogFile = $tbzFile . ".log.json";
        $tbzUnpackLogFile = $tbzFile . ".unpacklog.json";
        $tbzStatusFile = $tbzFile . ".status.json";

        if (file_exists($tbzFile)) {
            unlink($tbzFile);
        }

        if (file_exists($tbzDescFile)) {
            unlink($tbzDescFile);
        }

        if (file_exists($tbzLogFile)) {
            unlink($tbzLogFile);
        }

        if (file_exists($tbzUnpackLogFile)) {
            unlink($tbzUnpackLogFile);
        }

        if (file_exists($tbzStatusFile)) {
            unlink($tbzStatusFile);
        }

        $packagesQueuePath = $this->ircPackagePath."/queues/";

        $folder = new Folder($packagesQueuePath);

        $jsonFiles = $folder->find(".*\.tbz\.json", true);

        if (count($jsonFiles) <= 0) $this->removeLastErrorPackage();

        return true;
    }


    /**
     *
     * @param <type> $file
     * @return <type>
     */
    function unpackPackage($file) {

        $packagesQueuePath = $this->ircPackagePath."/queues/";

        $tbzFile = $packagesQueuePath . $file;
        $tbzDescFile = $tbzFile . ".json";

        if (!file_exists($tbzFile) || !file_exists($tbzDescFile)) return false;

        // create working directory
        $workingDir = $this->getWorkingDir();
        if(!$workingDir) return false;

        $unpackActions = $this->unpackTbzPackage($workingDir, $tbzFile);

        $unpackLogs = array();
        $success = true;

        // process actions
        foreach($unpackActions as $action) {
            $actionResult = $this->processAction($workingDir, $action, 'unpack');

            $action['success'] = $actionResult;

            $success &= $actionResult;
            
            $unpackLogs[] = $action;
        }

        if (!$success) $this->setLastErrorPackage($file);

        $this->saveUnpackPackageLog($file, $unpackLogs);

        $this->removeWorkingDir($workingDir);

        return $success;
    }


    /**
     *
     * @param $files
     * @return unknown_type
     */
    function unpackPackages($files) {

        $result = true ;
        $successFiles = array();

        if (empty($files)) return $successFiles;

        foreach ($files as $file) {

            $result &= $this->unpackPackage($file);

            if (!$result) break;

            // append to success list
            $successFiles[] = $file;

        }

        // create backup
        $this->createTbzBackup();

        return $successFiles;

    }


    /**
     *
     * @return <type>
     */
    function getLastDownloaded() {

        $lastDownloadedTime = time();

        $lastDownloadedFile = $this->ircPackagePath . "/last_downloaded" ;

        if (file_exists($lastDownloadedFile)) {
            $lastDownloadedTime = file_get_contents($lastDownloadedFile);
        }else {
            file_put_contents($lastDownloadedFile, $lastDownloadedTime);
        }

        return $lastDownloadedTime;
    }


    /**
     *
     * @param <type> $lastDownloadedTime
     * @return <type>
     */
    function setLastDownloaded($lastDownloadedTime) {

        $lastDownloadedFile = $this->ircPackagePath . "/last_downloaded" ;

        file_put_contents($lastDownloadedFile, $lastDownloadedTime);

        return $lastDownloadedTime;

    }


    /**
     *
     * @return <type>
     */
    function getLastErrorPackage() {

        $lastErrorPackage = false;

        $lastErrorPackageFile = $this->ircPackagePath . "/last_error_package" ;

        if (file_exists($lastErrorPackageFile)) {
            $lastErrorPackage = chop(file_get_contents($lastErrorPackageFile));
        }

        return $lastErrorPackage;
    }


    /**
     *
     * @param <type> $lastDownloadedTime
     * @return <type>
     */
    function setLastErrorPackage($lastErrorPackage=false) {

        if ($lastErrorPackage) {
            $lastErrorPackageFile = $this->ircPackagePath . "/last_error_package" ;

            file_put_contents($lastErrorPackageFile, $lastErrorPackage);
        }

        return $lastErrorPackage;

    }


    /**
     *
     * @param <type> $lastDownloadedTime
     * @return <type>
     */
    function removeLastErrorPackage() {

        $lastErrorPackageFile = $this->ircPackagePath . "/last_error_package" ;

        if (file_exists($lastErrorPackageFile)) {
            @unlink($lastErrorPackageFile);
        }

        return true;

    }


    /**
     * Using CURL Ext to download binary file.
     *
     * Using fopen's handle to CURLOPT_FILE let CURL writing out to file not return output.
     *
     * @param <type> $url
     * @param <type> $file
     * @return <type>
     */
    function curlDownloadFile($url, $file) {

        if (($curl = curl_init($url)) == false) {
            throw new Exception("curl_init error for url $url.");
        }

        // set timeout
        curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, (int)$this->syncSettings['timeout']);

        if (($fp = fopen($file, "wb")) === false) {
            throw new Exception("fopen error for filename $file");
        }

        // output to file
        curl_setopt($curl, CURLOPT_FILE, $fp);

        // set binary mode
        curl_setopt($curl, CURLOPT_BINARYTRANSFER, true);
        if (curl_exec($curl) === false) {
            fclose($fp);
            unlink($fileName);
            throw new Exception("curl_exec error for url $url.");
        } else {
            fclose($fp);
        }

        curl_close($curl);

        return $file;
    }

    function boolVal($var) {
        switch ($var) {
            case $var == true:
            case $var == 1:
            // case $var == '1': // no need for this, because we used
            // $val == 1 not $var === 1
            case strtolower($var) == 'true':
            case strtolower($var) == 'on':
            case strtolower($var) == 'yes':
            case strtolower($var) == 'y':
                $out = 1;
                break;
            default: $out = 0;
        }

        return $out;
    }


    /**
     * removeExpirePackages
     *
     * @param <type> $expireDays
     * @return <type>
     */
    function removeExpirePackages($expireDays=0) {
        if ($expireDays <= 0) return true;

        $expireTime = time() - 86400*$expireDays;

        $packages = $this->getPackages();

        foreach ($packages as $package) {

            if ($package['activation'] <= $expireTime) {
                $this->removePackage($package['file']);
            }

        }
        return true;
        
    }
}

?>

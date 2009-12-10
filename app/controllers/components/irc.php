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


    function getIrcManifests() {

        if (count($this->ircManifests)) return $this->ircManifests;

        $extensionsDir = new Folder($this->extensionsPath);
        $ircManifestXmls = $extensionsDir->findRecursive("irc_manifest.xml");

        foreach ( $ircManifestXmls as $xmlfile) {
            $this->parseIrcManifest($xmlfile);
        }

        return $this->ircManifests;

    }


    function parseIrcManifest($xmlfile) {

        $xmlObj = simplexml_load_file($xmlfile);

        foreach ($xmlObj->module as $module) {
            $moduleArray = get_object_vars($module);
            $name = $moduleArray['@attributes']['name'];
            $actions = array();
            foreach ($module->action as $action) {
                $actions[] = get_object_vars($action);
            }

            $this->ircManifests[$name] = $actions;

        }


    }

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

    function appendPrefsJs($newPrefsJs) {

        if (file_exists($this->profilePath."/prefs.js")) {

            file_put_contents($this->profilePath."/prefs.js", $newPrefsJs, FILE_APPEND);

            // make getPrefsJs to reload
            $this->prefsJs = "" ;

        }
    }


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

    function removeWorkingDir($workingDir) {

        $workingDir = $this->workingDir;

        if (!empty($workingDir) && $workingDir != '.' && $workingDir != '..') {

            $folder = new Folder($workingDir);
            return $folder->delete();

        }else {
            return false;
        }

    }


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


    function processDbAction($workingDir, $action, $mode='create') {

        $database = $action['database'];
        $table = $action['table'];

        $result = false;

        switch($mode) {
            default:
            case 'create':

                if (strpos($database, '/') == false) {
                    $databaseFile = $this->databasesPath ."/" . $action['database'];
                }else {
                    $databaseFile = $action['database'];
                }

                $exportFile = $workingDir ."/dbs/" . $database . "__" . $table . ".csv";

                $versionSql = "pragma user_version";
                $cmdSql = sprintf("%s %s \"%s\"", $this->sqlite3Bin, $databaseFile, $versionSql);
                $version = chop(shell_exec($cmdSql));

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

                $versionSql = "pragma user_version";
                $cmdSql = sprintf("%s %s \"%s\"", $this->sqlite3Bin, $databaseFile, $versionSql);
                $version = chop(shell_exec($cmdSql));

                if ($masterDatabaseVersion != $version) return false;

                // delete old datas
                $deleteSql = "DELETE FROM $table" ;
                $cmdDelSql = sprintf("%s %s \"%s\"", $this->sqlite3Bin, $databaseFile, $deleteSql);
                shell_exec($cmdDelSql);

                // import new datas
                $sql = ".import $exportFile $table" ;
                $cmd = sprintf("%s -list %s \"%s\"", $this->sqlite3Bin, $databaseFile, $sql);
                shell_exec($cmd);

                $result = true;

                break;
        }

        return $result;


    }

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

                $exportFile = $workingDir ."/prefs/". $action['export_file'];
                $newPrefs = file_get_contents($exportFile);
                $this->appendPrefsJs($newPrefs);

                $result = true;

                break;
        }

        return $result;

    }


    function processFileAction($workingDir, $action, $mode='create') {

        $file = $action['file'] ;

        $result = false;

        switch($mode) {
            default:
            case 'create':

                $exportFile = $workingDir ."/files/" . urlencode($file). ".tar";
                $cmd = sprintf("%s -cf %s %s", $this->tarBin, $exportFile, $file);
                $result = shell_exec($cmd);

                $action['export_file'] = basename($exportFile);

                $result = $action;

                break;

            case 'unpack':

                $exportFile = $workingDir ."/files/". $action['export_file'];

                $cmd = sprintf("%s -xf %s -C /", $this->tarBin, $exportFile);
                shell_exec($cmd);

                $result = true;
                break;

        }

        return $result;

    }


    function processScriptAction($workingDir, $action, $mode='create') {
    // using tar
        $file = $action['file'] ;

        if (!file_exists($file)) return false;

        $cmd = "/bin/sh " . $file ;

        $result = shell_exec($cmd);

        $action['export_file'] = basename($result);

        return $action;


    }


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

    function saveUnpackPackageLog($tbzFile, $unpackLogs) {
        
        // saved and mark done
        $packagesQueuePath = $this->ircPackagePath."/queues/";
        
        $tbzUnpackLogFile = $tbzFile . ".unpacklog.json";

        file_put_contents($packagesQueuePath.$tbzUnpackLogFile, json_encode($unpackLogs));

        return true;
        
    }

    /**
     * getPackages
     * @return <type>
     */
    function getPackages() {

        $packages = array();

        $packagesQueuePath = $this->ircPackagePath."/queues/";

        $folder = new Folder($packagesQueuePath);

        $jsonFiles = $folder->find(".*\.json", true);

        foreach ( $jsonFiles as $jsonFile) {
            $packages[] = json_decode(file_get_contents($packagesQueuePath.$jsonFile), true);
        }

        return $packages;
    }

    /**
     * createPackage
     */
    function createPackage($activation, $modules="", $description="", $moduleLabels="") {

        $ircManifests = $this->getIrcManifests();

        // set default modules
        if (!empty($modules)) {
            $selectedModules = explode(",", $modules);
        }else {
            $selectedModules = array_keys($ircManifests);
            $modules = $selectedModules;
        }

        if (empty($moduleLabels)) {
            $moduleLabels = implode(",", $selectedModules);
        }

        // create working directory
        $workingDir = $this->getWorkingDir();
        if(!$workingDir) return false;

        $restoreActions = array() ;

        // forloop each selected modules
        foreach ($selectedModules as $module) {

        // get irc actions for module
            $actions = $ircManifests[$module];

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
            'created_machine_id' => $machine_id,
            'modules' => $modules,
            'module_labels' => $moduleLabels,
            'activation' => $activation,
            'description' => $description,
            'file' => basename($tbzFile),
            'checksum' => $tbzMd5,
            'filesize' => filesize($tbzFile)
        );

        $tbzDescFile = $tbzFile .".json";

        // write ircPackageDesc
        file_put_contents($tbzDescFile, json_encode($ircPackageDesc));

        $this->movePackageToQueue($tbzFile, $tbzDescFile);

        $this->removeWorkingDir($workingDir);

        return basename($tbzFile);
    }

    /**
     * removePackage
     */
    function removePackage($file) {

        $packagesQueuePath = $this->ircPackagePath."/queues/";

        $tbzFile = $packagesQueuePath . $file;
        $tbzDescFile = $tbzFile . ".json";
        $tbzLogFile = $tbzFile . ".log.json";
        $tbzUnpackLogFile = $tbzFile . ".unpacklog.json";

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

        return true;
    }


    /**
     * unpackPackage
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
        
        // process actions
        foreach($unpackActions as $action) {
            $actionResult = $this->processAction($workingDir, $action, 'unpack');
            
            $action['success'] = $actionResult;
            $unpackLogs[] = $action;
        }

        $this->saveUnpackPackageLog($file, $unpackLogs);

        $this->removeWorkingDir($workingDir);

        return true;
    }


}

?>
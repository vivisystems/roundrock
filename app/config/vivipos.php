<?php
/*
 * SETTING DEFAULT
 */
$DATA_PATH = '/data';
$DATABASE_PATH = '/data/databases';
$SYNCHRONOUS = 'FULL';
$JOURNAL_MODE = 'TRUNCATE';
$LOCKING_MODE = 'NORMAL';

App::import('Core', array('Configure', 'ClassRegistry', 'Overloadable', 'Validation', 'Behavior', 'ConnectionManager', 'Set', 'String','Folder'));

if (($db_configs = Cache::read('db_configs')) === false) {

    $databases = new Folder($DATABASE_PATH);
    $db_files = $databases->find('vivipos.*\.sqlite');

    $db_configs = array();
    foreach($db_files as $db_file) {
            preg_match('/^vivipos(.*)\.sqlite$/i', $db_file, $matches);

            if (count($matches) == 2){

                    $database = $DATABASE_PATH . '/' . $matches[0];
                    $name = str_replace('_', '', $matches[1]);
                    if (strlen($name) == 0 ) $name = 'default';

                    $config = array('driver'=>'sqlite3', 'database'=>$database,
                                    'synchronous'=>$SYNCHRONOUS, 'journal_mode'=>$JOURNAL_MODE,
                                    'locking_mode'=>$LOCKING_MODE);

                    $db_configs[$name] = $config;
                    //ConnectionManager::create($name, $config);
            }
    }
    Cache::write('db_files', $db_files);
    Cache::write('db_configs', $db_configs);
}

foreach ($db_configs as $db_name => $db_config ) {
    ConnectionManager::create($db_name, $db_config);
}

// sync_settings.ini parser
$PROFILE_PATH = '/data/profile';
if (($sync_settings = Cache::read('sync_settings')) === false) {
    if(file_exists($PROFILE_PATH.DS."sync_settings.ini")) {
        $sync_settings = parse_ini_file($PROFILE_PATH.DS."sync_settings.ini");
        // Cache::write('sync_settings', $sync_settings);
    }
}
Configure::write('sync_settings', $sync_settings);

// write vivipos settings to configure
Configure::write('DATA_PATH', $DATA_PATH);
Configure::write('DATABASE_PATH', $DATABASE_PATH);
Configure::write('PROFILE_PATH', $PROFILE_PATH);
?>

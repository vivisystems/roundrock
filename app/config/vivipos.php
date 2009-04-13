<?php
/* 
 */
$DATABASE_PATH = '/data/databases';

App::import('Core', array('Configure', 'ClassRegistry', 'Overloadable', 'Validation', 'Behavior', 'ConnectionManager', 'Set', 'String','Folder'));

$databases = new Folder($DATABASE_PATH);
$db_files = $databases->find('vivipos.*\.sqlite');

foreach($db_files as $db_file) {
	preg_match('/^vivipos(.*)\.sqlite$/i', $db_file, $matches);

	if (count($matches) == 2){

		$database = $DATABASE_PATH . '/' . $matches[0];
		$name = str_replace('_', '', $matches[1]);
		if (strlen($name) == 0 ) $name = 'default';
        
		$config = array('driver'=>'sqlite3', 'database'=>$database);

		ConnectionManager::create($name, $config);

	}
}

// sync_settings.ini parser
$PROFILE_PATH = '/data/profile';

if(file_exists($PROFILE_PATH.DS."sync_settings.ini")) {
    $ini_configs = parse_ini_file($PROFILE_PATH.DS."sync_settings.ini");
    Configure::write('sync_settings', $ini_configs);
}

?>

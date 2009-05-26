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

        $this->_loadDbConfig();

        $this->syncSettings =& Configure::read('sync_settings');

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


    function truncate() {

        if (empty($this->syncSettings['retain_days'])) $retain_days = 7;
        else $retain_days = $this->syncSettings['retain_days'];

        $this->out("truncate syncs (days = " . $retain_days . " )", true);
        $this->hr(false);

        $shell =& $this;

        $truncateResult = $shell->requestAction("/syncs/truncate/${retain_days}");

        $this->out("truncate syncs ok (total remove " . $truncateResult . ")", true);
    }

}
?>
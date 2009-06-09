<?php
require_once "sync_base.php";

class SyncToolsShell extends SyncBaseShell {

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

        $this->out("sync_tools usage: ", true);
        $this->hr(false);
        $this->out("command:  truncate", true);
        $this->hr(false);

    }


    function truncate() {

        if (empty($this->syncSettings['retain_days'])) $retain_days = 7;
        else $retain_days = $this->syncSettings['retain_days'];

        $this->out("truncate syncs (days = " . $retain_days . " )", true);
        $this->hr(false);

        $shell =& $this;

        if ($this->isSyncing()) {
            $this->out("other process issyncing..", true);
            return;
        }

        // $this->observerNotify('starting');

        $truncateResult = $shell->requestAction("/syncs/truncate/${retain_days}");

        // $this->observerNotify('finished', json_encode($truncateResult) );

        $this->out("truncate syncs ok (total remove " . $truncateResult . ")", true);
    }

}
?>
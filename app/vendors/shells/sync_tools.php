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
        $this->out("command:  truncate , vacuum", true);
        $this->hr(false);

    }


    function truncate() {

        $syncSettings = $this->readSyncSettings();
        $active = $syncSettings['active'];

        // sync not active , not truncate databases.
        //if (empty($active) ) return; // always trucate 2009.08.20 frank.

        if (empty($syncSettings['retain_days'])) $retain_days = 7;
        else $retain_days = $syncSettings['retain_days'];

        $this->out("truncate syncs (days = " . $retain_days . " )", true);
        $this->hr(false);

        if ($this->isSyncing()) {
            $this->out("other process issyncing..", true);
            return;
        }

        $this->syncStatus('starting');
        $this->observerNotify('starting');

        $truncateResult = $this->requestAction("/syncs/truncate/${retain_days}");

        $this->syncStatus('finished');
        $this->observerNotify('finished', json_encode($truncateResult) );

        $this->out("truncate syncs ok (total remove " . $truncateResult . ")", true);
    }

    function vacuum() {

        $syncSettings = $this->readSyncSettings();
        $active = $syncSettings['active'];

        $this->out("vacuum all databases with syncs table", true);
        $this->hr(false);

        if ($this->isSyncing()) {
            $this->out("other process issyncing..", true);
            return;
        }

        $this->syncStatus('starting');
        $this->observerNotify('starting');

        $vacuumResult = $this->requestAction("/syncs/vacuum/");

        $this->syncStatus('finished');
        $this->observerNotify('finished', json_encode($vacuumResult) );

        $this->out("vacuum all databases with syncs table ok (" . $vacuumResult . ")", true);
    }


}
?>
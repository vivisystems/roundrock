(function(){

    /**
     * Disk Space controller
     */

    var __controller__ = {

        name: 'DiskSpace',

        _last_check_date: null,

        _cart: null,
        _main: null,

        _check_interval: 0,
        _default_check_interval: 600000,

        _warned: false,
        _warn_threshold: 0,
        _default_warn_threshold: 50*1024*1024,      // 50MB

        _force_threshold: 0,
        _default_force_threshold: 30*1024*1024,     // 30MB

        _diskusage_output_file: '/tmp/diskspace_usage',

        initial: function() {

            // load preferences
            this._check_interval = parseInt(GeckoJS.Configure.read('vivipos.fec.settings.vivisystems.diskspace.check.interval')) || this._default_check_interval;
            this._warn_threshold = parseInt(GeckoJS.Configure.read('vivipos.fec.settings.vivisystems.diskspace.warn.threshold')) || this._default_warn_threshold;
            this._force_threshold = parseInt(GeckoJS.Configure.read('vivipos.fec.settings.vivisystems.diskspace.force.threshold')) || this._default_force_threshold;

            // get handle to cart controller
            this._cart = GeckoJS.Controller.getInstanceByName('Cart');

            // get handle to Main controller
            this._main = GeckoJS.Controller.getInstanceByName('Main');

            // listen for onIdle event
            var idleController = GeckoJS.Controller.getInstanceByName('Idle');
            if (idleController) {
                idleController.addEventListener('onIdle', this.checkDiskSpace, this);
            }
        },

        checkDiskSpace: function(evt) {

            if (this._isOnMainWindow() && this._cartHasNoOpenOrder()) {

                // time to perform check?
                let now = new Date();
                this.log('DEBUG', 'Disk space last checked [' + (this._last_check_date ? this._last_check_date : 'none') + '], now [' + now + ']');

                if (this._timeToCheck(now, this._last_check_date, this._check_interval)) {
                    this.log('DEBUG', 'Checking disk space [' + (now.getTime() - (this._last_check_date ? this._last_check_date.getTime() : 0)) + ']');

                    let free = this._getAvailableDiskspace();

                    if (free < 0) {
                        this.log('ERROR', 'Failed to get available disk space [' + free + ']');
                    }
                    else {
                        
                        let retainDays = GeckoJS.Configure.read('vivipos.fec.settings.OrderRetainDays');
                        if (free > this._warn_threshold) {
                            this.log('DEBUG', 'available diskspace [' + free + '] greater than warn threshold [' + this._warn_threshold + ']');
                        }
                        else if (free > this._force_threshold) {
                            if (!this._warned) {
                                this._warned = true;
                                this.log('WARN', 'available diskspace [' + free + '] reached warn threshold [' + this._warn_threshold + ']');
                                this._notify(_('Storage Low'),
                                             _('The system is running low on storage space. Please reduce the number of days to retain order data (currently set to ' + retainDays + ')'));
                            }
                            else {
                                this.log('DEBUG', '(already warned) available diskspace [' + free + '] reached warn threshold [' + this._warn_threshold + ']');
                            }
                        }
                        else {
                            this.log('ERROR', 'available diskspace [' + free + '] reached force threshold [' + this._force_threshold + ']');
                            var doExit = -1;
                            while (doExit < 1) {
                                if (retainDays < 2) {
                                    doExit = 1;
                                    this.log('ERROR', 'unable to reduce order data retain days [' + retainDays + ']');
                                    this._notify(_('Storage Critically Low'),
                                                 _('The system is critically low on storage space, and no disk space may be reclaimed. Continuing to use this terminal may lead to data loss. Please contact your dealer for assistance [message #v1000]'));
                                }
                                else {
                                    if (this._confirm(_('Storage Critically Low'),
                                                      (doExit == -1) ? _('Storage space is critically low. If you press OK, the system will attempt to reclaim storage by reducing the number of days to retain order data by 1 (currently set at %S days). Press Cancel to make no changes and shut down the terminal.', [retainDays])
                                                                     : _('Storage space is still critically low. If you press OK, the system will make another attempt to reclaim storage by reducing the number of days to retain order data by 1 (currently set at %S days). Press Cancel to make no further changes and shut down the terminal.', [retainDays])
                                                                 )) {
                                        this.log('ERROR', 'attempting to reclaim storage by reducing order data retain days [' + retainDays + '] by 1');
                                        doExit = 0;

                                        this._reclaimSpace(--retainDays);

                                        free = this._getAvailableDiskspace();
                                        if (free < 0) {
                                            doExit = 1;
                                            this.log('ERROR', 'Failed to get available disk space [' + free + ']');
                                            this._notify(_('Storage Critically Low'),
                                                         _('Storage availability verification failed. Continuing to use this terminal may lead to data loss. Please contact your dealer for assistance [message #v1001]'));
                                        }
                                        else {
                                            if (free > this._force_threshold) {
                                                doExit = 1;
                                                this._notify(_('Storage Critically Low'),
                                                             _('Storage reclaimed by removing expired data.'));
                                            }
                                        }
                                    }
                                    else {
                                        this.log('ERROR', 'shutting down as user chose not to reduce order data retain days [' + retainDays + ']');
                                        goShutdownMachine();
                                        doExit = 1;
                                    }
                                }
                            }
                        }
                    }
                    this._last_check_date = now;
                }
            }
        },

        _getAvailableDiskspace: function() {
            // get disk used
            let statusFile = this._diskusage_output_file;

            // remove existing output file, if any
            GREUtils.File.remove(statusFile);
            
            let available = -1;     // failed to run
            let script = "LC_ALL=c df -B 1 /data/databases | grep -v Filesystem | awk -F' ' '{ print $2 }' > " + statusFile;
            if (this._execute('/bin/sh', ['-c', script])) {
                // read integrity check status from status file
                if (GeckoJS.File.exists(statusFile)) {
                    let f = new GeckoJS.File(statusFile);
                    f.open('r');

                    // if status file is empty or unreadable, then integrity check failed to run
                    available = f.readLine() || -2;
                    f.close();

                    if (isNaN(available)){
                        available = -3;
                    }
                }
            }
            return available;
        },

        _reclaimSpace: function(retainDays) {
            GeckoJS.Configure.write('vivipos.fec.settings.OrderRetainDays', retainDays);
            var main = this._main;
            if (this._main) {
                main.clearOrderData(retainDays, true);
            }
            else {
                this.log('ERROR', 'main controller not available');
            }
        },

        _timeToCheck: function(now, last_time, interval) {
            return (last_time == null) || (now.getTime() - last_time.getTime() > interval);
        },

        _isOnMainWindow: function() {
            var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
            .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow('');

            return (mainWindow === window);
        },

        _cartHasNoOpenOrder: function() {
            var cart = this._cart;
            if (cart) {
                return !cart.ifHavingOpenedOrder();
            }
            else {
                return true;
            }
        },

        /*
         * close all connections to databases that are not in-memory
         */
        _closeDBConnections: function() {
            var dsList = GeckoJS.ConnectionManager.sourceList() || [];
            dsList.forEach(function(dsName) {
                if (dsName.toLowerCase() != 'memory') {
                    let ds = GeckoJS.ConnectionManager.getDataSource(dsName);
                    if (ds) {
                        ds.close();
                    }
                }
            }, this);
        },

        _execute: function(cmd, params) {
            try {
                var exec = new GeckoJS.File(cmd);
                var r = exec.run(params, true);
                exec.close();
                return true;
            }
            catch (e) {
                this.log('ERROR', 'Failed to execute command [' + cmd + ' ' + params + ']');
                return false;
            }
        },

        _notify: function(title, message) {
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }
            GREUtils.Dialog.alert(win, title, message);
        },

        _confirm: function(title, message) {
            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow'
                && win.document.documentElement.boxObject.screenX < 0) {
                win = null;
            }
            return GREUtils.Dialog.confirm(win, title, message);
        },

        destroy: function() {

        }
    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'DiskSpace');
    }, false);

})();


(function(){

    var __controller__ = {

        name: 'AutoBackup',
	
        _dataPath: null,
        _scriptPath: null,

        execute: function(cmd, params) {
            try {
                var exec = new GeckoJS.File(cmd);
                var r = exec.run(params, true);
                // this.log("ERROR", "Ret:" + r + "  cmd:" + cmd + "  params:" + params);
                exec.close();
                return true;
            }
            catch (e) {
                NotifyUtils.warn(_('Failed to execute command (%S).', [cmd + ' ' + params]));
                return false;
            }
        },

        _showWaitPanel: function(message) {
            var waitPanel = document.getElementById('wait_panel');
            if (waitPanel) {
                waitPanel.openPopupAtScreen(0, 0);

                var caption = document.getElementById( 'wait_caption' );
                caption.label = message;

                // release CPU for progressbar ...
                this.sleep(500);
            }
            return waitPanel;
        },

        autobackupToLocal: function(evt) {
            
            var autoBackup = GeckoJS.Configure.read('vivipos.fec.settings.AutoBackupOnClosing');
            if (!autoBackup) return;
            
            var waitPanel = this._showWaitPanel(_('Automatically Backing Up Data to Local Storage'));
            var script = this._scriptPath + "backup.sh";
            var args = [];

            // log user process
            this.log('FATAL', 'START Automatic Backup');

            // close all datasource connections
            GeckoJS.ConnectionManager.closeAll();
            
            let evt_data = {script: script, args: args, skip: false};
            if (this.dispatchEvent('beforeAutoBackupToLocal', evt_data)) {
                script = evt_data.script;
                args = evt_data.args;

                this.log('DEBUG', 'autobackup script [' + script + ']');
                this.log('DEBUG', 'autobackup args [' + this.dump(args) + ']');
                
                if (evt_data.skip || this.execute(script, args)) {
                    this.execute("/bin/sh", ["-c", "/bin/sync; /bin/sleep 1; /bin/sync;"]);
                }
            }

            this.log('FATAL', 'END Automatic Backup');

            if (waitPanel) waitPanel.hidePopup();
        },

        // initialize
        startup: function() {
            // initialize paths and flags
            this._dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            this._scriptPath = this._dataPath + "/scripts/"

            // register listener for sale period close event
            var shiftChangeController = GeckoJS.Controller.getInstanceByName('ShiftChanges');
            if (shiftChangeController) {
                shiftChangeController.addEventListener('periodClosed', this.autobackupToLocal, this);
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener("load", function (){
        $do('startup', '', 'AutoBackup');
    }, false);

})();

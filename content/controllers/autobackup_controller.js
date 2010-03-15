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
            // check if event is sale period close
            if (!evt || !evt.data || !evt.data.closing) return;

            var autoBackup = GeckoJS.Configure.read('vivipos.fec.settings.AutoBackupOnClosing');
            if (!autoBackup) return;
            
            var waitPanel = this._showWaitPanel(_('Automatically Backing Up Data to Local Storage'));
            var args = [];

            // log user process
            this.log('FATAL', 'START Automatic Backup');

            if (this.execute(this._scriptPath + "backup.sh", args)) {
                this.execute("/bin/sh", ["-c", "/bin/sync; /bin/sleep 1; /bin/sync;"]);
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
                shiftChangeController.addEventListener('shiftChanged', this.autobackupToLocal, this);
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener("load", function (){
        $do('startup', '', 'AutoBackup');
    }, false);

})();

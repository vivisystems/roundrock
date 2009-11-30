(function(){

    var __view__ = {

        init: function(dir) {

            this._data = [];
            this._files = null;
            this._timedata = [];
            var self = this;
            
            if (dir == null) {
                self._data = [];
                return;
            }

            this._files = new GeckoJS.Dir.readDir(dir, {
                type: "d"
            }).sort(function(a, b) {
                if (a.leafName < b.leafName) return 1; else if (a.leafName > b.leafName) return -1; else return 0;
            });

            this._files.forEach(function(o){
                var str = o.leafName;
                try {

                    var dt = Date.parseExact(str, "yyyyMd");
                    var timestr = dt.toLocaleDateString();

                    // check profile.tbz exists ?
                    o.append('profile.tbz');
                    if (o.exists()) {
                        timestr += ' ' + '(*)';
                    }

                } catch (e) {
                    var timestr = _(str);
                }
                var typestr = '';
                self._data.push({
                    time: timestr,
                    type: typestr,
                    dir: str
                });

            });            
        }
    };

    var BackupFilesView = window.BackupFilesView = GeckoJS.NSITreeViewArray.extend(__view__);

    var __controller__ = {

        name: 'SystemBackup',
	
        _listObj: null,
        _listObjLocalBackup: null,
        _listObjStickBackup: null,
        _listDatas: null,
        _selectedIndex: 0,
        _dataPath: null,
        _scriptDir: null,
        _localbackupDir: null,
        _backupDir: null,
        _busy: false,

        getListObjLocalBackup: function() {
            if(this._listObjLocalBackup == null) {
                this._listObjLocalBackup = document.getElementById('localbackupscrollablepanel');
            }
            return this._listObjLocalBackup;
        },

        getListObjStickBackup: function() {
            if(this._listObjStickBackup == null) {
                this._listObjStickBackup = document.getElementById('stickbackupscrollablepanel');
            }
            return this._listObjStickBackup;
        },

        setButtonState: function() {
            //
            $('#backuptolocal').attr('disabled', this._busy);
            $('#backuptostick').attr('disabled', this._busy);
            $('#restorefromlocal').attr('disabled', this._busy);
            $('#restorefromstick').attr('disabled', this._busy);

            $('#ok').attr('disabled', this._busy);
        },

        checkBackupDevices: function() {

            var osLastMedia = new GeckoJS.File('/tmp/last_media');
            // var osLastMedia = new GeckoJS.File('/var/tmp/vivipos/last_media');

            var last_media = "";
            var deviceNode = "";
            var deviceReady = false;
            this._backupDir = null;

            var deviceMount = "/media/";
            // var deviceMount = "/var/tmp/";

            var hasMounted = false;

            if (osLastMedia.exists()) {
                osLastMedia.open("r");
                last_media = osLastMedia.readLine();
                osLastMedia.close();
            }

            if (last_media) {

                var tmp = last_media.split('/');
                deviceNode = tmp[tmp.length-1];
                deviceMount +=  deviceNode + '/';

                var mountDir = new GeckoJS.File(deviceMount);

                if (mountDir.exists() && mountDir.isDir()) {

                    // mount dir exists
                    // autocreate backup_dir and restore dir
                    var branchId = GeckoJS.Session.get( 'storeContact' ).branch_id;
                    var terminalNo = GeckoJS.Session.get( 'terminal_no' );

                    if (branchId) branchId = '/' + branchId;
                    if (terminalNo) terminalNo = '/' + terminalNo;

                    var backupDir = new GeckoJS.Dir(deviceMount + 'system_backup' + branchId + terminalNo, true);
                    
                    if (backupDir.exists()) {

                        this._backupDir = backupDir.path;

                        deviceReady = true;

                    }
                }
            }

            return deviceReady ;

        },

        execute: function(cmd, param) {
            try {
                var exec = new GeckoJS.File(cmd);
                var r = exec.run(param, true);
                // this.log("ERROR", "Ret:" + r + "  cmd:" + cmd + "  param:" + param);
                exec.close();
                return true;
            }
            catch (e) {
                NotifyUtils.warn(_('Failed to execute command (%S).', [cmd + ' ' + param]));
                return false;
            }
        },

        _restart: function() {
            // restart vivipos
            GeckoJS.Observer.notify(null, 'prepare-to-restart', this);
        },

        _reboot: function() {
            // reboot vivipos
            GeckoJS.Observer.notify(null, 'prepare-to-reboot', this);
        },

        _showWaitPanel: function(message) {
            var waitPanel = document.getElementById('wait_panel');
            waitPanel.openPopupAtScreen(0, 0);

            var caption = document.getElementById( 'wait_caption' );
            caption.label = message;
            
            // release CPU for progressbar ...
            this.sleep(500);
            return waitPanel;
        },

        backupToLocal: function() {
            if (this._busy) return;
            this._busy = true;
            var waitPanel = this._showWaitPanel(_('Backing Up Data to Local Storage'));
            var withProfile = document.getElementById('backupWithProfile').checked ;// with-profile
            this.setButtonState();

            var args = [];
            if (withProfile) args.push('with-profile');

            // log user process
            this.log('FATAL', 'backupToLocal withProfile: [' + withProfile +']');

            this.flushPrefs(); // flush it.

            if (this.execute(this._scriptPath + "backup.sh", args)) {
                this.execute("/bin/sh", ["-c", "/bin/sync; /bin/sleep 1; /bin/sync;"]);
                NotifyUtils.info(_('<Backup to Local> is done!!'));
            }

            this.load();
            this._busy = false;
            this.setButtonState();
            waitPanel.hidePopup();
        },

        backupToStick: function() {
            if (this._busy) return;
            if (!this.checkBackupDevices()){
                NotifyUtils.info(_('Media not found!! Please attach the USB thumb drive...'));
                return;
            }
            this._busy = true;
            var waitPanel = this._showWaitPanel(_('Copying Backup Data to External Storage'));
            this.setButtonState();

            var localObj = this.getListObjLocalBackup();
            var index = localObj.selectedIndex;
            var datas = localObj.datasource._data;

            if (index >= 0) {
                var dir = datas[index].dir;
                // do copy from local to stick
                // var param = "-fr " + this._localbackupDir + dir + " " + this._stickbackupDir + dir;
                var param = ["-fr", this._localbackupDir + dir, this._stickbackupDir];

                // log user process
                this.log('FATAL', 'backupToStick file: [' + dir +']');

                if (this.execute("/bin/cp", param)) {
                    this.execute("/bin/sh", ["-c", "/bin/sync; /bin/sleep 1; /bin/sync;"]);
                    NotifyUtils.info(_('<Copy Backup to Stick> is done!!'));
                }
            } else {
                NotifyUtils.info(_('Please select a local backup first'));
            }

            this.load();
            this._busy = false;
            this.setButtonState();
            waitPanel.hidePopup();
        },

        restoreFromLocal: function() {
            if (this._busy) return;
            this._busy = true;
            var waitPanel = this._showWaitPanel(_('Restoring Data from Local Backup'));
            this.setButtonState();

            var localObj = this.getListObjLocalBackup();
            var index = localObj.selectedIndex;
            var datas = localObj.datasource._data;
            var withSystem = document.getElementById('restoreWithSystem').checked ;// with-system
            var args = [];

            if (index >= 0) {
                var dir = datas[index].dir;
                args.push(this._localbackupDir + dir);
                if (withSystem) args.push('with-system');

                var confirmMessage = _("Do you want to restore [%S] from local backup?", [datas[index].time]);
                if (withSystem) confirmMessage += "\n\n" + _("restore_with_system.confirm_message");
                else confirmMessage += "\n" + _("If you execute restore now, the system will restart automatically after you return to the Main Screen.");

                if (GREUtils.Dialog.confirm(this.topmostWindow, _("Confirm Restore"), confirmMessage )) {

                    // log user process
                    this.log('FATAL', 'restoreFromLocal file: [' + dir + '] withSystem: [' + withSystem +']');

                    this.sleep(100);

                    this.flushPrefs(); // flush it.
                    
                    if (this.execute(this._scriptPath + "restore.sh", args )) {
                        if(withSystem) {
                            this._reboot();
                        }else {
                            this._restart();
                        }
                        NotifyUtils.info(_('<Restore from Local backup> is done!!'));
                    }
                }
            } else {
                NotifyUtils.info(_('Please select an external backup to restore from'));
            }

            this._busy = false;
            this.setButtonState();
            waitPanel.hidePopup();
        },

        restoreFromStick: function() {
            if (this._busy) return;
            if (!this.checkBackupDevices()){
                NotifyUtils.info(_('Media not found!! Please attach the USB thumb drive...'));
                return;
            }

            this._busy = true;
            var waitPanel = this._showWaitPanel(_('Restoring Data from External Backup'));
            this.setButtonState();

            var stickObj = this.getListObjStickBackup();
            var index = stickObj.selectedIndex;
            var datas = stickObj.datasource._data;
            var withSystem = document.getElementById('restoreWithSystem').checked ;// with-system
            var args = [];

            if (index >= 0) {
                var dir = datas[index].dir;
                args.push(this._stickbackupDir + dir);
                if (withSystem) args.push('with-system');

                var confirmMessage = _("Do you want to restore [%S] from external USB storage?", [datas[index].time]) + "\n" + _("If you execute restore now, the system will restart automatically after you return to the Main Screen.");
                if (withSystem) confirmMessage += "\n\n" + _("restore_with_system.confirm_message");
                
                if (GREUtils.Dialog.confirm(this.topmostWindow, _("Confirm Restore"), confirmMessage)) {

                    // log user process
                    this.log('FATAL', 'restoreFromStick file: [' + dir + '] withSystem: [' + withSystem +']');

                    this.sleep(100);

                    this.flushPrefs(); // flush it.

                    if (this.execute(this._scriptPath + "restore.sh", args)){
                        if(withSystem) {
                            this._reboot();
                        }else {
                            this._restart();
                        }
                        NotifyUtils.info(_('<Restore from Stick> is done!!'));
                    }
                }
            } else {
                NotifyUtils.info(_('Please select a local backup to restore from'));
            }

            this._busy = false;
            this.setButtonState();
            waitPanel.hidePopup();
        },

        flushPrefs: function() {
            try {
                var mPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
                // mPrefService.readUserPrefs(null);
                mPrefService.savePrefFile(null);
                this.sleep(500);
            }catch(e) {
                this.log('ERROR', 'Error reload prefs.js');
            }
        },

        load: function() {
            
            if (this._dataPath == null) {
                this.checkBackupDevices();
                this._dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            }
            this._scriptPath = this._dataPath + "/scripts/"
            this._localbackupDir = this._dataPath + "/backups/";
            if (this._backupDir)
                this._stickbackupDir = this._backupDir + "/";
            else
                this._stickbackupDir = null;

            var panelViewLocal = new BackupFilesView(this._localbackupDir);
            this.getListObjLocalBackup().datasource = panelViewLocal;

            var panelViewStick = new BackupFilesView(this._stickbackupDir);
            this.getListObjStickBackup().datasource = panelViewStick;
        },

        select: function(index){
        //
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();

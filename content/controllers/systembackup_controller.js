(function(){

    var BackupFilesView = window.BackupFilesView = GeckoJS.NSITreeViewArray.extend({
        
        init: function(dir) {

            this._data = [];
            this._files = null;
            this._timedata = [];
            this._files = new GeckoJS.Dir.readDir(dir, {type: "d"}).sort(function(a, b) {if (a.leafName < b.leafName) return -1; else if (a.leafName > b.leafName) return 1; else return 0;});

            var self = this;

            this._files.forEach(function(o){
                var str = o.leafName;

                var dt = Date.parseExact(str, "yyyyMd");
                var timestr = dt.toLocaleDateString();
                var typestr = '';
                self._data.push({time: timestr, type: typestr, dir: str});
                
            });            
        }
    });

    /**
     * Class ViviPOS.SystemBackupController
     */

    GeckoJS.Controller.extend( {
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

            // var osLastMedia = new GeckoJS.File('/tmp/last_media');
            var osLastMedia = new GeckoJS.File('/var/tmp/vivipos/last_media');

            var last_media = "";
            var deviceNode = "";
            var deviceReady = false;
            this._backupDir = null;

            // var deviceMount = "/media/";
            var deviceMount = "/var/tmp/";

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
                    var backupDir = new GeckoJS.Dir(deviceMount + 'system_backup', true);

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
            return;
            opener.opener.vivipos.suspendSavePreference = true;
            GeckoJS.Observer.notify(null, 'prepare-to-restart', this);
        },

        _showWaitPanel: function(panel) {
            var waitPanel = document.getElementById(panel);
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            waitPanel.sizeTo(360, 120);
            var x = (width - 360) / 2;
            var y = (height - 240) / 2;
            waitPanel.openPopupAtScreen(x, y);

            // release CPU for progressbar ...
            this.sleep(1500);
            return waitPanel;
        },

        backupToLocal: function() {
            if (this._busy) return;
            this._busy = true;
            var waitPanel = this._showWaitPanel('backup_wait_panel');
            this.setButtonState();

            if (this.execute(this._scriptPath + "backup.sh", ''))
                NotifyUtils.info(_('<Backup to Local> is done!!'));

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
            var waitPanel = this._showWaitPanel('backup_wait_panel');
            this.setButtonState();

            var localObj = this.getListObjLocalBackup();
            var index = localObj.selectedIndex;
            var datas = localObj.datasource._data;

            if (index >= 0) {
                var dir = datas[index].dir;
                // do copy from local to stick
                // var param = "-fr " + this._localbackupDir + dir + " " + this._stickbackupDir + dir;
                var param = ["-fr", this._localbackupDir + dir, this._stickbackupDir];

                if (this.execute("/bin/cp", param))
                    NotifyUtils.info(_('<Copy Backup to Stick> is done!!'));
            } else {
                NotifyUtils.info(_('Must select a item from local backup list.'));
            }

            this.load();
            this._busy = false;
            this.setButtonState();
            waitPanel.hidePopup();
        },

        restoreFromLocal: function() {
            if (this._busy) return;
            this._busy = true;
            var waitPanel = this._showWaitPanel('restore_wait_panel');
            this.setButtonState();

            var localObj = this.getListObjLocalBackup();
            var index = localObj.selectedIndex;
            var datas = localObj.datasource._data;

            if (index >= 0) {
                var dir = datas[index].dir;

                if (GREUtils.Dialog.confirm(this.window, _("Confirm Restore"),
                        _("Do you want to restore (%S) from local backup?", [datas[index].time]))) {
                    if (this.execute(this._scriptPath + "restore.sh", [this._localbackupDir + dir])) {
                        this._restart();
                        NotifyUtils.info(_('<Restore from Local backup> is done!!'));
                    }
                }
            } else {
                NotifyUtils.info(_('Must select a item from local backup list.'));
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
            var waitPanel = this._showWaitPanel('restore_wait_panel');
            this.setButtonState();

            var stickObj = this.getListObjStickBackup();
            var index = stickObj.selectedIndex;
            var datas = stickObj.datasource._data;

            if (index >= 0) {
                var dir = datas[index].dir;

                if (GREUtils.Dialog.confirm(this.window, _("Confirm Restore"),
                        _("Do you want to restore (%S) from stick?", [datas[index].time]))) {

                    if (this.execute(this._scriptPath + "restore.sh", [this._stickbackupDir + dir])){
                        this._restart();
                        NotifyUtils.info(_('<Restore from Stick> is done!!'));
                    }
                }
            } else {
                NotifyUtils.info(_('Must select a item from stick list.'));
            }

            this._busy = false;
            this.setButtonState();
            waitPanel.hidePopup();
        },

        load: function() {
            if (this._dataPath == null) {
                this.checkBackupDevices();
                this._dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/') + '/data/';
            }
            this._scriptPath = this._dataPath + "scripts/"
            this._localbackupDir = this._dataPath + "backups/";
            this._stickbackupDir = this._backupDir + "/";

            var panelViewLocal = new BackupFilesView(this._localbackupDir);
            this.getListObjLocalBackup().datasource = panelViewLocal;

            var panelViewStick = new BackupFilesView(this._stickbackupDir);
            this.getListObjStickBackup().datasource = panelViewStick;
        },

        select: function(index){
            //
        }
    });


})();


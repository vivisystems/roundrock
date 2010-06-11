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
        _stickbackupDir: null,
        _busy: false,
        _availableDevices: [],
        _selectedDevice: null,
        _mtabPath: '/etc/mtab',

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

        scanBackupDevices: function() {
            var devices = {};

            // check BACKUP
            let suffixes = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
            suffixes.forEach(function(suffix) {
                let file = new GeckoJS.File('/dev/disk/by-label/BACKUP' + suffix);
                if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', 'file: ' + file + ' [' + file.path + ']');
                if (file) {
                    file.normalize();
                    if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', 'file: ' + file);
                    if (file.exists()) {
                        if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', 'file exists [' + file.path + ']');

                        // mount path
                        let mountPath = this.mountBackupDevice(file.path) || file.path;
                        devices[mountPath] = {path: file.path,
                                              mount: mountPath,
                                              label: 'BACKUP' + suffix,
                                              type: 'label'};
                    }
                }
            }, this);
            
            // check last media
            var last_media = "";
            var osLastMedia = new GeckoJS.File('/tmp/last_media');
            var deviceMount = "/media/";
            if (osLastMedia.exists()) {
                osLastMedia.open("r");
                last_media = osLastMedia.readLine();
                osLastMedia.close();
            }

            if (last_media) {

                var nodes = last_media.split('/');
                var deviceNode = nodes[nodes.length-1];
                deviceMount +=  deviceNode + '/';

                var mountDir = new GeckoJS.File(deviceMount);

                if (mountDir.exists() && mountDir.isDir()) {
                    devices[mountDir.path] = {path: mountDir.path,
                                              mount: mountDir.path,
                                              label: mountDir.path,
                                              type: 'removable'};
                }
            }
            
            // convert devices into array
            var list = [];
            for (let key in devices) {
                list.push(devices[key]);
            }

            if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', 'devices: ' + this.dump(list));

            return list;
        },

        checkBackupDevice: function(device) {

            var deviceReady = false;
            this._stickbackupDir = null;

            if (device) {

                let mountPath;
                let mountDir;

                // mount device if not already mounted
                if (device.type == 'label') {
                    mountPath = this.mountBackupDevice(device.path) + '/';
                }
                else {
                    mountPath =  device.mount + '/';
                }
                if (mountPath) {
                    mountDir = new GeckoJS.File(mountPath);

                    if (mountDir.exists() && mountDir.isDir()) {

                        // mount dir exists

                        let branchId = GeckoJS.Session.get( 'storeContact' ).branch_id;
                        let terminalNo = GeckoJS.Session.get( 'terminal_no' );

                        // autocreate backup_dir and restore dir
                        if (branchId) branchId = '/' + branchId;
                        if (terminalNo) terminalNo = '/' + terminalNo;

                        // check if backup directory exists
                        let backupDir = new GeckoJS.Dir(mountPath + 'system_backup' + branchId + terminalNo, true);
                        if (backupDir.exists()) {

                            this._stickbackupDir = backupDir.path + '/';
                            deviceReady = true;

                        }
                    }
                }
            }

            return deviceReady ;
        },

        mountBackupDevice: function(path) {

            // check mtab to see if device is already mounted
            var mountPath = false;
            var mtab = new GeckoJS.File(this._mtabPath);

            if (mtab.exists()) {
                let line;
                
                mtab.open("r");
                while (line = mtab.readLine()) {
                    if (line.indexOf(path) == 0) {
                        mountPath = line.split(' ')[1];
                        break;
                    }
                }
                mtab.close();
            }
            if (!mountPath) {
                mountPath = '/tmp/backup_' + GeckoJS.String.uuid();
                let mountFile = new GeckoJS.File(mountPath);
                mountFile.mkdir();
                this.execute('/bin/mount', [path, mountPath]);
            }

            return mountPath;
        },

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

            var script = this._scriptPath + "backup.sh";
            let evt_data = {script: script, args: args, skip: false};
            if (this.dispatchEvent('beforeBackupToLocal', evt_data)) {

                this.flushPrefs(); // flush it.

                // close all database connections
                GeckoJS.ConnectionManager.closeAll();

                script = evt_data.script;
                args = evt_data.args;

                this.log('DEBUG', 'backup script [' + script + ']');
                this.log('DEBUG', 'backup args [' + this.dump(args) + ']');

                if (evt_data.skip || this.execute(script, args)) {
                    this.execute("/bin/sh", ["-c", "/bin/sync; /bin/sleep 1; /bin/sync;"]);
                    NotifyUtils.info(_('<Backup to Local Storage> is done'));
                }

                this._restart();
            }
            this.refresh();
            this._busy = false;
            this.setButtonState();
            waitPanel.hidePopup();
        },

        backupToStick: function() {
            if (this._busy) return;
            if (!this.checkBackupDevice(this._selectedDevice)){
                NotifyUtils.info(_('Media not found!! Please attach the external storage device...'));
                return;
            }
            this._busy = true;
            var waitPanel = this._showWaitPanel(_('Copying Backup Data to External Media'));
            this.setButtonState();

            var localObj = this.getListObjLocalBackup();
            var index = localObj.selectedIndex;
            var datas = localObj.datasource._data;

            if (index >= 0) {
                var dir = datas[index].dir;
                // do copy from local to stick
                // var param = "-fr " + this._localbackupDir + dir + " " + this._stickbackupDir + dir;
                var params = ["-fr", this._localbackupDir + dir, this._stickbackupDir];

                // log user process
                this.log('FATAL', 'backupToStick file: [' + dir +']');

                if (this.execute("/bin/cp", params)) {
                    this.execute("/bin/sh", ["-c", "/bin/sync; /bin/sleep 1; /bin/sync;"]);
                    NotifyUtils.info(_('<Backup to External Storage> is done'));
                }
            } else {
                NotifyUtils.info(_('Please select a local backup first'));
            }

            this.refresh();
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

                    var script = this._scriptPath + "restore.sh";
                    let evt_data = {script: script, args: args, skip: false};
                    if (this.dispatchEvent('beforeRestoreFromLocal', evt_data)) {

                        this.flushPrefs(); // flush it.

                        // close all database connections
                        GeckoJS.ConnectionManager.closeAll();

                        script = evt_data.script;
                        args = evt_data.args;

                        this.log('DEBUG', 'restore script [' + script + ']');
                        this.log('DEBUG', 'restore args [' + this.dump(args) + ']');

                        if (evt_data.skip || this.execute(script, args )) {
                            if(withSystem) {
                                this._reboot();
                            }else {
                                this._restart();
                            }
                            NotifyUtils.info(_('<Restore from Local backup> is done!!'));
                        } else {
                            this._restart();
                        }
                    }
                }
            } else {
                NotifyUtils.info(_('Please select a local backup to restore from'));
            }

            this._busy = false;
            this.setButtonState();
            waitPanel.hidePopup();
        },

        restoreFromStick: function() {
            if (this._busy) return;
            if (!this.checkBackupDevice(this._selectedDevice)){
                NotifyUtils.info(_('Media not found!! Please attach the external storage device...'));
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

                var confirmMessage = _("Do you want to restore [%S] from external media [%S]?", [datas[index].time, this._selectedDevice.label]) + "\n" + _("If you execute restore now, the system will restart automatically after you return to the Main Screen.");
                if (withSystem) confirmMessage += "\n\n" + _("restore_with_system.confirm_message");
                
                if (GREUtils.Dialog.confirm(this.topmostWindow, _("Confirm Restore"), confirmMessage)) {

                    // log user process
                    this.log('FATAL', 'restoreFromStick file: [' + dir + '] withSystem: [' + withSystem +']');

                    this.sleep(100);

                    var script = this._scriptPath + "restore.sh";
                    let evt_data = {script: script, args: args, skip: false};
                    if (this.dispatchEvent('beforeRestoreFromRemote', evt_data)) {

                        this.flushPrefs(); // flush it.

                        // close all database connections
                        GeckoJS.ConnectionManager.closeAll();

                        script = evt_data.script;
                        args = evt_data.args;

                        this.log('DEBUG', 'restore script [' + script + ']');
                        this.log('DEBUG', 'restore args [' + this.dump(args) + ']');

                        if (evt_data.skip || this.execute(this._scriptPath + "restore.sh", args)){
                            if(withSystem) {
                                this._reboot();
                            }else {
                                this._restart();
                            }
                            NotifyUtils.info(_('<Restore from External Backup> is done!!'));
                        }else {
                            this._restart();
                        }
                    }
                }
            } else {
                NotifyUtils.info(_('Please select an external backup to restore from'));
            }

            this._busy = false;
            this.setButtonState();
            waitPanel.hidePopup();
        },

        flushPrefs: function() {
            try {
                var mPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);

                mPrefService.savePrefFile(null);

                var profD = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("ProfD", Components.interfaces.nsIFile);
                var userJs = profD.clone(); userJs.append('user.js');
                mPrefService.savePrefFile(userJs);

                this.sleep(200);

                // chmod to 664
                var prefsjs = GeckoJS.Configure.read('ProfD') + '/prefs.js';
                var nsiPrefs = GREUtils.File.getFile(prefsjs);
                nsiPrefs.permissions = 0664;

                userJs.permissions = 0664;

            }catch(e) {
                this.log('ERROR', 'Error reload prefs.js');
            }
        },

        // initialize
        load: function() {

            this._dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            this._scriptPath = this._dataPath + "/scripts/"
            this._localbackupDir = this._dataPath + "/backups/";

            this._availableDevices = this.scanBackupDevices();
            if (this._availableDevices.length == 1) {
                this.selectDevice(this._availableDevices[0]);
            }
            else {
                this.selectDevice();
            }
            this.validateForm();
        },

        selectDevice: function(device) {
            var deviceLabelObj = document.getElementById('scandevices');
            if (device) {
                if (this.checkBackupDevice(device)) {
                    deviceLabelObj.label = device.label;
                }
                else {
                    deviceLabelObj.label = _('Media [%S] not ready', [device.label]);
                }
            }
            else {
                deviceLabelObj.label = _('Please select media');
            }
            this._selectedDevice = device;

            this.refresh();
        },

        pickBackupDevices: function() {
            // scan list
            this._availableDevices = this.scanBackupDevices();

            var screenwidth = GeckoJS.Session.get('screenwidth');
            var screenheight = GeckoJS.Session.get('screenheight');

            var aURL = 'chrome://viviecr/content/select_backup_device.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth*.8 + ',height=' + screenheight*.8;
            var inputObj = {
                devices: this._availableDevices
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select External Backup Media'), features, inputObj);

            if (inputObj.ok) {
                let index = inputObj.device;
                if (index > -1 && index < this._availableDevices.length) {
                    this.selectDevice(this._availableDevices[index]);
                }
            }
        },

        refresh: function() {
            var panelViewLocal = new BackupFilesView(this._localbackupDir);
            this.getListObjLocalBackup().datasource = panelViewLocal;

            var panelViewStick = new BackupFilesView(this._stickbackupDir);
            this.getListObjStickBackup().datasource = panelViewStick;
            
            this.validateForm();
        },

        select: function(){
            this.validateForm();
        },

        validateForm: function() {
            var backuptostickBtn = document.getElementById('backuptostick');
            var restorefromlocalBtn = document.getElementById('restorefromlocal');
            var restorefromstickBtn = document.getElementById('restorefromstick');

            var localListObj = document.getElementById('localbackupscrollablepanel');
            var externalListObj = document.getElementById('stickbackupscrollablepanel');

            var localSelected = localListObj.selectedItems.length > 0;
            var externalSelected = externalListObj.selectedItems.length > 0;

            backuptostickBtn.setAttribute('disabled', !localSelected || !this._selectedDevice);
            restorefromlocalBtn.setAttribute('disabled', !localSelected);
            restorefromstickBtn.setAttribute('disabled', !externalSelected);
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();

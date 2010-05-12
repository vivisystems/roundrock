(function(){

    /**
     * This controller handles the recovery of user preference file prefs.js
     */

    var __controller__ = {

        name: 'UserPrefs',

        _script: 'restore_userprefs.sh',
        _dataPath: null,
        _localbackupDir: null,
        _scriptPath: null,

        initial: function() {
            this._dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            this._localbackupDir = this._dataPath + '/backups/';
            this._scriptPath = this._dataPath + "/scripts/"
        },

        // execute external commands
        _execute: function(cmd, param) {
            try {
                var exec = new GeckoJS.File(cmd);
                exec.run(param, true);
                exec.close();
                return true;
            }
            catch (e) {
                NotifyUtils.warn(_('Failed to execute command (%S).', [cmd + ' ' + param]));
                return false;
            }
        },
        // locate recovery source files from backup directories
        _locateRecoverySources: function() {

            let sources = [];
            let dir = this._localbackupDir

            // make sure local backup directory exists
            sources = new GeckoJS.Dir.readDir(dir, {
                type: 'd'
            }).filter(function(d) {
                let files = GeckoJS.Dir.readDir(d, {
                    type: 'f', name: /profile\.tbz|prefs\.js/
                });
                return (files.length > 0);
            });

            return sources
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

        // perform recovery of user preferences
        recover: function() {

            // check for access
            if (!this.Acl.isUserInRole('acl_manage_backup')) return;

            let sources = this._locateRecoverySources() || [];

            if (sources && sources.length > 0) {

                let backups = [];
                sources.forEach(function(f) {
                    backups.push({path: f.path, name: f.leafName})
                })

                let width = (GeckoJS.Session.get('screenwidth') || 800) * .9;
                let height = (GeckoJS.Session.get('screenheight') || 600) * .9;

                let aURL = 'chrome://viviecr/content/select_recovery_source.xul';
                let aArguments = {backups: backups};
                let aFeatures = 'chrome,modal,dialog,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height;

                let win = this.topmostWindow;
                if (win.document.documentElement.id == 'viviposMainWindow'
                    && win.document.documentElement.boxObject.screenX < 0) {
                    win = window;
                }
                win.openDialog(aURL,
                               _('Select Source for Recovery'),
                               aFeatures,
                               aArguments);

                if (aArguments.ok) {
                    if (GREUtils.Dialog.confirm(this.topmostWindow, _('User Preference Recovery'), _('Are you sure you want to restore user preferences from the selected backup [%S]? If you choose to proceed with recovery, application will restart immediately.', [aArguments.name]))) {
                        this.log('WARN', 'Executing user preference recovery from [' + aArguments.source + ']');

                        // check if script exists
                        var exec = new GeckoJS.File(this._scriptPath + this._script);
                        if (exec.isExecutable()) {

                            // select recovery target
                            let source = aArguments.source + '/prefs.js';
                            let mode = 'prefs';
                            let dest = GeckoJS.Configure.read('ProfD');

                            if (!GeckoJS.File.exists(source)) {
                                source = aArguments.source + '/profile.tbz';
                                mode = 'profile';
                                if (!GeckoJS.File.exists(source)) {
                                    source = null;
                                }
                            }
                            if (source) {
                                this.flushPrefs();

                                let mainController = GeckoJS.Controller.getInstanceByName('Main');
                                let waitPanel;
                                if (mainController) {
                                    waitPanel = mainController._showWaitPanel('wait_panel', 'wait_caption', _('Restoring User Preferences...'), 200, true);
                                }
                                exec.run([mode, source, dest], true);
                                
                                if (waitPanel) waitPanel.hidePopup();
                                GREUtils.restartApplication();
                            }
                            else {
                                this.log('ERROR', 'User preference backup source no longer exists in backup [' + aArguments.source + ']');
                                GREUtils.Dialog.alert(this.topmostWindow, _('User Preference Recovery'), _('Recovery source is no longer available; recovery cannot be performed.'));
                            }
                        }
                        else {
                            this.log('ERROR', 'User preference recovery script [' + exec.path + '] missing');
                            GREUtils.Dialog.alert(this.topmostWindow, _('User Preference Recovery'), _('Required script is missing; recovery cannot be performed.'));
                        }
                    }
                }
            }
            else {
                GREUtils.Dialog.alert(this.topmostWindow, _('User Preference Recovery'), _('No backup of user preferences found'));
            }
        }

    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if (main) main.addEventListener('afterInitial', function() {
                                                            main.requestCommand('initial', null, 'UserPrefs');
                                                        });
        }, false);
})();

(function(){

    var BackupFilesView = window.BackupFilesView = GeckoJS.NSITreeViewArray.extend({
        
        init: function(dir) {

            this._data = [];
            this._files = null;
            this._timedata = [];

            this._files = new GeckoJS.Dir.readDir(dir).sort(function(a, b) {if (a.leafName < b.leafName) return -1; else if (a.leafName > b.leafName) return 1; else return 0;});

            var self = this;
            var regexp = new RegExp(dir + "|.pak","g");
            this._files.forEach(function(o){
                var str = o.path;
                var timestr = str.replace(regexp, '');
                var typestr = '';
                self._data.push({time: timestr, type: typestr});
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
        _localbackupDir: null,

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

        backupToLocal: function () {
            //
            alert("backupToLocal");
        },

        backupToStick: function () {
            //
            alert("backupToStick");
        },

        restoreFromLocal: function () {
            //
            alert("restoreFromLocal");
        },

        restoreFromStick: function () {
            //
            alert("restoreFromStick");
        },

        load: function (data) {

            this._localbackupDir = GeckoJS.Configure.read('vivipos.fec.settings.backup.localbackupdir');
            this._stickbackupDir = GeckoJS.Configure.read('vivipos.fec.settings.backup.stickbackupdir');
            if (!this._localbackupDir) this._localbackupDir = '/var/tmp/vivipos/system_backup/';
            if (!this._stickbackupDir) this._stickbackupDir = '/var/tmp/vivipos/system_stick_backup/';

            // path with '/' end
            this._localbackupDir = (this._localbackupDir + '/').replace(/\/+/g,'/');
            this._stickbackupDir = (this._stickbackupDir + '/').replace(/\/+/g,'/');

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


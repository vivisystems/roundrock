var SyncSettingModel = window.SyncSettingModel =  GeckoJS.BaseObject.extend({
    name: 'SyncSetting',

    basePath: '/var/tmp',

    settingFile: 'sync_settings.ini',

    _setting: {},

    cached: false, // not thread safe

    /**
     * use ini for settings not database
     */
    read: function() {
        var isSetting = this.isSetting();

        if (!isSetting) return null;

        if (this.cached) {
            var setting  = GeckoJS.Session.get('SYNC_SETTINGS');
            if(setting) return setting;
        }

        var path = this.getSettingFile();
        var file = new GeckoJS.File(path);
        file.open("r");

        var bufs = file.readAllLine();

        file.close();
        bufs.forEach(function(buf){
            var t = buf.split('=');
            this._setting[t[0]] = t[1];
        }, this);

        if (this.cached) {
            GeckoJS.Session.set('SYNC_SETTINGS', this._setting);
        }

        return this._setting;
    },

    save: function(setting) {
        if(!setting) return ;

        this._setting = GREUtils.extend(this._setting, setting);

        var bufs = "";
        for (var key in this._setting) {
            bufs += key +'='+ this._setting[key] + '\n';
        }

        var path = this.getSettingFile();
        var file = new GeckoJS.File(path);
        
        file.open("w");
        file.write(bufs);
        file.close();

        if (this.cached) {
            GeckoJS.Session.set('SYNC_SETTINGS', this._setting);
        }

        
    },

    isSetting: function() {

        var path = this.getSettingFile();
        var file = new GeckoJS.File(path);
        return file.exists();
    },

    getSettingFile: function() {
        return (this.basePath + '/' + this.settingFile);
    }

});

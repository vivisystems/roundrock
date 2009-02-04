(function() {

const Cc = Components.classes;
const Ci = Components.interfaces;

/*
 * GeckoJS and GREUtils support events , so not THREAD SAFED
 *
 * use native xpcom operations.
 */

var SyncSetting = window.SyncSetting = function(){
    this.name = 'SyncSetting';
};

SyncSetting.settingFile = 'sync_settings.ini';

// cached settings
SyncSetting._setting = false;

/**
 * use ini for settings not database
 */
SyncSetting.prototype.read = function() {

        if (!this.isSetting()) return null;

        if (SyncSetting._setting) return SyncSetting._setting;

        SyncSetting._setting = {};

        var file = this.getSettingFile(); // nsILocalFile

        var iniparser = this.getINIParser(file); // nsIINIParser

        var keysEnum =  iniparser.getKeys('main');
        
        while (keysEnum.hasMore()) {
            var key = keysEnum.getNext();
            
            var value = iniparser.getString('main', key);

            SyncSetting._setting[key] = value;
        }

        return (SyncSetting._setting);

};

SyncSetting.prototype.save = function(setting) {

        if(!setting) return ;

	// init settings object
	if(!SyncSetting._setting) SyncSetting._setting = {};

        // copy setting value to SyncSetting
        for (var key in setting) {
            SyncSetting._setting[key] = setting[key];
        }

        var bufs = "[main]\n";
        for (var key in SyncSetting._setting) {
            bufs += key +'='+ SyncSetting._setting[key] + '\n';
        }
        bufs += '\n';

        var file = this.getSettingFile();

        this.writeIniFile(file, bufs);

};

SyncSetting.prototype.isSetting = function() {

        var file = this.getSettingFile();
        
        return file.exists();
        
};

/**
 *
 * @return {nsILocalFile}
 */
SyncSetting.prototype.getSettingFile = function() {
    
    // var path = SyncSetting.basePath + '/' + SyncSetting.settingFile;
    // var file = Cc["@mozilla.org/file/local;1"].createInstance(Ci.nsILocalFile);
    // file.initWithPath(path);

    var file = Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties).get("ProfD", Ci.nsIFile);

    file.append(SyncSetting.settingFile);

    return file;

};

SyncSetting.prototype.getINIParser = function(file) {

    var iniparser = Cc["@mozilla.org/xpcom/ini-parser-factory;1"].getService(Ci.nsIINIParserFactory).createINIParser(file);

    return iniparser;
};


SyncSetting.prototype.writeIniFile = function(file, str) {

    // file is nsIFile, data is a string
    var foStream = Cc["@mozilla.org/network/file-output-stream;1"].createInstance(Ci.nsIFileOutputStream);

    // use 0x02 | 0x10 to open file for appending.
    foStream.init(file, 0x02 | 0x08 | 0x20, 0666, 0);
    // write, create, truncate

    var charset = "UTF-8";

    var os = Cc["@mozilla.org/intl/converter-output-stream;1"].createInstance(Ci.nsIConverterOutputStream);

    // This assumes that fos is the nsIOutputStream you want to write to
    os.init(foStream, charset, 0, 0x0000);

    os.writeString(str);

    os.close();
    foStream.close();

};

})();

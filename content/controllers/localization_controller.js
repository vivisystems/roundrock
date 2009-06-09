(function(){

    /**
     * Localization Editor
     */

    var __controller__ = {
        name: 'Localization',

        load: function() {
            var chromeRegInstance = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
            var xulChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIXULChromeRegistry);

            // retrieve list of packages requesting localization editor support
            var packages = GeckoJS.Configure.read('vivipos.fec.registry.localization.package');

            var selectedLocale = xulChromeReg.getSelectedLocale('viviecr');

            // retrieve files from base locales
            var localeFiles = [];
            for (var pkg in packages) {

                // get base locale file path
                var chromePath = 'chrome://' + pkg + '/locale/';
                GeckoJS.Configure.write('general.useragent.locale', packages[pkg].base);
                var baseFilePath = GREUtils.File.chromeToPath(chromePath);

                // make sure file path exists and is a directory
                if (!GREUtils.File.exists(baseFilePath) || !GREUtils.File.isDir(baseFilePath)) {
                    NotifyUtils.warn(_('Path [%S] for package [%S] locale [%S] is either non-existent or is not a directory',
                                       [baseFilePath, pkg, packages[pkg].base]));
                }
                else {
                    var extensions = packages[pkg].ext.split(',');
                    var localeFile = {
                        pkg: pkg,
                        basePath: baseFilePath,
                        baseLocale: packages[pkg].base,
                        extensions: extensions
                    }

                    // retrieve individual files
                    localeFile.baseFiles = this.retrieveBaseFiles(GREUtils.Dir.readDir(baseFilePath, true), extensions);
                    
                    localeFiles.push(localeFile);
                }
            }
            // restore current locale
            GeckoJS.Configure.write('general.useragent.locale', selectedLocale);

            // retrieve file system paths to current locales
            var finalLocales = [];
            var self = this;
            localeFiles.forEach(function(f) {

                // get current locale file path
                var chromePath = 'chrome://' + f.pkg + '/locale/';
                var currentFilePath = GREUtils.File.chromeToPath(chromePath);

                // make sure file path exists and is a directory
                if (!GREUtils.File.exists(currentFilePath) || !GREUtils.File.isDir(currentFilePath)) {
                    NotifyUtils.warn(_('Path [%S] for package [%S] locale [%S] is either non-existent or is not a directory',
                                       [currentFilePath, pkg, selectedLocale]));
                }
                else {
                    f.currentLocale = selectedLocale;
                    f.currentPath = currentFilePath;
                    self.extractTranslations(f);
                    finalLocales.push(f);
                }
            });

            finalLocales.forEach(function(l) {
                self.log('DEBUG', self.dump(l.baseFiles));
            });

        },

        retrieveBaseFiles: function(files, extensions) {

            // filter files by extensions
            var self = this;
            var result = [];
            files.forEach(function(f) {
                if (f.length > 0) {
                    result = result.concat(self.retrieveBaseFiles(f, extensions));
                }
                else {
                    try {
                        var ext = GREUtils.File.ext(f);
                        if (extensions.indexOf(ext) > -1) {
                            var entry = {
                                path: f.path,
                                file: f.leafName,
                                ext: ext,
                                strings: self.extractStrings(GREUtils.Charset.convertToUnicode(GREUtils.File.readAllLine(f)), ext)
                            }
                            result.push(entry);
                        }
                    }
                    catch(e) {
                        self.log('WARN', 'failed to read base locale file ' + f.path);
                    }
                }
            });
            return result;
        },

        extractStrings: function(buf, ext, attr) {
            var entries = {};
            if (ext == 'dtd') {
                var regex = /\s*<!ENTITY\s+(\S+)\s+"([^"]*)">/g;
                var match;
                while ((match = regex.exec(buf)) != null) {
                    entries[match[1]] = {base: match[2]};
                }
            }
            return entries;
        },

        extractTranslations: function(localeFile) {
            this.log('DEBUG', 'extracting translations from directory ' + localeFile.currentPath);
            if (localeFile.baseFiles) {
                var self = this;
                localeFile.baseFiles.forEach(function(f) {
                    var file = localeFile.currentPath + '/' + f.file;
                    self.log('DEBUG', 'extracting translations from file ' + file);

                    try {
                        if (GREUtils.File.exists(file) && GREUtils.File.isReadable(file)) {
                            if (f.ext == 'dtd') {
                                var buf = GREUtils.Charset.convertToUnicode(GREUtils.File.readAllLine(file));
                                var regex = /\s*<!ENTITY\s+(\S+)\s+"([^"]*)">/g;
                                var match;
                                while ((match = regex.exec(buf)) != null) {
                                    if (f.strings[match[1]]) {
                                        f.strings[match[1]].translation = match[2];
                                    }
                                }
                            }
                        }
                    }
                    catch(e) {
                        self.log('WARN', 'failed to read current locale file ' + file);
                    }
                });
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();

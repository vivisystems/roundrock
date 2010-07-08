(function() {

    const EXT_MGR = Components.classes["@mozilla.org/extensions/manager;1"].getService(Components.interfaces.nsIExtensionManager);
    const XUL_CHROME_REG = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService().QueryInterface(Components.interfaces.nsIXULChromeRegistry);


    var __controller__ = {

        name : 'LocaleHelper',

        pkgCached: null,

        _dirtyFiles: {},
        _dirtyBit: false,

        /**
         * on ViviposStartup Check available update exists?
         */
        startup : function() {

            var self = this;

            var defaultId = 'viviecr@firich.com.tw';
            var defaultChromeName = 'viviecr';
            var langpackId = 'langpack-%LOCALE%@firich.com.tw';

            if(this.isExtensionCached(defaultId, defaultChromeName, langpackId)) return true;

            var untrans = this.getUnTranslationCount(defaultId, defaultChromeName);

            if (untrans > 0) {

                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                .getService(Components.interfaces.nsIPromptService);

                prompts.alert(null, _('VIVIECR untranslations found'),
                                    _('untranslations:') + ' ' + untrans + '\n\n' +
                                    _("Please install new version language pack or press 'OK' to auto fill untranslations.")
                             );

                this.autoFill(true);

                this.addExtensionCached(defaultId, defaultChromeName, langpackId);

            }else {
                // if cached no exists save it
                this.addExtensionCached(defaultId, defaultChromeName, langpackId);
            }

            return true;
            

        },

        /**
         * destroy listener
         */
        destroy : function() {

            var self = this;

        },

        /**
         * getExtensionVersion
         */
        getExtensionVersion: function(extId) {

            var extItem = EXT_MGR.getItemForID(extId);
            if (!extItem) return 0;

            return extItem.version;

        },

        getExtensionSelectedLocale: function(extId, chromeExtName) {

            var extItem = EXT_MGR.getItemForID(extId);
            if (!extItem) return "";

            var selectedLocale = "en";

            try {
                selectedLocale = XUL_CHROME_REG.getSelectedLocale(chromeExtName);
            }catch(e) {
                this.log('ERROR', e);
            }

            return selectedLocale;

        },

        getCachedKey: function(extId) {

            var cachedKey = "extensions.localehelper." + encodeURIComponent(extId).replace(".", "_", "g") ;
            return cachedKey;

        },

        getCachedValue: function(extId, chromeExtName, langpackId) {

            var extVersion = this.getExtensionVersion(extId);
            var selectedLocale = this.getExtensionSelectedLocale(extId, chromeExtName);
            var selectedLangpackId = langpackId.replace("%LOCALE%", selectedLocale);
            var selectedLangpackVersion = this.getExtensionVersion(selectedLangpackId);

            var cachedValue = encodeURIComponent(extId) + "_" + extVersion + "," + encodeURIComponent(selectedLangpackId) + "_" + selectedLangpackVersion ;

            return cachedValue;

        },


        isExtensionCached: function(extId, chromeExtName, langpackId) {

            if (this.getExtensionSelectedLocale(extId, chromeExtName) == 'en') return true;

            var cachedKey = this.getCachedKey(extId);
            var cachedValue = this.getCachedValue(extId, chromeExtName, langpackId);
            var prefCached = GREUtils.Pref.getPref(cachedKey);
           
            var result = false;

            if (prefCached != null) {
                if (prefCached != cachedValue) {
                    result = false;
                }else {

                    // check if reinstall the same langpack
                    var chromePath = 'chrome://' + chromeExtName + '/locale/.localehelper';
                    var baseFilePath = GREUtils.File.chromeToPath(chromePath);

                    if (GREUtils.File.exists(baseFilePath)) {
                        result = true;
                    }else {
                        result = false;
                    }
                    
                }
            }
            return result;

        },

        addExtensionCached: function(extId, chromeExtName, langpackId) {

            var cachedKey = this.getCachedKey(extId);
            var cachedValue = this.getCachedValue(extId, chromeExtName, langpackId);

            GREUtils.Pref.addPref(cachedKey, cachedValue);

            // write flag to langpack
            var chromePath = 'chrome://' + chromeExtName + '/locale/.localehelper';
            var baseFilePath = GREUtils.File.chromeToPath(chromePath);

            GREUtils.File.writeAllBytes(baseFilePath, ((new Date()).getTime()+""));


        },


        getUnTranslationCount: function(extId, chromeExtName) {

            var currentLocale = this.getExtensionSelectedLocale(extId, chromeExtName) || 'en';
            if (currentLocale == 'en' ) return 0;
            
            var self = this;

            var profD = GeckoJS.Configure.read('ProfD') || '';

            // switch to en
            GeckoJS.Configure.write('general.useragent.locale', 'en');

            // get base locale file path
            var chromePath = 'chrome://' + chromeExtName + '/locale/';
            var baseFilePath = GREUtils.File.chromeToPath(chromePath);

            // make sure file path exists and is a directory
            if (!GREUtils.File.exists(baseFilePath) || !GREUtils.File.isDir(baseFilePath)) return 0;

            var localePkg = {
                pkgName: chromeExtName,
                locales: [currentLocale, 'en'],
                basePath: baseFilePath,
                baseLocale: 'en',
                extensions: ['dtd', 'properties']
            };

            // get list of base en files
            var baseFileRecords = this._getBaseFileRecords(GREUtils.Dir.readDir(baseFilePath, true), localePkg.extensions, baseFilePath);

            if (baseFileRecords.length > 0) {
                baseFileRecords.forEach(function(record) {
                    record.baseStrings = self._extractStrings(GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(record.path)), record.ext);
                });
            }

            localePkg.files = baseFileRecords;

            // set to select locale
            GeckoJS.Configure.write('general.useragent.locale', currentLocale);

            var selectLocaleFilePath = GREUtils.File.chromeToPath(chromePath);

            // extract current installation name
            var installation = '';
            var extensionsPath = profD + '/extensions/';

            var index = selectLocaleFilePath.indexOf(extensionsPath);
            if (index > -1) {
                var descPath = selectLocaleFilePath.substr(extensionsPath.length);
                installation = descPath.split('/')[0];
            }

            // make sure file path exists and is a directory
            if (!GREUtils.File.exists(selectLocaleFilePath) || !GREUtils.File.isDir(selectLocaleFilePath)) {
                return 0;
            }
            else {
                localePkg.currentLocale = currentLocale;
                localePkg.currentPath = selectLocaleFilePath;
                localePkg.installName = installation;
                localePkg.installPath = extensionsPath + installation
            }
            self._extractTranslations(localePkg);

            this.pkgCached = localePkg;

            // restore to current locale
            GeckoJS.Configure.write('general.useragent.locale', currentLocale);

            return localePkg.emptyCount;


        },

        /**
         * from localization editor
         */
        autoFill: function(save) {

            var pkg = this.pkgCached;

            if (pkg && pkg.emptyCount > 0) {
                var modified = false;
                for (var i = 0; i < pkg.strings.length; i++) {
                    if (!pkg.strings[i].working || pkg.strings[i].working.length == 0) {
                        pkg.strings[i].working = pkg.strings[i].base;

                        this._dirtyFiles[pkg.strings[i].index] = pkg.strings[i].index;
                        modified = true;
                    }
                }
                this._dirtyBit = this._dirtyBit || modified;

                pkg.emptyCount = 0;
            }

            if (save) {
                this.save();
            }

        },

        save: function() {

            var pkg = this.pkgCached;
            
            if (pkg) {

                // look through each dirtyFile
                for (var index in this._dirtyFiles) {
                    var fileRecord = pkg.files[index];
                    var filepath = pkg.currentPath + '/' + fileRecord.file;

                    // for each string, copy working into translation
                    pkg.strings.forEach(function(str) {
                        str.translation = str.working || '';
                    });

                    // save to current locale file
                    switch(fileRecord.ext) {

                        case 'dtd':
                            this.saveDTD(pkg.strings, index, filepath);
                            break;

                        case 'properties':
                            this.saveProperties(pkg.strings, index, filepath);
                            break;
                    }
                }

                this._dirtyFiles = {};
                this._dirtyBit = false;
                
            }
            else {
                this.log('ERROR', 'save invoked when no package file has been selected');
            }
        },

        saveDTD: function(strings, index, filepath) {
            // write to in-memory buffer;
            var buf = ''
            strings.forEach(function(str) {
                if (str.index == index)
                    buf += '<!ENTITY ' + str.key + ' "' + str.translation + '">\n';
            });
            var fp = new GeckoJS.File(filepath, true);
            fp.open('w');
            if (!fp.write(buf)) {
                this.log('ERROR', 'Failed to write DTD to [' + filepath + ']');
                NotifyUtils.error(_('Failed to write DTD to file [%S]', [filepath]));
            }
            fp.close();
        },

        saveProperties: function(strings, index, filepath) {
            // write to in-memory buffer;
            var buf = ''
            strings.forEach(function(str) {
                if (str.index == index)
                    buf += (str.key + '=' + str.translation + '\n\n');
            });
            var fp = new GeckoJS.File(filepath, true);
            fp.open('w');
            if (!fp.write(buf)) {
                NotifyUtils.error(_('Failed to write Properties to file [%S]', [filepath]));
                this.log('ERROR', 'Failed to write Properties to [' + filepath + ']');
            }
            fp.close();
        },

        _getBaseFileRecords: function(files, extensions, root) {

            // filter files by extensions
            var self = this;
            var result = [];
            var rootLength = root.length;

            files.forEach(function(f) {
                if (f.length > 0) {
                    result = result.concat(self._getBaseFileRecords(f, extensions, root));
                }
                else {
                    var ext = GREUtils.File.ext(f);
                    if (extensions.indexOf(ext) > -1) {
                        var file = f.path.substr(rootLength + 1, f.path.length - rootLength - 1);
                        //self.log('WARN', 'extracting base strings from ' + file);
                        result.push({path: f.path,
                                     file: file,
                                     ext: ext});
                    }
                }
            });
            return result;
        },

        _extractStrings: function(buf, ext, attr) {
            var entries = {};
            var match;
            if (ext == 'dtd') {
                var regexDTD = /^\s*<!ENTITY\s+(\S+)\s+"([^"]*)"\s*>\s*$/gm;
                while((match = regexDTD.exec(buf)) != null) {
                    entries[match[1]] = {base: match[2]};
                }
            }
            else if (ext == 'properties') {
                var regexProp = /^\s*([^#].*?)=(.*)\s*$/gm;
                while ((match = regexProp.exec(buf)) != null) {
                    entries[match[1]] = {base: match[2]};
                }
                //this.log('WARN', GeckoJS.BaseObject.dump(entries));
            }
            return entries;
        },

        _extractTranslations: function(pkg) {
            //this.log('WARN', 'extracting translations from directory ' + localeFile.currentPath);
            var emptyStrings = [];
            var translatedStrings = [];
            var totalCount = 0;
            var emptyCount = 0;

            if (pkg.files) {
                for (var index = 0; index < pkg.files.length; index++) {
                    var f = pkg.files[index];

                    // first, clear existing translations, if any
                    var strings = GeckoJS.BaseObject.getValues(f.baseStrings);
                    strings.forEach(function(str) {delete str.translation;});

                    var file = pkg.currentPath + '/' + f.file;

                    try {
                        if (GREUtils.File.exists(file) && GREUtils.File.isReadable(file)) {
                            //this.log('WARN', 'extracting translations from file ' + file);
                            var match;
                            var buf;
                            if (f.ext == 'dtd') {
                                buf = GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(file));
                                var regexDTD = /\s*<!ENTITY\s+(\S+)\s+"([^"]*)"\s*>\s*/g;
                                while ((match = regexDTD.exec(buf)) != null) {
                                    if (f.baseStrings[match[1]]) {
                                        f.baseStrings[match[1]].translation = match[2];
                                    }
                                }
                            }
                            else if (f.ext == 'properties') {
                                buf = GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(file));
                                var regexProp = /^\s*([^#].*?)=(.*)\s*$/gm;
                                while ((match = regexProp.exec(buf)) != null) {
                                    if (f.baseStrings[match[1]]) {
                                        f.baseStrings[match[1]].translation = match[2];
                                    }
                                }
                                //this.log('WARN', GeckoJS.BaseObject.dump(entries));
                            }
                            //self.log('WARN', 'completed extraction of translations from file ' + file);
                        }

                        // convert strings to array
                        for (var key in f.baseStrings) {
                            totalCount++;
                            if (f.baseStrings[key].translation) {
                                translatedStrings.push({index: index,
                                                        key: key,
                                                        base: f.baseStrings[key].base,
                                                        working: f.baseStrings[key].translation,
                                                        translation: f.baseStrings[key].translation});
                                if (f.baseStrings[key].translation.length == 0) {
                                    emptyCount++;
                                }
                            }
                            else {
                                emptyStrings.push({index: index,
                                                   key: key,
                                                   base: f.baseStrings[key].base,
                                                   working: '',
                                                   translation: ''});
                                emptyCount++;
                            }
                        }
                    }
                    catch(e) {
                        this.log('WARN', 'failed to read current locale file ' + file);
                    }
                };
                // sort strings
                translatedStrings = translatedStrings.sort(function(a, b) {return a.key > b.key});
                emptyStrings = emptyStrings.sort(function(a, b) {return a.key > b.key});
                pkg.strings = emptyStrings.concat(translatedStrings);
                pkg.totalCount = totalCount;
                pkg.emptyCount = emptyCount;
            }
            else {
                this.log('WARN', 'no base files');
                pkg.strings = [];
                pkg.totalCount = pkg.emptyCount = 0;
            }
        }


		

    };

    GeckoJS.Controller.extend(__controller__);

    // mainWindow register stock initial
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"]
    .getService(Components.interfaces.nsIWindowMediator)
    .getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {

        window.addEventListener('ViviposStartup', function() {
            $do('startup', null, 'LocaleHelper');
        }, false);

    }

})();

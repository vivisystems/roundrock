(function(){

    /**
     * Localization Editor
     */

    var __controller__ = {
        name: 'Localization',

        _menu: null,

        _list: null,

        _packages: null,

        _dirtyBit: false,

        _dirtyFiles: {},

        _currentLocale: null,

        _currentIndex: -1,

        _currentPkg: null,

        _currentEntryIndex: -1,

        _containers: {},

        load: function() {
            var self = this;
            this._list = document.getElementById('editlist');

            var profD = GeckoJS.Configure.read('ProfD') || '';
            var menu = document.getElementById('package');

            var chromeRegInstance = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
            var xulChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIXULChromeRegistry);
            var toolkitChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIToolkitChromeRegistry);

            // retrieve list of packages requesting localization editor support
            var packages = GeckoJS.Configure.read('vivipos.fec.registry.localization.package');

            var selectedLocale = xulChromeReg.getSelectedLocale('viviecr');
            this._currentLocale = selectedLocale;

            var localeObj = document.getElementById('locale');
            if (localeObj) localeObj.value = '[' + selectedLocale + ']';

            // retrieve files from base locale
            var localePkgs = [];
            for (var pkgName in packages) {

                // get available locales
                var availableLocales = toolkitChromeReg.getLocalesForPackage(pkgName);

                // get base locale file path
                var chromePath = 'chrome://' + pkgName + '/locale/';
                GeckoJS.Configure.write('general.useragent.locale', packages[pkgName].base);
                var baseFilePath = GREUtils.File.chromeToPath(chromePath);

                // make sure file path exists and is a directory
                if (!GREUtils.File.exists(baseFilePath) || !GREUtils.File.isDir(baseFilePath)) {
                    NotifyUtils.warn(_('Path [%S] for package [%S] locale [%S] is either non-existent or is not a directory',
                                       [baseFilePath, pkgName, packages[pkgName].base]));
                }
                else {
                    var extensions = packages[pkgName].ext ? packages[pkgName].ext.split(',') : [];
                    var localePkg = {
                        pkgName: pkgName,
                        basePath: baseFilePath,
                        baseLocale: packages[pkgName].base,
                        extensions: extensions
                    }

                    // get list of files
                    var baseFileRecords = this._getBaseFileRecords(GREUtils.Dir.readDir(baseFilePath, true), extensions, baseFilePath);

                    if (baseFileRecords.length > 0) {
                        baseFileRecords.forEach(function(record) {
                            record.strings = self._extractStrings(GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(record.path)), record.ext);
                        });
                    }

                    localePkg.files = baseFileRecords;
                    localePkgs.push(localePkg);

                    // add to package menu
                    if (menu) {
                        var menuitem = menu.appendItem(pkgName);
                        if (menuitem) menuitem.setAttribute('style', 'text-align: left');
                    }
                }
            }
            this._menu = menu;

            // restore current locale
            GeckoJS.Configure.write('general.useragent.locale', selectedLocale);

            // retrieve file system paths to current locales
            localePkgs.forEach(function(p) {

                // get current locale file path
                var chromePath = 'chrome://' + p.pkgName + '/locale/';
                var currentFilePath = GREUtils.File.chromeToPath(chromePath);

                // extract current installation name
                var installation = '';
                var extensionsPath = profD + '/extensions/';

                var index = currentFilePath.indexOf(extensionsPath);
                if (index > -1) {
                    var descPath = currentFilePath.substr(extensionsPath.length);
                    installation = descPath.split('/')[0];
                }

                // make sure file path exists and is a directory
                if (!GREUtils.File.exists(currentFilePath) || !GREUtils.File.isDir(currentFilePath)) {
                    NotifyUtils.warn(_('Path [%S] for package [%S] locale [%S] is either non-existent or is not a directory',
                                       [currentFilePath, pkgName, selectedLocale]));
                }
                else {
                    p.currentLocale = selectedLocale;
                    p.currentPath = currentFilePath;
                    p.installName = installation;
                }
                self._extractTranslations(p);
            });
            this._packages = localePkgs;

            /*
            localePkgs.forEach(function(p) {
                self.log('WARN', self.dump(p));
            });
            */

            // select first package
            if (localePkgs.length > 0) {
                menu.selectedIndex = 0;
                this.selectPackage(0);
            }

            this._validateForm();

        },

        // data structure
        //
        // _packages: array of locales [
        //     index: {
        //         pkg: package name,
        //         locales: available locales
        //         extensions: array of file extensions
        //         basePath: file path to base locale directory
        //         baseLocale: base locale name
        //         currentPath: file path to current locale directory
        //         currentLocale: current locale name
        //         installName: name under which the current locale package is installed
        //         installPath: path where the current locale package is installed
        //         totalCount: total number of strings in package
        //         emptyCount: number of untranslated strings in current locale file
        //         files: array of locale files [
        //             index: {
        //                 path: absolute path to base locale file
        //                 file: relative path to base locale file (rooted at base locale directory)
        //                 ext: base locale file extension
        //             }
        //         ]
        //         strings: sorted array of strings [
        //             index: {
        //                 index: index into files
        //                 key: entity key,
        //                 base: base string,
        //                 translation: translated string for the current locale
        //                 working: working translation
        //             }
        //         ]
        //     }
        // ]
        //
        loadLocale: function(locale) {

            var self = this;
            this._list = document.getElementById('editlist');

            var profD = GeckoJS.Configure.read('ProfD') || '';
            var menu = document.getElementById('package');

            var chromeRegInstance = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
            var xulChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIXULChromeRegistry);

            // retrieve list of packages requesting localization editor support
            var packages = GeckoJS.Configure.read('vivipos.fec.registry.localization.package');
            
            var selectedLocale = xulChromeReg.getSelectedLocale('viviecr');
            this._currentLocale = selectedLocale;

            var localeObj = document.getElementById('locale');
            if (localeObj) localeObj.value = '[' + selectedLocale + ']';

            // retrieve files from base locale
            var localePkgs = [];
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
                    var extensions = packages[pkg].ext ? packages[pkg].ext.split(',') : [];
                    var localePkg = {
                        pkgName: pkg,
                        basePath: baseFilePath,
                        baseLocale: packages[pkg].base,
                        extensions: extensions
                    }

                    // get list of files
                    var baseFileRecords = this._getBaseFileRecords(GREUtils.Dir.readDir(baseFilePath, true), extensions, baseFilePath);

                    if (baseFileRecords.length > 0) {
                        baseFileRecords.forEach(function(record) {
                            record.strings = self._extractStrings(GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(record.path)), record.ext);
                        });
                    }

                    localePkg.files = baseFileRecords;
                    localePkgs.push(localePkg);

                    // add to package menu
                    if (menu) {
                        var menuitem = menu.appendItem(pkg);
                        if (menuitem) menuitem.setAttribute('style', 'text-align: left');
                    }
                }
            }
            this._menu = menu;

            // restore current locale
            GeckoJS.Configure.write('general.useragent.locale', selectedLocale);

            // retrieve file system paths to current locales
            localePkgs.forEach(function(p) {

                // get current locale file path
                var chromePath = 'chrome://' + p.pkgName + '/locale/';
                var currentFilePath = GREUtils.File.chromeToPath(chromePath);

                // extract current installation name
                var installation = '';
                var extensionsPath = profD + '/extensions/';

                var index = currentFilePath.indexOf(extensionsPath);
                if (index > -1) {
                    var descPath = currentFilePath.substr(extensionsPath.length);
                    installation = descPath.split('/')[0];
                }

                // make sure file path exists and is a directory
                if (!GREUtils.File.exists(currentFilePath) || !GREUtils.File.isDir(currentFilePath)) {
                    NotifyUtils.warn(_('Path [%S] for package [%S] locale [%S] is either non-existent or is not a directory',
                                       [currentFilePath, pkg, selectedLocale]));
                }
                else {
                    p.currentLocale = selectedLocale;
                    p.currentPath = currentFilePath;
                    p.installName = installation;
                }
                self._extractTranslations(p);
            });
            this._packages = localePkgs;

            /*
            localePkgs.forEach(function(p) {
                self.log('WARN', self.dump(p));
            });
            */

            // select first package
            if (localePkgs.length > 0) {
                menu.selectedIndex = 0;
                this.selectPackage(0);
            }

            this._validateForm();
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
                var regexProp = /^\s*([^#].*)=(.*)\s*$/gm;
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
            var translatedCount = 0;

            if (pkg.files) {
                for (var index = 0; index < pkg.files.length; index++) {
                    var f = pkg.files[index];

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
                                    if (f.strings[match[1]]) {
                                        f.strings[match[1]].translation = match[2];
                                        if (match[2].length > 0) translatedCount++;
                                    }
                                }
                            }
                            else if (f.ext == 'properties') {
                                buf = GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(file));
                                var regexProp = /^\s*([^#].*)=(.*)\s*$/gm;
                                while ((match = regexProp.exec(buf)) != null) {
                                    if (f.strings[match[1]]) {
                                        f.strings[match[1]].translation = match[2];
                                        if (match[2].length > 0) translatedCount++;
                                    }
                                }
                                //this.log('WARN', GeckoJS.BaseObject.dump(entries));
                            }
                            //self.log('WARN', 'completed extraction of translations from file ' + file);
                        }

                        // convert strings to array
                        for (var key in f.strings) {
                            totalCount++;
                            if (f.strings[key].translation) {
                                translatedStrings.push({index: index,
                                                        key: key,
                                                        base: f.strings[key].base,
                                                        working: f.strings[key].translation,
                                                        translation: f.strings[key].translation});
                            }
                            else {
                                emptyStrings.push({index: index,
                                                   key: key,
                                                   base: f.strings[key].base,
                                                   working: '',
                                                   translation: ''});
                            }
                        }

                        delete f.strings;
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
                pkg.emptyCount = totalCount - translatedCount;
            }
            else {
                this.log('WARN', 'no base files');
                pkg.strings = [];
                pkg.totalCount = pkg.emptyCount = 0;
            }
        },

        _confirmSwitch: function() {
            var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                .getService(Components.interfaces.nsIPromptService);
            var check = {value: false};

            var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                        prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +
                        prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_CANCEL;

            var r = prompts.confirmEx(null, _('Localization'),
                                            _('Translations have been modified; save changes?'),
                                            flags, _('Save'), _('Discard'), "", null, check);
            return r;
        },

        _displayPackage: function(p) {
            //this.log('WARN', this.dump(p.strings));

            // set to displayTree's data source
            this._list.datasource = p.strings;

            // update empty count
            var emptyObj = document.getElementById('empty');
            emptyObj.value = p.emptyCount;
            
            // select first entry
            this._list.view.selection.select(0);
            this.selectEntry(0);
        },

        exitCheck: function(data) {
            if (this._dirtyBit) {
                var response = this._confirmSwitch();
                if (response == 2) {
                    // cancel
                    data.cancel = true;
                }
                else if (response == 1) {
                    // discard; do nothing
                    data.cancel = false;
                }
                else {
                    data.cancel = false;
                    this.save();
                }
            }
        },
        
        selectPackage: function(index) {
            // if current package is selected, do nothing and exit
            if (this._currentIndex == index) {
                return;
            }

            // update locale list

            var list = this._list;
            var pkg = this._packages[index];

            if (list && pkg) {

                if (this._dirtyBit) {

                    // file modified, save first?
                    var response = this._confirmSwitch();
                    if (response == 2) {
                        // cancel; re-select current package
                        this._menu.selectedIndex = this._currentIndex;
                        return;
                    }
                    else if (response == 1) {
                        // discard; do nothing
                    }
                    else if (response == 0) {
                        this.save();
                    }
                }
                // clear state
                this._currentPkg = pkg;
                this._dirtyBit = false;
                this._dirtyFiles = {};

                this._currentIndex = index;
                this._displayPackage(pkg);

                this._validateForm();
            }
        },

        selectEntry: function(index) {
            var indexObj = document.getElementById('index');
            var baseObj = document.getElementById('edit_base');
            var workingObj = document.getElementById('edit_working');

            var pkg = this._currentPkg;
            var entry = pkg.strings[index];

            if (entry) {
                if (indexObj) indexObj.value = parseInt(index + 1) + '/' + pkg.strings.length;
                if (baseObj) baseObj.value = entry.base;
                if (workingObj) {
                    workingObj.value = entry.working || '';
                    workingObj.removeAttribute('disabled');
                }
                this._currentEntryIndex = index;
            }

            this._validateForm();
        },

        modify: function() {
            var workingObj = document.getElementById('edit_working');
            if (workingObj) {
                var text = workingObj.value;
                var index = this._currentEntryIndex;
                var pkg = this._currentPkg;

                if (text != null) text = GeckoJS.String.trim(text);
                
                if (index > -1 && pkg && pkg.strings) {
                    var strEntry = pkg.strings[index];
                    if (strEntry) {

                        // has text changed?
                        if (text != strEntry.translation) {
                            this._dirtyFiles[strEntry.index] = strEntry.index;
                            this._dirtyBit = true;
                        }
                        
                        if (strEntry.working == '' && text.length > 0) {
                            pkg.emptyCount--;
                        }
                        else if (strEntry.working.length > 0 && text == '') {
                            pkg.emptyCount++;
                        }
                        strEntry.working = text;
                        if (this._list) this._list.invalidateRow(index);
                        
                        var emptyObj = document.getElementById('empty');
                        emptyObj.value = pkg.emptyCount;
                    }
                }
            }
            this._validateForm();
        },

        save: function() {
            if (this._currentPkg) {
                var pkg = this._currentPkg;

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

                this._validateForm();
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
            if (fp.write(buf)) {
                OsdUtils.info(_('DTD file [%S] successfully updated', [filepath]));
            }
            else {
                NotifyUtils.error(_('Failed to write DTD to file [%S]', [filepath]));
                this.log('ERROR', 'Failed to write DTD to [' + filepath + ']');
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
            if (fp.write(buf)) {
                OsdUtils.info(_('Properties file [%S] successfully updated', [filepath]));
            }
            else {
                NotifyUtils.error(_('Failed to write Properties to file [%S]', [filepath]));
                this.log('ERROR', 'Failed to write Properties to [' + filepath + ']');
            }
            fp.close();
        },

        autoFill: function() {
            var pkg = this._currentPkg;
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
                if (this._list) this._list.invalidate();

                pkg.emptyCount = 0;
                var emptyObj = document.getElementById('empty');
                emptyObj.value = pkg.emptyCount;
            }

            this._validateForm();
        },
/*
        exportXPI: function() {
                }
            }
        },
*/
        exportDialog: function () {

            // load package install.rdf file for edit
            var exports = [];
            this._packages.forEach(function(pkg) {
                var installRDF = pkg.installationPath + '/install.rdf';
                exports.push({pkg: pkg.pkgName,
                              installName: pkg.installName,
                              currenPath: pkg.currentPath,
                              rdf: GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(installRDF))});

            })

            if (exports.length  == 0) {
                NotifyUtils.warn( _( 'No exportable locale packages found' ) );
            }
            else {
                var aURL = 'chrome://viviecr/content/export_locale.xul';
                var screenwidth = GeckoJS.Session.get('screenwidth');
                var screenheight = GeckoJS.Session.get('screenheight');

                var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;

                window.openDialog(aURL,
                                  _('Export Locale'),
                                  features,
                                  [this._currentLocale, exports]);
            }

        },

        _validateForm: function() {
            var modBtnObj = document.getElementById('modify');
            var saveBtnObj = document.getElementById('save');
            var fillBtnObj = document.getElementById('auto_fill');
            var workingObj = document.getElementById('edit_working');
            var exportBtnObj = document.getElementById('export_xpi');

            // turn on modify btn if an entry has been selected
            if (this._currentPkg.baseLocale == this._currentPkg.currentLocale) {
                if (workingObj) workingObj.setAttribute('disabled', 'true');
                if (modBtnObj) modBtnObj.setAttribute('disabled', 'true');
                if (fillBtnObj) fillBtnObj.setAttribute('disabled', 'true');
                if (saveBtnObj) saveBtnObj.setAttribute('hidden', 'true');
                if (exportBtnObj) exportBtnObj.setAttribute('disabled', 'true');
            }
            else {
                var selectedEntry = -1;
                if (this._list) {
                    selectedEntry = this._list.currentIndex;
                }
                if (selectedEntry > -1) {
                    if (modBtnObj) modBtnObj.removeAttribute('disabled');
                    if (workingObj) workingObj.removeAttribute('disabled');
                }
                else {
                    if (modBtnObj) modBtnObj.setAttribute('disabled', 'true');
                    if (workingObj) workingObj.setAttribute('disabled', 'true');
                }

                // turn on fill button if empty count > 0
                if (this._currentPkg && this._currentPkg.emptyCount > 0) {
                    if (fillBtnObj) fillBtnObj.removeAttribute('disabled');
                }
                else {
                    if (fillBtnObj) fillBtnObj.setAttribute('disabled', 'true');
                }
                // turn on save btn if dirty bit is set and current locale is different from base locale
                if (this._dirtyBit && this._currentPkg)
                    if (saveBtnObj) saveBtnObj.removeAttribute('hidden');
                else
                    if (saveBtnObj) saveBtnObj.setAttribute('hidden', 'true');

                if (exportBtnObj) exportBtnObj.removeAttribute('disabled');
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();

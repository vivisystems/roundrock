(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {
        
        name: 'Localization',

        _menu: null,
        _list: null,
        _localelist: null,       
        _packages: null,
        _dirtyBit: false,
        _dirtyFiles: {},
        _requireRestart: false,
        _currentPkg: null,
        _currentLocale: null,
        _currentLocalIndex: -1,
        _currentEntryIndex: -1,
        _currentPkgIndex: -1,
        _selectedLocale: null,
        _strings: [],
        _files: [],
        _filetype: null,

        load: function() {            
            var self = this;
            this._list = document.getElementById('editlist');
            this._localelist = document.getElementById('locale');

            var menu = document.getElementById('package');

            var chromeRegInstance = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
            var xulChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIXULChromeRegistry);
            var toolkitChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIToolkitChromeRegistry);

            // retrieve list of packages requesting localization editor support
            var packages = GeckoJS.Configure.read('vivipos.fec.registry.localization.package');

            var selectedLocale = xulChromeReg.getSelectedLocale('viviecr');
            this._selectedLocale = selectedLocale;

            // retrieve files from base locale
            var localePkgs = [];
            for (var pkgName in packages) {

                // get available locales
                var localeEnumerator = toolkitChromeReg.getLocalesForPackage(pkgName);
                var locales = [];
                while (localeEnumerator.hasMore()) {
                    locales.push(localeEnumerator.getNext());
                }
                
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
                        locales: locales,
                        basePath: baseFilePath,
                        baseLocale: packages[pkgName].base,
                        extensions: extensions
                    }

                    // get list of files
                    var baseFileRecords = this._getBaseFileRecords(GREUtils.Dir.readDir(baseFilePath, true), extensions, baseFilePath);

                    if (baseFileRecords.length > 0) {
                        baseFileRecords.forEach(function(record) {
                            record.baseStrings = self._extractStrings(GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(record.path)), record.ext);
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
            this._packages = localePkgs;

            // select first package
            if (localePkgs.length > 0) {
                menu.selectedIndex = 0;
                this.selectPackage(0);
            }
            this._packages = localePkgs;

            this._validateForm();
        },

        // data structure
        //
        // _packages: array of locales [
        //     index: {
        //         pkgName: package name,
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
        _loadLocale: function(pkg, locale) {
            var self = this;

            var profD = GeckoJS.Configure.read('ProfD') || '';

            // set to given locale
            GeckoJS.Configure.write('general.useragent.locale', locale);

            // get current locale file path
            var chromePath = 'chrome://' + pkg.pkgName + '/locale/';
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
                                   [currentFilePath, pkg, locale]));
            }
            else {
                pkg.currentLocale = locale;
                pkg.currentPath = currentFilePath;
                pkg.installName = installation;
                pkg.installPath = extensionsPath + installation
            }
            self._extractTranslations(pkg);

            // restore to selected locale
            GeckoJS.Configure.write('general.useragent.locale', this._selectedLocale);
            
            /*
            self.log('WARN', self.dump(pkg));
            */

            // display locale
            this._displayStrings(pkg, pkg.strings, pkg.emptyCount);

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
        },

        _confirmSwitch: function() {
            var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                .getService(Components.interfaces.nsIPromptService);
            var check = {value: false};

            var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                        prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                        prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

            var r = prompts.confirmEx(this.topmostWindow,
                                      _('Localization'),
                                      _('Translations have been modified; save changes?'),
                                      flags, _('Save'), '', _('Discard Changes'), null, check);
            return r;
        },

        _displayStrings: function(pkg, strings, emptyCount) {
            //this.log('WARN', this.dump(p.strings));

            // set to displayTree's data source
            this._list.datasource = strings;
            this._strings = strings;
            this._files = pkg.files;

            // update total count

            // update empty count
            var emptyObj = document.getElementById('empty');
            emptyObj.value = emptyCount;
            
            // select first entry
            this._list.view.selection.select(0);
            this.selectEntry(0);
        },

        exit: function() {
            if (this._dirtyBit) {
                var response = this._confirmSwitch();
                if (response == 1) {
                    return;
                }
                else if (response == 2) {
                    // discard; do nothing
                }
                else {
                    this.save();
                }
            }
            if (this._requireRestart) {
                if (GREUtils.Dialog.confirm(this.topmostWindow,
                                            _('Localization Editor'),
                                            _('Localization changes require system restart to take full effect. Do you want to restart now (after returning to the main screen?)'))) {
                    GeckoJS.Observer.notify(null, 'prepare-to-restart', this);
                }
            }
            window.close();
        },

        filter: function() {
            var filterText = '';
            var filterObj = document.getElementById('filter');
            if (filterObj) filterText = filterObj.value;

            var emptyCount;
            var strings;

            if (filterText.length == 0) {
                strings = this._currentPkg.strings;
                emptyCount = this._currentPkg.emptyCount;
            }
            else {
                emptyCount = 0;
                filterText = filterText.toLowerCase();

                strings = this._currentPkg.strings.filter(function(str) {
                    if ((str.translation.toLowerCase().indexOf(filterText) > -1) || (str.base.toLowerCase().indexOf(filterText) > -1)) {
                        if (str.translation == null || str.translation == '') emptyCount++;
                        return true;
                    }
                    else
                        return false;
                })
            }
            this._displayStrings(this._currentPkg, strings, emptyCount);

            this.selectEntry(0);
        },

        selectPackage: function(index) {

            // if current package is selected, do nothing and exit
            if (this._currentPkgIndex == index) {
                return;
            }

            var list = this._list;
            var pkg = this._packages[index];

            if (list && pkg) {

                if (this._dirtyBit) {

                    // file modified, save first?
                    var response = this._confirmSwitch();
                    if (response == 1) {
                        // cancel; re-select current package
                        this._menu.selectedIndex = this._currentPkgIndex;
                        return;
                    }
                    else if (response == 2) {
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

                this._currentPkgIndex = index;

                // append locale to localelist
                var localelist = this._localelist;
                if (localelist) {
                    // remove existing items
                    localelist.removeAllItems();

                    // add available locales
                    var selectedIndex = -1;
                    for (var i = 0; i < pkg.locales.length; i++) {
                        var locale = pkg.locales[i];
                        var item = localelist.appendItem(locale, locale);
                        item.setAttribute('style', 'text-align:left;');
                        if (locale == this._selectedLocale) selectedIndex = i;
                    };
                    if (selectedIndex == -1) {
                        selectedIndex = 0;
                    }
                    localelist.selectedIndex = selectedIndex;
                    this.selectLocale(pkg.locales[selectedIndex]);
                }
            }
        },

        selectLocale: function(locale) {

            var localelist = this._localelist;
            var pkg = this._currentPkg;

            if (localelist && pkg) {

                if (this._dirtyBit) {

                    // file modified, save first?
                    var response = this._confirmSwitch();
                    if (response == 1) {
                        // cancel; re-select current locale
                        localelist.selectedIndex = this._currentLocaleIndex;
                        return;
                    }
                    else if (response == 2) {
                        // discard; do nothing
                    }
                    else if (response == 0) {
                        this.save();
                    }
                }
                // clear state
                this._dirtyBit = false;
                this._dirtyFiles = {};

                this._currentLocale = locale;
                this._currentLocaleIndex = localelist.selectedIndex;

                // load locale
                this._loadLocale(pkg, locale);
            }
        },

        selectEntry: function(index) {
            var indexObj = document.getElementById('index');
            var baseObj = document.getElementById('edit_base');
            var workingObj = document.getElementById('edit_working');
            var filetypeObj = document.getElementById('file_type');

            var entry = this._strings[index];
            if (entry) {
                if (indexObj) indexObj.value = parseInt(index + 1) + '/' + this._strings.length;
                if (baseObj) baseObj.value = entry.base;
                if (workingObj) {
                    workingObj.value = entry.working || '';
                    workingObj.removeAttribute('disabled');
                }
                this._currentEntryIndex = index;
                this._filetype = this._files[entry.index].ext;
            }
            else {
                if (indexObj) indexObj.value = '0/0';
                this._filetype = null;
            }
            if (filetypeObj) filetypeObj.value = this._filetype;
            
            this._validateForm();
        },

        validateText: function(text, filetype) {
            if (filetype == 'dtd') {
                var re = /[%&\"]/;
                if (re.test(text)) {
                    return GREUtils.Dialog.confirm(this.topmostWindow,
                                                   _('Localization Editor'),
                                                   _('The text you entered contains one or more special characters (%, &, ") that should be used with extreme care. Mis-use may lead to non-functional screens. Are you sure you still want to modify this translation?'));
                }
            }
            return true;
        },

        modify: function() {
            var workingObj = document.getElementById('edit_working');
            if (workingObj) {
                var text = workingObj.value;
                var index = this._currentEntryIndex;
                var pkg = this._currentPkg;

                if (text != null) text = GeckoJS.String.trim(text);
                if (!this.validateText(text, this._filetype)) {
                    return;
                }
                if (index > -1 && pkg && this._strings) {
                    var strEntry = this._strings[index];
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
                this._requireRestart = this._requireRestart || this._dirtyBit;
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

        exportDialog: function () {

            // load package install.rdf file for edit
            var pkg = this._currentPkg;
            var locale = this._currentLocale;

            var installRDF = pkg.installPath + '/install.rdf';
            var rdf = '';
            try {
                rdf = GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(installRDF));
            }
            catch (e) {
                this.log('ERROR', 'Failed to load install.rdf for package:locale [' + pkg.pkgName + ':' + locale + '] at [' + installRDF + ']');
                NotifyUtils.error(_('Failed to load install.rdf for package-locale [%S-%S] at path [%S]', [pkg.pkgName, locale, installRDF]));

                return;
            }
            var aURL = 'chrome://viviecr/content/export_locale.xul';
            var screenwidth = GeckoJS.Session.get('screenwidth');
            var screenheight = GeckoJS.Session.get('screenheight');

            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Export Locale'), features,
                                       [pkg.pkgName, locale, pkg.installPath, pkg.installName, rdf]);
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
                    if (modBtnObj) modBtnObj.setAttribute('disabled', false);
                    if (workingObj) workingObj.removeAttribute('disabled');
                }
                else {
                    if (modBtnObj) modBtnObj.setAttribute('disabled', 'true');
                    if (workingObj) workingObj.setAttribute('disabled', 'true');
                }

                // turn on fill button if empty count > 0
                if (this._currentPkg && this._currentPkg.emptyCount > 0) {
                    if (fillBtnObj) fillBtnObj.setAttribute('disabled', false);
                }
                else {
                    if (fillBtnObj) fillBtnObj.setAttribute('disabled', 'true');
                }
                // turn on save btn if dirty bit is set and current locale is different from base locale
                if (this._dirtyBit && this._currentPkg) {
                    if (saveBtnObj) saveBtnObj.removeAttribute('hidden');
                }
                else {
                    if (saveBtnObj) saveBtnObj.setAttribute('hidden', 'true');
                }
                if (exportBtnObj) exportBtnObj.setAttribute('disabled', false);
            }
        }
    };

    AppController.extend(__controller__);

})();

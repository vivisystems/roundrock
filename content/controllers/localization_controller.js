(function(){

    /**
     * Localization Editor
     */

    var __controller__ = {
        name: 'Localization',

        _tree: null,

        _editscrollabletree: null,

        _packages: null,

        _dirtyBit: false,

        _currentIndex: -1,

        _currentPkg: null,

        _currentFile: null,

        _currentEntryIndex: -1,

        _containers: {},

        // data structure
        //
        // localePkgs array of locales [
        //     index: {
        //         pkg: package name,
        //         basePath: file path to base locale directory
        //         baseLocale: base locale name
        //         currentPath: file path to current locale directory
        //         currentLocale: current locale name
        //         extensions: array of file extensions
        //         numFiles: number of base locale files
        //         baseFiles: sorted array of locale files [
        //             index: {
        //                 path: absolute path to base locale file
        //                 file: relative path to base locale file (rooted at base locale directory)
        //                 ext: base locale file extension
        //                 level: number of levels down from base locale directory
        //                 emptyCount: number of untranslated strings in current locale file
        //                 totalCount: total number of strings in base locale file
        //                 strings: array of strings in base locale file [
        //                     index: {
        //                         key: entity key,
        //                         base: base string,
        //                         translation: translated string for the current locale
        //                         working: working translation
        //                     }
        //                 ]
        //             }
        //         ]
        //     }
        // ]
        //
        load: function() {

            this._tree = document.getElementById('navtree');
            this._editscrollabletree = document.getElementById('editscrollabletree');

            var chromeRegInstance = Components.classes["@mozilla.org/chrome/chrome-registry;1"].getService();
            var xulChromeReg = chromeRegInstance.QueryInterface(Components.interfaces.nsIXULChromeRegistry);

            // retrieve list of packages requesting localization editor support
            var packages = GeckoJS.Configure.read('vivipos.fec.registry.localization.package');

            var selectedLocale = xulChromeReg.getSelectedLocale('viviecr');
            var localeObj = document.getElementById('locale');
            if (localeObj) localeObj.value = '[' + selectedLocale + ']';

            // retrieve files from base locales
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
                    var extensions = packages[pkg].ext.split(',');
                    var localePkg = {
                        pkg: pkg,
                        basePath: baseFilePath,
                        baseLocale: packages[pkg].base,
                        extensions: extensions
                    }

                    // retrieve individual files
                    var baseFiles = this._retrieveBaseFiles(GREUtils.Dir.readDir(baseFilePath, true), extensions, baseFilePath);

                    if (baseFiles.length > 0) {
                        localePkg.baseFiles = baseFiles.sort(function(a,b) {return a.path > b.path});
                        localePkg.numFiles = baseFiles.length;
                        localePkgs.push(localePkg);
                    }
                }
            }
            // restore current locale
            GeckoJS.Configure.write('general.useragent.locale', selectedLocale);

            // retrieve file system paths to current locales
            var finalLocalePkgs = [];
            var self = this;
            localePkgs.forEach(function(p) {

                // get current locale file path
                var chromePath = 'chrome://' + p.pkg + '/locale/';
                var currentFilePath = GREUtils.File.chromeToPath(chromePath);

                // make sure file path exists and is a directory
                if (!GREUtils.File.exists(currentFilePath) || !GREUtils.File.isDir(currentFilePath)) {
                    NotifyUtils.warn(_('Path [%S] for package [%S] locale [%S] is either non-existent or is not a directory',
                                       [currentFilePath, pkg, selectedLocale]));
                }
                else {
                    p.currentLocale = selectedLocale;
                    p.currentPath = currentFilePath;
                    self._extractTranslations(p);
                    finalLocalePkgs.push(p);
                }
            });

            /*
            finalLocalePkgs.forEach(function(p) {
                self.log('WARN', self.dump(p));
            });
            */
           
            // construct the hierarchical tree
            this._buildTree(finalLocalePkgs);

            // save data
            this._packages = finalLocalePkgs;

            this._validateForm();
        },


        _retrieveBaseFiles: function(files, extensions, root, level) {

            level = parseInt(level);
            if (isNaN(level)) level = 0;

            // filter files by extensions
            var self = this;
            var result = [];
            var rootLength = root.length;

            files.forEach(function(f) {
                if (f.length > 0) {
                    result = result.concat(self._retrieveBaseFiles(f, extensions, root, level + 1));
                }
                else {
                    try {
                        var ext = GREUtils.File.ext(f);
                        if (extensions.indexOf(ext) > -1) {
                            var file = f.path.substr(rootLength + 1, f.path.length - rootLength - 1);
                            //self.log('WARN', 'extracting base strings from ' + file);
                            var entry = {
                                path: f.path,
                                file: file,
                                ext: ext,
                                level: level,
                                strings: self._extractStrings(GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(f)), ext)
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

        _extractTranslations: function(localePkg) {
            //this.log('WARN', 'extracting translations from directory ' + localeFile.currentPath);
            if (localePkg.baseFiles) {
                localePkg.baseFiles.forEach(function(f) {
                    var totalCount = 0;
                    var matchCount = 0;
                    var file = localePkg.currentPath + '/' + f.file;

                    //try {
                        if (GREUtils.File.exists(file) && GREUtils.File.isReadable(file)) {
                            //self.log('WARN', 'extracting translations from file ' + file);
                            var match;
                            var buf;
                            if (f.ext == 'dtd') {
                                buf = GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(file));
                                var regexDTD = /\s*<!ENTITY\s+(\S+)\s+"([^"]*)"\s*>\s*/g;
                                while ((match = regexDTD.exec(buf)) != null) {
                                    if (f.strings[match[1]]) {
                                        f.strings[match[1]].translation = match[2];
                                        if (match[2].length > 0) matchCount++;
                                    }
                                }
                            }
                            else if (f.ext == 'properties') {
                                buf = GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(file));
                                var regexProp = /^\s*([^#].*)=(.*)\s*$/gm;
                                while ((match = regexProp.exec(buf)) != null) {
                                    if (f.strings[match[1]]) {
                                        f.strings[match[1]].translation = match[2];
                                        if (match[2].length > 0) matchCount++;
                                    }
                                }
                                //this.log('WARN', GeckoJS.BaseObject.dump(entries));
                            }
                            //self.log('WARN', 'completed extraction of translations from file ' + file);
                        }

                        // convert strings to array
                        var emptyStrings = [];
                        var translatedStrings = [];
                        for (var key in f.strings) {
                            totalCount++;
                            if (f.strings[key].translation) {
                                translatedStrings.push({key: key,
                                                        base: f.strings[key].base,
                                                        translation: f.strings[key].translation});
                            }
                            else {
                                emptyStrings.push({key: key,
                                                   base: f.strings[key].base});
                            }
                        }
                        // sort strings
                        translatedStrings = translatedStrings.sort(function(a, b) {return a.key > b.key});
                        emptyStrings = emptyStrings.sort(function(a, b) {return a.key > b.key});

                        delete f.strings;
                        f.strings = emptyStrings.concat(translatedStrings);
                        f.totalCount = totalCount;
                        f.emptyCount = totalCount - matchCount;
/*
                    }
                    catch(e) {
                        self.log('WARN', 'failed to read current locale file ' + file);
                    }
                    */
                });
            }
            else {
                this.log('WARN', 'extraction aborted: no base files');
            }
        },

        _addContainer: function(parent) {
            // add container treeitem
            var treeitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:treeitem");
            treeitem.setAttribute('open', 'false');
            treeitem.setAttribute('container', 'true');

            // create a tree row
            var treerow = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:treerow");

            // create a tree cell
            var treecell = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:treecell");

            treerow.appendChild(treecell);
            treeitem.appendChild(treerow);

            parent.appendChild(treeitem);

            var treechildren = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:treechildren");
            treeitem.appendChild(treechildren);

            treeitem.treecell = treecell;
            treeitem.treechildren = treechildren;

            return treeitem;
        },

        _addTreeItem: function(parent, label, data) {
            // create a treeitem
            var treeitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:treeitem");
            
            // create a treerow
            var treerow = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:treerow");

            // create a treecell
            var treecell = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:treecell");

            treecell.setAttribute('label', label);
            treecell.setAttribute('value', data);

            treerow.appendChild(treecell);
            treeitem.appendChild(treerow);

            parent.appendChild(treeitem);
        },

        _buildTree: function(pkgs) {
            var root = document.getElementById('navtree-root');
            if (root) {
                var self = this;
                pkgs.forEach(function(pkg) {

                    var containerNodes = {};
                    var containerLabels = {};
                    var incompletes = {};
                    var totalIncompletes = 0;
                    var level = 0;

                    containerNodes[level] = self._addContainer(root);
                    containerLabels[level] = pkg.pkg;
                    incompletes[level] = 0;

                    var pathList, folder, leaf;

                    // iterate over baseFiles
                    var baseFiles = pkg.baseFiles;
                    if (baseFiles.length > 0) {
                        baseFiles.forEach(function(f) {
                            if (f.level > level) {
                                // extract folder name
                                pathList = f.file.split('/');
                                if (pathList.length >= f.level) {
                                    folder = pathList[f.level - 1];

                                    // down one level, add container treeitem and treechildren

                                    containerNodes[f.level] = self._addContainer(containerNodes[level].treechildren);
                                    containerLabels[f.level] = folder;
                                    level = f.level;
                                    incompletes[level] = 0;
                                }
                            }
                            else if (f.level < level) {
                                for (var lvl = level; lvl > f.level; lvl--) {
                                    // display incomplete count in current level's container label
                                    containerNodes[lvl].treecell.setAttribute('folder', containerLabels[lvl]);
                                    containerNodes[lvl].treecell.setAttribute('emptyCount', incompletes[lvl]);
                                    if (incompletes[lvl] > 0) {
                                        containerLabels[lvl] += ' (' + incompletes[lvl] + ')';
                                    }
                                    containerNodes[lvl].treecell.setAttribute('label', containerLabels[lvl]);

                                    // add incompletes count to parent level's count
                                    incompletes[lvl - 1] += incompletes[lvl];
                                }
                                // return to upper level
                                level = f.level;
                            }

                            // extract leaf name
                            pathList = f.file.split('/');
                            if (pathList.length > 0) {
                                leaf = pathList[pathList.length - 1];
                            }
                            else {
                                leaf = '';
                            }

                            if (f.emptyCount > 0) {
                                incompletes[level]++;
                                totalIncompletes++;
                            }
                            f.leaf = leaf;
                            self._addTreeItem(containerNodes[level].treechildren,
                                              leaf + ((f.emptyCount > 0) ? ' (' + f.emptyCount + ')' : ''),
                                              f.path);
                        })
                        containerNodes[0].treecell.setAttribute('folder', containerLabels[0]);
                        containerNodes[0].treecell.setAttribute('emptyCount', totalIncompletes);
                        if (totalIncompletes > 0) {
                            containerLabels[0] += ' (' + totalIncompletes + ')';
                        }
                        containerNodes[0].treecell.setAttribute('label', containerLabels[0]);
                    }
                })
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

        _displayFile: function(p) {
            //this.log('WARN', this.dump(p.strings));

            // copy current translation into working
            p.strings.forEach(function(str) {
                str.working = str.translation;
            });

            // set to displayTree's data source
            this._editscrollabletree.datasource = p.strings;

            // update file name
            var fileObj = document.getElementById('edit_file');
            if (fileObj) fileObj.value = p.file + ' (' + p.totalCount + ')';

            this._editscrollabletree.view.selection.select(0);

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
        
        selectFile: function(index) {
            var tree = this._tree;
            if (tree) {
                var value = tree.view.getCellValue(index, {id: 'value'});

                // if current file is selected, do nothing and exit
                if (this._currentFile && this._currentFile.path == value) {
                    this._currentIndex = index;
                    return;
                }

                // locate pkg and base file
                var pkgs = this._packages;

                for (var i = 0; i < pkgs.length; i++) {
                    var pkg = pkgs[i];

                    for (var j = 0; j < pkg.baseFiles.length; j++) {
                        var f = pkg.baseFiles[j];
                        if (f.path == value) {

                            if (this._dirtyBit) {

                                // file modified, save first?
                                var response = this._confirmSwitch();
                                if (response == 2) {
                                    // cancel; re-select current file
                                    if (this._currentIndex > -1 && this._currentIndex < tree.view.rowCount) {
                                        var cursor = tree.view.getCellValue(this._currentIndex, {id: 'value'});
                                        if (!this._currentFile || this._currentFile.path != cursor) {
                                            this._currentIndex = -1;
                                        }
                                    }
                                    if (this._currentIndex > -1) {
                                        tree.view.selection.select(this._currentIndex);
                                    }
                                    else {
                                        tree.view.selection.clearSelection();
                                    }
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
                            this._currentFile = f;
                            this._dirtyBit = false;

                            this._currentIndex = index;
                            this._displayFile(f);

                            this._validateForm();
                            
                            return;
                        }
                    }
                }
            }
        },

        selectEntry: function(index) {
            var keyObj = document.getElementById('edit_key');
            var baseObj = document.getElementById('edit_base');
            var workingObj = document.getElementById('edit_working');
            var entry;

            if (this._currentFile && index > -1) {
                entry = this._currentFile.strings[index];
            }

            if (entry) {
                if (keyObj) keyObj.value = entry.key;
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

                if (index > -1) {
                    this._currentFile.strings[index].working = text;
                    this._dirtyBit = this._dirtyBit ||
                                     (text != this._currentFile.strings[index].translation);

                    if (this._editscrollabletree) this._editscrollabletree.invalidateRow(index);
                }
            }
            this._validateForm();
        },

        save: function() {
            if (this._currentPkg && this._currentFile) {
                var pkg = this._currentPkg;
                var file = this._currentFile;
                var filepath = pkg.currentPath + '/' + file.file;

                // for each string, copy working into translation
                file.strings.forEach(function(str) {
                    str.translation = str.working || '';
                });

                // save to current locale file
                var emptyCount;
                switch(file.ext) {

                    case 'dtd':
                        emptyCount = this.saveDTD(file.strings, filepath);
                        break;

                    case 'properties':
                        emptyCount = this.saveProperties(file.strings, filepath);
                        break;
                }
                if (emptyCount > -1 && emptyCount != file.emptyCount) {
                    // fieDelta is used to increment/decrement container counts
                    var fileDelta = 0;
                    if (emptyCount * file.emptyCount == 0) {
                        fileDelta = (emptyCount) ? 1 : -1;
                    }

                    file.emptyCount = emptyCount;
                    var items = $('[value=' + file.path + ']');

                    if (items) {
                        if (emptyCount > 0) {
                            items.each(function(i) {
                                              this.setAttribute('label', file.leaf + ' (' + emptyCount + ')');
                                          })
                        }
                        else {
                            items.each(function(i) {
                                              this.setAttribute('label', file.leaf);
                                          })
                        }
                    }

                    if (fileDelta != 0) {
                        items.parents().map(function () {
                            if (this.getAttribute('container') == 'true') {
                                var folder = this.treecell.getAttribute('folder');
                                var oldEmptyCount = this.treecell.getAttribute('emptyCount');

                                var newEmptyCount = parseInt(oldEmptyCount) + parseInt(fileDelta);
                                if (newEmptyCount == 0) {
                                    this.treecell.setAttribute('label', folder);
                                }
                                else {
                                    this.treecell.setAttribute('label', folder + ' (' + newEmptyCount + ')');
                                }
                                this.treecell.setAttribute('emptyCount', newEmptyCount);
                            }
                        })
                    }
                }
                this._dirtyBit = false;

                this._validateForm();
            }
            else {
                this.log('ERROR', 'save invoked when no package file has been selected');
            }
        },

        saveDTD: function(strings, filepath) {
            // write to in-memory buffer;
            var emptyCount = 0;
            var buf = ''
            strings.forEach(function(str) {
                if (!str.translation) emptyCount++;
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

                emptyCount = -1
            }
            fp.close();
            return emptyCount;
        },

        saveProperties: function(strings, filepath) {
            // write to in-memory buffer;
            var emptyCount = 0;
            var buf = ''
            strings.forEach(function(str) {
                if (!str.translation) emptyCount++;
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

                emptyCount = -1;
            }
            fp.close();
            return emptyCount;
        },

        _validateForm: function() {
            var modBtnObj = document.getElementById('modify');
            var saveBtnObj = document.getElementById('save');
            var fillBtnObj = document.getElementById('auto_fill');

            // turn on modify btn if an entry has been selected
            var selectedEntry = -1;
            if (this._editscrollabletree) {
                selectedEntry = this._editscrollabletree.currentIndex;
            }
            if (selectedEntry > -1)
                modBtnObj.removeAttribute('disabled');
            else
                modBtnObj.setAttribute('disabled', 'true');

            // turn on fill button if a file has been selected and empty count > 0
            if (this._currentPkg && this._currentFile && this._currentFile.emptyCount > 0) {
                fillBtnObj.removeAttribute('disabled');
            }
            else {
                fillBtnObj.setAttribute('disabled', 'true');
            }
            // turn on save btn if dirty bit is set and current locale is different from base locale
            if (this._dirtyBit && this._currentPkg && this._currentPkg.baseLocale != this._currentPkg.currentLocale)
                saveBtnObj.removeAttribute('disabled');
            else
                saveBtnObj.setAttribute('disabled', 'true');
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();

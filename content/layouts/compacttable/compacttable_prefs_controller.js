(function() {

    var __controller__ = {

        name: 'CompactTablePrefs',
        prefix: 'vivipos.fec.settings.layout.compacttable.keys',
        keySettings: null,
        numKeys: 8,
        functionArray: null,
        keyListObj: null,
        functionListObj: null,

        startup: function() {
            var prefwin = document.getElementById('prefwin');
            var displayPane = document.getElementById('displaySettingsPane');
            var logoPane = document.getElementById('logoSettingsPane');
            var expressKeyPane = document.getElementById('expressKeySettingsPane');

            if (displayPane) prefwin.addPane(displayPane);
            if (logoPane) prefwin.addPane(logoPane);
            if (expressKeyPane) prefwin.addPane(expressKeyPane);

            var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/') + '/';
            var sDstDir = datapath + "/images/pluimages/";

            // initialize default oridyct image
            var defaultImageObj = document.getElementById('defaultimage');
            if (defaultImageObj) {
                defaultImageObj.src = 'file://' + sDstDir + 'no-photo.png';
            }

            // initialize logo
            var logoImageObj = document.getElementById('logoimage');
            if (logoImageObj) {
                var logoHeight = GeckoJS.Configure.read('vivipos.fec.settings.layout.compacttable.logoHeight');
                var logoWidth = GeckoJS.Configure.read('vivipos.fec.settings.layout.compacttable.logoWidth');
                if (isNaN(logoHeight)) logoHeight = 50;
                if (isNaN(logoWidth)) logoWidth = 50;
                logoImageObj.src = 'file://' + sDstDir + 'logo.png';
                logoImageObj.setAttribute('style', 'max-height: ' + logoHeight + 'px; max-width: ' + logoWidth + 'px;');
            }

            this.functionListObj = document.getElementById('expresskey_function_tree');
            
            // populate function list
            this.populateFunctionKeys();
            
            // refresh key list
            this.keyListObj = document.getElementById('expresskey_prefs_tree');
            this.keyListObj.datasource = this.getKeySettings();
        },

        getKeySettings: function() {
            if (!this.keySettings) {
                let keys = [];
                let keyPrefs = GeckoJS.Configure.read(this.prefix) || [];
                for (let i = 0; i < this.numKeys; i++) {
                    keys[i] = {
                        name: _('Express Key') + ' [' + parseInt(i + 1) + ']',
                        functionid: (keyPrefs[i] && keyPrefs[i].functionid) ? keyPrefs[i].functionid : '',
                        linked: (keyPrefs[i] && keyPrefs[i].linked) ? keyPrefs[i].linked : '',
                        command: (keyPrefs[i] && keyPrefs[i].command) ? keyPrefs[i].command : '',
                        label: (keyPrefs[i] && keyPrefs[i].label) ? keyPrefs[i].label : '',
                        access: (keyPrefs[i] && keyPrefs[i].access) ? keyPrefs[i].access : '',
                        controller: (keyPrefs[i] && keyPrefs[i].controller) ? keyPrefs[i].controller : '',
                        data: (keyPrefs[i] && keyPrefs[i].data) ? keyPrefs[i].data : ''
                    }
                }
                this.keySettings = keys;
            }
            return this.keySettings;
        },

        saveKeySettings: function() {
            let keySettings = this.getKeySettings();
            for (let i = 0; i < keySettings.length; i++) {
                let prefix = this.prefix + '.' + parseInt(i);
                GeckoJS.Configure.write(prefix + '.functionid', keySettings[i].functionid);
                GeckoJS.Configure.write(prefix + '.linked', keySettings[i].linked);
                GeckoJS.Configure.write(prefix + '.command', keySettings[i].command);
                GeckoJS.Configure.write(prefix + '.label', keySettings[i].label);
                GeckoJS.Configure.write(prefix + '.access', keySettings[i].access);
                GeckoJS.Configure.write(prefix + '.controller', keySettings[i].controller);
                GeckoJS.Configure.write(prefix + '.data', keySettings[i].data);
            }

            // inform layout controller of changes in express key settings
            var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

            var layout = mainWindow.GeckoJS.Controller.getInstanceByName('Layout');
            if (layout) {
                layout.requestCommand('updateExpressKeys', keySettings, 'Layout');
            }
        },

        populateFunctionKeys: function() {
            var prefix = 'vivipos.fec.registry.function.programmable';

            GeckoJS.Configure.loadPreferences(prefix);
            var fns = GeckoJS.Configure.read(prefix);

            var keys = GeckoJS.BaseObject.getKeys(fns);
            var functionArray = [];

            for (var i = 0; i < keys.length; i++) {
                var newKey = {};
                newKey.functionid = keys[i];
                newKey.access = fns[keys[i]].access;
                newKey.controller = fns[keys[i]].controller;
                newKey.command = fns[keys[i]].command;
                newKey.data = fns[keys[i]].data;
                newKey.name = _(prefix + '.' + keys[i] + '.name');
                newKey.label = _(prefix + '.' + keys[i] + '.label');
                newKey.desc = _(prefix + '.' + keys[i] + '.desc');
                functionArray.push(newKey);
            }
            functionArray.sort(function(a, b) {
                if (a.name < b.name) return -1;
                else if (a.name > b.name) return 1;
                else return 0;
            });
            this.functionArray = functionArray;

            // apply function list information to keymap panel
            this.functionListObj.datasource = functionArray;
        },

        refreshKeys: function() {
            let keyListObj = document.getElementById('expresskey_prefs_tree');
            keyListObj.refresh();
        },

        selectFunctionKey: function(tree) {
            var index;
            var count = tree.selection.count;
            if (count > 0)
                index = tree.currentIndex;
            else
                index = -1;

            var descID = 'expresskey_function_desc';

            if (index > -1) {
                document.getElementById(descID).value = this.functionArray[index].desc;
            }
            else {
                document.getElementById(descID).value = '';
            }

            this.validateLinkKey();
        },

        selectExpressKey: function(tree) {
            var count = tree.selection.count;
            var index = -1;

            if (count > 0) index = tree.currentIndex;

            var entry = this.keySettings[index];

            if (!entry) {
                entry = {
                    name: '',           /* name of express key */
                    functionid: '',     /* id of linked function */
                    linked: '',         /* name of linked function */
                    label: '',          /* user assigned label */
                    data: ''            /* user entered data */
                };
            }
            else {

                if (entry.linked) {
                    // select linked function
                    var fnList = this.functionArray;
                    for (var i = 0; i < fnList.length; i++) {
                        if (entry.functionid == fnList[i].functionid) {
                            var fnTree = document.getElementById('expresskey_function_tree');
                            fnTree.currentIndex = i ;
                            fnTree.selection.select(i);
                            fnTree.treeBoxObject.ensureRowIsVisible(i);
                            break;
                        }
                    }
                }
            }
            GeckoJS.FormHelper.unserializeFromObject('expressKeyForm', entry);
            
            this.validateLinkKey();
        },

        linkFunction: function() {
            let keyIndex = this.keyListObj.currentIndex;
            let functionIndex = this.functionListObj.currentIndex;

            if (!(keyIndex > -1 && functionIndex > -1)) {
                return;
            }
            let functionKey = this.functionArray[functionIndex];
            let key = this.keySettings[keyIndex];

            if (key && functionKey) {
                key.functionid = functionKey.functionid;
                key.linked = functionKey.name;
                key.command = functionKey.command;
                key.label = functionKey.label;
                key.access = functionKey.access;
                key.controller = functionKey.controller;
                key.data = functionKey.data;
            }
            this.selectExpressKey(this.keyListObj);

            this.refreshKeys();

            this.saveKeySettings();
        },

        unlinkFunction: function() {
            let keyIndex = this.keyListObj.currentIndex;

            if (!(keyIndex > -1)) {
                return;
            }
            let key = this.keySettings[keyIndex];

            if (key) {
                key.functionid = '';
                key.linked = '';
                key.command = '';
                key.label = '';
                key.access = '';
                key.controller = '';
                key.data = '';
            }
            this.selectExpressKey(this.keyListObj);

            this.refreshKeys();

            this.saveKeySettings();
        },

        updateExpressKey: function() {
            let keyIndex = this.keyListObj.currentIndex;

            if (!(keyIndex > -1)) {
                return;
            }
            let key = this.keySettings[keyIndex];
            let valObj = GeckoJS.FormHelper.serializeToObject('expressKeyForm');
            
            if (key) {
                key.label = valObj.label;
                key.data = valObj.data;
            }
            this.selectExpressKey(this.keyListObj);

            this.refreshKeys();

            this.saveKeySettings();
        },

        validateLinkKey: function() {
            // need to validate the following buttons:
            //
            // 1 - link button
            // 2 - unlink button
            // 3 - update button
            // 4 - label textbox
            // 5 - data textbox

            let functionIndex = this.functionListObj.selectedIndex;
            let keyIndex = this.keyListObj.selectedIndex;
            let key = this.keySettings[keyIndex];

            // link button
            var ready = (functionIndex > -1) && (keyIndex > -1);
            if (ready) {
                document.getElementById('expresskey_link').removeAttribute('disabled');
            }
            else {
                document.getElementById('expresskey_link').setAttribute('disabled', 'true');
            }

            // unlink button, update button, label textbox, data textbox
            if (key && key.linked) {
                document.getElementById('expresskey_unlink').removeAttribute('disabled');
                document.getElementById('expresskey_update').removeAttribute('disabled');
                document.getElementById('expresskey_label').removeAttribute('readonly');
                document.getElementById('expresskey_data').removeAttribute('readonly');
            }
            else {
                document.getElementById('expresskey_unlink').setAttribute('disabled', 'true');
                document.getElementById('expresskey_update').setAttribute('disabled', 'true');
                document.getElementById('expresskey_label').setAttribute('readonly', 'true');
                document.getElementById('expresskey_data').setAttribute('readonly', 'true');
            }

            // label textbox
        },

        resizeLogo: function() {
            var logoImageObj = document.getElementById('logoimage');
            if (logoImageObj) {
                var logoWidth = document.getElementById('logoWidth').value;
                var logoHeight = document.getElementById('logoHeight').value;
                if (isNaN(logoHeight)) logoHeight = 50;
                if (isNaN(logoWidth)) logoWidth = 50;
                logoImageObj.setAttribute('style', 'max-height: ' + logoHeight + 'px; max-width: ' + logoWidth + 'px;');
            }
        },
        
        selectImage: function(data) {

            let targetId = data[0];
            let targetFile = data[1];

            var targetObj = document.getElementById(targetId);

            if (!targetObj) return;

            var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/') + '/';
            var sSrcDir = datapath + "/images/original/";
            if (!sSrcDir) sSrcDir = '/data/images/original/';
            sSrcDir = (sSrcDir + '/').replace(/\/+/g,'/');

            var sDstDir = datapath + "/images/pluimages/";
            if (!sDstDir) sDstDir = '/data/images/pluimages/';
            sDstDir = (sDstDir + '/').replace(/\/+/g,'/');

            var aURL = "chrome://viviecr/content/imageManager.xul";
            var aName = "imagePicker";

            var args = {
                pickerMode: true,
                directory: sSrcDir + "",
                result: false,
                file: ""
            };

            var width = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            var height = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            args.wrappedJSObject = args;
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,width=" + width + ",height=" + height, args);

            var aFile = "";
            if (args.result) {
                var aFile = args.file;
            }
            var aSrcFile = aFile.replace("file://", "");

            if (!GREUtils.File.exists(aSrcFile))
                    return false;
            var aDstFile = sDstDir + targetFile;

            GREUtils.File.remove(aDstFile);
            GREUtils.File.copy(aSrcFile, aDstFile);

            targetObj.setAttribute("src", "file://" + aDstFile + "?" + Math.random());

            return aDstFile;
        },

        /**
         * Remove image
         */
        removeImage: function(data) {

            let targetId = data[0];
            let targetFile = data[1];

            var targetObj = document.getElementById(targetId);

            if (!targetObj) return;

            var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            var sDstDir = datapath + "/images/pluimages/";
            if (!sDstDir) sDstDir = '/data/images/pluimages/';
            sDstDir = (sDstDir + '/').replace(/\/+/g,'/');
            var aDstFile = sDstDir + targetFile;

            GREUtils.File.remove(aDstFile);
            targetObj.setAttribute("src", "");

            return aDstFile;
        }
    };
    
    GeckoJS.Controller.extend(__controller__);

})()

function prefs_overlay_startup() {
    $do('startup', '', 'CompactTablePrefs');
}

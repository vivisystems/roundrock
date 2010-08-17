(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'HotkeyPrefs',

        prefTree: null,
        functionTree: null,
        functionArray: null,
        selectedFunctionIndex: null,
        hotkeys: null,
        hotkeysArray: [],
        selectedHotkeyIndex: null,

        lastLinkFunction: null,

        reserveHotKeys: {
            '$13': true,
            '$190': true,
            'ctrl-$65': true, // ctrl+a // select all
            'ctrl-$67': true, // ctrl+c // copy
            'ctrl-$79': true, // ctrl+o
            'ctrl-$81': true, // ctrl+q
            'ctrl-$82': true, // ctrl+r
            'ctrl-$83': true, // ctrl+s
            'ctrl-$86': true, // ctrl+v // paste
            'ctrl-$88': true, // ctrl+x // cut
            'ctrl-$89': true, // ctrl+y // redo
            'ctrl-$8a': true, // ctrl+z // undo
            'ctrl-alt-$66': true, // ctrl-alt+b // package builder
            'ctrl-alt-$70': true, // ctrl-alt+f // function manager
            'ctrl-alt-$76': true, // ctrl-alt+l // function manager
            'ctrl-alt-$80': true, // ctrl-alt+p // screenshot
            'ctrl-alt-$85': true, // ctrl-alt+u // restore user preferences
            '$48': true,
            '$49': true,
            '$50': true,
            '$51': true,
            '$52': true,
            '$53': true,
            '$54': true,
            '$55': true,
            '$56': true,
            '$57': true

        },

        startup: function() {

            // get function list from configure; builds data into array of objects
            // with properties: name, label, description, command, data, access, controller
            var prefix = 'vivipos.fec.registry.function.programmable';

            GeckoJS.Configure.loadPreferences(prefix);
            var fns = GeckoJS.Configure.read(prefix);

            var keys = GeckoJS.BaseObject.getKeys(fns);
            var functionArray = [];

            for (var i = 0; i < keys.length; i++) {
                let newKey = {
                    id: keys[i],
                    version: fns[keys[i]].version,
                    access: fns[keys[i]].access,
                    command: fns[keys[i]].command,
                    controller: fns[keys[i]].controller,
                    data: fns[keys[i]].data,
                    name: fns[keys[i]].name ||  _(prefix + '.' + keys[i] + '.name'),
                    label: fns[keys[i]].label || _(prefix + '.' + keys[i] + '.label'),
                    desc: fns[keys[i]].desc || _(prefix + '.' + keys[i] + '.desc')
                };
                functionArray.push(newKey);
            }
            functionArray.sort(function(a, b) {
                if (a.name < b.name) return -1;
                else if (a.name > b.name) return 1;
                else return 0;
            });
            this.functionArray = functionArray;

            // apply function list information to keymap panel
            document.getElementById('hotkey_function_tree').datasource = functionArray;

            // get hotkey prefs
            var hotkey_prefix = 'vivipos.fec.settings.hotkeys';
            GeckoJS.Configure.loadPreferences(hotkey_prefix);
            var hotkeys = GeckoJS.Configure.read(hotkey_prefix);

            if (hotkeys) {
                this.hotkeys = new GeckoJS.Map();
                this.hotkeys.unserialize(hotkeys);
            }else {
                this.hotkeys = new GeckoJS.Map();
            }

            // refresh hotkeys tree
            this.savePreferences();

        },

        checkAvailableHotkey: function(keycombo, keydisplay, modifiers) {
          
            if (!keycombo) {

                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Hot Key Configuration'),
                                      _('Please Assign Hot Key to Linking Function'));
                return false;

            }
            
            if(this.reserveHotKeys[keycombo]) {

                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Hot Key Configuration'),
                                      _('Hot Key [%S] is reserved', [keydisplay]));
                return false;
            }

            var isExists = this.hotkeys.containsKey(keycombo);
            if (isExists) {

                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Hot Key Configuration'),
                                      _('Hot Key [%S] has already been assigned', [keydisplay]));
                return false ;
            }
            
            if ( modifiers == 'shift' || modifiers.length == 0 ) {

                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Hot Key Configuration'),
                                      _('Hot Key [%S] is not allowed, please add modifiers', [keydisplay]));
                return false;
            }
            
            return true;
          
        },

        addHotkey: function() {

            if (!this.confirmChangeHotkey()) {
                return false;
            }

            var aURL = 'chrome://viviecr/content/prompt_addhotkey.xul';
            var width = GeckoJS.Session.get('screenwidth') || 800;
            var height = GeckoJS.Session.get('screenheight') || 600;
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + width * 0.8 + ',height=' + height * 0.9;
            var inputObj = {
                hotkey: null,
                name: null,
                fn: null,
                data: null,
                fn_list: this.functionArray
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Hot Key'), features, inputObj, this);

            if (inputObj.ok) {

                var fn = inputObj.fn;
                var hotkey = inputObj.hotkey;
                var name = inputObj.name;
                var data = inputObj.data;

                var inputData = {
                    name: name,
                    linked: fn.name,
                    linked_id: fn.id,
                    version: fn.version,
                    access: fn.access,
                    command: fn.command,
                    controller: fn.controller,
                    data: data
                };

                inputData = GREUtils.extend(inputData, hotkey);

                // check if  hotkey is restricted or already exists

                var keycombo = inputData.keycombo;
                var keydisplay = inputData.keydisplay;
                var modifiers = inputData.modifiers;

                if (!this.checkAvailableHotkey(keycombo, keydisplay, modifiers)) return false;

                this.hotkeys.add(keycombo, inputData);
                
                document.getElementById('hotkey_id').value = keycombo;

                this.savePreferences();

                // key order might have changed, let's locate it
                this.selectedHotkeyIndex = -1;
                this.locateHotkey(keycombo);

                OsdUtils.info(_('Hot Key [%S] for [%S] added successfully', [keydisplay, fn.name]));
                return true;
            }
            return false;
        },

        modifyHotkey: function() {

            var entry = this.lastLinkFunction;

            if (!entry) {
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Hot Key Configuration'),
                                      _('Please Linking Function to Hot Key'));
                return false;
            }

            var inputData = this.Form.serializeToObject('hotkeyForm');

            inputData.access = entry.access;
            inputData.command = entry.command;
            inputData.controller = entry.controller;

            var hotkey =  document.getElementById('hotkey_hotkey');
            var hotkeyData = {
                keycombo: hotkey.getHotkey(false),
                keydisplay: hotkey.getHotkey(true),
                modifiers: hotkey.getModifiers(false),
                keycode: hotkey.hotkeyCodeVK,
                keychar: hotkey.hotkeyChar
            };

            inputData = GREUtils.extend(inputData, hotkeyData);

            //this.log(this.dump(inputData));

            var id = inputData.id ;
            var keycombo = inputData.keycombo;
            var keydisplay = inputData.keydisplay;
            var modifiers = inputData.modifiers;

            // change hotkey, check if hotkey exists

            if (id != keycombo) {

                if (!this.checkAvailableHotkey(keycombo, keydisplay, modifiers)) return false;

                // remove old
                if (this.hotkeys.containsKey(id)) {
                    this.hotkeys.remove(id);
                }

                delete inputData.id;
            }

            this.hotkeys.add(keycombo, inputData);
            document.getElementById('hotkey_id').value = keycombo;

            this.savePreferences();

            // key order might have changed, let's locate it
            this.selectedHotkeyIndex = -1;
            this.locateHotkey(keycombo);
            
            OsdUtils.info(_('Hot Key [%S] for [%S] modified successfully', [keydisplay, inputData.name]));

            return true;
        },

        removeHotkey: function() {

            try {

                var inputData = this.Form.serializeToObject('hotkeyForm');

                var entry = this.hotkeys.get(inputData.id);

                if (!entry) {
                    return ;
                }

                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                    _('confirm delete Hot Key [%S]', [entry.keydisplay]),
                    _('Are you sure you want to delete Hot Key [%S] for [%S]?', [entry.keydisplay, entry.name]))) {
                    return;
                }

                var keycombo = entry.keycombo;
                var keydisplay = entry.keydisplay;

                this.hotkeys.remove(keycombo);

                this.savePreferences();

                // select preceding hotkey combo
                this.selectedHotkeyIndex = -1;
                var tree = document.getElementById('hotkey_prefs_tree');
                var count = 0;
                if (tree.datasource != null && tree.datasource.data != null) {
                    count = tree.datasource.data.length;
                }
                var index = -1;
                if (count > 0) {
                    index = tree.currentIndex;
                    if (index >= count) {
                        index = count - 1;
                        tree.selection.select(index);
                    }
                }
                if (index > -1) {
                    this.selectHotkey(tree);
                }
                else {
                    GeckoJS.FormHelper.reset('hotkeyForm');
                    
                    this.editableFields(false);

                    document.getElementById('modify_hotkey').setAttribute('disabled', true);
                    document.getElementById('delete_hotkey').setAttribute('disabled', true);
                }

                OsdUtils.info(_('Hot Key [%S] for [%S] removed successfully', [keydisplay, inputData.name]));
            }
            catch (e) {

                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Hot Key Configuration'),
                                          _('An error occurred while removing Hot Key [%S]. The hot key may not have been removed successfully', [inputData.name]));
            }

        },

        editableFields: function(enable) {

            $('[form="hotkeyForm"]').val('');

            var hotkey =  document.getElementById('hotkey_hotkey');

            hotkey.setHotkey("", "");


            if(enable) {
                document.getElementById('hotkey_hotkey').removeAttribute('disabled');
                document.getElementById('hotkey_name').removeAttribute('readonly');
                document.getElementById('hotkey_data').removeAttribute('readonly');
                document.getElementById('hotkey_function_tree').setAttribute('disabled', false);

            }else {
                document.getElementById('hotkey_hotkey').setAttribute('disabled', true);
                document.getElementById('hotkey_name').setAttribute('readonly', true);
                document.getElementById('hotkey_data').setAttribute('readonly', true);
                document.getElementById('hotkey_function_tree').setAttribute('disabled', true);
            }

        },

        locateHotkey: function(keycombo) {
            var hotkeys = this.hotkeysArray;
            for (var i = 0; i < hotkeys.length; i++) {
                if (hotkeys[i].keycombo == keycombo) {
                    var hotkeyTree = document.getElementById('hotkey_prefs_tree');
                    hotkeyTree.currentIndex = i;
                    hotkeyTree.selection.clearSelection();
                    hotkeyTree.selection.select(i);
                    hotkeyTree.treeBoxObject.ensureRowIsVisible(i);

                    break;
                }
            }
        },

        selectHotkey: function(tree) {
            var count = tree.selection.count;
            var index = -1;
            
            if (count > 0) index = tree.currentIndex;
            
            if (index == this.selectedHotkeyIndex && index != -1) return;

            if (!this.confirmChangeHotkey(index)) {
                tree.selection.select(this.selectedHotkeyIndex);
                return;
            }

            this.selectedHotkeyIndex = index;

            var entry = this.hotkeysArray[index];

            if (!entry){
                return ;
            }

            this.lastLinkFunction = entry ;

            this.editableFields(true);

            // select linked function
            var found = false;
            var fnList = this.functionArray;
            var fnTree = document.getElementById('hotkey_function_tree');
            for (var i = 0; i < fnList.length; i++) {
                if ((entry.linked_id && fnList[i].id && entry.linked_id == fnList[i].id) || (entry.linked == fnList[i].name)) {
                    fnTree.currentIndex = i ;
                    fnTree.selection.select(i);
                    fnTree.treeBoxObject.ensureRowIsVisible(i);

                    entry.linked = fnList[i].name;
                    found = true;
                    break;
                }
            }
            if (!found) {
                fnTree.selection.select(-1);
            }

            var valObj = {
                id: entry.keycombo,
                name: entry.name,
                linked: entry.linked,
                linked_id: entry.linked_id || '',
                version: entry.version || '',
                data: entry.data
            };
            GeckoJS.FormHelper.unserializeFromObject('hotkeyForm', valObj);

            document.getElementById('hotkey_hotkey').setHotkey(entry.keycombo, entry.keydisplay);

            document.getElementById('modify_hotkey').setAttribute('disabled', false);
            document.getElementById('delete_hotkey').setAttribute('disabled', false);

            var nameObj = document.getElementById('hotkey_name');
            nameObj.focus();

        },

        searchHotkey: function(element) {

            try {

                var keycombo = element.getHotkey(false);
                var keydisplay = element.getHotkey(true);

                var hotkeyTree = document.getElementById('hotkey_prefs_tree');

                if (!this.hotkeys.get(keycombo)) {

                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Hot Key Configuration'),
                                          _('Hot Key [%S] does not exist', [keydisplay]));

                    return ;
                }

                var count = this.hotkeysArray.length;

                for (var i = 0; i < count ; i++) {

                    if (this.hotkeysArray[i]['keycombo'] == keycombo) {
                        hotkeyTree.currentIndex = i ;
                        hotkeyTree.selection.select(i);
                        hotkeyTree.treeBoxObject.ensureRowIsVisible(i);
                    }
                }
                
            }catch (e) {
                
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Hot Key Configuration'),
                                      _('An error occurred while searching for Hot Key [%S].', [keydisplay]));
            }

        },

        confirmChangeHotkey: function(index) {
            // check if hotkey form has been modified
            if (this.selectedHotkeyIndex != -1 && (index == null || (index != -1 && index != this.selectedHotkeyIndex))
                && GeckoJS.FormHelper.isFormModified('hotkeyForm')) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                    _('Discard Changes'),
                    _('You have made changes to the current hotkey. Are you sure you want to discard the changes?'))) {
                    return false;
                }
            }
            return true;
        },
        
        // save preferences
        savePreferences: function() {

            var hotkey_prefix = 'vivipos.fec.settings.hotkeys';
            GeckoJS.Configure.write(hotkey_prefix, this.hotkeys.serialize());

            // refresh hotkeys tree
            this.hotkeysArray = this.hotkeys.getValues().sort(function(a, b) {
                if (a.name < b.name) return -1
                else if (a.name > b.name) return 1;
                else return 0;
            });
            
            document.getElementById('hotkey_prefs_tree').datasource = this.hotkeysArray;

            // notify target of the preference change
            GeckoJS.Observer.notify(null, 'hotkey-preferences-update', this.target);


        },

        exit: function() {
            // check if hotkey form has been modified
            if (this.selectedHotkeyIndex != -1&& GeckoJS.FormHelper.isFormModified('hotkeyForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                .getService(Components.interfaces.nsIPromptService);
                var check = {
                    data: false
                };
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                    _('Exit'),
                    _('You have made changes to the current hot key. Save changes before exiting?'),
                    flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    if (!this.modifyHotkey()) return;
                }
            }
            window.close();
        },

        // handle function selection event
        selectFunction: function(tree) {

            var index;
            //GREUtils.log('[SelectFunction]: node <' + tree.nodeName + '> child <' + tree.tree.nodeName + '>');
            var count = tree.selection.count;
            if (count > 0)
                index = tree.currentIndex;
            else
                index = -1;

            this.selectedFunctionIndex = index;

            var descID = 'hotkey_function_desc';
            var linkID = 'hotkey_link';

            if (index > -1) {
                // if function selected, show description, enable link button

                //document.getElementById(descID).firstChild.data = this.functionArray[index].desc;
                document.getElementById(descID).value = this.functionArray[index].desc;

                // enable link button only if button selection is not null
                document.getElementById(linkID).disabled = false;
            }
            else {
                //document.getElementById(descID).firstChild.data = '';
                document.getElementById(descID).value = '';
                document.getElementById(linkID).disabled = true;
            }
        },


        // link function to button
        linkFunction: function() {

            var f = this.functionArray[this.selectedFunctionIndex];

            var entry = {
                linked_id: f.id,
                version: f.version,
                name: f.name,
                label: f.label,
                desc: f.desc,
                access: f.access,
                command: f.command,
                controller: f.controller,
                data: f.data
            };

            //GREUtils.log('[LinkFunction]: link prepared <' + GeckoJS.BaseObject.dump(entry) + '>');

            this.lastLinkFunction = entry;

            // update screen fields accordingly
            document.getElementById('hotkey_linked').value = f.name;
            document.getElementById('hotkey_linked_id').value = f.id;
            document.getElementById('hotkey_name').value = f.name;
            document.getElementById('hotkey_version').value = f.version;
            document.getElementById('hotkey_data').value = f.data;

        }


    };

    AppController.extend(__controller__);

    window.addEventListener("load", function (){
        $do('startup', '', 'HotkeyPrefs');
    }, false);

})()

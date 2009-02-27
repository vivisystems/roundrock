(function(){

    /**
     * Controller vivifuncpanelecrPrefs
     * 
     * This controller is used to manage the preference panel
     * for vivifuncpanelecr
     */

    GeckoJS.Controller.extend( {

        name: 'HotkeyPrefs',
        prefTree: null,
        functionTree: null,
        functionArray: null,
        selectedIndex: null,
        hotkeys: null,
        hotkeysArray: [],

        lastLinkFunction: null,

        reserveHotKeys: {
            '$13': true,
            '$190': true,
            'ctrl-$81': true,
            'ctrl-$82': true,
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
                var newKey = GeckoJS.BaseObject.extend(fns[keys[i]], {});
                newKey.name = _(keys[i] + '.name');
                newKey.label = _(keys[i] + '.label');
                newKey.desc = _(keys[i] + '.desc');
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
            this.hotkeysArray = this.hotkeys.getValues();
            document.getElementById('hotkey_prefs_tree').datasource = this.hotkeysArray;

        },

        addHotkey: function() {

            this.editableFields(true);

            document.getElementById('modify_hotkey').removeAttribute('disabled');
            document.getElementById('delete_hotkey').removeAttribute('disabled');

            var nameObj = document.getElementById('hotkey_name');
            nameObj.value = _('New Hotkey');
            nameObj.select();
            nameObj.focus();
        
            document.getElementById('hotkey_id').value = GeckoJS.String.uuid();


        },


        modifyHotkey: function() {

            var entry = this.lastLinkFunction;

                if (!entry) {

                    // @todo OSD
                    NotifyUtils.error(_('Please Linking Function to Hotkey', []));
                    return ;

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

            try {

                var id = inputData.id ;
                var keycombo = inputData.keycombo;
                var keydisplay = inputData.keydisplay;


                // change hotkey, find hotkey exists
                if (id != keycombo) {


                    if(this.reserveHotKeys[keycombo]) {

                        NotifyUtils.error(_('Hotkey [%S] is reserved', [keydisplay]));
                        return ;
                    }

                    var isExists = this.hotkeys.containsKey(keycombo);
                    if (isExists) {
                        
                        // @todo OSD
                        NotifyUtils.error(_('Hotkey [%S] is exists', [keydisplay]));
                        return ;
                    }



                    // remove old
                    try {
                        this.hotkeys.remove(id);
                    }catch(e) {}
                }

                delete inputData.id;
                this.hotkeys.add(keycombo, inputData);
                document.getElementById('hotkey_id').value = keycombo;

                this.savePreferences();

                //
                //
                // @todo OSD
                OsdUtils.info(_('Hotkey [%S] [%S] modified successfully', [inputData.name, keydisplay]));

            }
            catch (e) {
                
                // @todo OSD
                NotifyUtils.error(_('An error occurred while modifying Hotkey [%S]. The hotkey may not have been modified successfully', [inputData.name]));

            }

        },


        removeHotkey: function() {

            try {

                var inputData = this.Form.serializeToObject('hotkeyForm');

                var entry = this.hotkeys.get(inputData.id);

                if (!entry) {
                    return ;
                }

                var keycombo = entry.keycombo;
                var keydisplay = entry.keydisplay;

                this.hotkeys.remove(keycombo);

                this.savePreferences();

                this.editableFields(false);

                // @todo OSD
                OsdUtils.info(_('Hotkey [%S] [%S] remove successfully', [inputData.name, keydisplay]));

                document.getElementById('modify_hotkey').setAttribute('disabled', true);
                document.getElementById('delete_hotkey').setAttribute('disabled', true);


            }
            catch (e) {

                // @todo OSD
                NotifyUtils.error(_('An error occurred while removing Hotkey [%S]. The hotkey may not have been removed successfully', [inputData.name]));

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
                document.getElementById('hotkey_function_tree').removeAttribute('disabled');

            }else {
                document.getElementById('hotkey_hotkey').setAttribute('disabled', true);
                document.getElementById('hotkey_name').setAttribute('readonly', true);
                document.getElementById('hotkey_data').setAttribute('readonly', true);
                document.getElementById('hotkey_function_tree').setAttribute('disabled', true);

            }

        },

        selectHotkey: function(tree) {

            var count = tree.tree.view.selection.count;
            if (count > 0)
                index = tree.currentIndex;
            else
                index = -1;

            if (index <0) return;

            this.selectedIndex = index;

            var entry = this.hotkeysArray[index];

            if (!entry){
                return ;
            }

            this.lastLinkFunction = entry ;

            this.editableFields(true);

            document.getElementById('hotkey_id').value = entry.keycombo;
            document.getElementById('hotkey_hotkey').setHotkey(entry.keycombo, entry.keydisplay);
            document.getElementById('hotkey_name').value = entry.name;
            document.getElementById('hotkey_linked').value = entry.linked;
            document.getElementById('hotkey_data').value = entry.data;

            document.getElementById('modify_hotkey').removeAttribute('disabled');
            document.getElementById('delete_hotkey').removeAttribute('disabled');

            var nameObj = document.getElementById('hotkey_name');
            nameObj.focus();

        },

        
        // close preferences window
        cancelPreferences: function() {
            window.close();
        },

        // save preferences
        savePreferences: function() {

            var hotkey_prefix = 'vivipos.fec.settings.hotkeys';
            GeckoJS.Configure.write(hotkey_prefix, this.hotkeys.serialize());

            // refresh hotkeys tree
            this.hotkeysArray = this.hotkeys.getValues();
            document.getElementById('hotkey_prefs_tree').datasource = this.hotkeysArray;

            // notify target of the preference change
            GeckoJS.Observer.notify(null, 'hotkey-preferences-update', this.target);


        },

        // handle function selection event
        selectFunction: function(tree) {

            //GREUtils.log('[SelectFunction]: node <' + tree.nodeName + '> child <' + tree.tree.nodeName + '>');
            var count = tree.tree.view.selection.count;
            if (count > 0)
                index = tree.currentIndex;
            else
                index = -1;

            this.selectedIndex = index;

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

            var f = this.functionArray[this.selectedIndex];

            var entry = {
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
            document.getElementById('hotkey_name').value = f.name;
            document.getElementById('hotkey_data').value = f.data;

        }


       

    });

    window.addEventListener("load", function (){
        $do('startup', '', 'HotkeyPrefs');
    }, false);

})()
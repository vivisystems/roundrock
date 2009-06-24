(function(){

    var __controller__ = {

        name: 'vivifuncpanelecr_prefs',

        panel: null,
        functionArray: null,
        selectedIndex: null,
        extent: null,
        tabIndex: null,
        target: null,
        removedKeys: null,

        // no  button selected
        noButtonSelected: function() {
            // keymap
            document.getElementById('vivifuncpanelecr_prefs_keymap_selection').value = '';
            document.getElementById('vivifuncpanelecr_prefs_keymap_linked').value = '';
            document.getElementById('vivifuncpanelecr_prefs_keymap_linked_unlink').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_label').value = '';
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_label').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_label_apply').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_label_reset').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_link').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_data').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_data').value = '';
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_data_apply').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_data_reset').disabled = true;

            // gkeymap
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_selection').value = '';
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_linked').value = '';
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_linked_unlink').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label').value = '';
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label_apply').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label_reset').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_link').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data').value = '';
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data_apply').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data_reset').disabled = true;
        },

        // unmapped button selected
        unmappedButtonSelected: function(btnid) {
            document.getElementById('vivifuncpanelecr_prefs_keymap_selection').value = '[' + btnid + ']';
            document.getElementById('vivifuncpanelecr_prefs_keymap_linked').value = '';
            document.getElementById('vivifuncpanelecr_prefs_keymap_linked_unlink').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_label').value = '';
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_label').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_label_apply').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_label_reset').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_link').disabled = (this.selectedIndex < 0);
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_data').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_data').value = '';
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_data_apply').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_data_reset').disabled = true;

            // gkeymap
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_selection').value = '[' + btnid + ']';
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_linked').value = '';
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_linked_unlink').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label').value = '';
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label_apply').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label_reset').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_link').disabled = (this.selectedIndex < 0);
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data').value = '';
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data_apply').disabled = true;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data_reset').disabled = true;
        },

        // mapped button selected
        mappedButtonSelected: function(btnid, entry) {
            // look for function in function list
            var fList = this.functionArray;

            var functionListLocal = document.getElementById('vivifuncpanelecr_prefs_keymap_function_tree');
            var functionListGlobal = document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_tree');

            for (var index = 0; index < fList.length; index++) {
                if (fList[index].name == entry.name) {
                    functionListLocal.selection.select(index);
                    functionListGlobal.selection.select(index);

                    functionListLocal.treeBoxObject.ensureRowIsVisible(index);
                    functionListGlobal.treeBoxObject.ensureRowIsVisible(index);
                    break;
                }
            }

            document.getElementById('vivifuncpanelecr_prefs_keymap_selection').value = '[' + btnid + ']';
            document.getElementById('vivifuncpanelecr_prefs_keymap_linked').value = entry.name;
            document.getElementById('vivifuncpanelecr_prefs_keymap_linked_unlink').disabled = false;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_label').value = entry.label;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_label').disabled = false;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_label_apply').disabled = false;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_label_reset').disabled = false;
            document.getElementById('vivifuncpanelecr_prefs_keymap_link').disabled = (this.selectedIndex < 0);
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_data').disabled = false;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_data').value = entry.data;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_data_apply').disabled = false;
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_data_reset').disabled = false;

            // gkeymap
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_selection').value = '[' + btnid + ']';
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_linked').value = entry.name;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_linked_unlink').disabled = false;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label').value = entry.label;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label').disabled = false;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label_apply').disabled = false;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label_reset').disabled = false;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_link').disabled = (this.selectedIndex < 0);
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data').disabled = false;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data').value = entry.data;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data_apply').disabled = false;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data_reset').disabled = false;
        },

        // close preferences window

        cancelPreferences: function() {
            window.close();
        },

        // save preferences
        savePreferences: function() {
            var data = this.panel.datasource;
            var prefix = this.panel.getAttribute('prefix');

            //GREUtils.log('[PREFS][SavePreferences]: saving settings <' + GeckoJS.BaseObject.dump(data) + '> under prefix <' + prefix + '>');

            GeckoJS.Configure.write(prefix + '.maxpage', data.maxpage);
            GeckoJS.Configure.write(prefix + '.homePage', data.homePage);
            GeckoJS.Configure.write(prefix + '.rows', data.rows);
            GeckoJS.Configure.write(prefix + '.columns', data.columns);
            GeckoJS.Configure.write(prefix + '.vspacing', data.vspacing);
            GeckoJS.Configure.write(prefix + '.hspacing', data.hspacing);
            GeckoJS.Configure.write(prefix + '.wrap', data.wrap);
            GeckoJS.Configure.write(prefix + '.dir', data.dir);
            GeckoJS.Configure.write(prefix + '.restrictMode', data.restrictMode);
            GeckoJS.Configure.write(prefix + '.pageLabelMap', data.pageLabelMap.serialize());
            GeckoJS.Configure.write(prefix + '.pageLayoutMap', data.pageLayoutMap.serialize());
            GeckoJS.Configure.write(prefix + '.pageButtonstyleMap', data.pageButtonstyleMap.serialize());
            GeckoJS.Configure.write(prefix + '.pageButtonfontsizeMap', data.pageButtonfontsizeMap.serialize());

            GeckoJS.Configure.remove(prefix + '.pageKeymapMap');

            //GREUtils.log('[SAVEPREFERENCES]: save orientation <' + data.dir + '>');
            // must delete original keymaps
            var removedKeys = this.removedKeys;

            //GREUtils.log('[PREFS][SavePreferences]: removed keys <' + GeckoJS.BaseObject.dump(removedKeys.getValues()) + '>');
            removedKeys.getKeys().forEach(function(page) {
                var removedPageKeys = removedKeys.get(page);
                if (removedPageKeys) {
                    removedPageKeys.forEach(function(btnid) {
                        GeckoJS.Configure.write(prefix + '.pageKeymapMap.' + page + '.' + btnid, "");
                        //GREUtils.log('[PREFS][SavePreferences]: deleting keymap page <' + page + '> key <' + btnid + '>');
                    })
                }
            })

            data.pageKeymapMap.getKeys().forEach(function(page) {
                    var map = data.pageKeymapMap.get(page);
                    map.getKeys().forEach(function(btnid) {
                            var entry = map.get(btnid);
                            GeckoJS.Configure.write(prefix + '.pageKeymapMap.' + page + '.' + btnid, GeckoJS.BaseObject.serialize(entry));
                            //GREUtils.log('[PREFS][SavePreferences]: adding keymap page <' + page + '> key <' + btnid + '>');
                        }
                    )
                }

            );

            GeckoJS.Configure.savePreferences(prefix);
            //GREUtils.log('[PREFS][SavePreferences]: settings saved <' + GeckoJS.BaseObject.dump(prefix) + '>');

            // notify target of the preference change
            GeckoJS.Observer.notify(null, 'functionpanel-preferences-update', this.target);

            //GREUtils.log('[PREFS][SavePreferences]: target <' + this.target + '> notified');

            window.close();
        },

        // set button color
        selectButtonColor: function(color) {
            //GREUtils.log('[SelectButtonColor]: button color selected <' + color + '>');

            if (color == null) {
                //GREUtils.log('[SelectButtonColor]: no color selected');
                return false;
            }

            if (this.extent == null) {
                //GREUtils.log('[SelectButtonColor]: no button currently selected, unable to set color');
                return false;
            }

            var btnstyles = {};
            var colors = color.split(',');
            color = colors.join(' ');

            //GREUtils.log('[SelectButtonColor]: button color converted to class <' + color + '>');

            for (var r = this.extent.row1; r <= this.extent.row2; r++)
                for (var c = this.extent.column1; c <= this.extent.column2; c++) {
                    btnstyles[r + 'x' + c] = color;
                }
            this.panel.setButtonstyles(this.panel.currentPage, btnstyles, true);
            //this.panel.setSelection(false);
        },

        // set button fontsize
        selectButtonFontsize: function(fontsize) {
            //GREUtils.log('[SelectButtonFontsize]: button fontsize selected <' + fontsize + '>');

            if (fontsize == null) {
                //GREUtils.log('[SelectButtonFontsize]: no fontsize selected');
                return false;
            }

            if (this.extent == null) {
                //GREUtils.log('[SelectButtonFontsize]: no button currently selected, unable to set fontsize');
                return false;
            }

            var fontsizes = {};
            var f = fontsize.split(',');
            fontsize = f.join(' ');

            //GREUtils.log('[SelectButtonFontsize]: button fontsize converted to class <' + fontsize + '>');
            for (var r = this.extent.row1; r <= this.extent.row2; r++)
                for (var c = this.extent.column1; c <= this.extent.column2; c++) {
                    fontsizes[r + 'x' + c] = fontsize;
                }
            this.panel.setButtonfontsizes(this.panel.currentPage, fontsizes, true);
            //this.panel.setSelection(false);
        },

        // update link label
        updateLinkLabel: function() {
            if (this.extent == null) {
                //GREUtils.log('[UpdateLinkLabel]: no linked button <' + this.extent + '> to update');
                return;
            }
            var label = (this.tabIndex == 2) ? GeckoJS.String.trim(document.getElementById('vivifuncpanelecr_prefs_keymap_function_label').value) :
                                               GeckoJS.String.trim(document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label').value);

            if (label.length == 0) {
                return;
            }
            var entry = this.panel.getPageKeymap(this.panel.currentPage).get(this.extent.row1 + 'x' + this.extent.column1);
            entry.label = label;
            this.panel.setKeymap(this.panel.currentPage, [entry], true);
       },

        // reset link label
        resetLinkLabel: function() {
            if (this.extent == null) {
                //GREUtils.log('[ResetLinkLabel]: no linked button <' + this.extent + '> to reset');
                return;
            }
            var entry = this.panel.getPageKeymap(this.panel.currentPage).get(this.extent.row1 + 'x' + this.extent.column1);
            var labelNode = (this.tabIndex == 2) ? document.getElementById('vivifuncpanelecr_prefs_keymap_function_label') :
                                                   document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_label');
            if (entry) {
                // keymap entry found, setting text field to stored label
                labelNode.value = entry.label;
            }
            else {
                labelNode.value = '';

            }
        },

        // update link data
        updateLinkData: function() {
            if (this.extent == null) {
                //GREUtils.log('[UpdateLinkLabel]: no linked button <' + this.extent + '> to update');
                return;
            }
            var data = (this.tabIndex == 2) ? GeckoJS.String.trim(document.getElementById('vivifuncpanelecr_prefs_keymap_function_data').value) :
                                              GeckoJS.String.trim(document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data').value)
            var entry = this.panel.getPageKeymap(this.panel.currentPage).get(this.extent.row1 + 'x' + this.extent.column1);
            entry.data = data;
            this.panel.setKeymap(this.panel.currentPage, [entry], true);
       },

        // reset link data
        resetLinkData: function() {
            if (this.extent == null) {
                //GREUtils.log('[ResetLinkLabel]: no linked button <' + this.extent + '> to reset');
                return;
            }
            var entry = this.panel.getPageKeymap(this.panel.currentPage).get(this.extent.row1 + 'x' + this.extent.column1);
            var dataNode = (this.tabIndex == 2) ? document.getElementById('vivifuncpanelecr_prefs_keymap_function_data') :
                                                  document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_data')

            if (entry) {
                // keymap entry found, setting text field to stored label
                dataNode.value = entry.data;
            }
            else {
                dataNode.value = '';
            }
        },

        // remove all link
        removeAllLinks: function() {
            var keymap = this.panel.getPageKeymap(this.panel.currentPage);
            var extent = this.extent;
            var unlinkNode = (this.tabIndex == 2) ? document.getElementById('vivifuncpanelecr_prefs_keymap_unlink_all') :
                                                    document.getElementById('vivifuncpanelecr_prefs_gkeymap_unlink_all')

            //GREUtils.log('[RemoveAllLinks]: existing keymap <' + GeckoJS.BaseObject.dump(keymap) + '> to unlink, current selection <' + extent + '>');

            this.panel.setKeymap(this.panel.currentPage, [], false);

            // add all keymap entries for the page to removedKeys for later removal from preferences

            if (keymap) {
                var removedPageKeys = this.removedKeys.get(this.panel.currentPage);
                if (!removedPageKeys) removedPageKeys = [];
                keymap.getKeys().forEach(function(btnid) {removedPageKeys.push(btnid);});
                this.removedKeys.set(this.panel.currentPage, removedPageKeys);
            }

            //unlinkNode.disabled = true;

            if (extent) {
                var btnid = this.extent.row1 + 'x' + this.extent.column1;
                this.unmappedButtonSelected(btnid);

                // unmapping selected button
            }
        },

        // remove link
        removeLink: function() {
            if (this.extent == null) {
                //GREUtils.log('[RemoveLink]: no button <' + this.extent + '> to unlink');
                return;
            }

            var keymap = this.panel.getPageKeymap(this.panel.currentPage);
            var btnid = this.extent.row1 + 'x' + this.extent.column1;
            var newKeymap = [];
            var unlinkNode = (this.tabIndex == 2) ? document.getElementById('vivifuncpanelecr_prefs_keymap_unlink_all') :
                                                    document.getElementById('vivifuncpanelecr_prefs_gkeymap_unlink_all')

            //GREUtils.log('[RemoveLink]: existing keymap <' + GeckoJS.BaseObject.dump(keymap) + '> to unlink');

            keymap.remove(btnid);
            var removedKeys = this.removedKeys.get(this.panel.currentPage);
            if (removedKeys) removedKeys.push(btnid);
            else this.removedKeys.set(this.panel.currentPage, [btnid]);

            //GREUtils.log('[RemoveLink]: unlinked existing keymap <' + GeckoJS.BaseObject.dump(keymap) + '>');

            keymap.getKeys().forEach(function(key) {newKeymap.push(keymap.get(key))});

            //GREUtils.log('[RemoveLink]: preparing to set keymap <' + GeckoJS.BaseObject.dump(newKeymap) + '>');

            this.panel.setKeymap(this.panel.currentPage, newKeymap, false);

            unlinkNode.disabled = (newKeymap.length == 0);

            //GREUtils.log('[RemoveLink]: keymap for page <' + this.panel.currentPage + '> - <' + GeckoJS.BaseObject.dump(newKeymap) + '>');

            this.unmappedButtonSelected(btnid);
        },

        // link function to button
        linkFunction: function() {
            if ((this.extent == null) || (this.selectedIndex < 0)) {
                //GREUtils.log('[LinkFunction]: no function <' + this.selectedIndex + '> or button <' + this.extent + '> to link');
                return;
            }
            var unlinkNode = (this.tabIndex == 2) ? document.getElementById('vivifuncpanelecr_prefs_keymap_unlink_all') :
                                                    document.getElementById('vivifuncpanelecr_prefs_gkeymap_unlink_all')

            var f = this.functionArray[this.selectedIndex];
            var entry = [{row: this.extent.row1,
                          column: this.extent.column1,
                          name: f.name,
                          label: f.label,
                          desc: f.desc,
                          access: f.access,
                          command: f.command,
                          controller: f.controller,
                          data: f.data}];

            //GREUtils.log('[LinkFunction]: link prepared <' + GeckoJS.BaseObject.dump(entry[0]) + '>');

            this.panel.setKeymap(this.panel.currentPage, entry, true);

            // update screen fields accordingly
            this.mappedButtonSelected(entry[0].row + 'x' + entry[0].column, entry[0]);
            unlinkNode.disabled = true;
        },

        // handle function selection event
        selectFunction: function(tree) {
            //GREUtils.log('[SelectFunction]: node <' + tree.nodeName + '> child <' + tree.tree.nodeName + '>');
            var count = tree.selection.count;
            var index;
            if (count > 0)
                index = tree.currentIndex;
            else
                index = -1;

            //GREUtils.log('[SelectFunction] function index selected <' + index + '>');

            this.selectedIndex = index;

            if (this.tabIndex == 2) {
                var descID = 'vivifuncpanelecr_prefs_keymap_function_desc';
                var linkID = 'vivifuncpanelecr_prefs_keymap_link';
            }
            else {
                var descID = 'vivifuncpanelecr_prefs_gkeymap_function_desc';
                var linkID = 'vivifuncpanelecr_prefs_gkeymap_link';
            }

            if (index > -1) {
                // if function selected, show description, enable link button

                //document.getElementById(descID).firstChild.data = this.functionArray[index].desc;
                document.getElementById(descID).value = this.functionArray[index].desc;

                // enable link button only if button selection is not null
                if (this.panel.getSelection()) {
                    document.getElementById(linkID).disabled = false;
                }
            }
            else {
                //document.getElementById(descID).firstChild.data = '';
                document.getElementById(descID).value = '';
                document.getElementById(linkID).disabled = true;
            }
        },

        // switch active tab
        switchTab: function(tabIndex) {

            //var tabIndex = document.getElementById('vivifuncpanelecr_prefs_tabbox').selectedIndex;

            //GREUtils.log('[TAB]: switching from <' + this.tabIndex + '> to tab <' + tabIndex + '>');

            if (tabIndex == this.tabIndex) {
                return;
            }

            if (this.panel == null) return;

            this.panel.setSelection(false);
            this.panel.selectedNode1 = null;

            if ((this.tabIndex == 3) && (tabIndex != 3)) {
                this.panel.currentPage = this.lastPage;
            }

            this.tabIndex = tabIndex;
            if (tabIndex > 0) {
                this.panel.setAttribute('mode', 'configure');
                if (tabIndex == 1) {
                    this.panel.setAttribute('seltype', 'range');
                    document.getElementById('vivifuncpanelecr_prefs_keymap_function_tree').selectedIndex = -1;
                    document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_tree').selectedIndex = -1;
                }
                else {
                    if (tabIndex == 3) {
                        this.lastPage = this.panel.currentPage;
                        this.panel.currentPage = 'global';
                    }
                    var keymap = this.panel.getPageKeymap(this.panel.currentPage);
                    this.panel.setAttribute('seltype', 'single');
                    document.getElementById('vivifuncpanelecr_prefs_keymap_unlink_all').disabled = !keymap;
                    document.getElementById('vivifuncpanelecr_prefs_gkeymap_unlink_all').disabled = !keymap;

                    //GREUtils.log('[SWITCH]: page <' + this.panel.currentPage + '> keymap <' + keymap + '>');
                }
            }
            else {
                this.panel.setAttribute('mode', 'noop');
            }
            //this.panel.setSelection(false);
            //this.panel.selectedNode1 = null;
            //this.panel.renderKeymap();
        },

        // set panel orientation
        setOrientation: function(orient) {
            this.panel.setAttribute('dir', orient);
        },

        // set the panel's restrictMode attribute
        setRestrictMode: function(val) {
            this.panel.setAttribute('restrictMode', val);
            this.panel.renderKeymap(this.panel.currentPage);
        },


        // set the panel's wrap attribute
        setWrap: function(val) {
            this.panel.setAttribute('wrap', val);
        },

        // set the panel's resizable property
        setResizable: function(val) {
            this.panel.resizable=val;
        },

        // set the panel's size
        setSize: function() {
            this.panel.setSize(document.getElementById('vivifuncpanelecr_prefs_size_rows').value,
                               document.getElementById('vivifuncpanelecr_prefs_size_columns').value,
                               document.getElementById('vivifuncpanelecr_prefs_size_hspacing').value,
                               document.getElementById('vivifuncpanelecr_prefs_size_vspacing').value);
        },

        // set the panel's maxpage attribute
        setMaxPage: function() {
            this.panel.maxpage = document.getElementById('vivifuncpanelecr_prefs_maxpage').value;
        },

        // set the panel's defaultpage attribute
        setDefaultPage: function() {
            this.panel.homePage = document.getElementById('vivifuncpanelecr_prefs_defaultpage').value;
        },

        // set the panel's current page label
        setLabel: function(global) {
            var page = document.getElementById('vivifuncpanelecr_prefs_layout_page_number').value;
            var label = document.getElementById('vivifuncpanelecr_prefs_layout_label_page').value;
            var glabel = document.getElementById('vivifuncpanelecr_prefs_layout_label_global').value;
            //GREUtils.log('[SETLABEL]: setting page <' + page + '> label <' + label + '> global <' + global + '> global label <' + glabel +'>');
            if (global=='true') {
                this.panel.setLabel('global', glabel);
                //GREUtils.log('[SETLABEL]: global label <' + glabel + '>');
            }
            else {
              this.panel.setLabel(page, label);
              //GREUtils.log('[SETLABEL]: page label <' + label + '>');
            }
        },

        // reset the panel's current page label
        resetLabel: function(global) {
            if (global == 'true')
                document.getElementById('vivifuncpanelecr_prefs_layout_label_global').value = this.panel.getPageLabel('global');
            else {
                var page = document.getElementById('vivifuncpanelecr_prefs_layout_page_number').value;
                var label = this.panel.getPageLabel(page, true);
                document.getElementById('vivifuncpanelecr_prefs_layout_label_page').value = label;
                //GREUtils.log('[RESETLABEL]: resetting page label to <' + label + '>');
            }
        },

        // handle function panel page change event
        handlePageChanged: function(evt) {

            var newPage = evt.newPage;

            // first, update page layout panel
            document.getElementById('vivifuncpanelecr_prefs_layout_page_number').value = newPage;
            document.getElementById('vivifuncpanelecr_prefs_layout_label_page').value = evt.root.getPageLabel(newPage, true);

            // next, update keymap panel
            var keymap = evt.root.getPageKeymap(newPage);
            document.getElementById('vivifuncpanelecr_prefs_keymap_page_number').value = newPage;
            document.getElementById('vivifuncpanelecr_prefs_keymap_unlink_all').disabled = !keymap;

            // also update gkeymap panel
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_page_number').value = newPage;
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_unlink_all').disabled = !keymap;
        },

        // handle function panel page change event
        handleSelectionChanged: function(evt) {

            //GREUtils.log('[SelectionChanged]: selection extent <' + GeckoJS.BaseObject.dump(evt.extent) + '>');

            this.extent = evt.extent;

            // handle selection change for layout panel
            if (evt.extent == null) {
                document.getElementById('vivifuncpanelecr_prefs_layout_selection').value = '';
                document.getElementById('vivifuncpanelecr_prefs_layout_merge').disabled = true;
                document.getElementById('vivifuncpanelecr_prefs_layout_remove').disabled = true;
                document.getElementById('vivifuncpanelecr_prefs_layout_button_colorpicker').disabled = true;
                document.getElementById('vivifuncpanelecr_prefs_layout_button_fontsizepicker').disabled = true;
            }
            else {
                var w = evt.extent.column2 - evt.extent.column1 + 1;
                var h = evt.extent.row2 - evt.extent.row1 + 1;
                document.getElementById('vivifuncpanelecr_prefs_layout_selection').value = '[' + evt.extent.row1 + 'x' + evt.extent.column1 + '] - [' +
                                                                                           evt.extent.row2 + 'x' + evt.extent.column2 + ']';
                document.getElementById('vivifuncpanelecr_prefs_layout_merge').disabled = (evt.selected != 2) || ((w <= 1) && (h <= 1));
                document.getElementById('vivifuncpanelecr_prefs_layout_remove').disabled = false;
                document.getElementById('vivifuncpanelecr_prefs_layout_button_colorpicker').disabled = false;
                document.getElementById('vivifuncpanelecr_prefs_layout_button_fontsizepicker').disabled = false;
            }

            var keymap = evt.root.getPageKeymap(evt.page);
            var entry;
            var keyid;
            if (evt.extent) {
                keyid = evt.extent.row1 + 'x' + evt.extent.column1;
                if (keymap) entry = keymap.get(keyid);
            }

            // handle selection change for keymap/gkeymap panels
            if (evt.extent == null) {
                //GREUtils.log('[SelectionChanged]: selection cleared');

                // no button selected
                this.noButtonSelected();
            }
            else if (entry == null) {
                //GREUtils.log('[SelectionChanged]: selection changed, no keymap')

                // button selected, but no keymap
                this.unmappedButtonSelected(keyid);
            }
            else {
                <!--
                GREUtils.log('[SelectionChanged]: current keymap <' + GeckoJS.BaseObject.dump(keymap.getValues()) +
                           '> linked function <' + GeckoJS.BaseObject.dump(entry));
                -->
                // mapping found, get function name and label, turn on unlink and reset
                this.mappedButtonSelected(keyid, entry);
            }
            //GREUtils.log('[SelectionChanged]: selection extent <' + GeckoJS.BaseObject.dump(this.extent) + '>');
        },

        // remove buttons by constructing a new layout map
        removeButtons: function() {
            var existingLayout = this.panel.getPageLayout(this.panel.currentPage);
            var extent = this.panel.getSelection();
            var rows = this.panel.rows;
            var columns = this.panel.columns;
            var page = document.getElementById('vivifuncpanelecr_prefs_layout_page_number').value;

            //GREUtils.log('[RemoveButtons]: setting up - layout <' + GeckoJS.BaseObject.dump(existingLayout) + '> page <' + page + '> extent <' +
            //           GeckoJS.BaseObject.dump(extent) + '>');

            var layout = [];
            var c, r;
            var w = extent.column2 - extent.column1 + 1;
            var h = extent.row2 - extent.row1 + 1;

            if (existingLayout == null) {
                // build a new layout, leaving out buttons in the selection extent
                for (r = 1; r <= rows; r++) {
                    if ((r < extent.row1) || (r > extent.row2)) {
                        for (c = 1; c <= columns; c++)
                            layout.push(r + ',' + c + ',1,1');
                    }
                    else {
                        for (c = 1; c <= columns; c++) {
                            if ((c < extent.column1) || (c > extent.column2)) {
                                layout.push(r + ',' + c + ',1,1');
                            }
                        }
                    }
                }
            }
            else {
                // remove all buttons whose id fall within the selection extent
                for (var i = 0; i < existingLayout.length; i++) {
                    var entry = existingLayout[i].split(',');
                    if ((entry[0] < extent.row1) || (entry[0] > extent.row2) ||
                        (entry[1] < extent.column1) || (entry[1] > extent.column2)) {
                        layout.push(existingLayout[i]);
                    }
                }
            }
            // clear button selection
            this.panel.setSelection(false);

            //GREUtils.log('[RemoveButtons]: new layout with selected buttons removed <' + GeckoJS.BaseObject.dump(layout));
            this.panel.setLayout(page, layout, false);
        },

        // merge buttons by constructing a new layout map
        mergeButtons: function() {
            var existingLayout = this.panel.getPageLayout(this.panel.currentPage);
            var extent = this.panel.getSelection();
            var rows = this.panel.rows;
            var columns = this.panel.columns;
            var page = document.getElementById('vivifuncpanelecr_prefs_layout_page_number').value;

    /*
            GREUtils.log('[MergeButtons]: setting up - layout <' + GeckoJS.BaseObject.dump(existingLayout) + '> page <' + page + '> extent <' +
                       GeckoJS.BaseObject.dump(extent) + '>');
    */
            var layout = [];
            var c, r;
            var w = extent.column2 - extent.column1 + 1;
            var h = extent.row2 - extent.row1 + 1;

            if (existingLayout == null) {
                // build a new layout
                for (r = 1; r <= rows; r++) {
                    if ((r < extent.row1) || (r > extent.row2)) {
                        for (c = 1; c <= columns; c++)
                            layout.push(r + ',' + c + ',1,1');
                    }
                    else {
                        for (c = 1; c <= columns; c++) {
                            if ((r == extent.row1) && (c == extent.column1)) {
                                layout.push(r + ',' + c + ',' + w + ',' + h);
                            }
                            else if ((c < extent.column1) || (c > extent.column2)) {
                                layout.push(r + ',' + c + ',1,1');
                            }
                        }
                    }
                }
            }
            else {
                // overlay merged button on top of existing layout
                // first remove all buttons whose extent falls completely within the selection extent
                for (var i = 0; i < existingLayout.length; i++) {
                    var entry = existingLayout[i].split(',');
                    if ((entry[0] < extent.row1) || (entry[0] > extent.row2) ||
                        (entry[1] < extent.column1) || (entry[1] > extent.column2) ||
                        ((entry[0] - (- entry[2]) - 1) < extent.row1) || ((entry[0] - (- entry[2]) - 1) > extent.row2) ||
                        ((entry[1] - (- entry[3]) - 1) < extent.column1) || ((entry[1] - (- entry[3]) - 1) > extent.column2)) {
                        layout.push(existingLayout[i]);
                    }
                }
                // second add a new button with dimensions given by the selection extent
                layout.push(extent.row1 + ',' + extent.column1 + ',' +  w + ',' + h);
            }
            //GREUtils.log('[MergeButtons]: merged layout <' + GeckoJS.BaseObject.dump(layout));
            this.panel.setLayout(page, layout, false);
        },

        // reset layout
        resetLayout: function() {
            var page = document.getElementById('vivifuncpanelecr_prefs_layout_page_number').value;
            var rows = this.panel.rows;
            var columns = this.panel.columns;
            var layout = [];

            //GREUtils.log('[ResetLayout]: resetting layout for page <' + page + '>');

            this.panel.setSelection(false);

            // build a standard layout
            for (var r = 1; r <= rows; r++)
                for (var c = 1; c <= columns; c++)
                    layout.push(r + ',' + c + ',1,1');
            this.panel.setLayout(page, layout, false);
        },

        // set current layout as the global layout
        // need to convert
        setAsGlobalLayout: function() {
            var page = document.getElementById('vivifuncpanelecr_prefs_layout_page_number').value;

            this.panel.setLayout('global', this.panel.getPageLayout(page), false);
        },

        // apply global layout on the current page
        loadGlobalLayout: function() {
            var page = document.getElementById('vivifuncpanelecr_prefs_layout_page_number').value;

            this.panel.setLayout(page, null, false);
        },

       //
        // initialize the preference panel initial values
        //
        // the initial values should be taken from stored preferences;
        // for development/testing, they are taken from the XUL tag
        vivifuncpanelecrPrefs_startup: function(id) {

            //GREUtils.log('[PREFS][STARTUP]: id <' + id + '>');
            var panel = document.getElementById(id);
            this.panel = panel;
            //GREUtils.log('[PREFS][STARTUP]: panel found <' + this.panel.tagName + '>');

            // get initial size
            var parentHeight = this.panel.parentNode.boxObject.height - 20;
            var parentWidth = this.panel.parentNode.boxObject.width - 20;

            this.panel.width = parentWidth;
            this.panel.height = parentHeight;

            // get display information
            var maxpage = panel.getAttribute('maxpage');
            var rows = panel.getAttribute('rows');
            var columns = panel.getAttribute('columns');
            var hspacing = panel.getAttribute('hspacing');
            var vspacing = panel.getAttribute('vspacing');
            var orientation = panel.getAttribute('dir') || 'normal';
            var wrap = panel.getAttribute('wrap');
            var restrictMode = panel.getAttribute('restrictMode');

            // get page label information
            var homePage = panel.getAttribute('homePage');

            var pageLabel = panel.getPageLabel(homePage, true);
            var gpageLabel = panel.getPageLabel('global');
            var prefix = 'vivipos.fec.registry.function.programmable';

            if (('arguments' in window) && (window.arguments.length > 0)) {
                var arg = window.arguments[0];
                if (arg && ('target' in arg) && arg.target) this.target = arg.target;
                if (arg && ('function_prefix' in arg) && arg.function_prefix) prefix = arg.function_prefix;
            }
            else {
                this.target = null;
            }
            //GREUtils.log('[PREFS][STARTUP]: target object <' +this.target + '> with function from <' + prefix + '>');
            //
            // get function list from configure; builds data into array of objects
            // with properties: name, label, description, command, data, access, controller

            GeckoJS.Configure.loadPreferences(prefix);
            var fns = GeckoJS.Configure.read(prefix);

            var keys = GeckoJS.BaseObject.getKeys(fns);

            // build list of internal functions
            var functionArray = panel.getInternalFunctionList();

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

            //GREUtils.log('[PREFS][STARTUP]: programmable functions <' + GeckoJS.BaseObject.dump(functionArray) + '>');

            this.selectedIndex = -1;
            this.panel.setAttribute('mode', 'configure');

            // apply size information
            document.getElementById('vivifuncpanelecr_prefs_maxpage').value = maxpage;
            document.getElementById('vivifuncpanelecr_prefs_defaultpage').value = homePage;
            document.getElementById('vivifuncpanelecr_prefs_size_rows').value = rows;
            document.getElementById('vivifuncpanelecr_prefs_size_columns').value = columns;
            document.getElementById('vivifuncpanelecr_prefs_size_hspacing').value = hspacing;
            document.getElementById('vivifuncpanelecr_prefs_size_vspacing').value = vspacing;
            document.getElementById('vivifuncpanelecr_prefs_orientation').value = orientation;
            document.getElementById('vivifuncpanelecr_prefs_wrap_yes').checked = (wrap > 0);
            document.getElementById('vivifuncpanelecr_prefs_wrap_no').checked = (wrap == 0);
            document.getElementById('vivifuncpanelecr_prefs_restrict_hidden_yes').checked = (restrictMode == 'hidden');
            document.getElementById('vivifuncpanelecr_prefs_restrict_hidden_no').checked = (restrictMode != 'hidden');

            // apply page layout information
            document.getElementById('vivifuncpanelecr_prefs_layout_page_number').value = homePage;
            document.getElementById('vivifuncpanelecr_prefs_layout_label_page').value = pageLabel;
            document.getElementById('vivifuncpanelecr_prefs_layout_label_global').value = gpageLabel;

            // apply function list information to keymap panel
            document.getElementById('vivifuncpanelecr_prefs_keymap_function_tree').datasource = functionArray;

            // apply function list information to gkeymap panel
            document.getElementById('vivifuncpanelecr_prefs_gkeymap_function_tree').datasource = functionArray;

            // store a copy of the keymap
            this.removedKeys = new GeckoJS.Map();

            var self = this;

            // listen for 'vivifuncpanelecrPageChanged' event
            panel.addEventListener('vivifuncpanelecrPageChanged', function(evt) {
                                                                      self.handlePageChanged(evt);
                                                                  }, false);

            // listen for 'vivifuncpanelecrSelectionChanged' event
            panel.addEventListener('vivifuncpanelecrSelectionChanged', function(evt) {
                                                                          self.handleSelectionChanged(evt);
                                                                       }, false);
            this.panel.setAttribute('mode', 'noop');
        }

    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener("load", function (){
      $do('vivifuncpanelecrPrefs_startup', 'vivifuncpanelecr_prefs', 'vivifuncpanelecr_prefs');
    }, false);

})()
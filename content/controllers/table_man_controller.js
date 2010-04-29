(function(){

    /**
     * Class TableManController
     */
    var __controller__ = {

        name: 'TableMan',

        uses: ['TableSetting', 'TableRegion', 'TableMark', 'Table', 'TableStatus'],

        _isBusy: false,

        _regionListObj: null,
        _tableListObj: null,
        _cart: null,
        _markListObj: null,

        _minimumChargeFor: {
            '0': _('Final Amount'),
            '1': _('Original Amount') /*, '2': _('No Revalue'), '3': _('No Promotion') */
        },

        _needRestart: false,

        _templates: null,

        initial: function() {
        },

        getCartController: function() {
            if (this._cart == null) {
                var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
                this._cart = mainWindow.GeckoJS.Controller.getInstanceByName( 'Cart' );
            }
            // this._cart.dispatchEvent('onSplitCheck', null);

            return this._cart;
        },

        getTableListObj: function() {
            if(this._tableListObj == null) {
                this._tableListObj = document.getElementById('tablescrollabletree');
            }
            return this._tableListObj;
        },

        getRegionListObj: function() {
            if(this._regionListObj == null) {
                this._regionListObj = document.getElementById('regionscrollabletree');
            }
            return this._regionListObj;
        },

        getMarkListObj: function() {
            if(this._markListObj == null) {
                this._markListObj = document.getElementById('markscrollabletree');
            }
            return this._markListObj;
        },


        /**
         * select table by index
         * 
         * @param {Number} index
         */
        selectTable: function(index) {
            this.getTableListObj().selection.select(index);
            if (index > -1) {
                var table = this.getTableListObj().datasource.data[index];
                GeckoJS.FormHelper.unserializeFromObject('tableForm', table);
                this.getTableListObj().treeBoxObject.ensureRowIsVisible(index);
            }

            this.validateForm();
        },

        /**
         * select Region by index
         *
         * @param {Number} index
         */
        selectRegion: function(index) {
            this.getRegionListObj().selection.select(index);
            if (index > -1) {
                var region = this.getRegionListObj().datasource.data[index];
                GeckoJS.FormHelper.unserializeFromObject('regionForm', region);
                this.getRegionListObj().treeBoxObject.ensureRowIsVisible(index);
            }

            this.validateRegionForm();
        },

        /**
         * select Mark by index
         */
        selectMark: function(index){

            this.getMarkListObj().selection.select(index);
            this.getMarkListObj().treeBoxObject.ensureRowIsVisible(index);
            if (index > -1) {
                var inputObj = this.getMarkListObj().datasource.data[index];
                GeckoJS.FormHelper.unserializeFromObject('markForm', inputObj);
                this.getMarkListObj().treeBoxObject.ensureRowIsVisible(index);
            }
            else {
                GeckoJS.FormHelper.reset('destinationForm');
            }

            this.validateMarkForm();
        },


        /**
         * auto create tables by number
         */
        autoCreateTables: function() {

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=550';
            var inputObj = {
                input0:null,
                require0:true,
                input1:null,
                require1:true,
                numpad:true,
                digitOnly0:true
            };

            this.topmostWindow.openDialog(aURL, _('Add Tables'), features, _('Adding New Tables'), '', _('Number of New Tables'), _('Number of Seats per Table'), inputObj);
            if (inputObj.ok && inputObj.input0) {
                var num = inputObj.input0 || 0;
                var defaultSeats = inputObj.input1 || 2;

                for(var no = 1; no <= num; no++) {
                    var table_no = no;
                    var table_name = 'T' + no;
                    var seats = defaultSeats;

                    var newTable = {
                        table_no: table_no+'',
                        table_name: table_name,
                        active: true,
                        seats: seats
                    };

                    this.Table.addTable(newTable);

                }

                this.loadTables(0);

                this._needRestart = true;

                OsdUtils.info(_('[%S] new tables added successfully', [num]));
            }
        },


        /**
         * addTable and support autoCreateTables
         */
        addTable: function() {
            if (this._isBusy) return;
            this._isBusy = true;

            try {
                // no any table, batch create.
                if (this.getTableListObj().datasource.data.length <= 0) {
                    this.autoCreateTables();

                    this._isBusy = false;
                    return;
                }

                var aURL = 'chrome://viviecr/content/prompt_additem.xul';
                var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=550';
                var inputObj = {
                    input0:null,
                    require0:true,
                    input1:null,
                    require1:true,
                    numpad:true,
                    digitOnly0:true
                };

                this.topmostWindow.openDialog(aURL, _('Add Table'), features, _('New Table'), '', _('Table Number'), _('Table Name'), inputObj);
                if (inputObj.ok && inputObj.input0) {

                    var table_no = inputObj.input0;
                    if (table_no <= 0) {
                        NotifyUtils.warn(_('Table number [%S] is invalid', [table_no]));
                        this._isBusy = false;
                        return;
                    }

                    var table_name = inputObj.input1;

                    var newTable = {
                        table_no: table_no,
                        table_name: table_name,
                        active: true,
                        seats: 4
                    };

                    var success = this.Table.addTable(newTable);

                    if (success) {

                        // reload tables
                        var tables = this.Table.getTables(true);

                        // find table_no 's index
                        var index = -1;
                        tables.forEach(function(table, idx){
                            if (table.table_no == table_no) index = idx;
                        });

                        // update UI
                        this.loadTables(index);

                        this._needRestart = true;

                        OsdUtils.info(_('Table number [%S] added successfully', [table_no]));

                    }else {
                        // duplicate
                        NotifyUtils.warn(_('Table number [%S] has already been assigned', [table_no]));
                    }
                }
            } finally {
                this._isBusy = false;
            }
        },


        /**
         * modify table
         */
        modifyTable: function() {
            if (this._isBusy) return;
            this._isBusy = true;

            try {
                var index = this.getTableListObj().selectedIndex;
                var inputObj = GeckoJS.FormHelper.serializeToObject('tableForm');

                if (index > -1 && inputObj.id != '' && inputObj.table_no != '') {

                    var success = this.Table.updateTable(inputObj.id, inputObj);

                    if (success) {

                        // only repaint tree
                        var table = GREUtils.extend(this.getTableListObj().datasource.data[index], inputObj);
                        this.getTableListObj().datasource.data[index] = table;
                        this.getTableListObj().treeBoxObject.invalidateRow(index);

                        this._needRestart = true;

                        OsdUtils.info(_('Table [%S (%S)] modified successfully', [table.table_no, table.table_name]));
                    }
                }
            } finally {
                this._isBusy = false;
            }
        },


        /**
         * deleteTable
         */
        deleteTable: function() {
            if (this._isBusy) return;
            this._isBusy = true;

            try {
                var index = this.getTableListObj().selectedIndex;
                if (index >= 0) {
                    var table = this.getTableListObj().datasource.data[index];
                    var nextIndex = (index == (this.getTableListObj().datasource.data.length-1)) ? index -1 : index;

                    if (!GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete table [%S (%S)]', [table.table_no, table.table_name]),
                        _('Are you sure you want to delete table [%S (%S)]?', [table.table_no, table.table_name]))) {
                        return;
                    }

                    var success = this.Table.removeTable(table.id);

                    if (success) {

                        // only repaint tree
                        var orgCount = this.getTableListObj().datasource.data.length;
                        this.getTableListObj().datasource.data.splice(index, 1);
                        var newCount = this.getTableListObj().datasource.data.length;
                        this.getTableListObj().treeBoxObject.rowCountChanged(orgCount, (newCount-orgCount), index);

                        this._needRestart = true;

                        OsdUtils.info(_('Table [%S (%S)] deleted successfully', [table.table_no, table.table_name]));
                    }

                }
            } finally {
                this._isBusy = false;
            }
        },


        /**
         * toggle Table active flag
         */
        toggleTable: function() {
            if (this._isBusy) return;
            this._isBusy = true;

            try {
                var index = this.getTableListObj().selectedIndex;
                var inputObj = GeckoJS.FormHelper.serializeToObject('tableForm');

                if (index > -1 && inputObj.id != '' && inputObj.table_no != '' && inputObj.table_name != '') {

                    var success = this.Table.toggleTable(inputObj.id);

                    if (success) {

                        // only repaint tree
                        var table = this.getTableListObj().datasource.data[index];
                        table.active = !table.active;
                        this.getTableListObj().datasource.data[index] = table;
                        this.getTableListObj().treeBoxObject.invalidateRow(index);

                        this._needRestart = true;

                        OsdUtils.info(_('Table [%S (%S)] modified successfully', [inputObj.table_no, inputObj.table_name]));
                    }

                }
            } finally {
                this._isBusy = false;
            }
        },

        /**
         * rebuildTableStatus
         */
        rebuildTableStatus: function() {

            if (this._isBusy) return;
            this._isBusy = true;

            try {

                var success = this.TableStatus.rebuildTableStatus();

                if (success) {

                    GREUtils.Dialog.alert(this.topmostWindow,
                        _('Table Status'),
                        _('Table status rebuilt successfully'));
                }
                else {
                    GREUtils.Dialog.alert(this.topmostWindow,
                        _('Table Status'),
                        _('Failed to rebuild table status, please check the network connectivity to the terminal designated as the table status server [message #2101]'));
                }
            } finally {
                this._isBusy = false;
            }

        },

        /**
         * Add Table Region to Local Database.
         */
        addRegion: function() {

            if (this._isBusy) return;
            this._isBusy = true;

            try {
                var aURL = 'chrome://viviecr/content/prompt_additem.xul';
                var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=500';
                var inputObj = {
                    input0:null,
                    require0:true,
                    numpad:true
                };

                this.topmostWindow.openDialog(aURL, _('Add Region'), features, _('New Region'), '', _('Region Name'), '', inputObj);
                if (inputObj.ok && inputObj.input0) {

                    var region_name = inputObj.input0;

                    var newRegion = {
                        name: region_name,
                        image: ''
                    };

                    var success = this.TableRegion.addTableRegion(newRegion);

                    if (success) {

                        // reload regions 
                        var regions = this.TableRegion.getTableRegions(true);

                        // find region_name 's index
                        var index = -1;
                        regions.forEach(function(region, idx){
                            if (region.name == region_name) index = idx;
                        });
 
                        // update UI
                        this.loadRegions(index);

                        this._needRestart = true;

                        OsdUtils.info(_('Region [%S] added successfully', [region_name]));
                       
                    }else {
                        // duplicate
                        NotifyUtils.warn(_('Region [%S] has already been assigned', [region_name]));
                    }
                }
            } finally {
                this._isBusy = false;
            }
        },

        /**
         * Modify Table Region to Local Database 
         */
        modifyRegion: function() {

            if (this._isBusy) return;
            this._isBusy = true;

            try {
                var index = this.getRegionListObj().selectedIndex;
                var inputObj = GeckoJS.FormHelper.serializeToObject('regionForm');

                if (index > -1 && inputObj.id != '' && inputObj.name != '') {

                    var success = this.TableRegion.updateTableRegion(inputObj.id, inputObj);

                    if (success) {
                        // reload regions (maybe order changed)
                        var regions = this.TableRegion.getTableRegions(true);
                        var region_name = inputObj.name;

                        // find region_name 's index
                        index = -1;
                        regions.forEach(function(region, idx){
                            if (region.name == region_name) index = idx;
                        });
 
                        // update UI
                        this.loadRegions(index);

                        this._needRestart = true;                        

                        OsdUtils.info(_('Region [%S] modified successfully', [region_name]));
                    }
                    
                }
            } finally {
                this._isBusy = false;
            }
        },

        /**
         * Delete Table Region to Local Database.
         */
        deleteRegion: function() {

            if (this._isBusy) return;
            this._isBusy = true;

            try {
                var index = this.getRegionListObj().selectedIndex;
                if (index >= 0) {
                    var region = this.getRegionListObj().datasource.data[index];
                    var nextIndex = (index == (this.getRegionListObj().datasource.data.length-1)) ? index -1 : index;

                    if (!GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete region [%S (%S)]', [region.name]),
                        _('Are you sure you want to delete region [%S]?', [region.name]))) {
                        return;
                    }

                    var success = this.TableRegion.removeTableRegion(region.id);

                    if (success) {

                        // update UI
                        this.loadRegions(nextIndex);

                        this._needRestart = true;

                        OsdUtils.info(_('Region [%S] deleted successfully', [region.name]));
                    }

                }
            } finally {
                this._isBusy = false;
            }
        },

        /**
         * load / reload Table Regions from Server / Local database and update UI
         * 
         * @param {Number} index
         */
        loadRegions: function(index) {
            //
            var regions = this.TableRegion.getTableRegions(true);
            this.getRegionListObj().datasource = regions;

            document.getElementById('region_count').value = regions.length;

            this.selectRegion(index);

            // update Region menu UI
            this.setRegionMenuItem();

            return regions;

        },

        /**
         * load / reload Tables from Server / Local database and update UI
         *
         * @param {Number} index
         */
        loadTables: function(index) {

            // tables
            var tables = this.Table.getTables(true);
            this.getTableListObj().datasource = tables;

            document.getElementById('table_count').value = tables.length;

            this.selectTable(index);

            return tables;
        },


        /**
         * addMark
         */
        addMark: function(){

            if (this._isBusy) return;
            this._isBusy = true;

            try {

                var aURL = 'chrome://viviecr/content/prompt_additem.xul';
                var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
                var inputObj = {
                    input0:null,
                    require0:true
                };

                GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Table Status'), features,
                    _('New Table Status'), '', _('Table Status'), '', inputObj);

                if (inputObj.ok && inputObj.input0) {

                    var mark_name = inputObj.input0.replace('\'', '"', 'g');

                    var newMark = {
                        name: mark_name,
                        period: 0,
                        opdeny: false
                    };

                    var success = this.TableMark.addTableMark(newMark);

                    if (success) {

                        // reload marks
                        var marks = this.TableMark.getTableMarks(true);

                        // find markName 's index
                        var index = -1;
                        marks.forEach(function(mark, idx){
                            if (mark.name == mark_name) index = idx;
                        });

                        // update UI
                        this.loadMarks(index);

                        this._needRestart = true;

                        OsdUtils.info(_('Table status [%S] added successfully', [mark_name]));

                    }else {

                        NotifyUtils.warn(_('Table status [%S] already exists', [mark_name]));

                    }
                }
            } finally {
                this._isBusy = false;
            }

        },

        /**
         * modifyMark
         */
        modifyMark: function() {

            if (this._isBusy) return;
            this._isBusy = true;

            try {

                var inputObj = GeckoJS.FormHelper.serializeToObject('markForm');
                var index = this.getMarkListObj().selectedIndex;
                if (index > -1 && inputObj.name != null && inputObj.name.length > 0) {

                    var orgMark = this.getMarkListObj().datasource.data[index];
                    var success = this.TableMark.updateTableMark(orgMark.id, inputObj);

                    if (success) {
                        // reload regions
                        var marks = this.TableMark.getTableMarks(true);
                        var mark_name = inputObj.name;

                        // find region_name 's index
                        index = -1;
                        marks.forEach(function(mark, idx){
                            if (mark.name == mark_name) index = idx;
                        });

                        // update UI
                        this.loadMarks(index);

                        this._needRestart = true;

                        OsdUtils.info(_('Table status [%S] modified successfully', [mark_name]));
                    }

                }
                
            } finally {
                this._isBusy = false;
            }

        },

        /**
         * deleteMark
         */
        deleteMark: function(){

            if (this._isBusy) return;
            this._isBusy = true;

            try {

                var index = this.getMarkListObj().selectedIndex;
            
                if (index >= 0) {

                    var mark = this.getMarkListObj().datasource.data[index];
                    var nextIndex = (index == (this.getMarkListObj().datasource.data.length-1)) ? index -1 : index;

                    if (!GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete table status [%S]', [mark.name]), _('Are you sure you want to delete table status [%S]?', [mark.name]))) {
                        return;
                    }
                    var success = this.TableMark.removeTableMark(mark.id);

                    if (success) {

                        // update UI
                        this.loadMarks(nextIndex);

                        this._needRestart = true;

                        OsdUtils.info(_('Table status [%S] deleted successfully', [mark.name]));
                    }

                }
            } finally {
                this._isBusy = false;
            }

        },


        /**
         * loadMarks
         * 
         * @param {Number} index    selectedIndex
         */
        loadMarks: function (index) {

            var marks = this.TableMark.getTableMarks(true);
            
            this.getMarkListObj().datasource = marks;

            this.selectMark(index);

            this.setAutoMarkMenuItem();

            return marks;

        },

        /**
         * setAutoMarkMenuItem
         */
        setAutoMarkMenuItem: function() {

            var marks = this.TableMark.getTableMarks() || [];

            var autoMarkObj = document.getElementById('automark_after_submit');

            // remove all child...
            autoMarkObj.removeAllItems();

            // append default empty
            if(marks.length > 0) autoMarkObj.appendItem('','');

            marks.forEach(function(data){
                autoMarkObj.appendItem(data.name, data.id);
            });

        },

        /**
         * setDestinationMenuItem
         */
        setDestinationMenuItem: function() {

            // read destinations from configure
            var destinations = GeckoJS.Configure.read('vivipos.fec.settings.Destinations') || [];
            var defaultDestination = GeckoJS.Configure.read('vivipos.fec.settings.DefaultDestination');
            
            if (destinations != null && destinations.length > 0) {
                destinations = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(destinations));
            }else {
                destinations = [];
            }
            var destinations2 = [];
            
            var destinationObj = document.getElementById('table_destination');
            destinationObj.removeAllItems();

            // append default empty
            if(destinations.length > 0) destinationObj.appendItem('','');

            destinations.forEach(function(data){
                var defaultMark = (data.name == defaultDestination) ? '* ' : '';
                destinationObj.appendItem(defaultMark+data.name, data.name);

                data.label =  defaultMark+data.name ;
                destinations2.push(data);
                
            });

            // update require buttons
            var tablenoDestinationObj = document.getElementById('tableno_destination');
            var guestnumDestinationObj = document.getElementById('guestnum_destination');

            tablenoDestinationObj.datasource = destinations2;
            guestnumDestinationObj.datasource = destinations2;


        },


        /**
         * setRegionMenuItem
         */
        setRegionMenuItem: function() {

            var regions = this.TableRegion.getTableRegions() || [];

            var regionObj = document.getElementById('table_region');
            var defaultRegionObj = document.getElementById('default_region');

            regionObj.removeAllItems();
            defaultRegionObj.removeAllItems();

            // append all regions
            defaultRegionObj.appendItem(_('All Regions'),'ALL');
            defaultRegionObj.appendItem(_('Available Tables'),'AVAILABLE');

            regions.forEach(function(data){
                regionObj.appendItem(data.name, data.id);
                defaultRegionObj.appendItem(data.name, data.id);
            });


        },

        /**
         * setMinimumChargeForMenuItem
         */
        setMinimumChargeForMenuItem: function() {

            var minimumChargeForObj = document.getElementById('minimumChargeFor');

            minimumChargeForObj.removeAllItems();

            for (var key in this._minimumChargeFor) {
                minimumChargeForObj.appendItem(this._minimumChargeFor[key], key);
            }
        },


        /**
         * setAnnotationMenuItem
         */
        setAnnotationMenuItem: function() {

            var annotationsObj = document.getElementById('annotationForOverrideMinimumCharge');

            annotationsObj.removeAllItems();

            var datas = GeckoJS.Configure.read('vivipos.fec.settings.Annotations');
            if (datas != null) {
                var codeDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datas));

                if (codeDatas) {
                    codeDatas.forEach(function(annotation) {
                        annotationsObj.appendItem(annotation.code + ' - ' + annotation.type , annotation.type);
                    });

                    annotationsObj.selectedIndex = 0;
                }

            }

        },


        setPrintCheckTemplates: function() {

            var transferTableTemplateObj = document.getElementById('print_check_after_transfer_table_template');
            var returnCartItemTemplateObj = document.getElementById('print_check_after_return_cart_item_template');
            var rushItemTemplateObj = document.getElementById('print_check_rush_item_template');
            
            transferTableTemplateObj.removeAllItems();
            returnCartItemTemplateObj.removeAllItems();
            rushItemTemplateObj.removeAllItems();

            let transferTableTemplates = this.getTemplates('transfertable-check');
            let returnItemTemplates = this.getTemplates('returnitem-check');
            let rushItemTemplates = this.getTemplates('rushitem-check');

            transferTableTemplates.forEach(function(tpl) {
                transferTableTemplateObj.appendItem(_(tpl.label), tpl.name, '');
            });
            returnItemTemplates.forEach(function(tpl) {
                returnCartItemTemplateObj.appendItem(_(tpl.label), tpl.name, '');
            });
            rushItemTemplates.forEach(function(tpl) {
                rushItemTemplateObj.appendItem(_(tpl.label), tpl.name, '');
            });

        },


        searchDialog: function () {

            var aURL = "chrome://viviecr/content/plusearch.xul";
            var aName = _('Product Search');

            var item = null;

            var buf = null;
            var aArguments = {
                buffer: buf,
                item: item,
                select: true
            };
            var width = GeckoJS.Session.get('screenwidth') || 800;
            var height = GeckoJS.Session.get('screenheight') || 600;

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, "chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=" + width + ",height=" + height, aArguments);

            if (aArguments.ok) {
                if (aArguments.item) {

                    var serializedPlu = GeckoJS.BaseObject.serialize(aArguments.item.Product);
                    document.getElementById('minimumChargePlu').value = serializedPlu;
                    document.getElementById('pluInfo').value = aArguments.item.Product.no + "-" + aArguments.item.Product.name;

                }else {
                    
            }
            }

            return null;

        },

        /**
         * read table settings from databases.
         * 
         * @param {Boolean} remote      use remote settings
         */
        readTableSettings: function(remote) {

            remote = remote || false;
            var settings = this.TableSetting.getTableSettings(true, remote);
            this.Form.reset('settingsForm');
            this.Form.unserializeFromObject('settingsForm', settings);


            // update require buttons
            var tablenoDestinationObj = document.getElementById('tableno_destination');
            var guestnumDestinationObj = document.getElementById('guestnum_destination');

            let datasourceDestinations = GeckoJS.Array.objectExtract(tablenoDestinationObj.datasource.data, '{n}.name');

            // update destination settings
            if(settings.RequireTableNo) {
                
                let destsByTableNo = settings.RequireTableNo.split(",");
                let selectedItems = [];

                destsByTableNo.forEach(function(dest) {
                    let index = GeckoJS.Array.inArray(dest, datasourceDestinations);
                    if (index != -1) selectedItems.push(index);
                });

                tablenoDestinationObj.selectedItems = selectedItems ;
                
            }

            if (settings.RequireGuestNum) {

                let destsByGuestNum = settings.RequireGuestNum.split(",");
                let selectedItems = [];

                destsByGuestNum.forEach(function(dest) {
                    let index = GeckoJS.Array.inArray(dest, datasourceDestinations);
                    if (index != -1) selectedItems.push(index);
                });

                guestnumDestinationObj.selectedItems = selectedItems ;
            }

            return settings;

        },

        /**
         * save table settings to databases.
         */
        saveTableSettings: function() {

            // get form values , only checked
            var settings = this.Form.serializeToObject('settingsForm', true);

            var tablenoDestinationObj = document.getElementById('tableno_destination');
            var guestnumDestinationObj = document.getElementById('guestnum_destination');

            let datasourceDestinations = GeckoJS.Array.objectExtract(tablenoDestinationObj.datasource.data, '{n}.name');

            if(settings.RequireTableNo) {
                let destsByTableNo = settings.RequireTableNo.split(",");
                let selectedItems = [];
                destsByTableNo.forEach(function(idx) {
                    selectedItems.push( datasourceDestinations[idx]);

                });
                settings.RequireTableNo = selectedItems.toString();
            }

            if (settings.RequireGuestNum) {
                let destsByGuestNum = settings.RequireGuestNum.split(",");
                let selectedItems = [];
                destsByGuestNum.forEach(function(idx) {
                    selectedItems.push( datasourceDestinations[idx]);

                });
                settings.RequireGuestNum = selectedItems.toString();
            }
            // get require destination
            this.TableSetting.saveTableSettings(settings);

            
        },

        /**
         * save settings and table status options.
         */
        saveSettings: function() {

            // save table_settings
            this.saveTableSettings();

            // reload setting
            var tableSettings = this.TableSetting.getTableSettings(true);

            // update setting to configure system.
            try {
                // set requireCheckNo to configure
                let requireCheckNo = ( tableSettings.RequireCheckNo ? true : false) || false  ;
                GeckoJS.Configure.write('vivipos.fec.settings.GuestCheck.TableSettings.RequireCheckNo', requireCheckNo, false );

                // set check_no sequence max value
                let maxCheckNo = tableSettings.MaxCheckNo || 100;
                if (requireCheckNo) {
                    let seqModel = new SequenceModel();
                    seqModel.setSequenceMaxValue('check_no', maxCheckNo);
                }
                this._needRestart = true;
            }catch(e) {
            }

            OsdUtils.info(_('Options saved successfully'));

        },

        cloneSettingsFromMaster: function() {
            //
            if (GREUtils.Dialog.confirm(this.topmostWindow,
                _('Clone Table Management Options'),
                _('Table management options will be cloned from the table status server.') + '\n\n' + _('Are you sure you want to proceed?') + '\n') == true) {

                this.readTableSettings(true);

            }

        },

        // return template registry objects
        getTemplates: function (type) {

            let templates = {};

            if (this._templates == null) {
                this._templates = GeckoJS.Configure.read('vivipos.fec.registry.templates');
            }
            if (!type) {
                templates = this._templates;
            }
            else {
                for (var tmpl in this._templates) {
                    var tpl = this._templates[tmpl];
                    if (tpl.type && (tpl.type.split(',').indexOf(type) > -1)) {
                        templates[tmpl] = tpl;
                    }
                }
            }

            let sortedTemplates = [];
            for (let tmpl in templates) {
                let newTemplate = GREUtils.extend({}, templates[tmpl]);
                newTemplate.name = tmpl;

                var label = newTemplate.label;
                if (label.indexOf('chrome://') == 0) {
                    var keystr = 'vivipos.fec.registry.templates.' + tmpl + '.label';
                    label = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
                }
                else {
                    label = _(label);
                }
                newTemplate.label = label;
                sortedTemplates.push(newTemplate);
            }
            sortedTemplates = new GeckoJS.ArrayQuery(sortedTemplates).orderBy('label asc');

            return sortedTemplates;

        },


        /**
         * callback function when document onload.
         */
        load: function() {

            // load regions and update tree
            var regions = this.loadRegions(0);

            // load marks and update menu UI
            this.loadMarks(0);

            // set nsitableview
            var tablesView = new NSITablesView();
            tablesView.setRegions(regions);
            this.getTableListObj().datasource = tablesView;
            this.loadTables(0);

            this.disableClientBtns();

            // load minimum charge item
            this.setMinimumChargeForMenuItem();

            // load annotation
            this.setAnnotationMenuItem();

            // update destination menu UI.
            this.setDestinationMenuItem();

            // get template with check type
            this.setPrintCheckTemplates('check');

            // get table settings and update UI
            this.readTableSettings();

        },


        /**
         * doExit check restart and confirm
         */
        doExit: function() {
            //
            //this._getTableStatusModel()._tableStatusLastTime = 0;

            if (this._needRestart) {
                var restartMsg = _('Modification of tables and regions requires system restart to take effect.') + '\n' +
                _('The system will restart automatically after you return to the Main Screen.');
                GREUtils.Dialog.alert(this.topmostWindow, _("Table Manager"), restartMsg);
                GeckoJS.Observer.notify(null, 'prepare-to-restart', this);

            }
            doOKButton();
        },

        /**
         * validateMarkFrom and Disabled modify/delete buttons
         */
        validateMarkForm: function() {

            var index = this.getMarkListObj().selectedIndex;
            var modBtn = document.getElementById('modify_mark');
            var delBtn = document.getElementById('delete_mark');

            if (this.getMarkListObj().datasource.data.length <= 0) {
                index = -1;
            }
            modBtn.setAttribute('disabled', index == -1);
            delBtn.setAttribute('disabled', index == -1);
        },

        /**
         * validateRegionFrom and Disabled modify/delete buttons
         */
        validateRegionForm: function() {

            var index = this.getRegionListObj().selectedIndex;
            var modBtn = document.getElementById('modify_region');
            var delBtn = document.getElementById('delete_region');

            if (this.getRegionListObj().datasource.data.length <= 0) {
                index = -1;
            }
            modBtn.setAttribute('disabled', index == -1);
            delBtn.setAttribute('disabled', index == -1);
        },

        /**
         * validateFrom and Disabled modify/delete buttons
         */
        validateForm: function() {

            var index = this.getTableListObj().selectedIndex;
            // var autoCreateBtn = document.getElementById('auto_create_table');
            var addBtn = document.getElementById('add_table');
            var modBtn = document.getElementById('modify_table');
            var delBtn = document.getElementById('delete_table');
            var toggleBtn = document.getElementById('toggleactive_table');

            if (this.getTableListObj().datasource.data.length <= 0) {
                index = -1;
            }
            modBtn.setAttribute('disabled', index == -1);
            delBtn.setAttribute('disabled', index == -1);
            toggleBtn.setAttribute('disabled', index == -1);

        },

        /**
         * disable buttons when terminal is client
         */
        disableClientBtns: function() {
            // table
            if(this.Table.isRemoteService()) {
                document.getElementById('add_table').setAttribute('hidden', true);
                document.getElementById('modify_table').setAttribute('hidden', true);
                document.getElementById('delete_table').setAttribute('hidden', true);
                document.getElementById('toggleactive_table').setAttribute('hidden', true);
            }

            // region
            if(this.TableRegion.isRemoteService()) {
                document.getElementById('add_region').setAttribute('hidden', true);
                document.getElementById('modify_region').setAttribute('hidden', true);
                document.getElementById('delete_region').setAttribute('hidden', true);
            }

            // mark
            if(this.TableMark.isRemoteService()) {
                document.getElementById('add_mark').setAttribute('hidden', true);
                document.getElementById('modify_mark').setAttribute('hidden', true);
                document.getElementById('delete_mark').setAttribute('hidden', true);
                document.getElementById('rebuild_status').setAttribute('hidden', true);
            }

            // settings
            if(this.TableSetting.isRemoteService()) {
                // can edit always
                document.getElementById('automark_after_submit').setAttribute('disabled', true);
            }else {
                document.getElementById('clone_settings_from_master').setAttribute('hidden', true);
            }

        }


    };
    
    GeckoJS.Controller.extend(__controller__);

})();

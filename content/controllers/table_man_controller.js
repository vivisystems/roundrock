(function(){

    /**
     * Class TableManController
     */

    var __controller__ = {
        name: 'TableMan',
        _tables: [],
        _regions: [],


        _regionListDatas: null,
        _regionListObj: null,
        _tableListDatas: null,
        _tableListObj: null,
        _tableStatusModel: null,
        _cart: null,
        _markListDatas: null,
        _markListObj: null,

        _minimumChargeFor: {'0': _('Final Amount'), '1': _('Original Amount') /*, '2': _('No Revalue'), '3': _('No Promotion') */},

        _tableSettings: null,


        initial: function() {
            // load default destination
            /*
            var defaultDest = null;
            var datastr = GeckoJS.Configure.read('vivipos.fec.settings.Destinations');
            var listDatas = null;

            if (datastr != null) {
                listDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datastr));
                var curDefaults = new GeckoJS.ArrayQuery(listDatas).filter('defaultMark = *');
                if (curDefaults.length > 0) {
                    defaultDest = curDefaults[0];
                }
            }
            GeckoJS.Session.set('destinations', listDatas);
            GeckoJS.Session.set('defaultDestination', defaultDest);

            // add listener for newTransaction event
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if (cart) {
                cart.addEventListener('newTransaction', this.initTransaction, this);
            }
            */
        },

        _getTableStatusModel: function() {
            if (this._tableStatusModel == null) {

                var cart = this.getCartController();
                this._tableStatusModel = cart.GuestCheck._tableStatusModel;

            }
            return this._tableStatusModel;
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

        switchTab: function(index) {

            switch (index) {
                case 0:
                    break;
                case 2:
                    var table_no = document.getElementById('table_id').value;
                    this.requestCommand('loadBookings', table_no, 'TableBook');
                    this.requestCommand('selectBooking', 0, 'TableBook');
                    break;
            }
        },

        selectTable: function(index) {
            // clear form
            GeckoJS.FormHelper.reset('tableForm');

            this.getTableListObj().selection.select(index);
            if (index > -1) {
                var table = this._tableListDatas[index];
                GeckoJS.FormHelper.unserializeFromObject('tableForm', table);

                /*
                var table_id = document.getElementById('table_id').value;
                var table_no = document.getElementById('table_no').value;
                this.requestCommand('setTableId', table_id, 'TableBook');
                this.requestCommand('setTableNo', table_no, 'TableBook');
                */
                this.requestCommand('load', null, 'TableBook');
            }

            this.validateForm();
        },

        selectRegion: function(index) {
            // clear form
            GeckoJS.FormHelper.reset('regionForm');

            this.getRegionListObj().selection.select(index);
            if (index > -1) {
                var region = this._regionListDatas[index];
                GeckoJS.FormHelper.unserializeFromObject('regionForm', region);
            }

            this.validateRegionForm();
        },

        selectMark: function(index){
            // clear form
            GeckoJS.FormHelper.reset('markForm');

            this.getMarkListObj().selection.select(index);
            this.getMarkListObj().treeBoxObject.ensureRowIsVisible(index);
            if (index > -1) {
                var inputObj = this._markListDatas[index];
//                if (inputObj.defaultMark == '*')
//                    inputObj.defaultCheckbox = 1;
//                else
//                    inputObj.defaultCheckbox = 0;
                GeckoJS.FormHelper.unserializeFromObject('markForm', inputObj);

            }
            else {
                GeckoJS.FormHelper.reset('destinationForm');
            }

            this.validateMarkForm();
        },

        isDuplicate: function(table_no) {

            var tableModel = new TableModel();
//            var table = tableModel.findByIndex('first', {
//                index: 'table_no',
//                value: table_no
//            });
            var table = tableModel.find('first', {conditions: "table_no='" + table_no + "'", recursive: 0});

            return (table != null);
        },

        addTable: function() {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=540,height=500';
            var inputObj = {input0:null, require0:true, input1:null, require1:true, numpad:true, digitOnly0:true};

            this.topmostWindow.openDialog(aURL, _('Add Table'), features, _('New Table'), '', _('Table Number'), _('Table Name'), inputObj);
            if (inputObj.ok && inputObj.input0) {

                var table_no = inputObj.input0;
                if (table_no <= 0) {
                    // @todo OSD
                    NotifyUtils.warn(_('Table Number [%S] is invalid', [table_no]));
                    return;
                }
                if (this.isDuplicate(table_no)) {
                    // @todo OSD
                    NotifyUtils.warn(_('Table Number [%S] has already been assigned', [table_no]));
                    return;
                }

                var table_name = inputObj.input1;

                var newTable = {table_no: table_no, table_name: table_name, active: true, seats: 4};

                var tableModel = new TableModel();
                tableModel.id = '';
                newTable = tableModel.save(newTable);

                // add table_status
                var newTableStatus = {table_id:newTable.id, table_no: table_no};
                this._getTableStatusModel().id = '';
                newTableStatus = this._getTableStatusModel().save(newTableStatus);

                this.loadTables();

//                this._tableListDatas.push(newTable);
//                this._tableListDatas = new GeckoJS.ArrayQuery(this._tableListDatas).orderBy('name asc');

                // loop through this._listDatas to find the newly added destination
                var index
                for (index = 0; index < this._tableListDatas.length; index++) {
                    if (this._tableListDatas[index].table_no == table_no) {
                        break;
                    }
                }

//                this.getTableListObj().treeBoxObject.rowCountChanged(index, 1);

                // make sure row is visible
                this.getTableListObj().treeBoxObject.ensureRowIsVisible(index);

                // select the new Table
                this.selectTable(index);

                // switch to edit mode
                // this.editMode();

                // @todo OSD
                OsdUtils.info(_('Table [%S] added successfully', [table_no]));
            }
        },

        modifyTable: function() {
            var index = this.getTableListObj().selectedIndex;
            var inputObj = GeckoJS.FormHelper.serializeToObject('tableForm');

            if (index > -1 && inputObj.id != '' && inputObj.table_no != '' && inputObj.table_name != '') {
                // var table = this._tableListDatas[index];
                var table = inputObj;

                var tableModel = new TableModel();
                tableModel.id = inputObj.id;
                inputObj.active = GeckoJS.String.parseBoolean(inputObj.active);
                var tables = tableModel.save(inputObj);

                // update table_status
                /*
                var newTableStatus = {id:table.table_status_id ,table_id:table.id, table_no: table.table_no};
                var tableStatusModel = new TableStatusModel();
                tableStatusModel.id = table.table_status_id;
                newTableStatus = tableStatusModel.save(newTableStatus);
                delete tableStatusModel;
                */
                var newTableStatus = {id:table.table_status_id ,table_id:table.id, table_no: table.table_no};

                this._getTableStatusModel().id = table.table_status_id;
                this._getTableStatusModel().save(newTableStatus);

                this.loadTables();

                // loop through this._listDatas to find the newly modified destination
                var newIndex;
                for (newIndex = 0; newIndex < this._tableListDatas.length; newIndex++) {
                    if (this._tableListDatas[newIndex].table_no == table.table_no) {
                        break;
                    }
                }
                this.getTableListObj().treeBoxObject.invalidate();

                // make sure row is visible
                this.getTableListObj().treeBoxObject.ensureRowIsVisible(newIndex);

                // select the new customer
                this.selectTable(newIndex);

                // @todo OSD
                OsdUtils.info(_('Table [%S (%S)] modified successfully', [inputObj.table_no, inputObj.table_name]));
            }
        },

        deleteTable: function() {
            var index = this.getTableListObj().selectedIndex;
            if (index >= 0) {
                var table = this._tableListDatas[index];

                if (!GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete table [%S (%S)]', [table.table_no, table.table_name]),
                                             _('Are you sure you want to delete table [%S (%S)]?', [table.table_no, table.table_name]))) {
                    return;
                }
                
                var tableModel = new TableModel();
                tableModel.del(table.id);
                delete tableModel;


                // update table_status
                /*
                var tableStatusModel = new TableStatusModel();
                tableStatusModel.del(table.table_status_id);
                delete tableStatusModel;
                */
                this._getTableStatusModel().del(table.table_status_id);

                this._tableListDatas.splice(index, 1);

                this.getTableListObj().treeBoxObject.rowCountChanged(index, -1);

                if (index >= this._tableListDatas.length) index = this._tableListDatas.length - 1;
                this.getTableListObj().treeBoxObject.ensureRowIsVisible(index);

                this.selectTable(index);

                // this.searchMode();

                // @todo OSD
                OsdUtils.info(_('Table [%S (%S)] deleted successfully', [table.table_no, table.table_name]));
            }
        },

        toggleTable: function() {

            var index = this.getTableListObj().selectedIndex;
            var inputObj = GeckoJS.FormHelper.serializeToObject('tableForm');

            if (index > -1 && inputObj.id != '' && inputObj.table_no != '' && inputObj.table_name != '') {

                var table_no = inputObj.table_no;
                var tableModel = new TableModel();
                tableModel.id = inputObj.id;

                inputObj.active = !GeckoJS.String.parseBoolean(inputObj.active);

                var table = tableModel.save(inputObj);

                this.loadTables();

                // loop through this._listDatas to find the newly modified destination
                var newIndex;
                for (newIndex = 0; newIndex < this._tableListDatas.length; newIndex++) {
                    if (this._tableListDatas[newIndex].table_no == table.table_no) {
                        break;
                    }
                }
                this.getTableListObj().treeBoxObject.invalidate();

                // make sure row is visible
                this.getTableListObj().treeBoxObject.ensureRowIsVisible(newIndex);

                // select the new customer
                this.selectTable(newIndex);

                // @todo OSD
                OsdUtils.info(_('Table [%S (%S)] modified successfully', [inputObj.table_no, inputObj.table_name]));
            }
        },

        addRegion: function() {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=500';
            var inputObj = {input0:null, require0:true, input1:null, require1:false, numpad:true};

            this.topmostWindow.openDialog(aURL, _('Add Region'), features, _('New Region'), '', _('Region Name'), '', inputObj);
            if (inputObj.ok && inputObj.input0) {

                var region_name = inputObj.input0;

                var newRegion = {name: region_name, image: ''};

                var regionModel = new TableRegionModel();
                newRegion = regionModel.save(newRegion);

                this._regionListDatas.push(newRegion);
                this._regionListDatas = new GeckoJS.ArrayQuery(this._regionListDatas).orderBy('name asc');

                // loop through this._listDatas to find the newly added destination
                var index
                for (index = 0; index < this._regionListDatas.length; index++) {
                    if (this._regionListDatas[index].name == region_name) {
                        break;
                    }
                }
                this.getRegionListObj().treeBoxObject.rowCountChanged(index, 1);

                // make sure row is visible
                this.getRegionListObj().treeBoxObject.ensureRowIsVisible(index);

                // select the new Table
                this.selectRegion(index);

                // switch to edit mode
                // this.editMode();

                this.setRegionMenuItem();

                // @todo OSD
                OsdUtils.info(_('Region [%S] added successfully', [region_name]));
            }
        },

        modifyRegion: function() {
            var index = this.getRegionListObj().selectedIndex;
            var inputObj = GeckoJS.FormHelper.serializeToObject('regionForm');

            if (index > -1 && inputObj.id != '' && inputObj.name != '') {

                var regionModel = new TableRegionModel();
                regionModel.id = inputObj.id;
                var region = regionModel.save(inputObj);

                this.loadRegions();

                // loop through this._listDatas to find the newly modified destination
                var newIndex;
                for (newIndex = 0; newIndex < this._regionListDatas.length; newIndex++) {
                    if (this._regionListDatas[newIndex].name == region.name) {
                        break;
                    }
                }
                this.getRegionListObj().treeBoxObject.invalidate();

                // make sure row is visible
                this.getRegionListObj().treeBoxObject.ensureRowIsVisible(newIndex);

                // select the new customer
                this.selectRegion(newIndex);

                this.setRegionMenuItem();

                // @todo OSD
                OsdUtils.info(_('Region [%S] modified successfully', [inputObj.name]));
            }
        },

        deleteRegion: function() {
            var index = this.getRegionListObj().selectedIndex;
            if (index >= 0) {
                var region = this._regionListDatas[index];

                if (!GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete region [%S (%S)]', [region.name]),
                                             _('Are you sure you want to delete region [%S]?', [region.name]))) {
                    return;
                }

                var regionModel = new TableRegionModel();
                regionModel.del(region.id);

                this._regionListDatas.splice(index, 1);

                this.getRegionListObj().treeBoxObject.rowCountChanged(index, -1);

                if (index >= this._regionListDatas.length) index = this._regionListDatas.length - 1;
                this.getRegionListObj().treeBoxObject.ensureRowIsVisible(index);

                this.selectRegion(index);

                // this.searchMode();

                this.setRegionMenuItem();

                // @todo OSD
                OsdUtils.info(_('Region [%S] deleted successfully', [region.name]));
            }
        },

        loadRegions: function() {
            //
            var regionModel = new TableRegionModel();
            var regions = regionModel.find('all', {});
            this._regionListDatas = regions;
            var regionView =  new GeckoJS.NSITreeViewArray(this._regionListDatas);
            this.getRegionListObj().datasource = regionView;

            document.getElementById('region_count').value = this._regionListDatas.length;

        },

        loadTables: function() {
            //
            var fields = ['tables.table_no',
                            'tables.table_name',
                            'tables.seats',
                            'tables.active',
                            'tables.tag',
                            'tables.destination',
                            'tables.minimum_charge_per_table',
                            'tables.minimum_charge_per_guest',
                            'table_regions.name AS "Table.region"',
                            'tables.table_region_id',
                            'table_regions.image AS "Table.image"',
                            'table_statuses.id AS "Table.table_status_id"'
                        ];
            var orderby = 'tables.table_no ASC';
            
            var tableModel = new TableModel();
            var tables = tableModel.find('all', {fields: fields, order: orderby, recursive: 2});
            
            this._tableListDatas = tables;
            var tableView =  new GeckoJS.NSITreeViewArray(this._tableListDatas);
            tableView.getCellValue = function(row, col) {
                var sResult;
                var key = (typeof col == 'object') ? col.id : col;

                try {
                    if (key == 'active') {
                        sResult = this.data[row][key] ? '*' : ' ';
                    } else {
                        sResult= this.data[row][key];
                    }
                }
                catch (e) {
                    return "<" + row + "," + key + ">";
                }
                return sResult;
            }
            this.getTableListObj().datasource = tableView;

            document.getElementById('table_count').value = this._tableListDatas.length;

        },

        addMark: function(){
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {input0:null, require0:true};

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Table Mark'), features,
                                       _('New Table Mark'), '', _('Table Mark'), '', inputObj);
            if (inputObj.ok && inputObj.input0) {
                var markName = inputObj.input0.replace('\'', '"', 'g');

                var dupNames = new GeckoJS.ArrayQuery(this._markListDatas).filter('name = \'' + markName + '\'');
                if (dupNames.length > 0) {
                    // @todo OSD
                    NotifyUtils.warn(_('Table mark [%S] already exists', [markName]));
                    return;
                }

                // this._markListDatas.push({defaultMark: '', name: markName, pricelevel: '-', prefix: '', customerInfo: '0'});
                this._markListDatas.push({name: markName, period: 0, opdeny: false});

                this.saveMarks();

                // loop through this._listDatas to find the newly added destination and select it
                
                var index = 0;
                for (var index = 0; index < this._markListDatas.length; index++) {
                    if (this._markListDatas[index].name == markName) {
                        this.selectMark(index);
                        break;
                    }
                }
                
                // @todo OSD
                OsdUtils.info(_('Table mark [%S] added successfully', [markName]));
            }
        },

        modifyMark: function() {
            var inputObj = GeckoJS.FormHelper.serializeToObject('markForm');
            var index = this.getMarkListObj().selectedIndex;
            if (index > -1) {

                if (inputObj.name != null && inputObj.name.length > 0) {
                    this._markListDatas[index].period = inputObj.period;
                    this._markListDatas[index].opdeny = inputObj.opdeny;
                    // this.setDefaultDestination(inputObj.defaultCheckbox);

                    this.saveMarks();

                    var markName = this._markListDatas[index].name;

                    this.getMarkListObj().treeBoxObject.ensureRowIsVisible(index);
                    OsdUtils.info(_('Table mark [%S] modified successfully', [markName]));
                }
                else {
                    // shouldn't happen, but check anyways
                    NotifyUtils.warn(_('Table mark must not be empty'));
                }
            }
        },

        deleteMark: function(){
            var index = this.getMarkListObj().selectedIndex;
            if (index >= 0) {
                var markName = this._markListDatas[index].name;

                if (!GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete table mark [%S]', [markName]), _('Are you sure you want to delete table mark [%S]?', [markName]))) {
                    return;
                }

                this._markListDatas.splice(index, 1);
                this.saveMarks();

                // @todo OSD
                OsdUtils.info(_('Table mark [%S] deleted successfully', [markName]));

                index = this.getMarkListObj().selectedIndex;
                if (index >= this._markListDatas.length) index = this._markListDatas.length - 1;
                this.selectMark(index);
            }
        },

        saveMarks: function() {
            var datas = new GeckoJS.ArrayQuery(this._markListDatas).orderBy('name asc');
            var datastr = GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(datas));

            GeckoJS.Configure.write('vivipos.fec.settings.GuestCheck.TableMarks', datastr);
            // GeckoJS.Session.set('autoMarkTableAfterSubmitOrder', this.getAutoMarkTableAfterSubmitOrder());
            // GeckoJS.Session.set('tableMarks', datas);
            GeckoJS.Session.set('autoMarkAfterSubmitOrder', {});

            this.loadMarks();
        },

        loadMarks: function () {

            if (this._markListDatas == null) this._markListDatas = [];
            if (this._markListDatas.length <= 0) {
                var datas = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableMarks');
                if (datas != null) this._markListDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datas));
                if (this._markListDatas.length <= 0) this._markListDatas = [];
            }

            var markView =  new GeckoJS.NSITreeViewArray(this._markListDatas);
            markView.getCellValue = function(row, col) {
                var sResult;
                var key = (typeof col == 'object') ? col.id : col;

                try {
                    if (key == 'opdeny') {
                        sResult = this.data[row][key] ? '*' : ' ';
                    } else {
                        sResult= this.data[row][key];
                    }
                }
                catch (e) {
                    return "<" + row + "," + key + ">";
                }
                return sResult;
            }

            this.getMarkListObj().datasource = markView;

            // this.validateMarkForm();
        },

        seAutoMarkMenuItem: function() {

            var marks = this._markListDatas;

            var autoMarkObj = document.getElementById('automark_after_submit_menupopup');

            // remove all child...
            while (autoMarkObj.firstChild) {
                autoMarkObj.removeChild(autoMarkObj.firstChild);
            }

            var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
            menuitem.setAttribute('value', '');
            menuitem.setAttribute('label', ' ');
            autoMarkObj.appendChild(menuitem);

            if (marks && marks.length > 0) {
                marks.forEach(function(data){
                    var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                    menuitem.setAttribute('value', data.name);
                    menuitem.setAttribute('label', data.name);
                    autoMarkObj.appendChild(menuitem);
                });
            }
        },

        setDestinationMenuItem: function() {

            // read destinations from configure
            var destinations = GeckoJS.Configure.read('vivipos.fec.settings.Destinations');
            if (destinations != null) destinations = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(destinations));

            var destinationObj = document.getElementById('table_destination_menupopup');

            // remove all child...
            while (destinationObj.firstChild) {
                destinationObj.removeChild(destinationObj.firstChild);
            }

            var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
            menuitem.setAttribute('value', '');
            menuitem.setAttribute('label', ' ');
            destinationObj.appendChild(menuitem);

            if (destinations && destinations.length > 0) {
                destinations.forEach(function(data){
                    var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                    menuitem.setAttribute('value', data.name);
                    menuitem.setAttribute('label', data.defaultMark + data.name);
                    destinationObj.appendChild(menuitem);
                });
            }
        },

        setRegionMenuItem: function() {
            var regionModel = new TableRegionModel();
            var regions = regionModel.find('all', {
                fields: ['id', 'name']
                });
            var regionObj = document.getElementById('table_region_menupopup');

            // remove all child...
            while (regionObj.firstChild) {
                regionObj.removeChild(regionObj.firstChild);
            }

            if (regions && regions.length > 0) {
                regions.forEach(function(data){
                    var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                    menuitem.setAttribute('value', data.id);
                    menuitem.setAttribute('label', data.name);
                    regionObj.appendChild(menuitem);
                });
            }
        },

        setMinimumChargeForMenuItem: function() {

            var minimumChargeForObj = document.getElementById('minimumChargeForPopup');

            // remove all child...
            while (minimumChargeForObj.firstChild) {
                minimumChargeForObj.removeChild(minimumChargeForObj.firstChild);
            }

            for (var key in this._minimumChargeFor) {
                var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                menuitem.setAttribute('value', key);
                menuitem.setAttribute('label', this._minimumChargeFor[key]);
                minimumChargeForObj.appendChild(menuitem);
            }
        },

        searchDialog: function () {

            var aURL = "chrome://viviecr/content/plusearch.xul";
            var aName = _('Product Search');

            var item = null;

            var buf = null;
            var aArguments = {
                buffer: buf,
                item: item
            };
            var width = this.screenwidth;
            var height = this.screenheight;

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

        readTableSettings: function() {
            //
            this._tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};

            return this._tableSettings;
        },

        saveTableSettings: function(settings) {
            //
            this._tableSettings = settings;
            GeckoJS.Configure.write('vivipos.fec.settings.GuestCheck.TableSettings', this._tableSettings);
            
        },

        saveSettings: function() {
            var settings = GeckoJS.FormHelper.serializeToObject('settingsForm');
            this.saveTableSettings(settings);
            GeckoJS.Session.set('autoMarkAfterSubmitOrder', {});
            // @todo OSD
            OsdUtils.info(_('Options saved successfully'));
        },

        load: function() {
            //
            var settings = this.readTableSettings();
            GeckoJS.FormHelper.unserializeFromObject('settingsForm', settings);

            this.setDestinationMenuItem();
            this.setRegionMenuItem();
            this.setMinimumChargeForMenuItem();
            this.loadRegions();
            this.selectRegion(0);
            this.loadTables();
            this.selectTable(0);
            this.loadMarks();
            this.selectMark(0);
            this.seAutoMarkMenuItem();

        },

        doExit: function() {
            //
            this._getTableStatusModel()._tableStatusLastTime = 0;
            doOKButton();
        },

        validateMarkForm: function() {
            var index = this.getMarkListObj().selectedIndex;
            var modBtn = document.getElementById('modify_mark');
            var delBtn = document.getElementById('delete_mark');

            if (this._markListDatas.length <= 0) {
                index = -1;
            }
            modBtn.setAttribute('disabled', index == -1);
            delBtn.setAttribute('disabled', index == -1);
        },

        validateRegionForm: function() {
            var index = this.getRegionListObj().selectedIndex;
            var modBtn = document.getElementById('modify_region');
            var delBtn = document.getElementById('delete_region');

            if (this._regionListDatas.length <= 0) {
                index = -1;
            }
            modBtn.setAttribute('disabled', index == -1);
            delBtn.setAttribute('disabled', index == -1);
        },

        validateForm: function() {
            var index = this.getTableListObj().selectedIndex;
            var modBtn = document.getElementById('modify_table');
            var delBtn = document.getElementById('delete_table');
            var toggleBtn = document.getElementById('toggleactive_table');


            if (this._tableListDatas.length <= 0) {
                index = -1;
            }
            modBtn.setAttribute('disabled', index == -1);
            delBtn.setAttribute('disabled', index == -1);
            toggleBtn.setAttribute('disabled', index == -1);
        }

    };
    
    GeckoJS.Controller.extend(__controller__);

})();

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
        _bookingListDatas: null,
        _bookingListObj: null,

        _tableSettings: null,


        initial: function () {
            //
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

        getBookingListObj: function() {
            if(this._bookingListObj == null) {
                this._bookingListObj = document.getElementById('bookingscrollabletree');
            }
            return this._bookingListObj;
        },

        switchTab: function(index) {
            //
            // this.log('switchTab:' + index);
            if (index == 2) {
                this.loadBookings();
                this.selectBooking(0);
            }
        },

        selectTable: function(index) {
            // clear form
            GeckoJS.FormHelper.reset('tableForm');

            this.getTableListObj().vivitree.selection.select(index);
            if (index > -1) {
                var table = this._tableListDatas[index];
this.log("table:");
this.log(this.dump(table));
                GeckoJS.FormHelper.unserializeFromObject('tableForm', table);
            }

            // this.validateForm();
        },

        selectRegion: function(index) {
            // clear form
            GeckoJS.FormHelper.reset('regionForm');

            this.getRegionListObj().vivitree.selection.select(index);
            if (index > -1) {
                var region = this._regionListDatas[index];
                GeckoJS.FormHelper.unserializeFromObject('regionForm', region);
            }
        },

        selectBooking: function(index) {
            // clear form
            GeckoJS.FormHelper.reset('bookingForm');

            this.getBookingListObj().vivitree.selection.select(index);
            if (index > -1) {
                var booking = this._bookingListDatas[index];
                if (booking) {
                    GeckoJS.FormHelper.unserializeFromObject('bookingForm', booking);
                    document.getElementById('booking_time_tmp').value = parseInt(booking.booking) * 1000;
                }
            }
        },

        isDuplicate: function(table_no) {

            var tableModel = new TableModel();
//            var table = tableModel.findByIndex('first', {
//                index: 'table_no',
//                value: table_no
//            });
            var table = tableModel.find('first', {conditions: "table_no='" + table_no + "'"});

            return (table != null);
        },

        addTable: function() {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=500';
            var inputObj = {input0:null, require0:true, input1:null, require1:true, numpad:true};

            window.openDialog(aURL, _('Add Table'), features, _('New Table'), '', _('Table Number'), _('Table Name'), inputObj);
            if (inputObj.ok && inputObj.input0) {

                var table_no = inputObj.input0;
                if (this.isDuplicate(table_no)) {
                    // @todo OSD
                    NotifyUtils.warn(_('Table Number [%S] has already been assigned exists', [table_no]));
                    return;
                }

                var table_name = inputObj.input1;

                var newTable = {table_no: table_no, table_name: table_name, active: true, seats: 4};

                var tableModel = new TableModel();
                newTable = tableModel.save(newTable);

                this._tableListDatas.push(newTable);
                this._tableListDatas = new GeckoJS.ArrayQuery(this._tableListDatas).orderBy('name asc');

                // loop through this._listDatas to find the newly added destination
                var index
                for (index = 0; index < this._tableListDatas.length; index++) {
                    if (this._tableListDatas[index].table_no == table_no) {
                        break;
                    }
                }
                this.getTableListObj().treeBoxObject.rowCountChanged(index, 1);

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
this.log(this.dump(inputObj));
            if (index > -1 && inputObj.id != '' && inputObj.table_no != '' && inputObj.table_name != '') {

                var tableModel = new TableModel();
                tableModel.id = inputObj.id;
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

        deleteTable: function() {
            var index = this.getTableListObj().selectedIndex;
            if (index >= 0) {
                var table = this._tableListDatas[index];

                if (!GREUtils.Dialog.confirm(null, _('confirm delete table [%S (%S)]', [table.table_no, table.table_name]),
                                             _('Are you sure you want to delete table [%S (%S)]?', [table.table_no, table.table_name]))) {
                    return;
                }

                var tableModel = new TableModel();
                tableModel.del(table.id);


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

            window.openDialog(aURL, _('Add Region'), features, _('New Region'), '', _('Region Name'), '', inputObj);
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

                if (!GREUtils.Dialog.confirm(null, _('confirm delete region [%S (%S)]', [region.name]),
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

        addBooking: function() {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=500';
            var inputObj = {input0:null, require0:true, input1:null, require1:false, numpad:true};

            window.openDialog(aURL, _('Add Booking'), features, _('New Booking'), '', _('Contact'), _('Telephone'), inputObj);
            if (inputObj.ok && inputObj.input0) {

                // var booking_time = Math.round((new Date()).getTime() / 1000);
                var booking_time = Math.round(Date.now().addHours(2) / 1000);
                var booking_contact = inputObj.input0;
                var booking_telephone = inputObj.input1;
                var table_id = document.getElementById('table_id').value;
                var table_no = document.getElementById('table_no').value;
alert(table_no);
                var newBooking = {table_id: table_id, booking: booking_time, contact: booking_contact, telephone: booking_telephone, table_no: table_no};

                var bookingModel = new TableBookingModel();
                newBooking = bookingModel.save(newBooking);

                this._bookingListDatas.push(newBooking);
                this._bookingListDatas = new GeckoJS.ArrayQuery(this._bookingListDatas).orderBy('booking asc');

                // loop through this._listDatas to find the newly added destination
                var index
                for (index = 0; index < this._bookingListDatas.length; index++) {
                    if (this._bookingListDatas[index].id == newBooking.id) {
                        break;
                    }
                }
                this.getBookingListObj().treeBoxObject.rowCountChanged(index, 1);

                // make sure row is visible
                this.getBookingListObj().treeBoxObject.ensureRowIsVisible(index);

                // select the new Table
                this.selectBooking(index);

                // switch to edit mode
                // this.editMode();

                // @todo OSD
                OsdUtils.info(_('Booking added successfully'));
            }
        },

        modifyBooking: function() {
            var index = this.getRegionListObj().selectedIndex;
            var inputObj = GeckoJS.FormHelper.serializeToObject('bookingForm');
            inputObj.booking = Math.round(document.getElementById('booking_time_tmp').value / 1000);

            if (index > -1 && inputObj.id != '') {

                var bookingModel = new TableBookingModel();
                bookingModel.id = inputObj.id;
                var booking = bookingModel.save(inputObj);

                this.loadBookings();

                // loop through this._listDatas to find the newly modified destination
                var newIndex;
                for (newIndex = 0; newIndex < this._bookingListDatas.length; newIndex++) {
                    if (this._bookingListDatas[newIndex].id == booking.id) {
                        break;
                    }
                }
                this.getBookingListObj().treeBoxObject.invalidate();

                // make sure row is visible
                this.getBookingListObj().treeBoxObject.ensureRowIsVisible(newIndex);

                // select the new customer
                this.selectBooking(newIndex);

                // @todo OSD
                OsdUtils.info(_('Booking [%S] modified successfully', [inputObj.name]));
            }
        },

        deleteBooking: function() {
            var index = this.getRegionListObj().selectedIndex;
            if (index >= 0) {
                var region = this._regionListDatas[index];

                if (!GREUtils.Dialog.confirm(null, _('confirm delete region [%S (%S)]', [region.name]),
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
                            'table_regions.name AS "Table.region"',
                            'tables.table_region_id',
                            'table_regions.image AS "Table.image"'];
            var orderby = 'tables.table_no ASC';
            
            var tableModel = new TableModel();
            var tables = tableModel.find('all', {fields: fields, order: orderby, recursive: 2});

            this._tableListDatas = tables;
            var tableView =  new GeckoJS.NSITreeViewArray(this._tableListDatas);
            this.getTableListObj().datasource = tableView;

            document.getElementById('table_count').value = this._tableListDatas.length;

        },

        loadBookings: function() {
            //
            var now = Math.round((new Date()).getTime() / 1000);
            var table_id = document.getElementById('table_id').value;
            var conditions = "table_bookings.booking>='" + now +
                            "' AND table_bookings.table_id='" + table_id +
                            "'";
            var bookingModel = new TableBookingModel();
            var bookings = bookingModel.find('all', {conditions: conditions});
            // var bookings = bookingModel.find('all', {});
// this.log(this.dump(bookings));
            this._bookingListDatas = bookings;
            var bookingView =  new GeckoJS.NSITreeViewArray(this._bookingListDatas);
            this.getBookingListObj().datasource = bookingView;

            document.getElementById('booking_count').value = this._bookingListDatas.length;

        },

        setDestinationMenuItem: function() {

            // read destinations from configure
            var destinations = GeckoJS.Configure.read('vivipos.fec.settings.Destinations');
            if (destinations != null) destinations = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(destinations));
            // this.log(this.dump(datas));
            // return ;

            var destinationObj = document.getElementById('table_destination_menupopup');

            // remove all child...
            while (destinationObj.firstChild) {
                destinationObj.removeChild(destinationObj.firstChild);
            }

            var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
            menuitem.setAttribute('value', '');
            menuitem.setAttribute('label', ' ');
            destinationObj.appendChild(menuitem);

            destinations.forEach(function(data){
                var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                menuitem.setAttribute('value', data.name);
                menuitem.setAttribute('label', data.defaultMark + data.name);
                destinationObj.appendChild(menuitem);
            });
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

            regions.forEach(function(data){
                var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                menuitem.setAttribute('value', data.id);
                menuitem.setAttribute('label', data.name);
                regionObj.appendChild(menuitem);
            });
        },

        readTableSettings: function() {
            //
            this._tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};
            return this._tableSettings;
        },

        saveTableSettings: function(settings) {
            //
            // var datastr = GeckoJS.BaseObject.serialize(this._listDatas);
            this._tableSettings = settings;
            GeckoJS.Configure.write('vivipos.fec.settings.GuestCheck.TableSettings', this._tableSettings);
        },

        saveSettings: function() {
            var settings = GeckoJS.FormHelper.serializeToObject('settingsForm');
            this.saveTableSettings(settings);
            // @todo OSD
            OsdUtils.info(_('Options saved successfully'));
        },

        load: function() {
            //
            var settings = this.readTableSettings();
            GeckoJS.FormHelper.unserializeFromObject('settingsForm', settings);


            this.setDestinationMenuItem();
            this.setRegionMenuItem();
            this.loadRegions();
            this.selectRegion(0);
            this.loadTables();
            this.selectTable(0);
            this.loadBookings();
            this.selectBooking(0);
        }

    };
    
    GeckoJS.Controller.extend(__controller__);

})();

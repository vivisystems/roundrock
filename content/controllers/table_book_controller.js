(function(){

    /**
     * Class TableBookController
     */

    var __controller__ = {
        name: 'TableBook',
        _bookingListDatas: null,
        _bookingListObj: null,
        _table_id: null,
        _table_no: null,
        _table_name: null,
        _table_status_id: null,
        _tableStatusModel: null,
        _cart: null,

        initial: function () {
            //
        },

        getCartController: function() {
            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            this._cart = mainWindow.GeckoJS.Controller.getInstanceByName( 'Cart' );

            // this._cart.dispatchEvent('onSplitCheck', null);

            return this._cart;
        },

        getBookingListObj: function() {
            if(this._bookingListObj == null) {
                this._bookingListObj = document.getElementById('bookingscrollabletree');
            }
            return this._bookingListObj;
        },

        selectBooking: function(index) {
            // clear form
            GeckoJS.FormHelper.reset('bookingForm');

            this.getBookingListObj().vivitree.selection.select(index);
            var idx = this.getBookingListObj().selectedIndex;

            if (index > -1) {
                var booking = this._bookingListDatas[index];
                if (booking) {
                    GeckoJS.FormHelper.unserializeFromObject('bookingForm', booking);
                    document.getElementById('booking_time_tmp').value = parseInt(booking.booking) * 1000;
                }
            }

            this.validateForm();
        },

        addBooking: function() {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=550';
            var inputObj = {input0:null, require0:true, input1:null, require1:false, numpad:true};

            window.openDialog(aURL, _('Add Booking'), features, _('New Booking'), '', _('Contact'), _('Telephone'), inputObj);
            if (inputObj.ok && inputObj.input0) {

                // var booking_time = Math.round((new Date()).getTime() / 1000);
                // var booking_time = Math.round(Date.now().addHours(2) / 1000);
                var now = Date.now();
                var book_time = new Date(now.getYear() + 1900, now.getMonth(), now.getDate(), now.getHours(), now.getMinutes(), 0);
                // var booking_time = Math.round(Date.now().addHours(2) / 1000);
                var booking_time = Math.round(book_time.addHours(2) / 1000);
                var booking_contact = inputObj.input0;
                var booking_telephone = inputObj.input1;

                // var table_id = document.getElementById('table_id').value;
                // var table_no = document.getElementById('table_no').value;
                var table_id = this._table_id;
                var table_no = this._table_no;
                var table_status_id = this._table_status_id;

                var newBooking = {table_id: table_id, booking: booking_time, contact: booking_contact, telephone: booking_telephone, table_no: table_no, table_status_id: table_status_id};

                var bookingModel = new TableBookingModel();
                newBooking = bookingModel.save(newBooking);

                // touch TableStatusModel
                this.getCartController().GuestCheck._tableStatusModel.touchTableStatus(table_no);

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
            var index = this.getBookingListObj().selectedIndex;
            var inputObj = GeckoJS.FormHelper.serializeToObject('bookingForm');
            inputObj.booking = Math.round(document.getElementById('booking_time_tmp').value / 1000);

            if (index > -1 && inputObj.id != '') {

                var bookingModel = new TableBookingModel();
                bookingModel.id = inputObj.id;
                var booking = bookingModel.save(inputObj);

                // touch TableStatusModel
                var table_id = this._table_id;
                var table_no = this._table_no;
                var table_status_id = this._table_status_id;
                this.getCartController().GuestCheck._tableStatusModel.touchTableStatus(table_no);

                this.loadBookings(booking.table_id);

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
            var index = this.getBookingListObj().selectedIndex;
            var inputObj = GeckoJS.FormHelper.serializeToObject('bookingForm');

            if (index >= 0) {

                var region = this._bookingListDatas[index];

                if (!GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete booking [%S (%S)]', [inputObj.contact, inputObj.table_no]),
                                             _('Are you sure you want to delete booking [%S (%S)]?', [inputObj.contact, inputObj.table_no]))) {
                    return;
                }

                var bookingModel = new TableBookingModel();
                bookingModel.del(inputObj.id);
                delete bookingModel;

                // touch TableStatusModel
                var table_id = this._table_id;
                var table_no = this._table_no;
                var table_status_id = this._table_status_id;
                this.getCartController().GuestCheck._tableStatusModel.touchTableStatus(table_no);

                this.loadBookings();

                this.getBookingListObj().treeBoxObject.invalidate();

                // @todo OSD
                OsdUtils.info(_('Booking [%S (%S)] deleted successfully', [inputObj.contact, inputObj.table_no]));

            }
        },

        removeOldBooking: function() {
            //
            var now = Math.round((new Date()).getTime() / 1000);
            var rmTime = now - 86400; // one day ago...
            var cond = "booking<'" + rmTime + "'";

            var bookingModel = new TableBookingModel();
            bookingModel.delAll(cond);
            delete bookingModel;
        },

        loadBookings: function(table_no) {
            //
            var now = Math.round((new Date()).getTime() / 1000);
            // var table_id = document.getElementById('table_id').value;
            var table_id = table_no;
            var conditions = "table_bookings.booking>='" + now +
                            "' AND table_bookings.table_id='" + table_id +
                            "'";
            var bookingModel = new TableBookingModel();
            var bookings = bookingModel.find('all', {conditions: conditions});
            this._bookingListDatas = bookings;
            var bookingView =  new GeckoJS.NSITreeViewArray(this._bookingListDatas);

            bookingView.getCellValue= function(row, col) {
                if (col.id == 'booking') {
                    var booking = this.data[row].booking * 1000;
                    var text = (new Date(booking)).toString('yyyy-MM-dd HH:mm:ss');
                    return text;
                } else {
                    return this.data[row][col.id];
                }
            };

            this.getBookingListObj().datasource = bookingView;

            document.getElementById('booking_count').value = this._bookingListDatas.length;

            

        },

        readTableSettings: function() {
            //
            this._tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};
            return this._tableSettings;
        },

        setTableId: function(table_id) {
            this._table_id = table_id;

        },

        setTableNo: function(table_no) {
            this._table_no = table_no;
        },

        setTableName: function(table_name) {
            this._table_name = table_name;
        },

        setTableStatusId: function(table_status_id) {
            this._table_status_id = table_status_id;

        },

        load: function() {
            //
            if (window.arguments) {
                var inputObj = window.arguments[0];
            } else {
                inputObj = {
                    table_id: document.getElementById('table_id').value,
                    table_no: document.getElementById('table_no').value,
                    table_name: document.getElementById('table_name').value,
                    table_status_id: document.getElementById('table_status_id').value
                }
            }

            // this._table_no = inputObj.table_no;
            // this._table_id = inputObj.table_id;
            this.setTableId(inputObj.table_id);
            this.setTableNo(inputObj.table_no);
            this.setTableName(inputObj.table_name);
            this.setTableStatusId(inputObj.table_status_id);

            document.getElementById('booking_table_title').setAttribute('label', _('Book Table# %S : %S', [this._table_no, this._table_name]));

            var settings = this.readTableSettings();
            GeckoJS.FormHelper.unserializeFromObject('settingsForm', settings);

            // remove old booking
            this.removeOldBooking();

            this.loadBookings(this._table_id);
            this.selectBooking(0);


        },

        validateForm: function() {
            var index = this.getBookingListObj().selectedIndex;
            var modBtn = document.getElementById('modify_book');
            var delBtn = document.getElementById('delete_book');

            if (this._bookingListDatas.length <= 0) {
                index = -1;
            }
            modBtn.setAttribute('disabled', index == -1);
            delBtn.setAttribute('disabled', index == -1);
        }

    };
    
    GeckoJS.Controller.extend(__controller__);

})();

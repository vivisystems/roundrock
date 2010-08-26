(function(){

    /**
     * Class TableBookController
     */

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'TableBook',

        uses: ['TableSetting', 'TableBooking', 'Table'],

        _bookingListObj: null,
        _bookingHelper: null,

        _startTime: false,
        _endTime: false,

        getBookingListObj: function() {

            if(this._bookingListObj == null) {
                this._bookingListObj = document.getElementById('bookingScrollabletree');
            }
            return this._bookingListObj;
        },

        getBookingHelperObj: function() {
            
            if(this._bookingHelper == null) {
                this._bookingHelper = new NSITableBookingsView();
            }
            return this._bookingHelper;
        },


        showBookEditPanel: function(resetForm) {
            resetForm = resetForm || false;

            if (resetForm) {
                this.Form.reset('bookingForm');

                var roundDatetime = (new Date()).getTime();
                document.getElementById('booking_time_tmp').value = (roundDatetime - (roundDatetime % 900000)); // round down 15mins
                
                document.getElementById('add_modify_btn').disabled = true;
            }
            
            let scrollPanel = document.getElementById('availableScrollablepanel');
            scrollPanel.datasource = [];
            $.popupPanel('bookEditPanel');
            return;
        },

        addBooking: function(popup) {

            popup = popup || false;
            if (popup) {
                document.getElementById('booking_table_edit_title').label = _('Add Booking');
                this.showBookEditPanel(true);
                return;
            }

        },

        modifyBooking: function() {
            
            let listObj = this.getBookingListObj();
            let helper = this.getBookingHelperObj();

            var index = listObj.selectedIndex;
            
            if (index < 0) return;

            var booking = helper.data[index];

            let data = GREUtils.extend({}, booking.TableBooking);

            data.table_no = booking.Table.table_no ;
            
            GeckoJS.FormHelper.unserializeFromObject('bookingForm', data);

            document.getElementById('booking_time_tmp').value = booking.TableBooking.booking*1000 ;

            document.getElementById('booking_table_edit_title').label = _('Modify Booking') + ' : ' + booking.TableBooking.id;
            
            this.showBookEditPanel();

            return true;
        },


        saveBooking: function() {

            var inputObj = GeckoJS.FormHelper.serializeToObject('bookingForm');
            let bookingTime = Math.round(document.getElementById('booking_time_tmp').value / 1000 );
            inputObj.booking = bookingTime;

            if (inputObj.id.length == 0) {
                // add booking
                inputObj.id = GeckoJS.String.uuid();
                let result = this.TableBooking.addTableBooking(inputObj);
                if (result) OsdUtils.info(_('Booking added successfully'));
            }else {
                // update booking
                let result = this.TableBooking.updateTableBooking(inputObj.id, inputObj);
                if (result) OsdUtils.info(_('Booking [%S] modified successfully', [inputObj.contact]));
            }

            this.loadBookings();

            $.hidePanel('bookEditPanel');
            
        },

        deleteBooking: function() {
            
            let listObj = this.getBookingListObj();
            let helper = this.getBookingHelperObj();

            var index = listObj.selectedIndex;
            
            if (index < 0) return;

            var booking = helper.data[index];

            if (!GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete booking [%S (%S)]', [booking.TableBooking.contact, booking.Table.table_no]),
                _('Are you sure you want to delete booking [%S (%S)]?', [booking.TableBooking.contact, booking.Table.table_no]))) {
                return;
            }

            var result = this.TableBooking.removeTableBooking(booking.TableBooking.id);

            if (result) {

                this.loadBookings();

                OsdUtils.info(_('Booking [%S (%S)] deleted successfully', [booking.TableBooking.contact, booking.Table.table_no]));
            }

        },


        selectBooking: function(index) {

            var modBtn = document.getElementById('modify_book');
            var delBtn = document.getElementById('delete_book');

            if (index != -1) {
                modBtn.disabled = false;
                delBtn.disabled = false;
            }else {
                modBtn.disabled = true;
                delBtn.disabled = true;
            }

        },

        selectAvailableTable: function(index) {

            let scrollPanel = document.getElementById('availableScrollablepanel');
            let table = scrollPanel.datasource.data[index];

            document.getElementById('selected_tableid').value = table.id;
            document.getElementById('selected_tableno').value = table.no;

            document.getElementById('add_modify_btn').disabled = false;

        },


        loadBookings: function(dir) {

            var startTime = 0, endTime = 0;

            if (!this._startTime || !this._endTime || dir =='today') {
                var now = Math.round((new Date()).getTime() / 1000);
                this._startTime = Math.round(Date.today().getTime() / 1000);
                this._endTime = this._startTime + 86400;
            }

            if (dir == 'prev') {
                this._startTime -= 86400;
                this._endTime -= 86400;
            }else if (dir == 'next') {
                this._startTime += 86400;
                this._endTime += 86400;
            }   

            startTime = this._startTime;
            endTime = this._endTime;

            var startTimeStr = (new Date(startTime*1000)).toString('yyyy/MM/dd hh:mm:ss');
            var endTimeStr = (new Date(endTime*1000-1)).toString('yyyy/MM/dd hh:mm:ss');

            var bookings = this.TableBooking.getTableBookings(startTime, endTime);

            let listObj = this.getBookingListObj();
            let helper = this.getBookingHelperObj();

            helper.data = bookings;
            
            listObj.datasource = helper;

            listObj.selectedIndex = -1;

            document.getElementById('booking_table_title').label = _('Booking Tables') + ' : ' + startTimeStr + ' - ' + endTimeStr ;
            document.getElementById('booking_count').value = bookings.length;

            this.selectBooking(-1);
            

        },

        checkAvailableTables: function(all) {

            all = all || false;

            let btn = null;

            if (all) {
                btn = document.getElementById('getAllTablesBtn');
            }else {
                btn = document.getElementById('checkAvailableTablesBtn');
            }
            let scrollPanel = document.getElementById('availableScrollablepanel');
            scrollPanel.vivibuttonpanel.resizeButtons();

            let partySize = document.getElementById('party_size').value;
            let bookingTime = Math.round(document.getElementById('booking_time_tmp').value / 1000 );
            let bookingId = document.getElementById('booking_id').value;

            let orgLabel = btn.label;

            btn.label = _('Finding Available Tables');
            btn.disabled = true;

            let tables = [];
            let displayTables = [];
            if (all) {
                tables = this.TableBooking.getAllTables();
            }else {
                tables = this.TableBooking.getAvailableTables(bookingTime, partySize, bookingId);
            }

            tables.forEach(function(table) {
                let display = '[' + table.Table.table_no + ':' + table.Table.table_name  +']' + '\n' + '#' + table.Table.seats ;
                displayTables.push({
                    display: display,
                    id: table.Table.id ,
                    no: table.Table.table_no
                });
            }, this);

            scrollPanel.datasource = displayTables;
            
            btn.label = orgLabel ;
            btn.disabled = false;
            
        },

        load: function() {
            
            $.installPanel('selectTablePanel',  {
                css: {
                    top: '0px',
                    left: '0px'
                }
            });
            $.installPanel('bookEditPanel', {
                css: {
                    top: '0px',
                    left: '0px'
                }
            });

            this.loadBookings();

        },

        viewTableBook: function() {
            $.popupPanel('selectTablePanel');
            
        }

    };
    
    AppController.extend(__controller__);

})();

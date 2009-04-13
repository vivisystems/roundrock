(function(){

    var TableStatusView = window.TableStatusView = GeckoJS.NSITreeViewArray.extend({

/*
    'TableWinAsFirstWin': true
    'VirtualTableMap': false
    'RequireCheckNo': true
    'TablePeriodLimit': 60
    'RequireTableNo': true
    'TableRemindTime': 120
    'RequireGuestNum': false
    'TableBookingTimeout': 15
    'DisplayCheckNo': true
    'DisplayTableLabel': true
    'DisplaySeqNo': true
    'DisplayBooking': true
    'DisplayPeriod': true
    'DisplayTotal': true
    'DisplayCapacity': true
    'DisplayClerk': true
*/
        renderButton: function(row, btn) {
            // GREUtils.log('renderButton...');
// GREUtils.log(GeckoJS.BaseObject.dump(this.data[row]));
            if (!this.data[row]) return;
            if (this.data[row].table_no <= "0") return;
            // if (!this.data[row].check_no) return;
            var tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};

            var seq = this.data[row].sequence || '';
            var check_no = this.data[row].check_no || '';
            var checks = this.data[row].checks || '';
            var table_no = this.data[row].table_no || '';
            var table_label = this.data[row].table_name || '';
            var guest_num = this.data[row].no_of_customers || '0';
            var seats = this.data[row].seats || '0';
            var subtotal = this.data[row].total || '0';
            var clerk = this.data[row].clerk || '';
            var now = Math.round(new Date().getTime());
            var transaction_created = this.data[row].transaction_created * 1000 || now;

            var booking_time = Math.round((this.data[row].booking ? this.data[row].booking.booking : 0) || 0) * 1000;

            var book_time = (booking_time > 100) ? "B#" + (new Date(booking_time)).toString("HH:mm") : '';

            var period_time = Math.round((now - transaction_created));
            var period = Date.today().addMilliseconds(period_time).toString("HH:mm");

            var capacity = guest_num + "/" + seats;

            if (check_no != "") check_no = "C#" + check_no;
            if (checks != "") checks = "+" + checks;

            if (seq != "") {
                subtotal = "T#" + subtotal;
                btn.setTableStatus(1);

                if (guest_num <= seats)
                    btn.setCapacityStatus(1);
                else
                    btn.setCapacityStatus(2);

                if (period_time < tableSettings.TablePeriodLimit * 60 * 1000)
                    btn.setPeriodStatus(1);
                else
                    btn.setPeriodStatus(2);
            } else {
                subtotal = '';
                period = '';

                btn.setTableStatus(0);
                btn.setPeriodStatus(0);
                btn.setCapacityStatus(0);
            }

            btn.table_no = table_no;
            btn.checks = checks;
            btn.table_label = tableSettings.DisplayTableLabel ? table_label : '';
            btn.seq_no = tableSettings.DisplaySeqNo ? seq : '';
            btn.check_no = tableSettings.DisplayCheckNo ? check_no : '';
            btn.booking = tableSettings.DisplayBooking ? book_time : '';
            btn.period = tableSettings.DisplayPeriod ? period : '';
            btn.subtotal = tableSettings.DisplayTotal ? subtotal : '';
            btn.capacity = tableSettings.DisplayCapacity ? capacity : '';
            // share seq_no for seq & clerk
            btn.seq_no = tableSettings.DisplayClerk ? clerk : btn.seq_no;
            return;
        }
    });

    /**
     * Class TableManController
     */

    var __controller__ = {
        name: 'SelectTable',

        _inputObj: window.arguments[0],
        _titleObj: null,
        _org_title: '',
        _tableSettings: {},
        _tables: [],

        initial: function () {
            //
            this.readTableConfig();
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

        _setPromptLabel: function(prompt_1, prompt_2, prompt_3) {
            //
            document.getElementById("prompt_1").value = prompt_1;
            document.getElementById("prompt_2").value = prompt_2;
            document.getElementById("prompt_3").value = prompt_3;
        },

        _showPromptPanel: function(panel, sleepTime) {

            var promptPanel = document.getElementById(panel);
            var funcPanel = document.getElementById('func_panel');
            var w = funcPanel.boxObject.width + 32;
            var h = funcPanel.boxObject.height + 48;
            var x = funcPanel.boxObject.screenX - 32;
            var y = funcPanel.boxObject.screenY - 18;
// GREUtils.log("w:" + w + ", h:" + h);
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            promptPanel.sizeTo(w, h);
            // var x = (width - 360) / 2;
            // var y = (height - 240) / 2;
            promptPanel.openPopupAtScreen(x, y);

            // release CPU for progressbar ...
            if (!sleepTime) {
              sleepTime = 1000;
            }
            this.sleep(sleepTime);

            return promptPanel;
        },

        _hidePromptPanel: function(panel) {
            var promptPanel = document.getElementById(panel);
            promptPanel.hidePopup();
        },

        readTableConfig: function() {
            this._tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || false;
        },

        doRecallCheck: function() {
            this._setPromptLabel('*** Recall Check ***', 'Please Select a Table to recall...', 'Press CANCEL button to cancel function');

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'RecallCheck';
            // this._titleObj.setAttribute('label', this._org_title + " - " + _("Recall Check"));
        },

        doSplitCheck: function() {
            this._setPromptLabel('*** Split Check ***', 'Please Select a Table to split...', 'Press CANCEL button to cancel function');

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'SplitCheck';
            // this._titleObj.value = this._org_title + " - " + _("Split Check");
        },

        doMergeCheck: function() {
            this._setPromptLabel('*** Merge Check ***', 'Please Select a Table to merge...', 'Press CANCEL button to cancel function');

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'MergeCheck';
            // this._titleObj.setAttribute('label', this._org_title + " - " + _("Merge Check"));
        },

        doMergeTable: function() {
            this._setPromptLabel('*** Merge Table ***', 'Please Select the source table as master table...', 'Press CANCEL button to cancel function');

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'MergeTable';
        },

        doUnmergeTable: function() {
            this._setPromptLabel('*** Unmerge Table ***', 'Please Select the hold table to be unmerge...', 'Press CANCEL button to cancel function');

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'UnmergeTable';
        },

        doBookingTable: function() {
            //
        },

        doChangeClerk: function() {
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            var service_clerk;
            if ( user != null ) {
                service_clerk = user.username;
            }

            this._setPromptLabel('*** Change Clerk ***', _('Please Select a Table to change service clerk to logined user [ %S ]...', [service_clerk]), 'Press CANCEL button to cancel function');

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'ChangeClerk';
        },

        doTransTable: function() {
            this._setPromptLabel('*** Trans Table ***', 'Please Select the source table to translate...', 'Press CANCEL button to cancel function');

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'TransTable';
        },

        doSelectTableNo: function() {
            this._setPromptLabel('*** Select Table ***', 'Please Select a Table...', 'Press CANCEL button to cancel function');

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'SelectTableNo';
            // this._titleObj.setAttribute('label', this._org_title + " - " + _("Select Table No"));
        },

        doCancelFunc: function() {
            this._hidePromptPanel('prompt_panel');
            if (this._inputObj.action) {
                this._inputObj.action = '';
            } else {
                doCancelButton();
            }
        },

        doFunc: function() {
            // @todo check status first, doFunc when match table selected...
            this._hidePromptPanel('prompt_panel');
            // alert('doFunc...' + inputObj.action);
            var v = document.getElementById('tableScrollablepanel').value;
            if (this._inputObj.action) {
                inputObj.index = this._tables[v].table_no;
                doOKButton();
            }
                
        },

        load: function() {
            //
            // this._titleObj = document.getElementById('main_title');
            // this._org_title = this._titleObj.getAttribute('label');

            // var tables = inputObj.tables;
            var tables = [];
            inputObj.tables.forEach(function(o){
                if (o.active || o.sequence)
                tables.push(o);
            });
            this._tables = tables;
            var tableStatus = new TableStatusView(tables);
            document.getElementById('tableScrollablepanel').datasource = tableStatus ;
        }

    };
    
    GeckoJS.Controller.extend(__controller__);

})();

(function(){
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/template_ext.js');
    
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
            // var guest_num = this.data[row].no_of_customers || '0';
            var guest_num = this.data[row].guests || '0';
            var seats = this.data[row].seats || '0';
            var subtotal = this.data[row].total || '0';
            var clerk = this.data[row].clerk || '';
            var now = Math.round(new Date().getTime());
            var holdby = this.data[row].holdby || '';
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

                if (holdby)
                    btn.setTableStatus(2);
                else
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
            
            if (holdby) btn.seq_no = _('Host Table') + ':' + holdby;
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
        _sourceTableNo: null,
        _tableStatusModel: null,

        initial: function () {
            //
            // this.readTableConfig();
            if (this._tableStatusModel == null) {
                this._tableStatusModel = new TableStatusModel;
                this._tableStatusModel.initial();
            }
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

        _setPromptLabel: function(prompt_1, prompt_2, prompt_3, prompt_4, highlight) {
            //
            if (prompt_1 != null) document.getElementById("prompt_1").value = prompt_1;
            if (prompt_2 != null) document.getElementById("prompt_2").value = prompt_2;
            if (prompt_3 != null) document.getElementById("prompt_3").value = prompt_3;
            if (prompt_4 != null) document.getElementById("prompt_4").value = prompt_4;

            document.getElementById("prompt_2").className = "PromptLabel2 whitefont";
            document.getElementById("prompt_3").className = "PromptLabel2 whitefont";

            document.getElementById("prompt_" + highlight).className = "PromptLabel2 yellowfont";
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

        _showOrderDisplayPanel: function(panel, tableObj, obj) {

            var promptPanel = document.getElementById(panel);
            // obj.setAttribute("popup", panel);
            var doc = document.getElementById('order_display_div');

            // var id = "ce593cf1-1806-4b15-9a44-ce8681dc5d5c";
            // var id = "d534c226-0231-44b8-b7c0-7fcbea4998a3";
            var id = tableObj.order_id || '';

            if (!id) return;
            
            var orderModel = new OrderModel();
            var order = orderModel.findById(id, 2);

            // load template
            var path = GREUtils.File.chromeToPath('chrome://viviecr/content/order_display_template.tpl');
            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

            var data = {};
            data.order = order;
            data.sequence = order.sequence;

            var result = tpl.process(data);

            if (doc) {
                doc.innerHTML = result;
            }

            promptPanel.openPopup(obj, "after_start", 0, 0, false, false);

            return promptPanel;
        },

        readTableConfig: function() {
            this._tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || false;
        },

        doRecallCheck: function() {
            this._setPromptLabel('*** Recall Check ***', 'Please Select a Table to recall...', '', 'Press CANCEL button to cancel function', 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'RecallCheck';
            // this._titleObj.setAttribute('label', this._org_title + " - " + _("Recall Check"));
        },

        doSplitCheck: function() {
            this._setPromptLabel('*** Split Check ***', 'Please Select a Table to split...', '', 'Press CANCEL button to cancel function', 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'SplitCheck';
            // this._titleObj.value = this._org_title + " - " + _("Split Check");
        },

        doMergeCheck: function() {
            this._setPromptLabel('*** Merge Check ***', 'Please Select a Table to merge...', '', 'Press CANCEL button to cancel function', 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'MergeCheck';
            // this._titleObj.setAttribute('label', this._org_title + " - " + _("Merge Check"));
        },

        doMergeTable: function() {
            this._setPromptLabel('*** Merge Table ***', 'Please Select the source table as master table...', '', 'Press CANCEL button to cancel function', 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'MergeTable';
        },

        doUnmergeTable: function() {
            this._setPromptLabel('*** Unmerge Table ***', 'Please Select the hold table to be unmerge...', '', 'Press CANCEL button to cancel function', 2);

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

            this._setPromptLabel('*** Change Clerk ***', _('Select a table to change service clerk to [ %S ]...', [service_clerk]), '', 'Press CANCEL button to cancel function', 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'ChangeClerk';
        },

        doTransTable: function() {
            this._setPromptLabel('*** Trans Table ***', 'Please Select the source table to translate...', '', 'Press CANCEL button to cancel function', 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'TransTable';
        },

        doSelectTableNo: function() {
            this._setPromptLabel('*** Select Table ***', 'Please Select a Table...', '', 'Press CANCEL button to cancel function', 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'SelectTableNo';
            // this._titleObj.setAttribute('label', this._org_title + " - " + _("Select Table No"));
        },

        doRefreshTableStatus: function() {
            /*
            var tableStatus = new TableStatusView(this._tables);
            tableStatus._controller = this;
            document.getElementById('tableScrollablepanel').datasource = tableStatus ;
            */
           document.getElementById('tableScrollablepanel').invalidate();
            this._inputObj.action = '';
            this._sourceTableNo = null;
            this._hidePromptPanel('prompt_panel');
            return;
        },

        doCancelFunc: function() {
            this._hidePromptPanel('prompt_panel');
            if (this._inputObj.action) {
                this._inputObj.action = '';
                this._sourceTableNo = null;
            } else {
                doCancelButton();
            }
        },

        doFunc: function(evt) {
// this.log(evt.originalTarget.tagName);
            // @todo check status first, doFunc when match table selected...
            var v = document.getElementById('tableScrollablepanel').value;
            var selTable = this._tables[v];
            
            switch (this._inputObj.action) {
                case 'TransTable':
                    if (this._sourceTableNo) {
                        //
                        this._inputObj.sourceTableNo = this._sourceTableNo;
                    } else {
                        if (!selTable.sequence) {
                            // @todo OSD
                            NotifyUtils.error(_('This table is empty!!'));
                            return;
                        }
                        this._setPromptLabel(null, null, 'Please Select the target table to translate...', null, 3);
                        this._sourceTableNo = this._tables[v].table_no;
                        document.getElementById('tableScrollablepanel').invalidate();
                        return;
                    }
                    
                    break;
                case 'MergeTable':
                    if (this._sourceTableNo) {
                        //
                        var i = this._tables[v].table_no;
                        var holdby = this._sourceTableNo;
                        this._tables = this._tableStatusModel.holdTable(i, holdby);

                        var tables = [];
                        this._tables.forEach(function(o){
                            if (o.active || o.sequence)
                            tables.push(o);
                        });
                        this._tables = tables;

                        var tableStatus = new TableStatusView(this._tables);
                        tableStatus._controller = this;
                        document.getElementById('tableScrollablepanel').datasource = tableStatus ;

                        this._inputObj.action = '';
                        this._sourceTableNo = null;
                        this._hidePromptPanel('prompt_panel');
                        return;
                    } else {
                        if (!selTable.sequence) {
                            // @todo OSD
                            NotifyUtils.error(_('This table is empty!!'));
                            return;
                        }
                        this._setPromptLabel(null, null, 'Please Select a empty table to merge...', null, 3);
                        this._sourceTableNo = this._tables[v].table_no;
                        document.getElementById('tableScrollablepanel').invalidate();
                        return;
                    }
                    break;
                case 'UnmergeTable':

                    if (!selTable.holdby) {
                        // @todo OSD
                        NotifyUtils.error(_('This table had not been hold!!'));
                        return;
                    }

                    var i = this._tables[v].table_no;
                    var holdby = null;
                    this._tables = this._tableStatusModel.holdTable(i, holdby);

                    var tables = [];
                    this._tables.forEach(function(o){
                        if (o.active || o.sequence)
                        tables.push(o);
                    });
                    this._tables = tables;

                    var tableStatus = new TableStatusView(this._tables);
                    tableStatus._controller = this;
                    document.getElementById('tableScrollablepanel').datasource = tableStatus ;

                    this._inputObj.action = '';
                    this._sourceTableNo = null;
                    this._hidePromptPanel('prompt_panel');
                    return;
                    break;
                default:
                    this._showOrderDisplayPanel('order_display_panel', this._tables[v], evt.originalTarget);
                    break;
            }
            this._hidePromptPanel('prompt_panel');
            // alert('doFunc...' + inputObj.action);
            
            if (this._inputObj.action) {
                inputObj.index = this._tables[v].table_no;
                doOKButton();
            }
                
        },

        displayOrder: function (id) {

            // get browser content body
            // var bw = document.getElementById('preview_frame');
            // var doc = bw.contentWindow.document.getElementById( 'abody' );

            // load data
            var orderModel = new OrderModel();
            var order = orderModel.findById(id, 2);

            // load template
            // var path = GREUtils.File.chromeToPath('chrome://viviecr/content/order_template.tpl');
            // var file = GREUtils.File.getFile(path);
            // var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

            var data = {};
            data.order = order;
            data.sequence = order.sequence;

            // var result = tpl.process(data);
            /*
            if (doc) {
                doc.innerHTML = result;
            }
            */
        },

        load: function() {
            this.initial();
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
            tableStatus._controller = this;
            document.getElementById('tableScrollablepanel').datasource = tableStatus ;
        }

    };
    
    GeckoJS.Controller.extend(__controller__);

})();

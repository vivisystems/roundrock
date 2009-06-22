(function(){
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/template_ext.js');
    
    var TableStatusView = window.TableStatusView = GeckoJS.NSITreeViewArray.extend({

        renderButton: function(row, btn) {
            // GREUtils.log('renderButton...');
            if (!this.data[row]) return;
            if (this.data[row].table_no <= 0) return;

            var tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};

            if (this.data[row].order == null) this.data[row].order = {};
            if (this.data[row].table == null) this.data[row].table = {};

            var seq = this.data[row].sequence || '';
            var check_no = this.data[row].check_no || '';
            var checks = this.data[row].checks || '';
            var table_no = this.data[row].table_no || '';
            var table_label = this.data[row].Table.table_name || '';
            var seats = this.data[row].Table.seats || '0';
            // var guest_num = this.data[row].order.no_of_customers || '0';
            var guest_num = this.data[row].guests || '0';

            

            /*
            if (this.data[row].order.length > 0)
            var subtotal = this.data[row].order[0].total || '0';
            else var subtotal = '';
            */
            
            var subtotal = this.data[row].total || '';

            var clerk = this.data[row].clerk || '';
            var now = Math.round(new Date().getTime());
//            var holdby = this.data[row].holdby || '';
            var holdby = this.data[row].hostby || '';
            // var transaction_created = this.data[row].order.transaction_created * 1000 || now;
            // var transaction_created = this.data[row].created * 1000 || now;
            var transaction_created = this.data[row].start_time * 1000 || now;

            // display booking...
            var book_time = '';
            if (this.data[row].TableBooking && this.data[row].TableBooking.length > 0) {
                var remindTime = now - tableSettings.TableRemindTime * 60 *1000;
                var bookTimeOut = tableSettings.TableBookingTimeout * 60 *1000;
                

                for (var key in this.data[row].TableBooking) {
                    var bookTime = this.data[row].TableBooking[key];
                    // var booking_time = Math.round((this.data[row].booking ? this.data[row].booking : 0) || 0) * 1000;
                    var booking_time = Math.round((bookTime.booking ? bookTime.booking : 0) || 0) * 1000;

                    if (booking_time < remindTime) {
                        booking_time = 0;
                    } else if (now  > booking_time + bookTimeOut) {
                        booking_time = 0;
                    }

                    if (booking_time > 100) {
                        book_time = _("B#") + (new Date(booking_time)).toString("HH:mm");
                        break;
                    }

                }

            }

            var period_time = Math.round((now - transaction_created) + 1);
            var period = Date.today().addMilliseconds(period_time).toString("HH:mm");

            var capacity = guest_num + "/" + seats;

            if (check_no != "") check_no = _("C#") + check_no;
            if (checks != "") checks = "+" + checks;

            if (seq != "") {
                subtotal = _("T#") + subtotal;
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
     * Class SelectTableController
     */

    var __controller__ = {
        name: 'SelectTable',

        // _inputObj: window.arguments[0],
        _inputObj: {},
        _tableSettings: {},
        _tables: null,
        _sourceTable: null,
        _sourceTableNo: null,
        _tableStatusModel: null,
        _isNewOrder: false,
        _cartController: null,
        _mainController: null,
        _selectedCheckNo: null,
        _isBusy: false,

        initial: function () {
            //
//            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
//            if (screenwidth > 1000) {
//                document.getElementById('tableScrollablepanel').rows = 5;
//                document.getElementById('tableScrollablepanel').cols = 5;
//            }

            if (this._cartController == null) {
                this._cartController = GeckoJS.Controller.getInstanceByName('Cart');
            };

            // this.readTableConfig();
            if (this._tableStatusModel == null) {
                // this._tableStatusModel = new TableStatusModel;
                // this._tableStatusModel.initial();
                this._tableStatusModel = this._cartController.GuestCheck._tableStatusModel;
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
            //var funcPanel = document.getElementById('func_panel');

            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            var w = 850;//funcPanel.boxObject.width + 32;
            var h = 132;//funcPanel.boxObject.height + 0;
            var y = height - h - 20; // +51;
            if (height == 600){
                w = 708;
                h = 116;
                y = height - h - 20; // + 6;
            }
            var x = 10;//funcPanel.boxObject.screenX - 32;
            // var y = funcPanel.boxObject.screenY - 18;

            promptPanel.sizeTo(w, h);

            promptPanel.openPopupAtScreen(x, y);

            // release CPU for progressbar ...
            if (!sleepTime) {
              sleepTime = 1000;
            }
            // this.sleep(sleepTime);

            return promptPanel;
        },

        _hidePromptPanel: function(panel) {
            var promptPanel = document.getElementById(panel);
            promptPanel.hidePopup();
        },

        _showOrderDisplayPanel: function(panel, tableObj, obj) {
            var self = this;

            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;

            var promptPanel = document.getElementById(panel);
            var doc = document.getElementById('order_display_div');

            var id = tableObj.order_id || '';

            // if (!id) return;
            if (tableObj.checks <= 0 || tableObj.order == null || tableObj.order.length == 0) return;
            
            var order = tableObj.order[0];

            // load template
            var path = GREUtils.File.chromeToPath('chrome://viviecr/content/order_display_template.tpl');
            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

            var data = {orders:[]};
            /*
            // remove all tabs
            var tabs = document.getElementById('orders_tab');
            while (tabs.firstChild) {
                tabs.removeChild(tabs.firstChild);
            }

            tableObj.order.forEach(function(o){
                data.orders.push(o);
                var tab = document.createElement("tab");
                tab.setAttribute('label', 'C#' + o.check_no);
                tab.setAttribute('oncommand', "$do('selectOrderTab', " + o.check_no + ", 'SelectTable')");
                tabs.appendChild(tab);
            })
            */
            tableObj.order.forEach(function(o){
                data.orders.push(o);
            });

            data.sequence = order.seq;

            var result = tpl.process(data);

            if (doc) {
                doc.innerHTML = result;
            }

            // first popup...
            
            if (promptPanel.boxObject.width == 0) {
                
                promptPanel.openPopupAtScreen(0, 0, false);
                this.sleep(100);
                promptPanel.hidePopup();
            }
            
            var x = (width - promptPanel.boxObject.width) / 2;
            var y = (height - promptPanel.boxObject.height) / 2;

            promptPanel.openPopupAtScreen(x, y, false);

            // remove all tabs
            var tabs = document.getElementById('orders_tab');
            while (tabs.firstChild) {
                tabs.removeChild(tabs.firstChild);
            }

            tableObj.order.forEach(function(o){
                var tab = document.createElement("tab");
                tab.setAttribute('label', 'C#' + o.check_no);
                tab.setAttribute('oncommand', "$do('selectOrderTab', " + o.check_no + ", 'SelectTable')");
                tabs.appendChild(tab);
            })

            // select first order
            tabs.selectedIndex = 0;
            tabs.selectedItem.doCommand();

            return promptPanel;
        },

        readTableConfig: function() {
            this._tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || false;
        },

        popupOrderPanel: function() {
            //
            // this.log("popupOrderPanel:::");
            // this._selectedCheckNo =
        },

        hideOrderPanel: function() {
            //
            // this.log("hideOrderPanel:::");
            this._selectedCheckNo = null;
        },

        selectOrderTab: function(evt) {
            //
            this._selectedCheckNo = evt;
        },

        doCloseOrderPanel: function() {
            //
            this._hidePromptPanel('order_display_panel');
        },

        doClosePromptPanel: function() {
            //
            this.doCancelFunc();
        },

        doRecallCheck: function() {
            if (this._selectedCheckNo) {
                
                this._inputObj.action = 'RecallCheck';
                this._inputObj.check_no = this._selectedCheckNo;

                this.doCloseOrderPanel();
                this.doFunc();
                
            } else {
                this._setPromptLabel('*** ' + _('Recall Check') + ' ***', _('Please select a table to recall...'), '', _('Press CANCEL button to cancel function'), 2);

                var pnl = this._showPromptPanel('prompt_panel');
                this._inputObj.action = 'RecallCheck';
            }
        },

        doSplitCheck: function() {
            if (this._selectedCheckNo) {
                
                this._inputObj.action = 'SplitCheck';
                this._inputObj.check_no = this._selectedCheckNo;

                this.doCloseOrderPanel();
                this.doFunc();

            } else {
                this._setPromptLabel('*** ' + _('Split Check') + ' ***', _('Please select a table to split...'), '', _('Press CANCEL button to cancel function'), 2);

                var pnl = this._showPromptPanel('prompt_panel');
                this._inputObj.action = 'SplitCheck';
            }

        },

        doMergeCheck: function() {
            if (this._selectedCheckNo) {
                
                this._inputObj.action = 'MergeCheck';
                this._inputObj.check_no = this._selectedCheckNo;

                this.doCloseOrderPanel();
                this.doFunc();

            } else {

                this._setPromptLabel('*** ' + _('Merge Check') + ' ***', _('Please select a table to merge...'), '', _('Press CANCEL button to cancel function'), 2);

                var pnl = this._showPromptPanel('prompt_panel');
                this._inputObj.action = 'MergeCheck';
            }

        },

        doMergeTable: function() {
            this._setPromptLabel('*** ' + _('Merge Table') + ' ***', _('Please select the master table...'), '', _('Press CANCEL button to cancel function'), 2);
            
            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'MergeTable';
        },

        doUnmergeTable: function() {
            this._setPromptLabel('*** ' + _('Unmerge Table') + ' ***', _('Please select the table to unmerge...'), '', _('Press CANCEL button to cancel function'), 2);
            
            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'UnmergeTable';
        },

        doBookingTable: function() {
            this._setPromptLabel('*** ' + _('Book Table') + ' ***', _('Please select a table to book...'), '', _('Press CANCEL button to cancel function'), 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'BookTable';

            return;

            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';

            var aURL = 'chrome://viviecr/content/table_book.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                isNewOrder: null,
                tables: null
            };

            window.openDialog(aURL, 'table_book', features, inputObj);

            return;

        },

        doChangeClerk: function() {
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            var service_clerk;
            if ( user != null ) {
                service_clerk = user.username;
            }

            this._setPromptLabel('*** ' + _('Change Clerk') + ' ***', _('Select a table to change service clerk to [ %S ]...', [service_clerk]), '', _('Press CANCEL button to cancel function'), 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'ChangeClerk';
        },

        doTransTable: function() {
            if (this._selectedCheckNo) {

                this._inputObj.action = 'TransTable';
                this._inputObj.check_no = this._selectedCheckNo;

                this.doCloseOrderPanel();
                this.doFunc();

            } else {

                this._setPromptLabel('*** ' + _('Trans Table') + ' ***', _('Please select the table to be transfered...'), '', _('Press CANCEL button to cancel function'), 2);

                var pnl = this._showPromptPanel('prompt_panel');
                this._inputObj.action = 'TransTable';

            }
        },

        doSelectTableNo: function() {
            this._setPromptLabel('*** ' + _('Select Table') + ' ***', _('Please select a table...'), '', _('Press CANCEL button to cancel function'), 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'SelectTableNo';

        },

        doRefreshTableStatusLight: function() {
            //

            try {

                window._tableStatusModel.getTableStatusList();

                document.getElementById('tableScrollablepanel').invalidate();
                // GREUtils.log("refreshTableStatusLight:::");

            } catch(e) {}

            return;
        },

        doRefreshTableStatus: function() {

            this._tableStatusModel.getTableStatusList();

            document.getElementById('tableScrollablepanel').invalidate();
            this._inputObj.action = '';
            this._sourceTable = null;
            this._sourceTableNo = null;
            this._hidePromptPanel('prompt_panel');

            if (this._mainController == null) {
                this._mainController = GeckoJS.Controller.getInstanceByName('Main');
            }
            var waitPanel = this._mainController._showWaitPanel('wait_panel', 'common_wait', _('Data synchronizing, please wait...'), 1000);
            // sync data
            try {
                var exec = new GeckoJS.File("/data/vivipos_webapp/sync_client");
                var r = exec.run(["sync"], false);
                exec.close();
            }
            catch (e) {
                NotifyUtils.warn(_('Failed to execute command (sync_client).', []));
                return false;
            }
            finally {
                waitPanel.hidePopup();
            }
            return;
        },

        doCancelFunc: function() {
            this._hidePromptPanel('prompt_panel');

            if (this._inputObj.action) {
                this._inputObj.action = '';
                this._sourceTable = null;
                this._sourceTableNo = null;
            } else {
                // doCancelButton();
                $.hidePanel('selectTablePanel', false);
            }
        },

        doFunc: function(evt) {

            // @todo prevent reentry...
            if (this._isBusy) {
                this._hidePromptPanel('prompt_panel');
                return;
            }
            this._isBusy = true;

            // @todo check status first, doFunc when match table selected...
            var v = document.getElementById('tableScrollablepanel').value;
            var selTable = this._tables[v];
            
            switch (this._inputObj.action) {
                case 'SelectTableNo':

                    if (selTable.hostby) {
                        // @todo OSD
                        NotifyUtils.error(_('This table is host by Table#%S !!', [selTable.hostby]));
                        this._isBusy = false;
                        return;
                    }

                    this._hidePromptPanel('prompt_panel');
                    // alert('doFunc...' + inputObj.action);

                    if (this._inputObj.action) {
                        // this._inputObj.index = this._tables[v].table_no;
                        this._inputObj.index = v;
                        this._inputObj.tableObj = this._tables[v];
                        this._inputObj.ok = true;
                        // doOKButton();
                        var cart = GeckoJS.Controller.getInstanceByName('Cart');
                        
                        cart.GuestCheck.doSelectTableFuncs(this._inputObj);

                        this._inputObj.action = '';
                        this._sourceTableNo = null;
                        
                        $.hidePanel('selectTablePanel', true);

                        this._isBusy = false;
                        return;
                    }
                    break;
                case 'RecallCheck':
                    if (!selTable.sequence) {
                        // @todo OSD
                        NotifyUtils.error(_('This table is empty!!'));
                        this._isBusy = false;
                        return;
                    }

                    break;
                case 'SplitCheck':
                    if (!selTable.sequence) {
                        // @todo OSD
                        NotifyUtils.error(_('This table is empty!!'));
                        this._isBusy = false;
                        return;
                    }

                    break;
                case 'MergeCheck':
                    if (!selTable.sequence) {
                        // @todo OSD
                        NotifyUtils.error(_('This table is empty!!'));
                        this._isBusy = false;
                        return;
                    }

                    break;
                case 'ChangeClerk':
                    this._inputObj.sourceTableNo = this._sourceTableNo;

                    this._hidePromptPanel('prompt_panel');
                    // alert('doFunc...' + inputObj.action);

                    if (this._inputObj.action) {
                        // this._inputObj.index = this._tables[v].table_no;
                        this._inputObj.index = v;
                        this._inputObj.tableObj = this._tables[v];
                        this._inputObj.ok = true;
                        // doOKButton();
                        var cart = GeckoJS.Controller.getInstanceByName('Cart');
                        cart.GuestCheck.doSelectTableFuncs(this._inputObj);

                        this._inputObj.action = '';
                        this._sourceTableNo = null;

                        // $.hidePanel('selectTablePanel', true);
                        cart.GuestCheck.getNewTableNo();
                        this._isBusy = false;
                        return;
                    }
                    break;
                case 'TransTable':
                    if (this._sourceTableNo) {
                        //
                        var srcTableNo = this._sourceTableNo;
                        this._inputObj.sourceTableNo = this._sourceTableNo;

                        this._hidePromptPanel('prompt_panel');
                        // alert('doFunc...' + inputObj.action);

                        if (this._inputObj.action) {
                            // this._inputObj.index = this._tables[v].table_no;
                            this._inputObj.index = v;
                            this._inputObj.tableObj = this._tables[v];
                            // this._inputObj.tableObj = GREUtils.extend({}, this._tables[v]);
                            this._inputObj.ok = true;
                            // doOKButton();
                            var cart = GeckoJS.Controller.getInstanceByName('Cart');
                            cart.GuestCheck.doSelectTableFuncs(this._inputObj);

                            this._inputObj.action = '';
                            this._sourceTableNo = null;

                            // $.hidePanel('selectTablePanel', true);
                            cart.GuestCheck.getNewTableNo();
                            this._isBusy = false;
                            return;
                        }

                    } else {
                        if (!selTable.sequence) {
                            // @todo OSD
                            NotifyUtils.error(_('This table is empty!!'));
                            this._isBusy = false;
                            return;
                        }
                        this._setPromptLabel(null, null, _('Please select the table to transfer to...'), null, 3);
                        this._sourceTableNo = this._tables[v].table_no;
                        document.getElementById('tableScrollablepanel').invalidate();
                        this._isBusy = false;
                        return;
                    }
                    
                    break;
                case 'MergeTable':
                    if (this._sourceTableNo) {
                        //
                        var i = this._tables[v].table_no;
                        var holdby = GeckoJS.BaseObject.clone(this._sourceTable);

                        // this._tables = this._tableStatusModel.holdTable(i, holdby.table_no);
                        this._tableStatusModel.holdTable(i, holdby.table_no);

                        document.getElementById('tableScrollablepanel').invalidate();

                        this._inputObj.action = '';
                        this._sourceTable = null;
                        this._sourceTableNo = null;
                        this._hidePromptPanel('prompt_panel');
                        this._isBusy = false;
                        return;
                    } else {
                        // allow empty table as host table
                        /*
                        if (!selTable.sequence) {
                            // @todo OSD
                            NotifyUtils.error(_('This table is empty!!'));
                            return;
                        }
                        */
                        this._setPromptLabel(null, null, _('Please select an empty table to merge...'), null, 3);
                        this._sourceTable = this._tables[v];
                        this._sourceTableNo = this._tables[v].table_no;

                        document.getElementById('tableScrollablepanel').invalidate();
                        this._isBusy = false;
                        return;
                    }
                    break;
                case 'UnmergeTable':

                    // if (!selTable.holdby) {
                    if (!selTable.hostby) {
                        // @todo OSD
                        NotifyUtils.error(_('This table had not been hold!!'));
                        this._isBusy = false;
                        return;
                    }

                    var i = this._tables[v].table_no;
                    var holdby = GeckoJS.BaseObject.clone(this._tables[v]);
                    holdby.status = -1;

                    // this._tables = this._tableStatusModel.holdTable(i, holdby);
                    // this._tables = this._tableStatusModel.holdTable(i, i);
                    this._tableStatusModel.holdTable(i, i);

                    document.getElementById('tableScrollablepanel').invalidate();
                    
                    this._inputObj.action = '';
                    this._sourceTableNo = null;
                    this._hidePromptPanel('prompt_panel');
                    this._isBusy = false;
                    return;
                    break;

                case 'BookTable':

                    var table_status_id = this._tables[v].id
                    var table_id = this._tables[v].Table.id;
                    var table_no = this._tables[v].table_no;
                    var table_name = this._tables[v].Table.table_name;
                    var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
                    var screenheight = GeckoJS.Session.get('screenheight') || '600';

                    var aURL = 'chrome://viviecr/content/table_book.xul';
                    var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
                    var inputObj = {
                        table_no: table_no,
                        table_id: table_id,
                        table_name: table_name,
                        table_status_id: table_status_id,
                        tables: null
                    };

                    window.openDialog(aURL, 'table_book', features, inputObj);

                    this._inputObj.action = '';
                    this._sourceTableNo = null;
                    this._hidePromptPanel('prompt_panel');
                    
                    var cart = GeckoJS.Controller.getInstanceByName('Cart');
                    cart.GuestCheck.getNewTableNo();
                    this._isBusy = false;
                    return;
                    break;
                default:

                    var orders = this._cartController.GuestCheck.getCheckList("TableNo", this._tables[v].table_no);
                    this._tables[v].order = orders.concat([]);
                    this._showOrderDisplayPanel('order_display_panel', this._tables[v], evt.originalTarget);
                    break;
            }
            this._hidePromptPanel('prompt_panel');
            // alert('doFunc...' + inputObj.action);
            
            if (this._inputObj.action) {
                // this._inputObj.index = this._tables[v].table_no;
                this._inputObj.index = v;
                this._inputObj.tableObj = this._tables[v];
                this._inputObj.ok = true;
                // doOKButton();

                var cart = GeckoJS.Controller.getInstanceByName('Cart');
                var r = cart.GuestCheck.doSelectTableFuncs(this._inputObj);

                if (r) {
                
                    $.hidePanel('selectTablePanel', true)
                }
                this._inputObj.action = '';
                this._sourceTableNo = null;
                
            }
            this._isBusy = false;
        },

        _enableFuncs: function(isNewOrder) {

            try {
                document.getElementById('recall_check').setAttribute('hidden', isNewOrder);
                document.getElementById('merge_table').setAttribute('hidden', isNewOrder);
                document.getElementById('unmerge_table').setAttribute('hidden', isNewOrder);
                document.getElementById('split_check').setAttribute('hidden', isNewOrder);
                document.getElementById('merge_check').setAttribute('hidden', isNewOrder);
                // document.getElementById('booking_table').setAttribute('hidden', isNewOrder);
                document.getElementById('change_clerk').setAttribute('hidden', isNewOrder);
                document.getElementById('trans_table').setAttribute('hidden', isNewOrder);
            } catch (e) {}
        },

        load: function(evt) {
            var inputObj = window.arguments[0];
            var self = this;

            // init popupPanel...
            var $panel = $('#selectTablePanel');
            // var $buttonPanel = $('#paymentscrollablepanel');

            var screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            var screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            $.installPanel($panel[0], {

                css: {
                    top: 0,
                    left: 0,

                    width: screenwidth,
                    height: screenheight
                },

                init: function(evt) {
                    self.initial();
                    window.RefreshTableStatusLight = self.doRefreshTableStatusLight;
                    window._tableStatusModel = self._tableStatusModel;

                },

                load: function(evt) {

                    inputObj = evt.data[0];

                    self.load2(inputObj);

                },

                showing: function(evt) {

                },

                shown: function(evt) {

                    document.getElementById('tableScrollablepanel').invalidate();
                    
                    clearInterval(window.tableStatusRefreshInterval);
                    window.tableStatusRefreshInterval = setInterval('RefreshTableStatusLight()', 15000);

                    document.getElementById('table_status_timer').startClock();

                },

                hide: function (evt) {

                    clearInterval(window.tableStatusRefreshInterval);

                    document.getElementById('table_status_timer').stopClock();

                }

            });
            var main = mainWindow.GeckoJS.Controller.getInstanceByName( 'Main' );
            main.dispatchEvent('onFirstLoad', null);

        },

        load2: function(inputObj) {

            if (inputObj) {
            this._inputObj = inputObj;
            this._isNewOrder = inputObj.isNewOrder;
            this._enableFuncs(this._isNewOrder);
            }
            
            // this.initial();

            // var tables = inputObj.tables;
            var tables = this._tableStatusModel.getTableStatusList();

            if (this._tables == null) {
                    // tables = inputObj.tables;

                    this._tables = tables;
                    this._inputObj.tables = tables;
                    var tableStatus = new TableStatusView(this._tables);
                    tableStatus._controller = this;
                    document.getElementById('tableScrollablepanel').datasource = tableStatus ;
            } else {
                    this._inputObj.tables = this._tables;
                    tableStatus._controller = this;
                    // document.getElementById('tableScrollablepanel').invalidate();
            }

        }

    };
    
    GeckoJS.Controller.extend(__controller__);


})();

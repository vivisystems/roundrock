(function(){
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/template_ext.js');
    
    var TableStatusView = window.TableStatusView = GeckoJS.NSITreeViewArray.extend({

        renderButton: function(row, btn) {
            // GREUtils.log('renderButton...');
            if (!this.data[row]) return;
            if (this.data[row].table_no <= 0) return;
            // if (!this.data[row].check_no) return;
            var tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};

            if (this.data[row].order == null) this.data[row].order = {};
            if (this.data[row].table == null) this.data[row].table = {};

            var seq = this.data[row].sequence || '';
            var check_no = this.data[row].check_no || '';
            var checks = this.data[row].checks || '';
            var table_no = this.data[row].table_no || '';
//            var table_label = this.data[row].table.table_name || '';
            var table_label = this.data[row].table_name || '';
            // var guest_num = this.data[row].order.no_of_customers || '0';
            var guest_num = this.data[row].guests || '0';

            // var seats = this.data[row].table.seats || '0';
            var seats = this.data[row].seats || '0';

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
            var transaction_created = this.data[row].created * 1000 || now;
//            var booking_time = Math.round((this.data[row].booking ? this.data[row].booking.booking : 0) || 0) * 1000;
            var booking_time = Math.round((this.data[row].booking ? this.data[row].booking : 0) || 0) * 1000;

            var book_time = (booking_time > 100) ? _("B#") + (new Date(booking_time)).toString("HH:mm") : '';

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
        _tables: [],
        _sourceTable: null,
        _sourceTableNo: null,
        _tableStatusModel: null,
        _isNewOrder: false,

        initial: function () {
            //
//            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
//            if (screenwidth > 1000) {
//                document.getElementById('tableScrollablepanel').rows = 5;
//                document.getElementById('tableScrollablepanel').cols = 5;
//            }
            
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

            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            var w = funcPanel.boxObject.width + 32;
            var h = funcPanel.boxObject.height + 0;
            var x = funcPanel.boxObject.screenX - 32;
            // var y = funcPanel.boxObject.screenY - 18;
            var y = height - h - 8;

            
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

            if (!id) return;
            
            var order = tableObj.order[0];

            // load template
            var path = GREUtils.File.chromeToPath('chrome://viviecr/content/order_display_template.tpl');
            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

            var data = {orders:[]};
            
            // remove all tabs
            var tabs = document.getElementById('orders_tab');
            while (tabs.firstChild) {
                tabs.removeChild(tabs.firstChild);
            }

            tableObj.order.forEach(function(o){
                data.orders.push(o);
                var tab = document.createElement("tab");
                tab.setAttribute('label', 'C#' + o.check_no);
                tabs.appendChild(tab);
            })
            data.sequence = order.seq;

            var result = tpl.process(data);

            if (doc) {
                doc.innerHTML = result;
            }

            // after_start
            var x = (width - promptPanel.boxObject.width) / 2;
            var y = (height - promptPanel.boxObject.height) / 2;
            // alert("x, y:" + x + "," + y);
            // promptPanel.openPopup(obj, "overlay", x, y, false, false);
            promptPanel.openPopupAtScreen(x, y, false);

            return promptPanel;
        },

        readTableConfig: function() {
            this._tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || false;
        },

        doRecallCheck: function() {
            this._setPromptLabel('*** ' + _('Recall Check') + ' ***', _('Please select a table to recall...'), '', _('Press CANCEL button to cancel function'), 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'RecallCheck';

        },

        doSplitCheck: function() {
            this._setPromptLabel('*** ' + _('Split Check') + ' ***', _('Please select a table to split...'), '', _('Press CANCEL button to cancel function'), 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'SplitCheck';

        },

        doMergeCheck: function() {
            this._setPromptLabel('*** ' + _('Merge Check') + ' ***', _('Please select a table to merge...'), '', _('Press CANCEL button to cancel function'), 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'MergeCheck';

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

            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
            var cart = mainWindow.GeckoJS.Controller.getInstanceByName( 'Cart' );
            var curTransaction = null;
            curTransaction = cart._getTransaction();

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
            this._setPromptLabel('*** ' + _('Trans Table') + ' ***', _('Please select the table to be transfered...'), '', _('Press CANCEL button to cancel function'), 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'TransTable';
        },

        doSelectTableNo: function() {
            this._setPromptLabel('*** ' + _('Select Table') + ' ***', _('Please select a table...'), '', _('Press CANCEL button to cancel function'), 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'SelectTableNo';

        },

        doRefreshTableStatus: function() {

            document.getElementById('tableScrollablepanel').invalidate();
            this._inputObj.action = '';
            this._sourceTable = null;
            this._sourceTableNo = null;
            this._hidePromptPanel('prompt_panel');

            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            cart.GuestCheck.getNewTableNo();

/*
            ///
            var fields = ['tables.table_no',
                            'tables.table_name',
                            'tables.seats',
//                            'table_statuses.clerk AS "Table.clerk"'
//                            'table_statuses.clerk',
                            'table_maps.id AS "Table.map_id"'
                      ];
// var fields = null;
            // var conditions = "orders.check_no='" + no + "' AND orders.status='2'";
            var conditions = null;
            var tableModel = new TableModel;
            var tables = tableModel.find('all', {fields: fields, conditions: conditions, recursive: 2});
this.log('Tables:::');
this.log(this.dump(tables));
*/
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
            // @todo check status first, doFunc when match table selected...
            var v = document.getElementById('tableScrollablepanel').value;
            var selTable = this._tables[v];
            
            switch (this._inputObj.action) {
                case 'SelectTableNo':

                    if (selTable.hostby) {
                        // @todo OSD
                        NotifyUtils.error(_('This table is host by Table#%S !!', [selTable.hostby]));
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
                        
                        $.hidePanel('selectTablePanel', true);
                        return;
                    }
                    break;
                case 'RecallCheck':
                    if (!selTable.sequence) {
                        // @todo OSD
                        NotifyUtils.error(_('This table is empty!!'));
                        return;
                    }

                    break;
                case 'SplitCheck':
                    if (!selTable.sequence) {
                        // @todo OSD
                        NotifyUtils.error(_('This table is empty!!'));
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
                        // $.hidePanel('selectTablePanel', true);
                        cart.GuestCheck.getNewTableNo();
                        return;
                    }
                    break;
                case 'TransTable':
                    if (this._sourceTableNo) {
                        //
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
                            // $.hidePanel('selectTablePanel', true);
                            cart.GuestCheck.getNewTableNo();
                            return;
                        }

                    } else {
                        if (!selTable.sequence) {
                            // @todo OSD
                            NotifyUtils.error(_('This table is empty!!'));
                            return;
                        }
                        this._setPromptLabel(null, null, _('Please select the table to transfer to...'), null, 3);
                        this._sourceTableNo = this._tables[v].table_no;
                        document.getElementById('tableScrollablepanel').invalidate();
                        return;
                    }
                    
                    break;
                case 'MergeTable':
                    if (this._sourceTableNo) {
                        //
                        var i = this._tables[v].table_no;
                        var holdby = GeckoJS.BaseObject.clone(this._sourceTable);

                        this._tables = this._tableStatusModel.holdTable(i, holdby.table_no);
                        
                        var tables = [];
                        this._tables.forEach(function(o){
                            // if (o.active || o.sequence)
                            tables.push(o);
                        });
                        this._tables = tables;
                        
                        var tableStatus = new TableStatusView(this._tables);
                        tableStatus._controller = this;
                        document.getElementById('tableScrollablepanel').datasource = tableStatus ;

                        this._inputObj.action = '';
                        this._sourceTable = null;
                        this._sourceTableNo = null;
                        this._hidePromptPanel('prompt_panel');
                        return;
                    } else {
                        if (!selTable.sequence) {
                            // @todo OSD
                            NotifyUtils.error(_('This table is empty!!'));
                            return;
                        }

                        this._setPromptLabel(null, null, _('Please select an empty table to merge...'), null, 3);
                        this._sourceTable = this._tables[v];
                        this._sourceTableNo = this._tables[v].table_no;

                        document.getElementById('tableScrollablepanel').invalidate();
                        return;
                    }
                    break;
                case 'UnmergeTable':

                    // if (!selTable.holdby) {
                    if (!selTable.hostby) {
                        // @todo OSD
                        NotifyUtils.error(_('This table had not been hold!!'));
                        return;
                    }

                    var i = this._tables[v].table_no;
                    var holdby = GeckoJS.BaseObject.clone(this._tables[v]);
                    holdby.status = -1;

                    // this._tables = this._tableStatusModel.holdTable(i, holdby);
                    this._tables = this._tableStatusModel.holdTable(i, i);

                    var tables = [];
                    this._tables.forEach(function(o){
                        // if (o.active || o.sequence)
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

                    return;
                    break;
                default:
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
                cart.GuestCheck.doSelectTableFuncs(this._inputObj);
                $.hidePanel('selectTablePanel', true)
            }
                
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

                },

                load: function(evt) {

                    inputObj = evt.data[0];

                    self.load2(inputObj);

                },

                showing: function(evt) {

                },

                shown: function(evt) {

                },

                hide: function (evt) {
                    
                }

            });
            var main = mainWindow.GeckoJS.Controller.getInstanceByName( 'Main' );
            main.dispatchEvent('onFirstLoad', null);

        },

        load2: function(inputObj) {

            this._inputObj = inputObj;
            this._isNewOrder = inputObj.isNewOrder;
            this._enableFuncs(this._isNewOrder);

            this.initial();

            // var tables = inputObj.tables;
            var tables2 = this._tableStatusModel.getTableStatusList();
this.log("dump tables2");
this.log(this.dump(tables2));
            var tables = [];
            /*
            if (inputObj.tables) {
                inputObj.tables.forEach(function(o){
                    // if (o.active || o.sequence)
                    tables.push(o);
                });
            }
            */
            if (tables2) {
                tables2.forEach(function(o){
                    // if (o.active || o.sequence)
                    tables.push(o);
                });
            }

            // tables = inputObj.tables;
            this._tables = tables;
            this._inputObj.tables = tables;
            var tableStatus = new TableStatusView(this._tables);
            tableStatus._controller = this;
            document.getElementById('tableScrollablepanel').datasource = tableStatus ;

        }

    };
    
    GeckoJS.Controller.extend(__controller__);

})();

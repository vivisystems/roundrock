(function(){
    
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/template_ext.js');

    var TableStatusView = NSITableStatusView;

    /**
     * Class SelectTableController
     */

    var __controller__ = {

        name: 'SelectTable',

        template: 'order_display_template',

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
        _selectedOrderId: null,
        _isBusy: false,

        _regionTables: null,
        _regions: null,
        _regionsById: {},

        _regionIndex: 0,
        _regionName: [],

        _orderPanel: null,
        _orderDoc: null,

        _tplPath: null,
        _tplFile: null,
        _tpl: null,

        _popupX: 40,
        _popupY: 30,

        _timeout: 5000,

        _tableDock: false,
        _tableDockLeft: 0,
        _tableDockTop: 0,
        _tableDockWidth: 400,
        _tableDockHeight: 400,

        initial: function () {
            //
            if (this._cartController == null) {
                this._cartController = GeckoJS.Controller.getInstanceByName('Cart');
            };

            if (this._tableStatusModel == null) {
                // this._tableStatusModel = new TableStatusModel;
                // this._tableStatusModel.initial();
                this._tableStatusModel = this._cartController.GuestCheck._tableStatusModel;
            }

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

            this._isBusy = true;

            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;

            if (this._orderPanel == null) {
                this._orderPanel = document.getElementById(panel);
                this._orderDoc = document.getElementById('order_display_div');
            }

            var promptPanel = this._orderPanel;
            var doc = this._orderDoc;

            var id = tableObj.order_id || '';

            // if (!id) return;
            if (tableObj.checks <= 0 || tableObj.order == null || tableObj.order.length == 0) return;
            
            var order = tableObj.order[0];

            // load template
            if (this._tpl == null) {
                var path = GREUtils.File.chromeToPath('chrome://viviecr/content/tpl/' + this.template + '.tpl');
                var file = GREUtils.File.getFile(path);
                this._tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );
            }
            var tpl = this._tpl;

            var data = {orders:[]};
            
            tableObj.order.forEach(function(o){
                data.orders.push(o);
            });

            if (!(tableObj.order && tableObj.order.length > 0)) return;

            data.sequence = order.seq;

            var result = tpl.process(data);

            if (doc) {
                doc.innerHTML = result;
            }

            // first time popup...
            if (promptPanel.boxObject.width == 0) {
                var x = this._popupX;
                var y = this._popupY;
                promptPanel.openPopupAtScreen(x, y, false);
                this.sleep(100);
            } else {
                var x = (width - promptPanel.boxObject.width) / 2;
                var y = (height - promptPanel.boxObject.height) / 2;

                this._popupX = x;
                this._popupY = y;
            }

            promptPanel.openPopupAtScreen(x, y, false);

            // remove all tabs
            var tabs = document.getElementById('orders_tab');
            while (tabs.firstChild) {
                tabs.removeChild(tabs.firstChild);
            }

            if (tableObj.order && tableObj.order.length > 0) {

                tableObj.order.forEach(function(o){

                    var tab = document.createElement("tab");
                    tab.setAttribute('label', 'C#' + o.Order.check_no);
                    tab.setAttribute('oncommand', "$do('selectOrderTab', '" + o.Order.id + "', 'SelectTable')");
                    tabs.appendChild(tab);
                }, this);
            } else {
                this.log('DEBUG', 'display order tableObj error:::');
            }

            // select first order
            tabs.selectedIndex = 0;
            if (tabs.selectedItem) {
                tabs.selectedItem.doCommand();
            }

            this._isBusy = false;

            return promptPanel;
        },

        readTableConfig: function() {

            this._tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || false;
            // this._tableSettings = this._tableStatusModel.getTableStatusOptions();
            this._timeout = (this._tableSettings.TableRefreshFrequence || 15) * 1000;
            
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
            this._selectedOrderId = null;
        },

        selectOrderTab: function(evt) {
            //
            this._selectedCheckNo = evt;
            this._selectedOrderId = evt;
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
            // if (this._selectedCheckNo) {
            if (this._selectedOrderId) {
                
                this._inputObj.action = 'RecallCheck';
                this._inputObj.check_no = this._selectedCheckNo;
                this._inputObj.order_id = this._selectedOrderId;

                this.doCloseOrderPanel();
                this.doFunc();
                
            } else {
                this._setPromptLabel('*** ' + _('Recall Check') + ' ***', _('Please select a table to recall...'), '', _('Press CANCEL button to cancel function'), 2);

                var pnl = this._showPromptPanel('prompt_panel');
                this._inputObj.action = 'RecallCheck';
            }
        },

        doSplitCheck: function() {
            // if (this._selectedCheckNo) {
            if (this._selectedOrderId) {
                
                this._inputObj.action = 'SplitCheck';
                this._inputObj.check_no = this._selectedCheckNo;
                this._inputObj.order_id = this._selectedOrderId;

                this.doCloseOrderPanel();
                this.doFunc();

            } else {
                this._setPromptLabel('*** ' + _('Split Check') + ' ***', _('Please select a table to split...'), '', _('Press CANCEL button to cancel function'), 2);

                var pnl = this._showPromptPanel('prompt_panel');
                this._inputObj.action = 'SplitCheck';
            }

        },

        doMergeCheck: function() {
            // if (this._selectedCheckNo) {
            if (this._selectedOrderId) {
                
                this._inputObj.action = 'MergeCheck';
                this._inputObj.check_no = this._selectedCheckNo;
                this._inputObj.order_id = this._selectedOrderId;

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

        doMarkTable: function() {
            this._setPromptLabel('*** ' + _('Add Table Status') + ' ***', _('Please select the table to mark status...'), '', _('Press CANCEL button to cancel function'), 2);
            
            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'MarkTable';
        },

        doUnmarkTable: function() {
            this._setPromptLabel('*** ' + _('Clear Table Status') + ' ***', _('Please select the table to clear status...'), '', _('Press CANCEL button to cancel function'), 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'UnmarkTable';
        },

        doMarkRegionTable: function() {

                this._inputObj.action = 'MarkRegionTable';

                this.doCloseOrderPanel();
                this.doFunc();

        },

        doUnmarkRegionTable: function() {

                this._inputObj.action = 'UnmarkRegionTable';

                this.doCloseOrderPanel();
                this.doFunc();

        },

        doBookingTable: function() {
            this._setPromptLabel('*** ' + _('Book Table') + ' ***', _('Please select a table to book...'), '', _('Press CANCEL button to cancel function'), 2);

            var pnl = this._showPromptPanel('prompt_panel');
            this._inputObj.action = 'BookTable';

            return;

            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';

            var aURL = 'chrome://viviecr/content/table_book.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                isNewOrder: null,
                tables: null
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, 'table_book', aFeatures, inputObj);

            return;

        },

        doChangeClerk: function() {
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            var service_clerk;
            if ( user != null ) {
                service_clerk = user.username;
            }

            // if (this._selectedCheckNo) {
            if (this._selectedOrderId) {

                this._inputObj.action = 'ChangeClerk';
                this._inputObj.check_no = this._selectedCheckNo;
                this._inputObj.order_id = this._selectedOrderId;

                this.doCloseOrderPanel();
                this.doFunc();

            } else {
                this._setPromptLabel('*** ' + _('Change Clerk') + ' ***', _('Select a table to change service clerk to [ %S ]...', [service_clerk]), '', _('Press CANCEL button to cancel function'), 2);

                var pnl = this._showPromptPanel('prompt_panel');
                this._inputObj.action = 'ChangeClerk';
            }

            return;
            

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
            // if (this._selectedCheckNo) {
            if (this._selectedOrderId) {

                this._inputObj.action = 'TransTable';
                this._inputObj.check_no = this._selectedCheckNo;
                this._inputObj.order_id = this._selectedOrderId;

                this.doCloseOrderPanel();

                this._setPromptLabel('*** ' + _('Trans Table') + ' ***', _('Please select the table to be transfered...'), '', _('Press CANCEL button to cancel function'), 2);

                var pnl = this._showPromptPanel('prompt_panel');
                
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
            var selectTable = GeckoJS.Controller.getInstanceByName('SelectTable');

            if (selectTable._isBusy) {

                clearTimeout(window.tableStatusRefreshInterval);
                window.tableStatusRefreshInterval = setTimeout('RefreshTableStatusLight()', window.tableStatusRefreshTime);

                return;
            }

            try {

                var list = window._tableStatusModel.getTableStatusList();

                document.getElementById('tableScrollablepanel').invalidate();


            } catch(e) {
                dump(e);
            }

            clearTimeout(window.tableStatusRefreshInterval);
            window.tableStatusRefreshInterval = setTimeout('RefreshTableStatusLight()', window.tableStatusRefreshTime);
            
            return;
        },

        doRefreshTableStatus: function() {

            if (this.isBusy) return;

            this._tableStatusModel._tableStatusLastTime = 0;
            this._tableStatusModel._tableOrderLastTime = 0;
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
                if (!this._tableDock)
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
            var selTable = this._regionTables[v];
            var cart = GeckoJS.Controller.getInstanceByName('Cart');

            var r = false;

            var selectedOrderId = this._inputObj.order_id;

            switch (this._inputObj.action) {
                case 'SelectTableNo':

                    if (selTable.hostby) {
                        // @todo OSD
                        NotifyUtils.error(_('This table is hosted by Table#%S !!', [selTable.hostby]));
                        this._isBusy = false;
                        return;
                    }

                    if (selTable.mark && selTable.mark_op_deny) {
                        // @todo OSD
                        NotifyUtils.error(_('This table status is marked as [%S] and can not be selected !!', [selTable.mark]));
                        this._isBusy = false;
                        return;
                    }

                    this._hidePromptPanel('prompt_panel');

                    if (this._inputObj.action) {
                        // this._inputObj.index = this._regionTables[v].table_no;
                        this._inputObj.index = v;
                        this._inputObj.tableObj = this._regionTables[v];
                        this._inputObj.ok = true;
                        // doOKButton();
                        
                        // cart.GuestCheck.doSelectTableFuncs(this._inputObj);
                        cart.GuestCheck.doSelectTableNo(this._inputObj);

                        this._inputObj.action = '';
                        this._sourceTableNo = null;

                        if (!this._tableDock)
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

                    if (this._inputObj.action) {
                        // this._inputObj.index = this._regionTables[v].table_no;
                        this._inputObj.index = v;
                        this._inputObj.tableObj = this._regionTables[v];
                        this._inputObj.ok = true;

                        var r = cart.GuestCheck.doRecallCheck(this._inputObj);

                        if (r) {

                            $.hidePanel('selectTablePanel', true)
                        }
                        this._inputObj.action = '';
                        this._sourceTableNo = null;

                    }

                    break;
                case 'SplitCheck':
                    if (!selTable.sequence) {
                        // @todo OSD
                        NotifyUtils.error(_('This table is empty!!'));
                        this._isBusy = false;
                        return;
                    }
                    
                    this._inputObj.sourceTableNo = this._sourceTableNo;

                    this._hidePromptPanel('prompt_panel');
                    // alert('doFunc...' + inputObj.action);

                    if (this._inputObj.action) {

                        this._inputObj.index = v;
                        this._inputObj.tableObj = this._regionTables[v];
                        this._inputObj.ok = true;

                        if (selectedOrderId) {
                            r = cart.GuestCheck.doSplitCheckByCheck(selectedOrderId);
                        } else {
                            r = cart.GuestCheck.doSplitCheck(this._sourceTableNo);
                        }

                        if (r) {
                            if (!this._tableDock) {
                                if (r == 1){
                                    $.hidePanel('selectTablePanel', true)
                                }
                            }
                        }

                        this._inputObj.action = '';
                        this._sourceTableNo = null;

                        // $.hidePanel('selectTablePanel', true);
                        // cart.GuestCheck.getNewTableNo();
                        this._isBusy = false;
                        this.doRefreshTableStatusLight();
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

                    this._inputObj.sourceTableNo = this._sourceTableNo;

                    this._hidePromptPanel('prompt_panel');

                    if (this._inputObj.action) {

                        this._inputObj.index = v;
                        this._inputObj.tableObj = this._regionTables[v];
                        this._inputObj.ok = true;

                        if (selectedOrderId) {
                            r = cart.GuestCheck.doMergeCheckByCheck(selectedOrderId);
                        } else {
                            r = cart.GuestCheck.doMergeCheck(this._sourceTableNo);
                        }

                        if (r) {
                            if (!this._tableDock) {
                                if (r == 1){
                                    $.hidePanel('selectTablePanel', true);
                                }
                            }
                        }

                        this._inputObj.action = '';
                        this._sourceTableNo = null;

                        // $.hidePanel('selectTablePanel', true);
                        // cart.GuestCheck.getNewTableNo();
                        this._isBusy = false;
                        this.doRefreshTableStatusLight();
                        return;
                    }

                    break;
                case 'ChangeClerk':
                    
                    this._inputObj.sourceTableNo = this._sourceTableNo;

                    this._hidePromptPanel('prompt_panel');

                    if (this._inputObj.action) {

                        this._inputObj.index = v;
                        this._inputObj.tableObj = this._regionTables[v];
                        this._inputObj.ok = true;

                        if (selectedOrderId) {
                            cart.GuestCheck.doChangeClerkByCheck(selectedOrderId);
                        } else {
                            cart.GuestCheck.doChangeClerk(this._sourceTableNo);
                        }

                        this._inputObj.action = '';
                        this._sourceTableNo = null;

                        // $.hidePanel('selectTablePanel', true);
                        
                        this._isBusy = false;
                        cart.GuestCheck.getNewTableNo();
                        return;
                    }
                    break;
                case 'TransTable':

                    if (selTable.hostby) {
                        // @todo OSD
                        NotifyUtils.error(_('This table is hosted by Table#%S !!', [selTable.hostby]));
                        this._isBusy = false;
                        return;
                    }

                    if (selTable.mark && selTable.mark_op_deny) {
                        // @todo OSD
                        NotifyUtils.error(_('This table status is marked as [%S] and can not be selected !!', [selTable.mark]));
                        this._isBusy = false;
                        return;
                    }
                    
                    if (this._sourceTableNo) {
                        //
                        var srcTableNo = this._sourceTableNo;
                        this._inputObj.sourceTableNo = this._sourceTableNo;

                        this._hidePromptPanel('prompt_panel');

                        if (this._inputObj.action) {

                            this._inputObj.index = v;
                            this._inputObj.tableObj = this._regionTables[v];

                            this._inputObj.ok = true;

                            var dstTableNo = this._regionTables[v].table_no;

                            if (selectedOrderId) {
                                cart.GuestCheck.doTransferByCheck(srcTableNo, dstTableNo, selectedOrderId);
                            } else {
                                cart.GuestCheck.doTransferCheck(srcTableNo, dstTableNo);
                            }


                            this._inputObj.action = '';
                            this._sourceTableNo = null;

                            // $.hidePanel('selectTablePanel', true);
                            
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
                        this._sourceTableNo = this._regionTables[v].table_no;
                        document.getElementById('tableScrollablepanel').invalidate();
                        this._isBusy = false;
                        return;
                    }
                    
                    break;
                case 'MergeTable':
                    if (this._sourceTableNo) {
                        //
                        var table_no = this._regionTables[v].table_no;
                        var holdby = GeckoJS.BaseObject.clone(this._sourceTable);

                        // this._tables = this._tableStatusModel.holdTable(i, holdby.table_no);
                        this._tableStatusModel.holdTable(table_no, holdby.table_no);

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
                        this._sourceTable = this._regionTables[v];
                        this._sourceTableNo = this._regionTables[v].table_no;

                        document.getElementById('tableScrollablepanel').invalidate();
                        this._isBusy = false;
                        return;
                    }
                    break;
                case 'UnmergeTable':

                    if (!selTable.hostby) {
                        // @todo OSD
                        NotifyUtils.error(_('This table had not been hold!!'));
                        this._isBusy = false;
                        return;
                    }

                    var table_no = this._regionTables[v].table_no;
                    var holdby = GeckoJS.BaseObject.clone(this._regionTables[v]);
                    holdby.status = -1;

                    this._tableStatusModel.holdTable(table_no, table_no);

                    document.getElementById('tableScrollablepanel').invalidate();
                    
                    this._inputObj.action = '';
                    this._sourceTableNo = null;
                    this._hidePromptPanel('prompt_panel');
                    this._isBusy = false;
                    return;
                    break;

                case 'MarkTable':

                    var screenwidth = GeckoJS.Session.get('screenwidth') || 800;
                    var screenheight = GeckoJS.Session.get('screenheight') || 600;

                    var aURL = 'chrome://viviecr/content/select_mark.xul';
                    var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;

                    var tableNo = this._regionTables[v].table_no;
                    var tableName = this._regionTables[v].table_name;
                    var inputObj = {
                        name: '',
                        title: _('Select Table Status'),
                        description: _('You are now marking table status of Table# %S (%S)', [tableNo,tableName])
                    };
                    GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select Table Status'), aFeatures, inputObj);

                    if (inputObj.ok && inputObj.name) {
                        this._isBusy = true;
                        var table_no = this._regionTables[v].table_no;

                        var markObj = inputObj.markObj;

                        this._tableStatusModel.setTableMark(table_no, markObj);
                    }

                    this._inputObj.action = '';
                    this._sourceTableNo = null;
                    this._hidePromptPanel('prompt_panel');

                    this._isBusy = false;
                    cart.GuestCheck.getNewTableNo();
                    return;
                    break;

                case 'UnmarkTable':

                    var tableNo = this._regionTables[v].table_no;
                    var tableName = this._regionTables[v].table_name;
                    if (GREUtils.Dialog.confirm(this.topmostWindow,
                        _('Clear Table Status'),
                        _('You are now clearing table status of Table# %S (%S). Proceed?\n' +
                            'Click OK to clear, \nor, click Cancel to abort.', [tableNo,tableName])) == true) {

                        var table_no = this._regionTables[v].table_no;
                        var markObj = {};
                        this._isBusy = true;
                        this._tableStatusModel.setTableMark(table_no, markObj);
                        document.getElementById('tableScrollablepanel').invalidate();

                        // @todo OSD
                        NotifyUtils.warn(_('Table status of Table# %S (%S) is cleared.', [tableNo,tableName]));

                    }

                    this._inputObj.action = '';
                    this._sourceTableNo = null;
                    this._hidePromptPanel('prompt_panel');

                    this._isBusy = false;
                    cart.GuestCheck.getNewTableNo();
                    return;
                    break;

                case 'MarkRegionTable':

                    var screenwidth = GeckoJS.Session.get('screenwidth') || 800;
                    var screenheight = GeckoJS.Session.get('screenheight') || 600;

                    var aURL = 'chrome://viviecr/content/select_mark.xul';
                    var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;

                    var regionName = this._regionName[this._regionIndex];
                    var inputObj = {
                        name: '',
                        title: _('Select Table Status'),
                        description: _('You are now marking table status of region [%S]', [regionName])
                    };
                    GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select Table Status'), aFeatures, inputObj);

                    if (inputObj.ok && inputObj.name) {
                        this._isBusy = true;

                        var markObj = inputObj.markObj;

                        this._tableStatusModel.setTableMarks(this._regionTables, markObj);
                    }

                    this._inputObj.action = '';
                    this._sourceTableNo = null;
                    this._hidePromptPanel('prompt_panel');
                    this._isBusy = false;
                    cart.GuestCheck.getNewTableNo();
                    return;
                    break;

                case 'UnmarkRegionTable':

                    var regionName = this._regionName[this._regionIndex];
                    if (GREUtils.Dialog.confirm(this.topmostWindow,
                        _('Clear all table status in region'),
                        _('You are now clearing all table status of region [%S]. Proceed?\n' +
                            'Click OK to clear, \nor, click Cancel to abort.', [regionName])) == true) {

                        var markObj = {};
                        this._isBusy = true;

                        this._tableStatusModel.setTableMarks(this._regionTables, markObj);

                        document.getElementById('tableScrollablepanel').invalidate();

                        // @todo OSD
                        NotifyUtils.warn(_('All table status of region [%S] are cleared.', [regionName]));

                    }

                    this._inputObj.action = '';
                    this._sourceTableNo = null;
                    this._hidePromptPanel('prompt_panel');
                    this._isBusy = false;
                    cart.GuestCheck.getNewTableNo();
                    return;
                    break;

                case 'BookTable':

                    var table_status_id = this._regionTables[v].id
                    var table_id = this._regionTables[v].Table.id;
                    var table_no = this._regionTables[v].table_no;
                    var table_name = this._regionTables[v].Table.table_name;
                    var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
                    var screenheight = GeckoJS.Session.get('screenheight') || '600';

                    var aURL = 'chrome://viviecr/content/table_book.xul';
                    var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
                    var inputObj = {
                        table_no: table_no,
                        table_id: table_id,
                        table_name: table_name,
                        table_status_id: table_status_id,
                        tables: null
                    };

                    GREUtils.Dialog.openWindow(this.topmostWindow, aURL, 'table_book', aFeatures, inputObj);

                    this._inputObj.action = '';
                    this._sourceTableNo = null;
                    this._hidePromptPanel('prompt_panel');

                    cart.GuestCheck.getNewTableNo();
                    this._isBusy = false;
                    return;
                    break;
                default:

                    var orders = this._cartController.GuestCheck.getCheckList("TableNo", this._regionTables[v].table_no);
                    this._regionTables[v].order = orders.concat([]);
                    this._showOrderDisplayPanel('order_display_panel', this._regionTables[v], evt.originalTarget);
                    break;
            }
            this._hidePromptPanel('prompt_panel');
            
            if (this._inputObj.action) {

                this._inputObj.index = v;
                this._inputObj.tableObj = this._regionTables[v];
                this._inputObj.ok = true;

                this.log("DEBUG", "do not call to doSelectTableFuncs with action:" + this._inputObj.action);

                if (r) {
                    if (!this._tableDock)
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

        setRegionMenuItem: function() {

            var regions = this.getRegionList();

            var regionObj = document.getElementById('table_region_menupopup');

            // remove all child...
            while (regionObj.firstChild) {
                regionObj.removeChild(regionObj.firstChild);
            }

            this._regionName = [];
            var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
            menuitem.setAttribute('value', '0');
            menuitem.setAttribute('label', _('All Regions'));
            regionObj.appendChild(menuitem);
            this._regionName.push(_('All Regions'));

            var index = 0;
            regions.forEach(function(data){
                var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                // menuitem.setAttribute('value', data.id);
                index++
                menuitem.setAttribute('value', index);
                menuitem.setAttribute('label', data.name);
                regionObj.appendChild(menuitem);
                this._regionName.push(data.name);
            }, this);
            
            this._regionIndex = 0;
            document.getElementById('table_region').selectedIndex = this._regionIndex;
        },

        _menuPriorRegion: function(){
            //
            document.getElementById('table_region').selectedIndex = this.priorRegion();
        },

        _menuNextRegion: function() {
            //
            document.getElementById('table_region').selectedIndex = this.nextRegion();
        },

        _menuSetRegion: function(index) {
            //
            document.getElementById('table_region').selectedIndex = index;
            this.setRegion(index);
        },

        getRegionList: function() {
            //
            if (this._regions) return this._regions;

            this._regions = this._tableStatusModel.getRegions();

            var index = 0;
            this._regions.forEach(function(regionObj){
                this._regionsById[regionObj.id] = index++;
                regionObj['regionTables'] = [];
            }, this);

            return this._regions;
        },

        setRegion: function(index) {
            //
            var region_id;
            if (index == "0") {
                this._regionTables = this._tables;

            } else {
                region_id = this._regions[index - 1].id;

                this._regionTables = this._regions[index - 1].regionTables;

            }

            var tableStatus = new TableStatusView(this._regionTables);
            tableStatus._controller = this;
            document.getElementById('tableScrollablepanel').datasource = tableStatus ;

            return this._regionIndex = index;
        },

        priorRegion: function() {
            //
            this._regionIndex--
            this._regionIndex = this._regionIndex < 0 ? this._regions.length : this._regionIndex;
            this.setRegion(this._regionIndex);

            return this._regionIndex;

        },

        nextRegion: function() {
            //
            this._regionIndex++
            this._regionIndex = this._regionIndex > this._regions.length ? 0 : this._regionIndex;
            this.setRegion(this._regionIndex);

            return this._regionIndex;

        },

        load: function(evt) {
            
            var inputObj = window.arguments[0];
            var self = this;

            // init popupPanel...
            var $panel = $('#selectTablePanel');

            var screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            var screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            if (this._tableDock) {
                var top = this._tableDockTop;
                var left = this._tableDockLeft;
                var width = this._tableDockWidth;
                var height = this._tableDockHeight;
            } else {
                var top = 0;
                var left = 0;
                var width = screenwidth;
                var height = screenheight;
            }


            $.installPanel($panel[0], {

                css: {
                    top: top,
                    left: left,
                    width: width,
                    height: height
                },

                overlayCSS: {
                    top: top,
                    left: left,
                    width: width,
                    height: height
                },

                init: function(evt) {

                    self.initial();
                    window.tableStatusRefreshTime = self._timeout;
                    window.RefreshTableStatusLight = self.doRefreshTableStatusLight;
                    window._tableStatusModel = self._tableStatusModel;
                    window._tableStatusIsBusy = self._isBusy;
                    
                    inputObj = evt.data[0];
                    self.load2(inputObj);

                },

                load: function(evt) {

                    // inputObj = evt.data[0];
                    // self.load2(inputObj);

                },

                showing: function(evt) {

                },

                shown: function(evt) {

                    self.readTableConfig();
                    window.tableStatusRefreshTime = self._timeout;
//GREUtils.log("panel shown:::");
                    window._tableStatusModel.getTableStatusList();
                    document.getElementById('tableScrollablepanel').invalidate();

                    // clearInterval(window.tableStatusRefreshInterval);
                    clearTimeout(window.tableStatusRefreshInterval);

                    // release CPU to refresh table status panel ...
                    // GeckoJS.BaseObject.sleep(100);

                    // window.tableStatusRefreshInterval = setInterval('RefreshTableStatusLight()', 50000);
                    window.tableStatusRefreshInterval = setTimeout('RefreshTableStatusLight()', window.tableStatusRefreshTime);

                    if (document.getElementById('table_status_timer'))
                        document.getElementById('table_status_timer').startClock();

                },

                hide: function (evt) {

                    // clearInterval(window.tableStatusRefreshInterval);
                    clearTimeout(window.tableStatusRefreshInterval);

                    if (document.getElementById('table_status_timer'))
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

            this._enableFuncs(false);
            }

            var tables = this._tableStatusModel.getTableStatusList();

            if (this._tables == null) {
            
                    this._tables = tables;
                    this._inputObj.tables = tables;

                    this.setRegionMenuItem();

                    // make tables of regions to reference to all tables
                    this._tables.forEach(function(tableObj){
                        //
                        var index = this._regionsById[tableObj.Table.table_region_id];
                        if (index >= 0) {
                            this._regions[index].regionTables[this._regions[index].regionTables.length] = tableObj;

                        }
                    }, this);

                    var default_region_id = this._tableSettings.DefaultRegion;
                    var regionIndex = (this._regionsById[default_region_id] || -1) + 1;

                    this._menuSetRegion(regionIndex);

            } else {
                    this._inputObj.tables = this._tables;

            }

        }

    };
    
    GeckoJS.Controller.extend(__controller__);


})();

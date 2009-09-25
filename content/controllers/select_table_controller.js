(function(){
    
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/template_ext.js');

    /**
     * Class SelectTableController
     */

    var __controller__ = {

        name: 'SelectTable',

        uses: ['TableSetting', 'Table', 'TableMark'],

        _cartController: null,

        _tablesViewHelper: null,
        
        tableSettings: null,

        action: 'selectTable', 
        
        template: 'order_display_template',

        _tplPath: null,
        _tplFile: null,
        _tpl: null,

        _timeout: 5000,

        _timerId: false,

        _blockRefreshTableStatus: false,

        _tableDock: false,
        _tableDockLeft: 0,
        _tableDockTop: 0,
        _tableDockWidth: 400,
        _tableDockHeight: 400,


        getTableSettings: function() {
            if(!this.tableSettings) {
                this.tableSettings = this.TableSetting.getTableSettings();
            }
            return this.tableSettings;
        },
        
        getRegionMenuObj: function() {
            return document.getElementById('table_region');
        },

        getTableSelectorPanelObj: function() {
            return document.getElementById('selectTablePanel');
        },


        /**
         * popupTableSelectorPanel
         */
        popupTableSelectorPanel: function() {
            try {
                var r = $.popupPanel('selectTablePanel');
            } catch (e) {}
        },

        /**
         * hidenTableSelectorPanel
         */
        hidenTableSelectorPanel: function() {
            try {
                if (!this.isDock()) $.hidePanel('selectTablePanel');
            } catch (e) {}
        },

        
        getTableButtonsPanelObj: function() {
            return document.getElementById('tableScrollablepanel');  
        },


        isDock: function() {
            var tableSettings = this.getTableSettings();
            return ( tableSettings.IsDockMode || false );
        },




        popupOrderDisplayPanel: function(panel) {

            panel = panel || 'order_display_panel';
            
            this._isBusy = true;

            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;

            var promptPanel = document.getElementById(panel);

            var x = 0, y = 0;

            // first time popup...
            if (promptPanel.boxObject.width == 0) {
                x = this._popupX;
                y = this._popupY;
                promptPanel.openPopupAtScreen(x, y, false);
                this.sleep(100);
            } else {
                x = (width - promptPanel.boxObject.width) / 2;
                y = (height - promptPanel.boxObject.height) / 2;

                this._popupX = x;
                this._popupY = y;
            }

            promptPanel.openPopupAtScreen(x, y, false);

            this._isBusy = false;

            return promptPanel;
        },

        hideOrderDisplayPanel: function(panel) {
            panel = panel || 'order_display_panel';
            var promptPanel = document.getElementById(panel);
            promptPanel.hidePopup();
            return promptPanel;
        },
        
        getTablesViewHelper: function() {
            if (!this._tablesViewHelper) {
                this._tablesViewHelper = new NSITableStatusView();
                this._tablesViewHelper.setTableSettings(this.getTableSettings());
                this._tablesViewHelper.TableStatus = new TableStatusModel();
            }
            return this._tablesViewHelper;
        },

        getSelectedRegion: function() {
            return this.getRegionMenuObj().value;
        },

        setSelectedRegion: function(region) {
            // XXX check exists
            this.getRegionMenuObj().value = region;
            // trigger setRegion method
            this.setRegion(region);
        },

        /**
         * setRegionMenuItem
         */
        setRegionMenuItem: function() {

            var regions = this.Table.TableRegion.getTableRegions() || [];
            var regionObj = this.getRegionMenuObj();

            regionObj.removeAllItems();
            
            // append all regions
            regionObj.appendItem(_('All Regions'),'ALL');

            regions.forEach(function(data){
                regionObj.appendItem(data.name, data.id);
            });

            var defaultRegion = this.tableSettings.DefaultRegion;
            regionObj.value = defaultRegion;
            
        },

        /**
         * menuChangeRegion
         * dir - previous / next
         * 
         */
        menuChangeRegion: function(dir) {

            var regionObj = this.getRegionMenuObj();
            var itemCount = regionObj.itemCount;
            var selIndex = regionObj.selectedIndex;

            switch(dir) {
                default:
                case 'next':
                    regionObj.selectedIndex = (++selIndex >= itemCount) ? 0 : selIndex;
                    break;
                case 'previous':
                    regionObj.selectedIndex = (--selIndex < 0) ? (itemCount-1) : selIndex;
                    break;
            }
            this.setRegion(regionObj.value);

        },

        /**
         * setRegion
         */
        setRegion: function(region) {
            // update tables panel
            this.setTablesByRegion(region);
        },


        /**
         * setTablesByRegion
         */
        setTablesByRegion: function(region) {
            region = region || 'ALL';    

            var tables = [];
            if (region != 'ALL') {
                tables = this.Table.getTablesByRegionId(region);
            }else {
                tables = this.Table.getTables();
            }

            this.getTablesViewHelper().setRegion(region);
            this.getTablesViewHelper().setTables(tables);
            
        },


        /**
         * refreshTableStatus
         *
         * if no table status receive, only repaint period time.
         */
        refreshTableStatus: function() {
            
            let isOpen = this.getTableSelectorPanelObj().state == 'open' ;
            
            if (this._blockRefreshTableStatus || !isOpen) return;

            try{
                this._blockRefreshTableStatus = true;
                
                // update status
                let updatedTablesStatus = this.Table.TableStatus.getTablesStatus(true);

                if (updatedTablesStatus && updatedTablesStatus.length > 0) {
                    this.getTablesViewHelper().refreshUpdatedTablesStatus(updatedTablesStatus);
                }else {
                    this.getTablesViewHelper().refreshTablesStatusPeriod();
                }
            }finally{
                this._blockRefreshTableStatus = false;
            }
            
        },

        
        /**
         * initialRefreshTimer
         */
        initialRefreshTimer: function(){


            if(typeof this._timerId == "number") return ;
            
            var self = this;
            var timeoutMS = this._timeout;

            var fn = function() {
                try {
                    self.refreshTableStatus();
                }catch(e) {
                    self.log('ERROR', 'on refreshTableStatus');
                }finally {
                    self._timerId = setTimeout( arguments.callee, timeoutMS );
                }
            };

            this._timerId = setTimeout(fn, timeoutMS);
        },

        /**
         * stopRefreshTimer
         */
        stopRefreshTimer: function() {
            
            if(typeof this._timerId == "number")  {
                clearTimeout(this._timerId);
                this._timerId = false;
            }

        },

        /**
         * initialTableSelectorPanel
         */
        initialTableSelectorPanel: function() {

            var tableSettings = this.getTableSettings();
            
            var self = this;

            // init popupPanel...
            var $panel = $('#selectTablePanel');

            var screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            var screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            var top=0, left=0,width=200,height=200;


            if (this.isDock()) {
                top = tableSettings.TableDockTop;
                left = tableSettings.TableDockLeft;
                width = tableSettings.TableDockWidth;
                height = tableSettings.TableDockHeight;
            } else {
                top = 0;
                left = 0;
                width = screenwidth;
                height = screenheight;
            }

            $.installPanel($panel[0], {

                css: {
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                    'z-index': 901
                },

                overlayCSS: {
                    top: top,
                    left: left,
                    width: width,
                    height: height,
                    'z-index': 900
                },

                init: function(evt) {

                    // this callback will triggered when popup panel first popup.
                    self.setRegionMenuItem();

                    // get selectedRegion
                    var selectedRegion = self.getSelectedRegion();

                    try {
                        // init tables and status view
                        self.getTableButtonsPanelObj().datasource = self.getTablesViewHelper();
                        // update tables by region
                        self.setTablesByRegion(selectedRegion);

                        self.setAction('selectTable');
                    
                    }catch(e) {
                        self.log('ERROR', 'ERROR init panel');
                    }

                },

                load: function(evt) {
                },

                showing: function(evt) {
                    // initial timer
                    self.initialRefreshTimer();
                },

                shown: function(evt) {
                    // tablespanel shown , refresh
                    self.refreshTableStatus();
                },

                hide: function (evt) {
                    // stop timer
                    self.stopRefreshTimer();
                }

            });
        },

        setActionButtonChecked: function(action) {

            // radio button in two vbox has bug, set checked self.
            $('button[group="func"]').each(function(btn) {
                this.removeAttribute('checked');
            });
            document.getElementById(action+'Btn').setAttribute('checked', true);

        },

        /**
         * getAction TableSelector current action mode.
         */
        getAction: function() {
            return (this.action || 'selectTable');
        },

        /**
         * setAction for TableSelector , 
         * also setPromptLable and clean unused data.
         */
        setAction: function(action) {
            this.action = action;
            switch(action) {
                case 'selectTable':
                    this.setActionButtonChecked(action);
                    this.setPromptLabel('*** ' + _('Select Table') + ' ***', _('Please select a table...'), 2);
                    this._actionData = null;
                    break;
                case 'mergeTable':
                    this.setActionButtonChecked(action);
                    this.setPromptLabel('*** ' + _('Merge Table') + ' ***', _('Please select the master table...'), 2);
                    this._actionData = null;
                    break;
                case 'mergeTableSlave':
                    // not real UI action
                    let table_no = this._actionData.table_no || '';
                    this.setPromptLabel('*** ' + _('Merge Table') + ' ***', _('Please select the table merge to [%S]...', [table_no]), 2);
                    break;
                case 'unmergeTable':
                    this.setActionButtonChecked(action);
                    this.setPromptLabel('*** ' + _('Unmerge Table') + ' ***', _('Please select the table to unmerge...'), 2);
                    break;
                case 'bookingTable':
                    this.setActionButtonChecked(action);
                    this.setPromptLabel('*** ' + _('Book Table') + ' ***', _('Please select a table to book...'), 2);
                    break;
                case 'markTable':
                    this.setActionButtonChecked(action);
                    this.setPromptLabel('*** ' + _('Add Table Status') + ' ***', _('Please select the table to mark status...'), 2);
                    break;
                case 'unmarkTable':
                    this.setActionButtonChecked(action);
                    this.setPromptLabel('*** ' + _('Clear Table Status') + ' ***', _('Please select the table to clear status...'), 2);
                    break;
            }
        },

        /**
         * Set onscreen prompt label
         */
        setPromptLabel: function(prompt_1, prompt_2, highlight) {
            //
            if (prompt_1 != null) document.getElementById("prompt_1").value = prompt_1;
            if (prompt_2 != null) document.getElementById("prompt_2").value = prompt_2;
            //            if (prompt_3 != null) document.getElementById("prompt_3").value = prompt_3;
            //            if (prompt_4 != null) document.getElementById("prompt_4").value = prompt_4;

            document.getElementById("prompt_2").className = "PromptLabel2 whitefont";
            //            document.getElementById("prompt_3").className = "PromptLabel2 whitefont";

            document.getElementById("prompt_" + highlight).className = "PromptLabel2 yellowfont";
        },

        /**
         * onTableSelect from popup panel. (FOR DOM Event)
         */
        onTableSelect: function (evt) {
            let selectedIndex = evt.target.selectedIndex;
            let selectedTable = evt.target.datasource.data[selectedIndex];
            let table_id = selectedTable.id;

            if (!selectedTable) {
                // table not exits ??  XXX notify error message
                return false;
            }

            // check which action to dispatch
            // this method just dispatcher
            let action  = this.getAction();

            switch(action) {
                default:
                case 'selectTable':
                    this.executeSelectTable(table_id);
                    break;
                case 'mergeTable':
                case 'mergeTableSlave':
                    this.executeMergeTable(table_id);
                    break;
                case 'unmergeTable':
                    this.executeUnmergeTable(table_id);
                    break;
                case 'markTable':
                    this.executeMarkTable(table_id);
                    break;
                case 'unmarkTable':
                    this.executeUnmarkTable(table_id);
                    break;
            }

            return true;
        },


        /**
         * executeSelectTable  -- called from onTableSelect dispatcher
         *
         * table_id
         */
        executeSelectTable: function(table_id, force_command){

            let table = this.Table.getTableById(table_id);
            let tableStatus = this.Table.TableStatus.getTableStatusById(table_id);
            let table_no = table.table_no;

            let active = 1;
            let status = 0;
            let command = 'newTable';

            // check status or not active or op_deny
            if (tableStatus) {
                if ((!table.active && tableStatus.TableStatus.order_count == 0) || tableStatus.TableStatus.status == 2
                    || (tableStatus.TableStatus.status == 3 && tableStatus.TableStatus.mark_op_deny) ) {

                    command = 'denyTable';
                }else if (tableStatus.TableStatus.status == 1 && tableStatus.TableStatus.order_count >0 ) {
                    command = 'selectTableOrder';
                }
                active = tableStatus.Table.active ? 1 : 0;
                status = tableStatus.TableStatus.status;
            }else if (!table.active) {
                command = 'denyTable';
                active = 0
            }

            switch (command) {
                default:
                case 'newTable':
                    this.newTable(table_id);
                    break;

                case 'denyTable':
                    // XXX deny Table, notify message ?
                    NotifyUtils.warn(_('Table [%S] Not available.Status: [%S], Active: [%S]',[ table_no, status, active]));
                    this.log('DEBUG', _('Table [%S] Not available.Status: [%S], Active: [%S]',[ table_no, status, active]));
                    break;

                case 'selectTableOrder':
                    this.executeSelectTableOrder(table_id);
                    break;
            }

            return true;


        },


        /**
         * executeSelectTableOrder  -- called from onTableSelect dispatcher
         * 
         * table_id
         */
        executeSelectTableOrder: function(table_id) {
            
            let table = this.Table.getTableById(table_id);
            let tableStatus = this.Table.TableStatus.getTableStatusById(table_id);
            let table_no = table.table_no;

            // unserialize orderObject 
            for(var id in tableStatus.OrdersById) {
                
                if(tableStatus.OrdersById[id].TransactionData) continue;

                let orderObject = tableStatus.OrdersById[id].OrderObject;
                let data = GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(atob(orderObject.object)));
                if (data) {
                    tableStatus.OrdersById[id].TransactionData = data;
                }else {
                    tableStatus.OrdersById[id].TransactionData = {};
                }
            }

            let doc = document.getElementById('order_display_div');
            let result = '';
            
            try {
                // process display text
                if (!tableStatus['_cachedOrdersInnerHTML_']) {

                    // load template
                    if (this._tpl == null) {
                        var path = GREUtils.File.chromeToPath('chrome://viviecr/content/tpl/' + this.template + '.tpl');
                        var file = GREUtils.File.getFile(path);
                        this._tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );
                    }
                    result = this._tpl.process(tableStatus);
                    
                // XXX cached it ?
                //tableStatus['_cachedOrdersInnerHTML_'] = result;
                }else {
                    result = tableStatus['_cachedOrdersInnerHTML_'];
                }

                if (doc) {
                    doc.innerHTML = result ;
                    // remove all tabs
                    var tabs = document.getElementById('orders_tab');
                    this.Form.removeAllChildren(tabs);
                    
                    tableStatus.TableOrder.forEach(function(order){
                        var tab = document.createElement("tab");
                        tab.setAttribute('label', 'CC#' + order.check_no);
                        tab.setAttribute('value', order.id);
                        tabs.appendChild(tab);
                    });

                    document.getElementById('order_selected_table_id').value = table_id;
                }
                this.popupOrderDisplayPanel();
            }catch(e){
                // XXX notify fatal error message.
                // alert(e);
                this.log('ERROR', 'executeSelectTableOrder and InnerHtml');
                return false;
            }
            return true;
        },

        /**
         * executeMergeTable  -- called from onTableSelect dispatcher
         */
        executeMergeTable: function(table_id) {

            let table = this.Table.getTableById(table_id);
            let tableStatus = this.Table.TableStatus.getTableStatusById(table_id);
            let table_no = table.table_no;
            let action = this.getAction();

            if (tableStatus) {
                if ((!tableStatus.Table.active && tableStatus.TableStatus.order_count == 0) || tableStatus.TableStatus.status == 2
                    || (tableStatus.TableStatus.status == 3 && tableStatus.TableStatus.mark_op_deny) ) {

                    NotifyUtils.warn(_('Table [%S] Not available.Status: [%S], Active: [%S]',[ table_no, tableStatus.TableStatus.status, tableStatus.Table.active]));
                    return ;
                }
            }else if (!table.active) {
                    NotifyUtils.warn(_('Table [%S] Not available.Status: [%S], Active: [%S]',[ table_no, 0, 0]));
                    return ;
            }

            // set master id
            switch(action) {
                case 'mergeTable':
                    this._actionData = table;
                    // prompt next step
                    this.setAction('mergeTableSlave');
                    return;
                    break;
                case 'mergeTableSlave':
                    if (tableStatus && tableStatus.TableStatus.status != 0) {
                        // check available
                        NotifyUtils.warn(_('Table [%S] Not available.Status: [%S], Active: [%S]',[ table_no, tableStatus.TableStatus.status, tableStatus.Table.active]));
                        return;
                    }
                    var masterTableId = this._actionData.id;
                    var slaveTableId = table_id;
                    break;
            }

            // merge table
            this.Table.TableStatus.mergeTable(masterTableId, slaveTableId);

            // set action to select ??
            this.setAction('selectTable');

            // refresh
            this.refreshTableStatus();

        },

        /**
         * executeUnmergeTable  -- called from onTableSelect dispatcher
         */
        executeUnmergeTable: function(table_id) {

            let table = this.Table.getTableById(table_id);
            let tableStatus = this.Table.TableStatus.getTableStatusById(table_id);
            let table_no = table.table_no;
            let status = 0;

            if (tableStatus) {
                status = tableStatus.TableStatus.status ;
                if (!tableStatus.TableStatus.hostby) status = 0;
            }

            if (status == 0) {
                NotifyUtils.warn(_('Table [%S] Not available.Status: [%S], Active: [%S]',[ table_no, tableStatus.TableStatus.status, tableStatus.Table.active]));
                return ;
            }

            // unmerge table
            this.Table.TableStatus.unmergeTable(table_id);

            // set action to select ??
            this.setAction('selectTable');

            // refresh
            this.refreshTableStatus();

        },


        /**
         * openSelectMarkDialog
         *
         * @param {Object} table
         */
        openSelectMarkDialog: function (table){

            var screenwidth = GeckoJS.Session.get('screenwidth') || 800;
            var screenheight = GeckoJS.Session.get('screenheight') || 600;

            var aURL = 'chrome://viviecr/content/select_mark.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;

            var tableNo = table.table_no;
            var tableName = table.table_name;
            var inputObj = {
                marks: this.TableMark.getTableMarks(),
                id: '',
                name: '',
                title: _('Select Table Status'),
                description: _('You are now marking table status of Table# %S (%S)', [tableNo,tableName])
            };
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select Table Status'), aFeatures, inputObj);

            if (inputObj.ok && inputObj.id) {
                return inputObj.id;
            }

            return false;

        },
        
        /**
         * executeMarkTable  -- called from onTableSelect dispatcher
         */
        executeMarkTable: function(table_id) {

            let table = this.Table.getTableById(table_id);
            let tableStatus = this.Table.TableStatus.getTableStatusById(table_id);
            let table_no = table.table_no;

            if (tableStatus) {
                if ((!tableStatus.Table.active && tableStatus.TableStatus.order_count == 0) || tableStatus.TableStatus.status == 2
                    || (tableStatus.TableStatus.status == 1) ) {

                    NotifyUtils.warn(_('Table [%S] Not available.Status: [%S], Active: [%S]',[ table_no, tableStatus.TableStatus.status, tableStatus.Table.active]));
                    return ;
                }
            }else if (!table.active) {
                    NotifyUtils.warn(_('Table [%S] Not available.Status: [%S], Active: [%S]',[ table_no, 0, 0]));
                    return ;
            }

            var markId = this.openSelectMarkDialog(table);

            if (!markId) {
                // XXX error message ?
                return false;
            }
            
            var user = this.Acl.getUserPrincipal();
            var clerk = '' ;
            if ( user != null ) {
                clerk = user.description || user.username;
            }

            // mark table
            this.Table.TableStatus.markTable(table_id, markId, clerk);

            // set action to select ??
            this.setAction('selectTable');

            // refresh
            this.refreshTableStatus();

        },

        /**
         * executeUnmarkTable  -- called from onTableSelect dispatcher
         */
        executeUnmarkTable: function(table_id) {

            let table = this.Table.getTableById(table_id);
            let tableStatus = this.Table.TableStatus.getTableStatusById(table_id);
            let table_no = table.table_no;
            let status = 0;

            if (tableStatus) {
                status = tableStatus.TableStatus.status ;
            }

            if (status != 3) {
                NotifyUtils.warn(_('Table [%S] Not available.Status: [%S], Active: [%S]',[ table_no, tableStatus.TableStatus.status, tableStatus.Table.active]));
                return ;
            }

            // unmark table
            this.Table.TableStatus.unmarkTable(table_id);

            // set action to select ??
            this.setAction('selectTable');

            // refresh
            this.refreshTableStatus();

        },


        /**
         * recallOrder -- called by orderdisplay popup panel
         *
         * @param {String} order_id
         */
        recallOrder: function(order_id) {

            this.hideOrderDisplayPanel();
            
            this.requestCommand('recallOrder', order_id, 'GuestCheck');
            // dockMode ?
            if (!this.isDock()) {
                this.hidenTableSelectorPanel();
            }
        },


        /**
         * Call guest_check newTable action -- called by orderdisplay popup panel
         *
         */
        newTable: function(table_id) {
            
            let table = this.Table.getTableById(table_id);
            let tableStatus = this.Table.TableStatus.getTableStatusById(table_id);
            let table_no = table.table_no;

            this.requestCommand('newTable', table_no, 'GuestCheck');
            // dockMode ?
            if (!this.isDock()) {
                this.hidenTableSelectorPanel();
            }
        },


        load: function(evt) {

            var tableSettings = this.getTableSettings();

            var timeoutSec = tableSettings.TableRefreshFrequence || 5;
            this._timeout = timeoutSec * 1000;
            
            // dump('select table controller load \n');
            
            // other resource only initial when panel first popup .
            // tables init by panel show
            this.initialTableSelectorPanel();


            //            var main = mainWindow.GeckoJS.Controller.getInstanceByName( 'Main' );
            //            main.dispatchEvent('onFirstLoad', null);
            if (tableSettings.TableWinAsFirstWin) {
                // just popup table selector
                this.popupTableSelectorPanel();
            }

        },

        doCancelFunc: function() {
            // doCancelButton();
            if (!this.isDock())
                $.hidePanel('selectTablePanel', false);
        }
    };
    
    GeckoJS.Controller.extend(__controller__);


})();

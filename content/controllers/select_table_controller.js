(function(){
    
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/template_ext.js');

    /**
     * Class SelectTableController
     */

    var __controller__ = {

        name: 'SelectTable',

        uses: ['TableSetting', 'Table', 'TableMark'],

        components: ['OrderStatus'],

        _guestCheckController: null,

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

        _initedPanel: false,

        /**
         * Get GuestCheckController
         *
         * @return {Controller} controller
         */
        getGuestCheckController: function() {

            if(!this._guestCheckController) {
                this._guestCheckController = GeckoJS.Controller.getInstanceByName('GuestCheck');
            }
            return this._guestCheckController;

        },


        /**
         * emulate dispatcher to requestCommand but it will return function's result like normal function.
         * 
         * @param {String} command
         * @param {Object} data
         * @return {Object} result
         */
        requestGuestCheckCommand: function(command, data) {

            var controller = this.getGuestCheckController();
            var result;

            if(controller[command] && typeof controller[command] == 'function') {

                result = controller[command].apply(controller, (typeof data =='array' ? data : [data] ));

                // emulate dispatcher do.
                var onActionEvent = 'on' + GeckoJS.Inflector.camelize(command);

                if(!controller.dispatchedEvents[onActionEvent]) {
                    controller.dispatchEvent(onActionEvent, arguments);
                }
            }

            return result;


        },
        
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
         * hideTableSelectorPanel
         */
        hideTableSelectorPanel: function() {
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
                x = this._popupX || 40;
                y = this._popupY || 10 ;
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
            regionObj.appendItem(_('Available Tables'),'AVAILABLE');

            regions.forEach(function(data){
                regionObj.appendItem(data.name, data.id);
            });

            var defaultRegion = this.tableSettings.DefaultRegion || 'ALL';
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
            seat = parseInt(document.getElementById('availableSeats').value) || 1;

            var tableSettings = this.getTableSettings();
            var showAvailableSeatTable = ( tableSettings.ShowAvailableSeatTable || false );

            var tables = [];

            switch(region) {
                default:
                    tables = this.Table.getTablesByRegionId(region);
                    break;
                case 'ALL':
                    tables = this.Table.getTables();
                    break;
                case 'AVAILABLE':
                    tables = this.Table.getAvailableTables(showAvailableSeatTable);
                    break;
                
            }

            // filter seats
            let availableTables = [];
            for(i=0; i<tables.length; i++) {
                if (seat <= tables[i].seats) {
                    availableTables.push(tables[i]);
                }
            }

            this.getTablesViewHelper().setRegion(region);
            this.getTablesViewHelper().setTables(availableTables);
            this.refreshTableSummaries();
            
        },

        setAvailableSeats: function() {

            this.setTablesByRegion(this.getSelectedRegion());
            
        },

        /**
         * refreshTableStatus
         *
         * if no table status receive, only repaint period time.
         */
        refreshTableStatus: function() {


            try{

                let isOpen = this.getTableSelectorPanelObj().state == 'open' ;

                if (this._blockRefreshTableStatus || !isOpen) return;

                this._blockRefreshTableStatus = true;
                
                // update status
                let updatedTablesStatus = this.Table.TableStatus.getTablesStatus(true);

                if (this.getSelectedRegion() == 'AVAILABLE') {
                    this.setTablesByRegion('AVAILABLE');
                }else {
                    if (updatedTablesStatus && updatedTablesStatus.length > 0) {
                        this.getTablesViewHelper().refreshUpdatedTablesStatus(updatedTablesStatus);
                        this.refreshTableSummaries();
                    }else {
                        this.getTablesViewHelper().refreshTablesStatusPeriod();
                    }
                }

                this.selectCurrentTable();
            }catch(e) {
                this.log('ERROR', 'refreshTableStatus error', e);
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
                    self.log('ERROR', 'on refreshTableStatus', e);
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
                top = tableSettings.TableDockTop +'px';
                left = tableSettings.TableDockLeft + 'px';
                width = tableSettings.TableDockWidth + 'px';
                height = tableSettings.TableDockHeight +'px';
            } else {
                top = 0+'px';
                left = 0+'px';
                width = screenwidth+'px';
                height = screenheight+'px';
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

                    try {

                        // this callback will triggered when popup panel first popup.
                        self.setRegionMenuItem();

                        // get selectedRegion
                        var selectedRegion = self.getSelectedRegion();

                        // size region button label
                        let priorRegion = document.getElementById('btn_prior_region');
                        let nextRegion = document.getElementById('btn_next_region');
                        if (priorRegion) {
                            priorRegion.resizeLabel();
                        }
                        if (nextRegion) {
                            nextRegion.resizeLabel();
                        }

                        // size stack
                        $('#tableDock').css({'min-width': width, 'max-width': width});

                        // init tables and status view
                        self.getTableButtonsPanelObj().datasource = self.getTablesViewHelper();
                        // update tables by region
                        self.setTablesByRegion(selectedRegion);

                        self.setAction('selectTable');

                        self._initedPanel = true;
                    
                    }catch(e) {
                        self.log('ERROR', 'ERROR init panel', e);
                    }

                },

                load: function(evt) {
                },

                showing: function(evt) {

                    try {

                        if (!self._tablesViewHelper) {
                            // prefetch tables status with orders if sessions not exists
                            self.Table.TableStatus.getTablesStatus();
                        }

                        // initial timer
                        self.initialRefreshTimer();

                        // update terminal_no
                        $('#select_table_terminal_no').val(GeckoJS.Session.get('terminal_no'));

                        // update user
                        let user = GeckoJS.Session.get('User');
                        let username = user ?  ((user.description.length > 0) ? user.description : user.username)  : '';
                        $('#select_table_current_user').val(username);

                        // sale_period
                        $('#select_table_sale_period').val(GeckoJS.Session.get('sale_period_string'));
                        if (GeckoJS.Configure.read('vivipos.fec.settings.DisableSalePeriod')){
                            $('#select_table_sale_period').attr('hidden', true);
                        }else {
                            $('#select_table_sale_period').attr('hidden', false);
                        }

                        // shift_number
                        $('#select_table_shift_number').val(GeckoJS.Session.get('shift_number'));
                        if (GeckoJS.Configure.read('vivipos.fec.settings.DisableShiftChange')){
                            $('#select_table_sale_period').attr('hidden', true);
                        }else {
                            $('#select_table_sale_period').attr('hidden', false);
                        }

                    }catch(e) {
                        self.log('ERROR', 'ERROR showing panel', e);
                    }

                },

                shown: function(evt) {

                    if (!self._initedPanel) {
                        self.log('WARN', 'not init panel before shown');
                        this.init();
                    }

                    if (!self.isDock()) {
                        $do('disableHotKeys', true, 'Main');
                        // disable user-defined hotkeys
                    }

                    // tablespanel shown , refresh
                    self.refreshTableStatus();
                },

                hide: function (evt) {
                    if (!self.isDock()) {
                        $do('restoreHotKeys', true, 'Main');
                        // restore user-defined hotkeys
                    }
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

            let btn = document.getElementById(action+'Btn');
            
            if(btn) btn.setAttribute('checked', true);

            if (action=='mergeCheck') {
                $('button[group="funcOrderDisp"]').each(function(btn) {
                    this.setAttribute('hidden', true);
                });
            }else {
                $('button[group="funcOrderDisp"]').each(function(btn) {
                    this.removeAttribute('hidden');
                });
            }

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
            let controller = this.getGuestCheckController();
            if (this.action != action && !controller.dispatchEvent('beforeSetAction', action)) {
                action = 'selectTable';
            }

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
                    this._actionData = null;
                    break;
                case 'bookingTable':
                    this.setActionButtonChecked(action);
                    this.setPromptLabel('*** ' + _('Book Table') + ' ***', _('Please select a table to book...'), 2);
                    break;
                case 'markTable':
                    this.setActionButtonChecked(action);
                    this.setPromptLabel('*** ' + _('Add Table Status') + ' ***', _('Please select the table to mark status...'), 2);
                    this._actionData = null;
                    break;
                case 'unmarkTable':
                    this.setActionButtonChecked(action);
                    this.setPromptLabel('*** ' + _('Clear Table Status') + ' ***', _('Please select the table to clear status...'), 2);
                    this._actionData = null;
                    break;
                case 'transferTable':
                    this.setActionButtonChecked(action);
                    this.setPromptLabel('*** ' + _('Trans Table') + ' ***', _('Please select the table to be transfered...'), 2);
                    break;
                case 'mergeCheck':
                    this.setActionButtonChecked(action);
                    this.setPromptLabel('*** ' + _('Merge Check') + ' ***', _('Please select the table and check to be merged...'), 2);
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
                case 'transferTable':
                    this.executeTransferTable(table_id);
                    break;
                case 'mergeCheck':
                    this.executeSelectTable(table_id);
                    //this.executeMergeCheck(table_id);
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

            var result = false;
            switch (command) {
                default:
                case 'newTable':
                    result = this.newTable(table_id);
                    break;

                case 'denyTable':
                    // XXX deny Table, notify message ?
                    NotifyUtils.warn(_('Table [%S] is not available for selection. Status [%S], Active [%S]',[ table_no, status, active]));
                    break;

                case 'selectTableOrder':
                    result = this.executeSelectTableOrder(table_id);
                    break;
            }

            // if selectTable action fails, clear selection
            if (!result) {
                this.selectCurrentTable();
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

            try {
                let ordersId = GeckoJS.BaseObject.getKeys(tableStatus.OrdersById);
                if (!tableStatus || tableStatus.TableOrder.length != ordersId.length) {
                    NotifyUtils.error(_('Table [%S] is not available!',[table_no]));
                }
            }catch(e) {
                NotifyUtils.error(_('Table [%S] is not available!',[table_no]));
                return;
            }

            // unserialize orderObject
            for(var id in tableStatus.OrdersById) {

                tableStatus.OrdersById[id].Order.status_str = this.OrderStatus.statusToString(tableStatus.OrdersById[id].Order.status);

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
                        if (order.check_no) {
                            tab.setAttribute('label', _('C#') + order.check_no);
                        }
                        else {
                            tab.setAttribute('label', _('S#') + order.sequence.substr(-3));
                        }
                        tab.setAttribute('value', order.id);
                        tabs.appendChild(tab);
                    });

                    document.getElementById('order_selected_table_id').value = table_id;
                }
                this._actionData = table;
                this.popupOrderDisplayPanel();
            }catch(e){
                // XXX notify fatal error message.
                // alert(e);
                this.log('ERROR', 'executeSelectTableOrder and InnerHtml\n' + result + this.dump(tableStatus), e);
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
            var masterTableId = (this._actionData ? this._actionData.id : '');
            var slaveTableId = table_id;

            if (tableStatus) {
                if ((!tableStatus.Table.active && tableStatus.TableStatus.order_count == 0) || tableStatus.TableStatus.status == 2
                    || (tableStatus.TableStatus.status == 3 && tableStatus.TableStatus.mark_op_deny)
                    || (masterTableId==slaveTableId) ) {

                    NotifyUtils.warn(_('Table [%S] is not available for merging. Status [%S], Active [%S]',[ table_no, tableStatus.TableStatus.status, tableStatus.Table.active]));
                    this.getTableButtonsPanelObj().selectedItems = [];
                    return ;
                }
            }else if (!table.active || (masterTableId==slaveTableId) ) {
                NotifyUtils.warn(_('Table [%S] is not available for merging. Status [%S], Active [%S]',[ table_no, 0, 0]));
                this.getTableButtonsPanelObj().selectedItems = [];
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
                        NotifyUtils.warn(_('Table [%S] is not available for merging. Status [%S], Active [%S]',[ table_no, tableStatus.TableStatus.status, tableStatus.Table.active]));
                        this.getTableButtonsPanelObj().selectedItems = [];
                        return;
                    }
                    masterTableId = this._actionData.id;
                    slaveTableId = table_id;
                    break;
            }

            // merge table
            this.Table.TableStatus.mergeTable(masterTableId, slaveTableId);

            if (this.tableSettings.StaydownAction) {
                this.setAction('mergeTable');
            }else {
                this.setAction('selectTable');
            }

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
                NotifyUtils.warn(_('Table [%S] is not available for unmerging. Status [%S], Active [%S]',[ table_no, status, (tableStatus?tableStatus.Table.active:1)]));
                this.getTableButtonsPanelObj().selectedItems = [];
                return ;
            }

            // unmerge table
            this.Table.TableStatus.unmergeTable(table_id);

            if (this.tableSettings.StaydownAction) {
                this.setAction('unmergeTable');
            }else {
                this.setAction('selectTable');
            }

            // refresh
            this.refreshTableStatus();

        },


        /**
         * openSelectMarkDialog
         *
         * @param {Object} table
         */
        openSelectMarkDialog: function (description){

            var screenwidth = GeckoJS.Session.get('screenwidth') || 800;
            var screenheight = GeckoJS.Session.get('screenheight') || 600;

            var aURL = 'chrome://viviecr/content/select_mark.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;

            var inputObj = {
                marks: this.TableMark.getTableMarks(),
                id: '',
                name: '',
                title: _('Select Table Status'),
                description: description
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

                    NotifyUtils.warn(_('Table [%S] is not available for marking. Status [%S], Active [%S]',[ table_no, tableStatus.TableStatus.status, tableStatus.Table.active]));
                    this.getTableButtonsPanelObj().selectedItems = [];
                    return ;
                }
            }else if (!table.active) {
                NotifyUtils.warn(_('Table [%S] is not available fr marking. Status [%S], Active [%S]',[ table_no, 0, 0]));
                this.getTableButtonsPanelObj().selectedItems = [];
                return ;
            }

            var tableNo = table.table_no;
            var tableName = table.table_name;
            var description = _('You are now marking table status of Table# %S (%S)', [tableNo,tableName]);
            var markId = this.openSelectMarkDialog(description);

            if (!markId) {
                // XXX error message ?
                this.getTableButtonsPanelObj().selectedItems = [];
                return false;
            }
            
            var user = this.Acl.getUserPrincipal();
            var clerk = '' ;
            if ( user != null ) {
                clerk = user.description || user.username;
            }

            // mark table
            this.Table.TableStatus.markTable(table_id, markId, clerk);

            if (this.tableSettings.StaydownAction) {
                this.setAction('markTable');
            }else {
                this.setAction('selectTable');
            }

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
                NotifyUtils.warn(_('Table [%S] is not available for unmarking. Status [%S], Active [%S]',[ table_no, tableStatus.TableStatus.status, tableStatus.Table.active]));
                this.getTableButtonsPanelObj().selectedItems = [];
                return ;
            }

            // unmark table
            this.Table.TableStatus.unmarkTable(table_id);

            if (this.tableSettings.StaydownAction) {
                this.setAction('unmarkTable');
            }else {
                this.setAction('selectTable');
            }

            // refresh
            this.refreshTableStatus();

        },


        /**
         * executeMarkRegion  -- called from table selector
         */
        executeMarkRegion: function() {

            var selectedRegion = this.getSelectedRegion();

            var region = null;

            if (selectedRegion == 'ALL') {
                region = {
                    id: 'ALL',
                    name: _('All Regions')
                };
            }else {
                region = this.Table.TableRegion.getTableRegionById(selectedRegion);
            }

            var description = _('You are now marking table status of Region# %S', [region.name]);

            var markId = this.openSelectMarkDialog(description);

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
            this.Table.TableStatus.markRegion(region.id, markId, clerk);

            this.setAction('selectTable');

            // refresh
            this.refreshTableStatus();

        },

        /**
         * executeUnmarkRegion  -- called from table selector
         */
        executeUnmarkRegion: function() {

            var selectedRegion = this.getSelectedRegion();

            var region = null;

            if (selectedRegion == 'ALL') {
                region = {
                    id: 'ALL',
                    name: _('All Regions')
                };
            }else {
                region = this.Table.TableRegion.getTableRegionById(selectedRegion);
            }
            
            var description = _('You are now cleaning table status of Region# %S', [region.name]);

            if (!GREUtils.Dialog.confirm(this.topmostWindow, _('Clear Table Status'), description)) return;

            // unmark table
            this.Table.TableStatus.unmarkRegion(region.id);

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
            
            var result = this.requestGuestCheckCommand('recallOrder', order_id);

            

            if (result) {

                var curTransaction = GeckoJS.Session.get('current_transaction') || false;
                var curStatus = curTransaction.data.status;
                var curTableNo = curTransaction.data.table_no;

                if ((curStatus != 2 && curStatus != 0) && curTableNo) {
                    // notify user this order has been fixed
                    NotifyUtils.warn(_('A minor error was detected with this order and has been fixed. The order was previously completed and will no longer appear in the table manager'));
                }

            }

            // dockMode ?
            if (result && !this.isDock()) {

                this.hideTableSelectorPanel();
            }
        },

        selectCurrentTable: function() {
            let table_no = GeckoJS.Session.get('vivipos_fec_table_number');
            if (table_no != null) {
                let tables = this.getTablesViewHelper().data || [];
                for (let i = 0; i < tables.length; i++) {
                    if (tables[i] && tables[i].table_no == table_no) {
                        this.getTableButtonsPanelObj().selectedItems = [i];
                        return;
                    }
                }
            }
            this.getTableButtonsPanelObj().selectedItems = [];
        },

        /**
         * Call guest_check newTable action -- called by orderdisplay popup panel
         *
         */
        newTable: function(table_id) {
            
            this.hideOrderDisplayPanel();

            let table = this.Table.getTableById(table_id);
            let tableStatus = this.Table.TableStatus.getTableStatusById(table_id);
            let table_no = table.table_no;

            var result = this.requestGuestCheckCommand('newTable', table_no);

            // dockMode ?
            if (result && !this.isDock()) {
                this.hideTableSelectorPanel();
            }

            return result;
        },


        /**
         * transferTable - called by orderdisplay popup panel
         */
        transferTable: function(order_id) {

            let orgTable = this._actionData ? this._actionData : null;

            // set orgTable,order_id to _actionData
            this._actionData = {
                orgTable: orgTable,
                orderId: order_id
            };

            this.hideOrderDisplayPanel();

            // set Action and prompt label
            this.setAction('transferTable');

        },


        /**
         * executeTransferTable -- check status and call GuestCheck 's transferTable
         */
        executeTransferTable: function(table_id) {
            
            let table = this.Table.getTableById(table_id);
            let tableStatus = this.Table.TableStatus.getTableStatusById(table_id);
            let table_no = table.table_no;
            let orderId = this._actionData.orderId ;
            let orgTableId = this._actionData.orgTable ? this._actionData.orgTable.id : '';

            let isSameTable = (table_id == orgTableId);

            if (tableStatus) {
                if ((!tableStatus.Table.active && tableStatus.TableStatus.order_count == 0) || tableStatus.TableStatus.status == 2 || isSameTable) {
                    NotifyUtils.warn(_('Table [%S] is not available for transfer. Status [%S], Active [%S]',[ table_no, tableStatus.TableStatus.status, tableStatus.Table.active]));
                    return ;
                }
            }else if (!table.active || isSameTable) {
                NotifyUtils.warn(_('Table [%S] is not available for transfer. Status [%S], Active [%S]',[ table_no, 0, 0]));
                return ;
            }

            // call guest_check transferTable
            var result = this.requestGuestCheckCommand('transferTable', {
                orderId: orderId,
                orgTableId: orgTableId,
                newTableId: table_id
            });

            // set action and prompt label.
            this.setAction('selectTable');

            if (result) {
                // refresh
                this.refreshTableStatus();
            }

        },


        /**
         * changeClerk -- called by orderdisplay popup panel
         */
        changeClerk: function(orderId) {
            
            this.hideOrderDisplayPanel();

            // call guest_check transferTable
            var result = this.requestGuestCheckCommand('changeClerk', orderId);

            // set action and prompt label.
            this.setAction('selectTable');
            
            if (result) {
                // refresh
                this.refreshTableStatus();
            }
            
        },


        /**
         * splitCheck -- called by orderdisplay popup panel
         */
        splitCheck: function(orderId) {

            this.hideOrderDisplayPanel();
            
            // call guest_check transferTable
            var result = this.requestGuestCheckCommand('splitCheck', orderId);

            // set action and prompt label.
            this.setAction('selectTable');

            if (result) {
                // refresh
                this.refreshTableStatus();
            }

        },

        mergeCheck: function(orderId) {

            let orgTable = this._actionData ? this._actionData : null;
            let prevActionData = this._prevActionData || {};

            if (prevActionData.orderId) {
                // submit merge
                let sourceOrderId = prevActionData.orderId;
                let targetOrderId = orderId;

                this.executeMergeCheck(sourceOrderId, targetOrderId);
                this._prevActionData = {};
                
            }else {
                // set orgTable,order_id to _actionData
                this._prevActionData = {
                    orgTable: orgTable,
                    orderId: orderId
                };

                this.hideOrderDisplayPanel();

                // set Action and prompt label
                this.setAction('mergeCheck');
            }


        },

        /**
         * mergeCheck -- called by orderdisplay popup panel
         */
        executeMergeCheck: function(sourceOrderId, targetOrderId) {

            this.hideOrderDisplayPanel();

            // call guest_check transferTable
            var result = this.requestGuestCheckCommand('mergeCheck', {
                source: sourceOrderId,
                target: targetOrderId
            });

            // set action and prompt label.
            this.setAction('selectTable');

            if (result) {
                // refresh
                this.refreshTableStatus();
            }

        },
        
        /**
         * openTableBookDialog
         */
        openTableBookDialog: function (){

            var screenwidth = GeckoJS.Session.get('screenwidth') || 800;
            var screenheight = GeckoJS.Session.get('screenheight') || 600;

            var aURL = 'chrome://viviecr/content/table_book.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;

            var inputObj = {};
            
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, 'table_book', aFeatures, inputObj);

            // auto refresh when close
            this.refreshTableStatus();

            return true;

        },
        

        /**
         *  initial function when DOM loaded.
         */
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
                var curTransaction = GeckoJS.Session.get('current_transaction') || {recoveryMode: false};
                if (this.isDock() || !curTransaction.recoveryMode) {
                    this.popupTableSelectorPanel();
                }
            }

        },

        doCancelFunc: function() {
            // doCancelButton();
            if (!this.isDock())
                $.hidePanel('selectTablePanel', false);
        },
        
        refreshTableSummaries: function() {
            
            let tableStatus = this.Table.TableStatus.getTablesStatus(false) || [];
            let tables = this.Table.getTables(false);


            let totalTable = tables.length;
            let usedTable = 0;
            let customers = 0;
            let checks = 0;
            let tableUsedPercentage = 0;

            tableStatus.forEach(function(o) {

               if (o.TableStatus) {
                    if (o.TableStatus.order_count > 0) {
                        usedTable++;
                        checks += o.TableStatus.order_count;
                    }
                    if (o.TableStatus.sum_customer > 0) customers+=o.TableStatus.sum_customer;
               }

            });

            try{
                tableUsedPercentage = (totalTable == 0) ? '-' : GeckoJS.NumberHelper.toPercentage(usedTable/totalTable*100);
            }catch(e) {}
            
            $('#usedTablesLbl').val(usedTable);
            $('#totalTablesLbl').val(totalTable);
            $('#percentageLbl').val(tableUsedPercentage);
            $('#checksLbl').val(checks || '-');
            $('#customersLbl').val(customers || '-');

            this.selectCurrentTable();
        }


    };
    
    GeckoJS.Controller.extend(__controller__);


})();

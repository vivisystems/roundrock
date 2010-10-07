(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {
        
        name: 'GuestCheck',

        components: ['CartUtils'],
        
        uses: ['Order', 'TableSetting', 'Table'],

        _cartController: null,

        tableSettings: null,

        _waitStoreFlag: false,

        initial: function() {

            // add cart events
            var cart = this.getCartController();
            if(cart) {

                // check table no and guests before submit...
                cart.addEventListener('beforeSubmit', this.onCartBeforeSubmit, this);

                // check minimum charge and table no and guests before addPayment...
                //cart.addEventListener('beforeAddPayment', this.onCartBeforeAddPayment, this);

                // popup table select panel
                cart.addEventListener('PrepareFinalization', this.onCartBeforeSubmit, this);
                cart.addEventListener('afterSubmit', this.onCartOnAfterSubmit, this);
                cart.addEventListener('onSubmitSuccess', this.onCartOnSubmitSuccess, this);
                cart.addEventListener('onCancelSuccess', this.onCartOnCancelSuccess, this);
                cart.addEventListener('onVoidSaleSuccess', this.onCartOnSubmitSuccess, this);

                // check after return cart item
                cart.addEventListener('afterReturnCartItem', this.afterReturnCartItem, this);


            }

            var main = this.getMainController();
            if (main) {
                main.addEventListener('afterTruncateTxnRecords', this.onMainTruncateTxnRecords, this);
                main.addEventListener('afterSignedOn', this.onMainFirstLoad, this);
            }

            var cartqueue = GeckoJS.Controller.getInstanceByName('CartQueue');
            if (cartqueue) {
                cartqueue.addEventListener('onQueue', this.onMainFirstLoad, this);
            }
            
            this.addEventListener('beforeStoreCheck', this.beforeStoreCheck, this);

            this.addEventListener('afterNewTable', this.afterNewTable, this);

            var printer = this.getPrintController();
            if (printer) {
                printer.addEventListener('beforePrintSlipGetTemplate', this.beforePrintSlipGetTemplate, this);
            }
            
            this.tableSettings = this.TableSetting.getTableSettings() || {};

            // load regions and tables in session.
            let regions = this.Table.TableRegion.getTableRegions();
            let tables = this.Table.getTables();

            // table window is first win
            if (this.tableSettings.TableWinAsFirstWin) {

                var alertWin = this.showAlertDialog();
                this.sleep(1000);

                // prefetch tables status with orders
                this.Table.TableStatus.getTablesStatus(true);

                if (alertWin) {
                    alertWin.close();
                    delete alertWin;
                }

            }
            GeckoJS.Configure.write('vivipos.fec.settings.GuestCheck.TableSettings.RequireCheckNo', (this.tableSettings.RequireCheckNo || false), false );
        },


        /**
         * Get CartController
         *
         * @return {Controller} controller
         */
        getCartController: function() {

            if(!this._cartController) {
                this._cartController = GeckoJS.Controller.getInstanceByName('Cart');
            }
            return this._cartController;

        },


        /**
         * Get MainController
         *
         * @return {Controller} controller
         */
        getMainController: function() {
            return GeckoJS.Controller.getInstanceByName('Main');
        },


        /**
         * Get KeypadController
         *
         * @return {Controller} controller
         */
        getKeypadController: function() {
            return GeckoJS.Controller.getInstanceByName('Keypad');
        },


        /**
         * Get PrintController
         *
         * @return {Controller} controller
         */
        getPrintController: function() {
            return GeckoJS.Controller.getInstanceByName('Print');
        },


        /**
         * print Check (current Transaction)
         */
        printChecks: function(txn, autoPrint, duplicate) {

            duplicate = duplicate || false;
            txn = txn || this.getCartController()._getTransaction();
            autoPrint = autoPrint || '';

            // print check
            this.getPrintController().printChecks(txn, null, autoPrint, duplicate);

        },


        /**
         * openGuestNumDialog
         *
         * @param {Number} no  default number of customers
         * @return {Number} number of customers
         */
        openGuestNumDialog: function (no){

            no = no || '1';
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:no,
                type0:'number',
                digitOnly0:true,
                require0:true,
                numpad:true,
                disablecancelbtn:true
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Number of Guests'), aFeatures, _('Enter Number of Guests'), '', _('Number'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                return inputObj.input0;
            }

            return no;
        },


        /**
         * open Check No Dialog
         */
        openCheckNoDialog: function (no, title){

            no = no || '';
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:no,
                require0:true,
                numpad:true
            };

            title = title || _('Enter Check Number');

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, title, aFeatures, title, '', '', '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                no = inputObj.input0;
            }

            return no;

        },


        /**
         * open Table No Dialog
         */
        openTableNumDialog: function (required){

            if (!required) required = false;
            var no = '';
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:'',
                require0:true,
                numpad:true
            };

            if (required) inputObj.disablecancelbtn = true;

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Table Number'), aFeatures, _('Enter Table Number'), '', '', '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                no = inputObj.input0;
            }

            return no;

        },

        /**
         * openSeatNoDialog
         *
         * @param {Number} no  default number of seat
         * @return {Number} number of customers
         */
        openSeatNoDialog: function (no){

            no = no || '1';
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:no,
                type0:'number',
                digitOnly0:true,
                require0:true,
                numpad:true,
                disablecancelbtn:true
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Seat No'), aFeatures, _('Enter Seat No'), '', _('Number'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                return inputObj.input0;
            }

            return no;
        },


        /**
         * popupTableSelectorPanel
         *
         */
        popupTableSelectorPanel: function() {

            var inputObj = {
                isNewOrder: true,
                // tables: tables
                tables: null
            };

            var dialog_data = [
            inputObj
            ];
            
            var self = this;
            var cart = this.getCartController();

            try {

                // check has opened order before popup
                if (cart.ifHavingOpenedOrder() ) {
                    // check txn is modified ?
                    var txn = cart._getTransaction();
                    if (txn && txn.isModified()) {
                        NotifyUtils.warn(_('Please close the current order before returning to the table selection screen'));
                        cart._clearAndSubtotal();
                        return false;
                    }else {
                        // force cancel if order not modified.
                        cart.cancel(true);
                    }
                }

                var r = $.popupPanel('selectTablePanel', dialog_data);
            } catch (e) {}

            return '';

        },


        /**
         * open Select Checks Dialog
         */
        openSelectChecksDialog: function (orders){

            var tableSettings = this.TableSetting.getTableSettings();

            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';

            var orderId = '';
            var aURL = 'chrome://viviecr/content/select_checks.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                tableSettings: tableSettings,
                orders: orders,
                excludedOrderId: ""
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, 'select_checks', aFeatures, inputObj);

            if (inputObj.ok && inputObj.order_id) {
                orderId = inputObj.order_id;
            }

            delete inputObj;
                
            return orderId;

        },


        /**
         * open split check Dialog
         */
        openSplitCheckDialog: function (transaction){

            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';

            var aURL = "chrome://viviecr/content/split_check.xul";
            var aName = _("Split Check");
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            
            var inputObj = {
                ok: false,
                transaction: transaction,
                source_data: null,
                split_datas: []

            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures, inputObj);

            if (inputObj.ok) {
                return inputObj;
            }

            return null;

        },


        /**
         * openMinimumChargeDialog
         *
         * @param {Number} amount
         * @return {Number} new amount
         */
        openMinimumChargeDialog: function (amount){

            amount = amount || 0;
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:amount,
                type0:'number',
                digitOnly0:true,
                require0:true,
                numpad:true,
                disablecancelbtn:true
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Minimum Charge'), aFeatures, _('Original Minimum Charge (%S)',[amount]), '', _('New Minimum Charge'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                return inputObj.input0;
            }

            return amount;
        },


        /**
         * isTableAvailable
         *
         * @param {Object} table
         * @return {Boolean} table is available
         */
        isTableAvailable: function(table) {

            let table_no = table.table_no;
            let active = table.active ? 1 : 0;
            let status = 0 ;
            let tableStatus = this.Table.TableStatus.getTableStatusById(table.id);
            let isDeny = false;

            // check status or not active or op_deny
            if (tableStatus) {
                if (tableStatus.TableStatus.status == 2 || (tableStatus.TableStatus.status == 3 && tableStatus.TableStatus.mark_op_deny) ) {

                    let status = tableStatus.TableStatus.status;
                    isDeny = true
                }
            }else if (active == 0) {
                isDeny = true;
            }

            if (isDeny) {
                NotifyUtils.warn(_('Table [%S] is not available for selection. Status [%S], Active [%S]',[ table_no, status, active]));
                return false;
            }else {
                return true;
            }
        },

        /**
         * Set Number of customers to transaction object
         *
         * @param {Number} num  default number of customers
         */
        guestNum: function(num) {

            var defaultNum = GeckoJS.Session.get('vivipos_fec_number_of_customers') || 0;
            var cart = this.getCartController();
            var curTransaction = cart._getTransaction(true);

            if (! cart.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Please open a new order first'));
                cart._clearAndSubtotal();
                return false;
            }

            if (num) {
                num = isNaN(parseInt(num)) ? -1 : parseInt(num) ;
            } else {
                num = this.getKeypadController().getBuffer();
                num = isNaN(parseInt(num)) ? -1 : parseInt(num) ;

                this.getKeypadController().clearBuffer();
                cart._cancelReturn();
            }

            while (num <= 0) {
                // popup dialog 
                num = parseInt(this.openGuestNumDialog(defaultNum));
            }

            // update number of customers.
            curTransaction.setNumberOfCustomers(num);
            
            cart._clearAndSubtotal();
            
            return true;

        },


        /**
         * Set Table no to transaction object
         *
         * @param {Number} no  table no
         * @param {Boolean} useNumberPad  use numberpad dialog
         */
        newTable: function(no, useNumberPad) {

            no = no || '';
            useNumberPad = useNumberPad || false;

            var cart = this.getCartController();


            if (no.length == 0) {              
                no = this.getKeypadController().getBuffer() || '';
                this.getKeypadController().clearBuffer();
                cart._cancelReturn();
            }

            if (no.length == 0) {
                if (!useNumberPad) {

                    // popup panel and return
                    return this.popupTableSelectorPanel();
                    
                }else {
                    // use callback to select table.
                    no = this.openTableNumDialog(true) ;
                }
            }

            // maybe use tableSelector or not select
            if (no.length == 0) return false;
            
            // get table define
            var table = this.Table.getTableByNo(no);
            if (table) {

                if (!this.isTableAvailable(table)) return false;

                var curTransaction = cart._getTransaction(true); // autocreate

                if (! cart.ifHavingOpenedOrder() ) {
                    NotifyUtils.warn(_('Please open a new order first'));
                    cart._clearAndSubtotal();
                    return false;
                }
                
                if (curTransaction.getTableNo() != '' && curTransaction.data.recall == 2) {
                    NotifyUtils.warn(_('Please use transfer table to update table number'));
                    cart._clearAndSubtotal();
                    return false;
                }

                // set destination action
                var destination = table.destination;

                if (destination) {
                    this.requestCommand('setDestination', destination, 'Destinations');
                }

                // update Table No
                curTransaction.setTableNo(no);
                curTransaction.setTableName(table.table_name);
                if (table.table_region_id) {
                    let region = this.Table.TableRegion.getTableRegionById(table.table_region_id);
                    if (region) curTransaction.setTableRegionName(region.name);
                }

                cart._clearAndSubtotal();

                // update table seats
                GeckoJS.Session.set('vivipos_fec_number_of_table_seats', (table.seats||1) );
                GeckoJS.Session.set('vivipos_fec_current_table_seat', 1);

                this.dispatchEvent('afterNewTable', curTransaction);

                return true;
                
            }else {
                NotifyUtils.warn(_('[%S] is an invalid table number. Table number must be defined through table manager; Please input another table number.', [no]));

                return false;
            }
            
        },


        /**
         * Set check_no to transaction object
         *
         * @param {Boolean} autoCheckNo  auto create check no
         */
        newCheck: function(autoCheckNo) {

            var cart = this.getCartController();
            var curTransaction = cart._getTransaction(true);
            var num = -1 ;

            if (! cart.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Please open a new order first'));
                cart._clearAndSubtotal();
                return false;
            }

            if (!autoCheckNo) {
                num = this.getKeypadController().getBuffer();
                num = isNaN(parseInt(num)) ? -1 : parseInt(num) ;

                this.getKeypadController().clearBuffer();
                cart._cancelReturn();
            }

            if (num < 0) {
                num = SequenceModel.getSequence('check_no');
            }
            
            // update number of customers.
            curTransaction.setCheckNo(num);
            cart._clearAndSubtotal();

            return true;
        },


        /**
         * openSplitPaymentDialog
         *
         * @param {Array} splitPayments  default splited payemnts
         * @param {Number} total
         * @return {Array} splited payments
         */
        openSplitPaymentDialog: function (splitPayments, total){

            var aURL = 'chrome://viviecr/content/prompt_splitpayment.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=700,height=560';
            var inputObj = {
                // disablecancelbtn: true,
                total: total,
                input: splitPayments
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Split Payment'), aFeatures, _('Split Payment'), inputObj);

            if (inputObj.ok && inputObj.input) {
                return inputObj.input;
            }else {
                return false;
            }

            return splitPayments;
        },


        /**
         * splitPayment is shortcut and mean splitPaymentByGustNum
         *
         * @alias splitPaymentByGustNum
         */
        splitPayment: function(amount) {

            var no = this.getKeypadController().getBuffer();
            this.getKeypadController().clearBuffer();

            amount = parseInt(amount || no || 0) ;

            return this.splitPaymentByGuestNum(amount);
        },


        /**
         * splitPaymentByGustNum
         */
        splitPaymentByGuestNum: function(guestNum) {
            
            var cart = this.getCartController();
            var curTransaction = cart._getTransaction();
            
            guestNum = guestNum || curTransaction.getNumberOfCustomers() || 0 ;
            guestNum = isNaN(guestNum) ? 0 : guestNum ;

            while (guestNum <= 0) {
                // popup dialog
                guestNum = parseInt(this.openGuestNumDialog(guestNum));
            }

            var remainTotal =  curTransaction.getRemainTotal();

            var arPayments = [];

            var remain = remainTotal;

            for (let i = 1; i <= guestNum; i++) {

                // last one
                if ( i == (guestNum)) {
                    arPayments[i-1] = remain;
                }else {
                    let amount = curTransaction.getRoundedPrice(remain/(guestNum-i+1));
                    arPayments[i-1] = amount;
                    remain-=amount;
                }
            }

            // open confirm dialog
            arPayments = this.openSplitPaymentDialog(arPayments, remainTotal);

            if (arPayments === false ) return false;

            // set transaction has splitpayment mode.
            curTransaction.setSplitPayments(true);

            // add payment amount to cart
            arPayments.forEach(function(pAmount) {
                if (pAmount != 0) {
                    cart._addPayment('cash', pAmount);
                }
            });

        },

    

        /**
         * beforeStoreCheck
         */
        beforeStoreCheck: function(evt) {

            var curTransaction = evt.data;
            var isCheckGuestNum = false ;
            var isCheckTableNo = false ; 
             
            if (this.tableSettings.RequireGuestOrTableNumWhenStored && this.tableSettings.RequireGuestNum) {
                let destsByGuestNum = this.tableSettings.RequireGuestNum.split(",");
                if (destsByGuestNum.indexOf(curTransaction.data.destination) != -1) isCheckGuestNum = true;
            }
            if (this.tableSettings.RequireGuestOrTableNumWhenStored && this.tableSettings.RequireTableNo) {
                let destsByTableNo = this.tableSettings.RequireTableNo.split(",");
                if (destsByTableNo.indexOf(curTransaction.data.destination) != -1) isCheckTableNo = true;
            }

            if (isCheckTableNo && !curTransaction.data.table_no) {
                let tableResult = this.newTable('', true);
                if (!tableResult) {
                    evt.preventDefault();
                    return false;
                }
            }

            let guest = curTransaction.data.no_of_customers || 0;
            guest = parseInt(guest);
            if (isCheckGuestNum && guest <= 0) {
                this.guestNum(-1);
            }

            return true;
        },


        /**
         *
         */
        beforePrintSlipGetTemplate: function(evt) {

            let eventData = evt.data;
            let data = eventData.data;
            let template = eventData.template;
            let devicetype = eventData.devicetype;

            let autoPrint = data.autoPrint || 'skip';
            let hasLinkedItems = data.hasLinkedItems;
            let txn = data.txn;
            let order = data.order;

            // transferTable
            switch(autoPrint) {
                case 'transferTable':
                    // only process products in this link_group
                    if (hasLinkedItems) {
                        let newTemplate = this.tableSettings.PrintCheckAfterTransferTableTemplate || '';
                        
                        // use new template to print transfer table
                        eventData.template = newTemplate;
                    }else {
                        evt.preventDefault();
                    }
                    break;

                case 'returnCartItem':
                    // only process products in this link_group
                    if (hasLinkedItems) {
                        let newTemplate = this.tableSettings.PrintCheckReturnCartItemTemplate || '';

                        let batchCount = txn.data.batchCount;
                        let returnCartItemBatch = txn.data.batchCount;
                        let returnCartItems = [];

                        for (let id in order.items) {
                            let item = order.items[id];
                            if (item.batch == returnCartItemBatch && item.linked) {

                                // process condiments
                                if (item.condiments) {
                                    item.condiments_array = GeckoJS.BaseObject.getKeys(item.condiments);
                                    item.condiments_string = item.condiments_array.join('; ');
                                }

                                returnCartItems.push(item);
                            }
                        }

                        order['return_cart_items'] = returnCartItems;
                        // use new template to print return cart item
                        eventData.template = newTemplate;

                        if (returnCartItems.length == 0) {
                            evt.preventDefault();
                        }

                    }else {
                        evt.preventDefault();
                    }
                    break;

                case 'rushItem':
                    // only process products in this link_group
                    if (hasLinkedItems) {
                        let newTemplate = this.tableSettings.PrintCheckRushItemTemplate || '';
                        
                        let rushItem = txn.data.rush_item;
                        let isPrintable = false;

                        for (let id in order.items) {
                            let item = order.items[id];
                            if (item.index == rushItem.index && item.linked) {
                                isPrintable = true;
                                break;
                            }
                        }

                        let waitMS = ((new Date()).getTime() - rushItem.created * 1000 + (new Date()).getTimezoneOffset()*60000 );
                        let waiting = (new Date(waitMS)).toLocaleFormat('%H:%M:%S');
                        rushItem['waiting'] = waiting;

                        // process condiments
                        if (rushItem.condiments) {
                            rushItem.condiments_array = GeckoJS.BaseObject.getKeys(rushItem.condiments);
                            rushItem.condiments_string = rushItem.condiments_array.join('; ');
                        }
                        order['rush_item'] = rushItem;

                        // use new template to print return cart item
                        eventData.template = newTemplate;
                        
                        if (!isPrintable) {
                            evt.preventDefault();
                        }
                    }else {
                        evt.preventDefault();
                    }
                    break;

                case 'store':

                    let onlyCurrentBatch = this.tableSettings.PrintCheckCurrentBatchItems || false;
                    let onlyPositiveCurrentBatch = this.tableSettings.PrintCheckOnlyPositiveCurrentBatchItems || false;
                    
                    let batchCount = txn.data.batchCount;
                    
                    // we only care about check type
                    if (devicetype == 'check' && hasLinkedItems && onlyCurrentBatch) {

                        let items = {};
                        let display_sequences = [];

                        for (let id in order.items) {
                            let item = order.items[id];
                            if (item.linked && item.batch == batchCount) {
                                if (onlyPositiveCurrentBatch) {
                                    if (item.current_qty >0) items[id] = item;
                                }else {
                                    items[id] = item;
                                }
                            }
                        }

                        for (let idx in order.display_sequences) {
                            let dsp = order.display_sequences[idx];
                            let item = items[dsp.index];
                            if (item && dsp.batch == batchCount) {
                                display_sequences.push(dsp);
                            }
                        }

                        if (display_sequences.length >0) {
                            order.items = items;
                            order.display_sequences = display_sequences;
                        }else {
                            evt.preventDefault();
                        }

                    }
                    break;
                    
                default:
                    break;
            }
            
        },
        

        /**
         * afterNewTable
         */
        afterNewTable: function(evt) {

            var curTransaction = evt.data;
            var isCheckGuestNum = false ;

            if (this.tableSettings.RequireGuestNumWhenNewTable && this.tableSettings.RequireGuestNum) {
                let destsByGuestNum = this.tableSettings.RequireGuestNum.split(",");
                if (destsByGuestNum.indexOf(curTransaction.data.destination) != -1) isCheckGuestNum = true;
            }

            let guest = curTransaction.data.no_of_customers || 0;
            guest = parseInt(guest);
            if (isCheckGuestNum && guest <= 0) {
                this.guestNum(-1);
            }

            return true;
        },


        /**
         * store current transaciton and close transaction.
         *
         */
        storeCheck: function() {

            if (this._waitStoreFlag) return false;

            var cart = this.getCartController();
            var curTransaction = cart._getTransaction();

            this._waitStoreFlag = true;

            if (! cart.ifHavingOpenedOrder() ) {

                //alert('ifHavingOpenedOrder');
                // check backupFile if need to resent to table service server.
                var order = new OrderModel();
                if (order && order.hasBackupFile(2)) {

                    var waitPanel = cart._blockUI('blockui_panel', 'common_wait', _('Recall Check'), 0);

                    var result = order.restoreOrderFromBackupToRemote();

                    if (waitPanel) cart._unblockUI(waitPanel);
                    
                    if (!result) {
                        let orderModel = new OrderModel();
                        if (orderModel.isLocalhost()) {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Data Operation Error'),
                                _('This order could not be committed. Please contact technical support for assistance immediately [message #505].'));
                        }
                        else {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Data Operation Error'),
                                _('This order could not be committed. Please check the network connectivity to the terminal designated as the table service server [message #502].'));
                        }
                        this._waitStoreFlag = false;
                        return false;
                    }else {
                        GREUtils.Dialog.alert(this.topmostWindow,
                            _('Data Operation'),
                            _('Previously uncommitted stored order(s) have now been committed to the table service server.') + this._waitStoreFlag);
                        this.onCartOnSubmitSuccess();
                        cart.dispatchEvent('onWarning', _('ORDER COMMITTED'));
                        this._waitStoreFlag = false;
                        return true;
                    }
                } else {    
                    NotifyUtils.warn(_('Not an open order; unable to store'));
                    cart._clearAndSubtotal();
                    this._waitStoreFlag = false;
                    return false;
                }
            }

            this.getKeypadController().clearBuffer();

            cart._cancelReturn();

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                this._waitStoreFlag = false;
                return false;
            }

            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                this._waitStoreFlag = false;
                return false;
            }

            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                this._waitStoreFlag = false;
                return false;
            }

            /*
             * force store check to webservices.
             * if not modified , not update batch and lockItems.
            if (!curTransaction.isModified()) {
                NotifyUtils.warn(_('No change to store'));
                return false;
            }
            */

            var beforeStoreCheck = this.dispatchEvent('beforeStoreCheck', curTransaction);
            if (!beforeStoreCheck) {
                this._waitStoreFlag = false;
                return false;
            }

            // save order
            if  (cart.submit(2)) {

                // backward compatible
                cart.dispatchEvent('onStore', curTransaction);

                cart.dispatchEvent('onWarning', _('STORED'));

                NotifyUtils.info(_('This order has been stored'));

                this.dispatchEvent('afterStoreCheck', curTransaction);

                cart._getCartlist().refresh();

                this._waitStoreFlag = false;
                return true;

            }

            this._waitStoreFlag = false;
            return false;
        },

        /**
         * make sure transaction does not already exist in cart when recalling orders
         *
         */

        beforeRecall: function() {
            var cart = this.getCartController();

            if (cart.ifHavingOpenedOrder() ) {
                // check txn is modified ?
                var txn = cart._getTransaction();
                if (txn && txn.isModified()) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Recall Order'),
                                          _('Please close the current order before recalling an existing order'));
                    cart._clearAndSubtotal();
                    return false;
                }
            }

            return true;
        },

        /**
         * getTransactionByOrderId
         *
         * @param {String} orderId   order uuid
         * @return {Object} for transaction.data object
         */
        getTransactionDataByOrderId: function(orderId) {


            orderId = orderId || '';
            if (orderId.length == 0) {
                orderId = this.getKeypadController().getBuffer() || '';
                this.getKeypadController().clearBuffer();
            }

            if (orderId.length == 0 ) {
                // use recallCheck mode and select dialog
                return this.recallCheck("-1");
            }

            if (orderId.length == 0) return false;
            
            let orderData = this.Order.readOrder(orderId, true); // recall use master service's datas.

            if (!orderData) {
                NotifyUtils.error(_('The requested order is not available', [orderId]));
                // release for other machine use.
                this.Order.releaseOrderLock(orderId);
                return false;
            }

            if (orderData.TableOrderLock) {
                NotifyUtils.error(_('This order is already locked by other terminal. [%S,%S]', [orderData.TableOrderLock.machine_id, orderData.TableOrderLock.machine_addr]));
                this.log(_('This order is already locked by other terminal. [%S,%S]', [orderData.TableOrderLock.machine_id, orderData.TableOrderLock.machine_addr]));
                return false;
            }

            // check okay, convert to transaction data
            let data = this.Order.mappingOrderDataToTranData(orderData);

            if (data.display_sequences == undefined) {
                NotifyUtils.error(_('This order cannot be recalled [%S]', [orderId]));
                // release for other machine use.

                this.Order.releaseOrderLock(orderId);
                return false;
            }

            return data;

        },


        /**
         * recall order by order id
         *
         * @param {String} orderId   order uuid
         * @param {Boolean} skipCheckCart skipCheckCart opened transaction
         * @return {Boolean} true if success
         */
        recallOrder: function(orderId, skipCheckCart) {

            skipCheckCart = skipCheckCart || false;
            
            if(!skipCheckCart) {
                if (!this.beforeRecall(orderId)) return false;
            }
            
            orderId = orderId || '';
            if (orderId.length == 0) {
                orderId = this.getKeypadController().getBuffer() || '';
                this.getKeypadController().clearBuffer();
            }

            if (orderId.length == 0 ) {
                // use recallCheck mode and select dialog
                return this.recallCheck("-1");
            }

            let data = this.getTransactionDataByOrderId(orderId);

            if(!data) return false;

            // set status to recall and udpate status to open status.
            data.recall = data.status;

            // update status to open status for now
            if (data.status == 2) data.status = 0 ;

            var curTransaction = new Transaction(true);
            // if no_of_customers == 0 use empty string
            data.no_of_customers = data.no_of_customers || '';

            // set to transactions
            curTransaction.data  = data;

            // recall alway recalc promotions
            Transaction.events.dispatch('onUnserialize', curTransaction, curTransaction);
            curTransaction.calcPromotions();
            curTransaction.calcTotal();

            // update transaction to cart
            var cart = this.getCartController()

            cart._setTransactionToView(curTransaction);
            cart.returnItem(true);
            
            curTransaction.updateCartView(-1, -1);

            curTransaction.setTableRegionName('');

            if (curTransaction.data.table_no && !isNaN(parseInt(curTransaction.data.table_no))) {
                var table = this.Table.getTableByNo(curTransaction.data.table_no);
                if (table) {
                    curTransaction.setTableNo(curTransaction.data.table_no);
                    curTransaction.setTableName(table.table_name);
                    if (table.table_region_id) {
                        let region = this.Table.TableRegion.getTableRegionById(table.table_region_id);
                        if (region) curTransaction.setTableRegionName(region.name);
                    }
                    // update table seats
                    GeckoJS.Session.set('vivipos_fec_number_of_table_seats', (table.seats||1) );
                    GeckoJS.Session.set('vivipos_fec_current_table_seat', 1);
                }else {
                    curTransaction.setTableNo(''); // reset table_no to empty
                }

                if (curTransaction.data.status == 0 && curTransaction.data.destination) {
                    this.requestCommand('setDestination', curTransaction.data.destination, 'Destinations');
                }
            }
            
            cart._clearAndSubtotal();

            // display to onscreen VFD
            cart.dispatchEvent('onWarning', _('RECALL# %S', [data.seq]));

            // dispatch recall success event
            this.dispatchEvent('afterRecallOrder', curTransaction);
            
            return true;

        },


        /**
         * recall by Check NO
         * 
         * @param {String} checkNo
         * @param {Boolean} skipRecall
         */
        recallCheck: function(checkNo, skipRecall) {

            let cart = this.getCartController();
            let waitPanel;
            if (cart) {
                waitPanel = cart._blockUI('blockui_panel', 'common_wait', _('Recall Check'), 0);
            }

            try {
                skipRecall = skipRecall || false;

                checkNo = checkNo || '';

                var checkTmp = checkNo.split(',');
                var checkNo = checkTmp[0] || '';
                var queryCompletedOrder = checkTmp[1] || '';

                if (checkNo.length == 0) {
                    checkNo = this.getKeypadController().getBuffer() || '';
                    this.getKeypadController().clearBuffer();
                }

                if (checkNo.length == 0) {
                    checkNo = this.openCheckNoDialog(checkNo);
                }

                var conditions = "" ;
                if (checkNo.length == 0 || checkNo == "-1") {
                    // conditions = "orders.status=2";
                }else {
                    conditions = "orders.check_no='"+checkNo+"' AND ";
                }

                if(queryCompletedOrder == '1'){
                    conditions = conditions + "  (orders.status=2 OR orders.status=1)";
                }else
                    conditions = conditions +  "orders.status=2";

                var orders = this.Order.getOrdersSummary(conditions, true);

                if (orders.length == 0) {
                    if (checkNo != '') {
                        NotifyUtils.error(_('Failed to find orders matching check number [%S]', [checkNo]));
                    }
                    else {
                        NotifyUtils.error(_('No stored orders found'));
                    }
                    return false;
                }

                // select orders
                var orderId = "";
                if (orders.length > 1) {
                    orderId = this.openSelectChecksDialog(orders);
                }else if (orders.length > 0) {
                    orderId = orders[0].Order.id ;
                }

                if(orderId.length>0) {
                    if (skipRecall) {
                        return orderId;
                    }else {
                        return this.recallOrder(orderId);
                    }
                }else {
                    return false;
                }
            }
            catch(e) {}
            finally {
                if (waitPanel) cart._unblockUI(waitPanel);
            }
        },

        /**
         * recall by Sequence 
         * 
         * @param {String} seq
         * @param {Boolean} skipRecall
         */
        recallBySequence: function(seq, skipRecall) {

            //let limit = GeckoJS.Configure.read('vivipos.fec.settings.recallOrder.limit') || '300';
            let cart = this.getCartController();
            let waitPanel;
            if (cart) {
                waitPanel = cart._blockUI('blockui_panel', 'common_wait', _('Recall Check'), 0);
            }

            try {
                skipRecall = skipRecall || false;

                seq = seq || '';

                var seqTmp = seq.split(',');
                var seq = seqTmp[0] || '';
                var queryCompletedOrder = seqTmp[1] || '';

                if (seq.length == 0) {
                    seq = this.getKeypadController().getBuffer() || '';
                    this.getKeypadController().clearBuffer();
                    
                }

                if (seq.length == 0) {
                   seq = this.openCheckNoDialog(seq, _('Enter Order Sequence Number'));
                }

                var conditions = "" ;
                if (seq.length == 0 || seq == "-1") {
                   // conditions = "orders.status=2";
                }else {
                    conditions = "orders.sequence='"+seq+"' AND ";
                }

                if(queryCompletedOrder == '1'){
                    conditions = conditions + "  (orders.status=2 OR orders.status=1)";
                }else
                    conditions = conditions +  "orders.status=2";

                //conditions = conditions + " AND LIMIT " + limit ;

                var orders = this.Order.getOrdersSummary(conditions, true);

                if (orders.length == 0) {
                    if (seq != '') {
                        NotifyUtils.error(_('Failed to find orders matching order sequence [%S]', [seq]));
                    }
                    else {
                        NotifyUtils.error(_('No stored orders found'));
                    }
                    return false;
                }

                // select orders
                var orderId = "";
                if (orders.length > 1) {
                    orderId = this.openSelectChecksDialog(orders);
                }else if (orders.length > 0) {
                    orderId = orders[0].Order.id ;
                }

                if(orderId.length>0) {
                    if (skipRecall) {
                        return orderId;
                    }else {
                        return this.recallOrder(orderId);
                    }
                }else {
                    return false;
                }
            }
            catch(e) {}
            finally {
                if (waitPanel) cart._unblockUI(waitPanel);
            }
        },


        /**
         * recall by Table NO
         *
         * alias as recallCheck but use tableNo..
         * this function is for quick service.
         *
         * @param {String} tableNo
         */
        recallTable: function(tableNo) {

            let cart = this.getCartController();
            let waitPanel;
            if (cart) {
                waitPanel = cart._blockUI('blockui_panel', 'common_wait', _('Recall Check'), 0);
            }

            try {
                if (!this.beforeRecall(orderId)) return false;

                tableNo = tableNo || '';

                var tableTmp = tableNo.split(',');
                var tableNo = tableTmp[0] || '';
                var queryCompletedOrder = tableTmp[1] || '';

                if (tableNo.length == 0) {
                    tableNo = this.getKeypadController().getBuffer() || '';
                    this.getKeypadController().clearBuffer();
                }

                if (tableNo.length == 0 ) {
                    tableNo = this.openTableNumDialog(false);
                }

                var conditions = "" ;
                if (tableNo.length == 0 ) {
                 //   conditions = "orders.status=2";
                }else {
                    conditions = "orders.table_no='"+tableNo+"' AND ";
                }

                if(queryCompletedOrder == '1'){
                    conditions = conditions + "  (orders.status=2 OR orders.status=1)";
                }else
                    conditions = conditions +  "orders.status=2";

                var orders = this.Order.getOrdersSummary(conditions, true);

                if (orders.length == 0) {
                    if (tableNo != '') {
                        NotifyUtils.error(_('Failed to find orders matching table number [%S]', [tableNo]));
                    }
                    else {
                        NotifyUtils.error(_('No stored orders found'));
                    }
                    return false;
                }

                // select orders
                var orderId = "";
                if (orders.length > 1) {
                    orderId = this.openSelectChecksDialog(orders);
                }else {
                    orderId = orders[0].Order.id ;
                }

                if(orderId.length>0) {
                    return this.recallOrder(orderId);
                }else {
                    return false;
                }
            }
            catch(e) {}
            finally {
                if (waitPanel) cart._unblockUI(waitPanel);
            }

        },


        /**
         * onCartBeforeAddpayment
         *
         * Check the minimum charge and add PLU
         *
         * @todo if destination is outside don't check it.
         *
         * @param {Object} evt
         */
        onCartBeforeAddPayment: function(evt) {
            // let destination = getXXXX;
            evt.data.txn = evt.data.transaction;
            evt.data.status = 1; // force check 

            var isCheckTableMinimumCharge = true;
            if (isCheckTableMinimumCharge && this.tableSettings.RequestMinimumCharge) {
                this.onCartBeforeSubmit(evt);
            }
            
        },


        /**
         * onCartBeforeSubmit
         *
         * Check table_no or guestNum
         *
         * @todo if destination is outside , don't check it.
         *
         * @param {Object} evt
         */
        onCartBeforeSubmit: function(evt) {
            
            if (evt.data.status != 1 && typeof evt.data.status != 'undefined') return ;

            var isCheckTableNo = false;
            var isCheckGuestNum = false;
            var curTransaction = evt.data.txn || evt.data;

            if (this.tableSettings.RequireGuestNum) {
                let destsByGuestNum = this.tableSettings.RequireGuestNum.split(",");
                if (destsByGuestNum.indexOf(curTransaction.data.destination) != -1) isCheckGuestNum = true;
            }
            if (this.tableSettings.RequireTableNo) {
                let destsByTableNo = this.tableSettings.RequireTableNo.split(",");
                if (destsByTableNo.indexOf(curTransaction.data.destination) != -1) isCheckTableNo = true;
            }

            if (isCheckTableNo && !curTransaction.data.table_no) {
                let tableResult = this.newTable('', true);
                if (!tableResult) evt.preventDefault();
            }
            
            let guest = curTransaction.data.no_of_customers || 0;
            guest = parseInt(guest);
            if (isCheckGuestNum && guest <= 0) {
                this.guestNum(-1);
            }
                
            var isCheckTableMinimumCharge = true;
           
            var table_no = curTransaction.data.table_no || '';
            var guests = curTransaction.data.no_of_customers || 0;

            if (isCheckTableMinimumCharge && this.tableSettings.RequestMinimumCharge && table_no) {

                var minimum_charge_per_table = this.tableSettings.GlobalMinimumChargePerTable;
                var minimum_charge_per_guest = this.tableSettings.GlobalMinimumChargePerGuest;

                var total = curTransaction.data.total;
                switch (this.tableSettings.MinimumChargeFor)  {
                    case "1":
                        // original
                        total = curTransaction.data.item_subtotal;
                        break;
                    /*
                    case "2":
                        // before revalue
                        total = total - evt.data.transaction.data.revalue_subtotal;
                        break;

                    case "3":
                        // before promote
                        total = total - evt.data.transaction.data.promotion_subtotal;
                        break;
                    */
                    default:
                        // final total
                        // total = evt.data.transaction.data.total;
                        break;

                }
                
                var table = this.Table.getTableByNo(table_no);

                if (table) {
                    // set minimum charge
                    minimum_charge_per_table = table.minimum_charge_per_table || minimum_charge_per_table;
                    minimum_charge_per_guest = table.minimum_charge_per_guest || minimum_charge_per_guest;
                }

                var org_minimum_charge = Math.max(minimum_charge_per_table, minimum_charge_per_guest * guests);
                var minimum_charge = org_minimum_charge;

                if (typeof curTransaction.data.override_minimumcharge != 'undefined') {
                       // set to current transaction minimum charge
                        minimum_charge = curTransaction.data.override_minimumcharge;
                }

                if (total < minimum_charge) {

                    let amount = curTransaction.formatPrice(minimum_charge);

                    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                            .getService(Components.interfaces.nsIPromptService);

                    var check = {data: false};
                    var flags = null;

                    flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_OK +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                    var action = prompts.confirmEx(this.topmostWindow,
                                                   _('Minimum Charge'),
                                                   _('The total for this order is less than the minimum charge (%S). ' +
                                                     'Click OK if you want to pay the minimum charge to close the order. ' +
                                                     'Otherwise, please click Cancel and add more items.', [amount]),
                                                   flags, '', '', _('Override Minimum Charge'), null, check);


                    if (action == 2) {

                        let user = null;

                        if (!this.Acl.isUserInRole("acl_override_minimumcharge")) {
                            user = this.getMainController().openUserInRoleDialog("acl_override_minimumcharge", true);
                            
                            if (!user) {
                                NotifyUtils.warn(_('The total for this order is less than the minimum charge (%S)', [amount]));
                                evt.preventDefault();
                                return ;
                            }

                        }else {
                            user = this.Acl.getUserPrincipal();
                        }

                        let newMinimumCharge = this.openMinimumChargeDialog(minimum_charge);

                        // set to current transaction minimum charge
                        curTransaction.data.override_minimumcharge = newMinimumCharge;
                        curTransaction.data.override_minimumcharge_user = user;
                        
                        minimum_charge = newMinimumCharge;

                        if ((minimum_charge - total) > 0) {
                            // add plu to cart
                            action = 0;
                        }else {

                            // add annotation
                            var annotationType = this.tableSettings.AnnotationForOverrideMinimumCharge || 'override_minimumcharge';
                            if(!curTransaction.data.annotations) curTransaction.data.annotations = {};
                            curTransaction.data.annotations[annotationType] = _('override minimum charge. override clerk (%S,%S), original minimum charge (%S), new minimum charge (%S), comp amount (%S)', [user.username, user.description, curTransaction.formatPrice(org_minimum_charge), curTransaction.formatPrice(minimum_charge), curTransaction.formatPrice(org_minimum_charge - total)]);

                        }

                    }


                    if (action == 0) {
                        
                        // add MinimumChargePlu to cart

                        var product = GeckoJS.BaseObject.unserialize(this.tableSettings.MinimumChargePlu);

                        if (product) {

                            var cart = this.getCartController();

                            // remove last payment
                            let lastItem = curTransaction.data.display_sequences[curTransaction.data.display_sequences.length-1];
                            if (lastItem.type == 'payment') cart.voidItem();

                            let newPrice = minimum_charge - total;
                            
                            cart.setPrice(newPrice);
                            cart.addItem(product);

                            let amount = curTransaction.formatPrice(newPrice);
                            NotifyUtils.warn(_('An additional amount of (%S) has been added to the order to meet the minimum charge', [amount]));
                        } else {
                            NotifyUtils.warn(_('The total for this order is less than the minimum charge (%S)', [amount]));
                        }

                        evt.preventDefault();

                    }else if (action == 1){

                        NotifyUtils.warn(_('The total for this order is less than the minimum charge (%S)', [amount]));

                        evt.preventDefault();

                    }else if (action == 2) {

                    }else {
                        NotifyUtils.warn(_('The total for this order is less than the minimum charge (%S)', [amount]));
                        evt.preventDefault();
                    }

                }else {

                    if (typeof curTransaction.data.override_minimumcharge != 'undefined' && (org_minimum_charge > total) ) {

                            // add annotation
                            let user = curTransaction.data.override_minimumcharge_user;
                            var annotationType = this.tableSettings.AnnotationForOverrideMinimumCharge || 'override_minimumcharge';
                            if(!curTransaction.data.annotations) curTransaction.data.annotations = {};
                            curTransaction.data.annotations[annotationType] = _('override minimum charge. override clerk (%S,%S), original minimum charge (%S), new minimum charge (%S), comp amount (%S)', [user.username, user.description, curTransaction.formatPrice(org_minimum_charge), curTransaction.formatPrice(minimum_charge), curTransaction.formatPrice(org_minimum_charge - total)]);

                    }
                    

                }
            }

        },

        /**
         * onCartOnAfterSubmit
         *
         * @param {Object} evt
         */
        onCartOnAfterSubmit: function(evt) {

            let txn = evt.data;

            // check if has returncartitem
            if (txn.data.returnCartItemBatch && (txn.data.returnCartItemBatch == txn.data.batchCount) ) {
                this.returnCartItem(evt);
            }

        },


        /**
         * onCartOnSubmitSuccess
         *
         * @param {Object} evt
         */
        onCartOnSubmitSuccess: function(evt) {

            if (this.tableSettings.TableWinAsFirstWin) {

                    var idle = GeckoJS.Controller.getInstanceByName('Idle');
                    idle.unregister('popTablePanel');

                    var poptablepanel = GeckoJS.Configure.read('vivipos.fec.settings.tableman.checkbox_poptablepanelIdleTime') || false;
                    var idletime = GeckoJS.Configure.read('vivipos.fec.settings.tableman.textbox_poptablepanelIdleTime') || 0;

                    var self=this;

                    var cartController = this.getCartController();

                    if (poptablepanel && idletime > 0) {

                        idle.register('popTablePanel', idletime, function(){

                           if(!cartController.ifHavingOpenedOrder()){
                               self.popupTableSelectorPanel();
                               idle.unregister('popTablePanel');
                           }
                        });
                    }
            }
        },


        /**
         * onCartAfterCancel
         * 
         * release lock if transaction is recalled
         *
         * @param {Object} evt
         */
        onCartOnCancelSuccess: function(evt) {
            
            let transaction = evt.data;

            // recall order, release lock
            if (transaction && transaction.data.recall == 2) {
                let orderId = transaction.data.id;

                let result = this.Order.releaseOrderLock(orderId);
            }

            if (this.tableSettings.TableWinAsFirstWin) {
                // newTable always create new transaction object
                //this.newTable();

                // just popup table selector
                this.popupTableSelectorPanel();
            }

        },


        /**
         * onMainFirstLoad
         *
         * @param {Object} evt
         */
        onMainFirstLoad: function(evt) {

            if (this.tableSettings.TableWinAsFirstWin) {
                // newTable always create new transaction object
                //this.newTable();

                // just popup table selector
                this.popupTableSelectorPanel();
            }
            
        },


        /**
         * onMainTruncateTxnRecords
         *
         * @param {Object} evt
         */
        onMainTruncateTxnRecords: function(evt) {

            var r = this.Table.begin();

            if (r) {

                // r = this.Table.execute('delete from tables');
                // if (r) r = this.Table.execute('delete from table_regions');
                // if (r) r = this.Table.execute('delete from table_settings');
                if (r) r = this.Table.execute('delete from table_orders');
                if (r) r = this.Table.execute('delete from table_order_locks');
                // if (r) r = this.Table.execute('delete from table_marks');
                if (r) r = this.Table.execute('delete from table_bookings');
                if (r) r = this.Table.execute('delete from table_statuses');

                // truncate sync tables
                if (r) r = this.Table.execute('delete from syncs');
                if (r) r = this.Table.execute('delete from sync_remote_machines');

                if (r) r = this.Table.commit();

                if (!r) {
                    var errNo = this.Table.lastError;
                    var errMsg = this.Table.lastErrorString;

                    this.Table.rollback();

                    this.dbError(errNo, errMsg,
                        _('An error was encountered while attempting to remove all table status records (error code %S) [message #501].', [errNo]));
                }
            }
            else {
                this.dbError(this.Table.lastError, this.Table.lastErrorString,
                    _('An error was encountered while attempting to remove all table status records (error code %S).', this.TableStatus.lastError));
            }
        },


        /**
         * changeClerk
         *
         */
        changeClerk: function(orderId){

            let fnTrigger = false;
            orderId = orderId || false;

            if (!orderId) {

                let txn = this.getCartController()._getTransaction();
                if (txn && txn.data) {
                    orderId = txn.data.id;
                    fnTrigger = true;
                }
            }
            if (!orderId) return false;
            
            var user = this.Acl.getUserPrincipal();
            var order = {
                id: orderId,
                service_clerk: user.username,
                service_clerk_displayname: user.description
            };

            var result = this.Order.changeClerk(orderId, order);

            return result;
        },


        /**
         * mergeCheck
         */
        mergeCheck: function(data) {
            
            data = data || false ;
            var result = false;
            let fnTrigger = false;
            var sourceOrderId = '';
            var targetOrderId = '';
            var sourceOrderSeq = '';
            var targetOrderSeq = '';

            if(data && typeof data =='object') {
                
                sourceOrderId = data.source || '';
                targetOrderId = data.target || '';

            }else {
                // fn trigger
                let txn = this.getCartController()._getTransaction();
                if (txn && txn.data && !txn.isModified()) {
                    sourceOrderId = txn.data.id;
                    targetOrderId = this.recallCheck('', true);

                    if (sourceOrderId && targetOrderId) fnTrigger = true;
                }
            }

            if (sourceOrderId == targetOrderId && sourceOrderId.length > 0) {
                NotifyUtils.error(_('The same order can not be merge'));
                return false;
            }

            let sourceData = this.getTransactionDataByOrderId(sourceOrderId);
            let targetData = this.getTransactionDataByOrderId(targetOrderId);
            
            let canMerge = true;
            let message = "";

            if (!sourceData || !targetData) {

                if (sourceData) this.Order.releaseOrderLock(sourceOrderId);
                if (targetData) this.Order.releaseOrderLock(targetOrderId);
                return false;

            }else {

                if ((sourceData.status != 2 && sourceData.recall != 2) || (targetData.status != 2 && targetData.recall != 2) ) {
                    canMerge = false;
                    message = _('This order not stored order, can not be merge');
                }

                if((parseFloat(sourceData['payment_subtotal']) > 0) || (parseFloat(targetData['payment_subtotal']) > 0) ) {
                    canMerge = false;
                    message = _('This order has been payment, can not be merge');
                }
                
                if((parseFloat(sourceData['trans_discount_subtotal']) > 0 || parseFloat(sourceData['trans_surcharge_subtotal']) > 0) ||
                    (parseFloat(targetData['trans_discount_subtotal']) > 0 || parseFloat(targetData['trans_surcharge_subtotal']) > 0) ) {
                    canMerge = false;
                    message = _('This order has discounts or surcharge, can not be merge');
                }

                if (!canMerge) {
                    this.Order.releaseOrderLock(sourceOrderId);
                    this.Order.releaseOrderLock(targetOrderId);
                    NotifyUtils.error(message);
                    return false;
                }

            }

            // set seq
            sourceOrderSeq = sourceData.seq;
            targetOrderSeq = targetData.seq;

            let transaction = new Transaction(true, true);
            transaction.data = sourceData ;

            let targetTransaction = new Transaction(true, true);
            targetTransaction.data = targetData;


            let maxBatchCount = Math.max(sourceData.batchCount, targetData.batchCount);
            
            // move all items
            transaction.moveCloneAllItems(targetTransaction);

            try {
                // save orignal orders
                Transaction.events.dispatch('onUnserialize', transaction, transaction);
                transaction.calcPromotions();
                transaction.calcTotal();
                transaction.setBackgroundMode(false);
                transaction.data.recall = 2;
                transaction.data.status = 2;
                transaction.data.batchCount = maxBatchCount;
                transaction.submit(2);

                let inherited_order_id = targetData.inherited_order_id || '' ;
                inherited_order_id = inherited_order_id.length > 0 ? (inherited_order_id+','+sourceOrderId) : sourceOrderId;

                let inherited_desc = targetData.inherited_desc || '' ;
                inherited_desc = inherited_desc.length > 0 ? (inherited_desc+','+_('Merge Check')) : _('Merge Check') ;
                
                Transaction.events.dispatch('onUnserialize', targetTransaction, targetTransaction);
                targetTransaction.calcPromotions();
                targetTransaction.calcTotal();
                targetTransaction.setBackgroundMode(false);
                targetTransaction.data.recall = 2;
                targetTransaction.data.status = -3;
                targetTransaction.data.inherited_order_id = inherited_order_id;
                targetTransaction.data.inherited_desc = inherited_desc;
                targetTransaction.submit(-3);
              
                result = true;

            }catch(e) {
                this.log('ERROR', 'Error mergeCheck', e);
            }finally {

                // finally commit the submit , and write transaction to databases(or to remote databases).
                var commitStatus = -99 ;

                try {
                    // commit order data to local databases or remote.
                    commitStatus = transaction.commit(2);

                    if (commitStatus == -1) {
                        let orderModel = new OrderModel();
                        if (orderModel.isLocalhost()) {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Data Operation Error'),
                                _('This order could not be committed. Please contact technical support for assistance immediately [message #505].'));
                        }
                        else {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Data Operation Error'),
                                _('This order could not be committed. Please check the network connectivity to the terminal designated as the table service server [message #503].'));
                            this.dispatchEvent('commitOrderError', commitStatus);
                        }
                        return false;
                    }
                    result = (result & true);

                }catch(ee) {
                    this.log('ERROR', 'Error mergeCheck commit', ee);
                }

            }

            if (result) {
                OsdUtils.info(_('Check# %S has been successfully merged to Check# %S', [targetOrderSeq, sourceOrderSeq]));
                if (fnTrigger) {
                    this.Order.releaseOrderLock(targetOrderId);
                    // recall order
                    this.recallOrder(sourceOrderId, true);
                }else {
                    this.Order.releaseOrderLock(sourceOrderId);
                    this.Order.releaseOrderLock(targetOrderId);
                }
            }
            return result;
            
        },


        /**
         * splitCheck
         */
        splitCheck: function(orderId) {

            let fnTrigger = false;
            orderId = orderId || false;

            if (!orderId) {
                
                let txn = this.getCartController()._getTransaction();
                if (txn && txn.data && !txn.isModified()) {
                    orderId = txn.data.id;
                    fnTrigger = true;
                }
            }
            if (!orderId) return false;
            
            let data = this.getTransactionDataByOrderId(orderId);
            
            if (!data) return false;

            let canSplit = true;
            let message = "";

            if (data.status != 2 && data.recall != 2) {
                canSplit = false;
                message = _('This order not stored order, can not be split');
            }
            if(parseFloat(data['payment_subtotal']) > 0) {
                canSplit = false;
                message = _('This order has been payment, can not be split');
            }
            if(parseFloat(data['trans_discount_subtotal']) > 0 || parseFloat(data['trans_surcharge_subtotal']) > 0) {
                canSplit = false;
                message = _('This order has discounts or surcharge, can not be split');
            }

            if (!canSplit) {
                this.Order.releaseOrderLock(orderId);
                NotifyUtils.error(message);
                return false;
            }

            let sourceSeq = data.seq;
            let splitSeqs = [];
            let transaction = new Transaction(true, true);
            transaction.data = data ;

            let result = this.openSplitCheckDialog(transaction);
            let result2 = false;

            let batchCount = data.batchCount;

            if (result) {

                try {
                    // save orignal orders
                    Transaction.events.dispatch('onUnserialize', transaction, transaction);
                    transaction.calcPromotions();
                    transaction.calcTotal();
                    transaction.setBackgroundMode(false);
                    transaction.data.recall = 2;

                    if (transaction.data.items_count == 0) {
                        transaction.submit(-3);
                    }else {    
                        transaction.submit(2);
                    }

                    for(let i in result.split_datas) {
                        
                        let sTrans = new Transaction(false, true);
                        let sTranSeq = sTrans.data.seq;

                        let sTranCheckNo = sTrans.data.check_no;
                        splitSeqs.push(sTranSeq);

                        sTrans.data = result.split_datas[i];
                        sTrans.data.seq = sTranSeq;
                        sTrans.data.check_no = sTranCheckNo;
                        sTrans.data.inherited_order_id = orderId;
                        sTrans.data.inherited_desc = _('Split Check');
                        sTrans.data.batchCount = batchCount;

                        Transaction.events.dispatch('onUnserialize', sTrans, sTrans);
                        sTrans.calcPromotions();
                        sTrans.calcTotal();
                        sTrans.setBackgroundMode(false);
                        sTrans.data.recall = 2;
                        sTrans.submit(2);
                    }

                    result2 = true;

                }catch(e) {
                    this.log('ERROR', 'Error splitCheck ', e);
                }finally {

                    // finally commit the submit , and write transaction to databases(or to remote databases).
                    var commitStatus = -99 ;

                    try {
                        // commit order data to local databases or remote.
                        commitStatus = transaction.commit(2);

                        if (commitStatus == -1) {
                            let orderModel = new OrderModel();
                            if (orderModel.isLocalhost()) {
                                GREUtils.Dialog.alert(this.topmostWindow,
                                    _('Data Operation Error'),
                                    _('This order could not be committed. Please contact technical support for assistance immediately [message #506].'));
                            }
                            else {
                                GREUtils.Dialog.alert(this.topmostWindow,
                                    _('Data Operation Error'),
                                    _('This order could not be committed. Please check the network connectivity to the terminal designated as the table service server [message #504].'));
                                this.dispatchEvent('commitOrderError', commitStatus);
                            }
                            return false;
                        }

                        result2 = (result2 & true);

                    }catch(ee) {
                        this.log('ERROR', 'Error splitCheck commit', ee);
                    }

                }

                if (result2){
                    OsdUtils.info(_('Check# %S has been successfully split to Check# %S', [sourceSeq, splitSeqs.join(',')]));
                    if (fnTrigger) {
                        // recall order
                        this.recallOrder(orderId, true);
                    }else {
                        this.Order.releaseOrderLock(orderId);
                    }
                }
            }else {
                this.Order.releaseOrderLock(orderId);
            }
            return result2;
        },


        /**
         * transferTable 
         */
        transferTable: function(data){

            data = data || false ;
            var result = false;
            let fnTrigger = false;

            var orderId = '';
            var orgTableId = '';
            var newTableId = '';

            if(data && typeof data =='object') {

                orderId = data.orderId || '';
                orgTableId = data.orgTableId || '';
                newTableId = data.newTableId || '';

                result = this.Order.transferTable(orderId, orgTableId, newTableId);

            }else {

                fnTrigger = true;
                let txn = this.getCartController()._getTransaction();
                
                if (!txn || (txn.data.status != 2 && txn.data.recall != 2) ) {
                    return false ;
                }

                var newTableNo = this.openTableNumDialog(true);

                orderId = txn.data.id;

                var orgTable = this.Table.getTableByNo(txn.data.table_no);
                var newTable = this.Table.getTableByNo(newTableNo);
               
                // check table available
                if (orgTable && newTable && (txn.data.table_no != newTableNo)) {

                    if (this.isTableAvailable(newTable)) {

                        orgTableId = orgTable.id;
                        newTableId = newTable.id;

                        result = this.Order.transferTable(orderId, orgTable.id, newTable.id);
                        this.recallOrder(orderId, true);

                    }

                }else {
                    NotifyUtils.warn(_('[%S] is an invalid table number. Table number must be defined through table manager; Please input another table number.', [newTableNo]));
                    return false;
                }
                
            }

            if (result) {

                let orgTable = this.Table.getTableById(orgTableId);
                let orgTableName = orgTable.table_name;
                let orgTableNo = orgTable.table_no;
                let orgRegionName = '';
                if (orgTable.table_region_id) {
                    let orgRegion = this.Table.TableRegion.getTableRegionById(orgTable.table_region_id);
                    if (orgRegion) orgRegionName = orgRegion.name;
                }

                let newTable = this.Table.getTableById(newTableId);
                let newTableName = newTable.table_name;
                let newRegionName = '';
                if (newTable.table_region_id) {
                    let newRegion = this.Table.TableRegion.getTableRegionById(newTable.table_region_id);
                    if (newRegion) newRegionName = newRegion.name;
                }

                // after transfer table dispatch event and print checks
                let isPrintCheck = parseInt(this.tableSettings.PrintCheckAfterTransferTable || 0);
                let printCheckTemplate = this.tableSettings.PrintCheckAfterTransferTableTemplate || '';

                if (isPrintCheck >0 && printCheckTemplate) {

                    let confirmed = true;

                    if (isPrintCheck == 2) {
                        confirmed = GREUtils.Dialog.confirm(this.topmostWindow,
                            _('Transfer Table'),
                            _('Transfer table From (%S) To (%S)', [orgTableName, newTableName]) + '\n' +
                            _('Are you sure you want to print transfer table check'));
                    }
                    if (confirmed) {

                        let newTxnData = this.getTransactionDataByOrderId(orderId);
                        newTxnData.table_name = newTableName;
                        newTxnData.table_region_name = newRegionName;
                        newTxnData.org_table_no = orgTableNo;
                        newTxnData.org_table_name = orgTableName;
                        newTxnData.org_table_region_name = orgRegionName;
                        newTxnData.transfer_table_time =  new Date().getTime() /1000;

                        this.printChecks({data: newTxnData}, 'transferTable', true);
                    }

                }

            }

            return result;

        },

        /**
         * process returnCartItem and printChecks
         */
        returnCartItem: function(evt) {

            let txn = evt.data;

            // print checks
            if (txn.data.returnCartItemBatch && (txn.data.returnCartItemBatch == txn.data.batchCount) ) {

                // after transfer table dispatch event and print checks
                let isPrintCheck = parseInt(this.tableSettings.PrintCheckAfterReturnCartItem || 0);
                let printCheckTemplate = this.tableSettings.PrintCheckReturnCartItemTemplate || '';

                if (isPrintCheck >0 && printCheckTemplate) {

                    let confirmed = true;

                    if (isPrintCheck == 2) {
                        confirmed = GREUtils.Dialog.confirm(this.topmostWindow,
                            _('Return Cart Item'),
                            _('Are you sure you want to print return cart item check'));
                    }
                    if (confirmed) {
                        this.printChecks(txn, 'returnCartItem', false);
                    }

                }

            }
        },

        /**
         * Cart returnCartItem listener
         */
        afterReturnCartItem: function(evt) {

            // only update returnCartitemBatch for quick search later
            let txn = this.getCartController()._getTransaction();
            txn.data.returnCartItemBatch = txn.data.batchCount+1;
            
        },


        /**
         * rush item
         */
        rushItem: function(code) {

            code = code || '';

            var cartController = this.getCartController();
            var index = cartController._cartView.getSelectedIndex();
            var curTransaction = cartController._getTransaction();

            if( !cartController.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; cannot void'));

                cartController._clearAndSubtotal();
                return;
            }

            // check if transaction is closed
            if (curTransaction.isClosed()) {
                NotifyUtils.warn(_('This order is being finalized and items may not be modified'));

                cartController._clearAndSubtotal();
                return;
            }

            if (curTransaction.data.recall != '2') {
                NotifyUtils.warn(_('This operation may only be applied to stored transactions'));

                return ;
            }

            if(index <0) {
                NotifyUtils.warn(_('Please select an item first'));

                cartController._clearAndSubtotal();
                return;
            }

            var itemTrans = null;

            var itemDisplay = curTransaction.getDisplaySeqAt(index);
            if (itemDisplay.type != 'item' && itemDisplay.type != 'setitem') {

                NotifyUtils.warn(_('Cannot RUSH the selected item [%S]. It is not the item or setitem.', [itemDisplay.name]));

                this._clearAndSubtotal();
                return;
            }

            itemTrans = curTransaction.getItemAt(index);
            if (itemTrans) {

                // after transfer table dispatch event and print checks
                let isPrintCheck = parseInt(this.tableSettings.PrintCheckRushItem || 0);
                let printCheckTemplate = this.tableSettings.PrintCheckRushItemTemplate || '';

                if ( isPrintCheck > 0 && printCheckTemplate ) {

                    let confirmed = true;

                    if ( isPrintCheck == 2 ) {
                        
                        confirmed = GREUtils.Dialog.confirm(this.topmostWindow,
                            _('Rush Item'),
                            _('Are you sure you want to print rush item check for [%S]', [itemTrans.name]));

                    }
                    if (confirmed) {

                        // required rushitem memo
                        if (code) {

                            let annotationController = GeckoJS.Controller.getInstanceByName('Annotations');
                            let annotationText = code ? annotationController.getAnnotationText(code) : false ;

                            if (annotationText) {
                                
                                let annotationTypes = [] ;
                                let texts = annotationText.split('|');
                                texts.forEach(function(t){
                                    annotationTypes.push({type: t, text: t});
                                });

                                let inputObj = {
                                    input0: code || '',
                                    require0: false,
                                    annotations: annotationTypes
                                };

                                var data = [_('Add Memo'), '', _('Memo'), '', inputObj];
                                var self = this;

                                return $.popupPanel('promptAddMemoPanel', data).next( function(evt){

                                    var result = evt.data;
                                    if (result.ok && result.input0) {
                                        curTransaction.data.rush_item = GREUtils.extend({rushitem_memo: result.input0}, itemTrans);
                                        self.printChecks(curTransaction, 'rushItem', true);
                                    }else {
                                        curTransaction.data.rush_item = GREUtils.extend({rushitem_memo: ''}, itemTrans);
                                        self.printChecks(curTransaction, 'rushItem', true);
                                    }
                                });                               

                            }else {
                                curTransaction.data.rush_item = GREUtils.extend({rushitem_memo: ''}, itemTrans);
                                this.printChecks(curTransaction, 'rushItem', true);
                            }
                        }else {
                            curTransaction.data.rush_item = GREUtils.extend({rushitem_memo: ''}, itemTrans);
                            this.printChecks(curTransaction, 'rushItem', true);
                        }
                    }
                }

                return;
            }
            
        },


        setSeatNo: function(no) {

            no = no || '';
            var cart = this.getCartController();

            if (no.length == 0) {
                no = this.getKeypadController().getBuffer() || '';
                this.getKeypadController().clearBuffer();

            }

            if (no.length == 0) {
                no = this.openSeatNoDialog(1);
            }

            no = no || '1';

            var curTransaction = cart._getTransaction(true); // autocreate
            
            GeckoJS.Session.set('vivipos_fec_current_table_seat', no);

            cart._cancelReturn();
            
        },
        

        /**
         * showAlertDialog
         */
        showAlertDialog: function() {

            var width = 600;
            var height = 120;

            var aURL = 'chrome://viviecr/content/alert_table_initialization.xul';
            var aName = _('Table Initialization');
            var aArguments = {};
            var aFeatures = 'chrome,dialog,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height;

            var win = this.topmostWindow;
            if (win.document.documentElement.id == 'viviposMainWindow' && (typeof win.width) == 'undefined')
                win = null;
              
            var alertWin = GREUtils.Dialog.openWindow(win, aURL, aName, aFeatures, aArguments);

            return alertWin;
        },

        destroy: function() {
        }


    };

    var GuestCheckController = window.GuestCheckController =  AppController.extend(__controller__);

    // mainWindow self register guest check initial
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {
        window.addEventListener('load', function() {

            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.addEventListener('onInitial', function() {
                    // trigger after main controller initialed.
                    main.requestCommand('initial', null, 'GuestCheck');
                })
            }

        }, false);


        window.addEventListener('unload', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.requestCommand('destroy', null, 'GuestCheck');
            }

        }, false);
    }

})();

(function(){

    var __controller__ = {
        
        name: 'GuestCheck',

        components: ['CartUtils'],
        
        uses: ['Order', 'TableSetting', 'Table'],

        _cartController: null,

        tableSettings: null,

        initial: function() {

            // add cart events
            var cart = this.getCartController();
            if(cart) {
            
                // check table no and guests before submit...
                cart.addEventListener('beforeSubmit', this.onCartBeforeSubmit, this);

                // check minimum charge and table no and guests before addPayment...
                cart.addEventListener('beforeAddPayment', this.onCartBeforeAddPayment, this);

                // popup table select panel
                cart.addEventListener('onSubmitSuccess', this.onCartOnSubmitSuccess, this);
                cart.addEventListener('onCancelSuccess', this.onCartOnCancelSuccess, this);

            }

            var main = this.getMainController();
            if (main) {
                main.addEventListener('afterTruncateTxnRecords', this.onMainTruncateTxnRecords, this);
            }


            this.tableSettings = this.TableSetting.getTableSettings();

            // table window is first win
            if (this.tableSettings.TableWinAsFirstWin) {

                var alertWin = this.showAlertDialog();
                this.sleep(1000);

                // load regions and tables in session.
                let regions = this.Table.TableRegion.getTableRegions();

                let tables = this.Table.getTables();

                // prefetch tables status with orders
                this.Table.TableStatus.getTablesStatus(true);

                if (alertWin) {
                    alertWin.close();
                    delete alertWin;
                }
                
            }
            GeckoJS.Configure.write('vivipos.fec.settings.GuestCheck.TableSettings.RequireCheckNo', (this.tableSettings.RequireCheckNo || false) );

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
        printChecks: function(txn) {

            txn = txn || this.getCartController()._getTransaction();

            // var printer = 1;
            var printer;
            var autoPrint = false;
            var duplicate = 1;
            // print check
            this.getPrintController().printChecks(txn, printer, autoPrint, duplicate);

        },


        /**
         * openGuestNumDialog
         *
         * @param {Number} no  default number of customers
         * @return {Number} number of customers
         */
        openGuestNumDialog: function (no){

            no = no || '';
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:no, 
                require0:true,
                numpad:true
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select Number of Customers'), aFeatures, _('Select Number of Customers'), '', _('Number'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                return inputObj.input0;
            }

            return no;
        },


        /**
         * open Check No Dialog
         */
        openCheckNoDialog: function (no){

            no = no || '';
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:no,
                require0:true,
                numpad:true
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select Check Number'), aFeatures, _('Select Check Number'), '', _('Number'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                no = inputObj.input0;
            }

            return no;

        },


        /**
         * open Table No Dialog
         */
        openTableNumDialog: function (){

            var no = '';
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:'',
                require0:true,
                numpad:true,
                disablecancelbtn:true
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select Table Number'), aFeatures, _('Select Table Number'), '', _('Number'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                no = inputObj.input0;
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

            try {
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
         * Set Number of customers to transaction object
         *
         * @param {Number} num  default number of customers
         */
        guestNum: function(num) {

            var defaultNum = GeckoJS.Session.get('vivipos_fec_number_of_customers') || 1;
            var cart = this.getCartController();
            var curTransaction = cart._getTransaction();

            if (! cart.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
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
           
            if (num == -1) {
                // popup dialog 
                num = this.openGuestNumDialog(defaultNum);
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
            var curTransaction = cart._getTransaction(true); // autocreate

            if (! cart.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                cart._clearAndSubtotal();
                return '';
            }

            if (no.length == 0 && !useNumberPad) {
                // popup panel and return
                return this.popupTableSelectorPanel();
            }

            if (no.length == 0) {              
                no = this.getKeypadController().getBuffer() || '';
                this.getKeypadController().clearBuffer();
                cart._cancelReturn();
            }

            // use callback to select table.
            if (no.length == 0) {
                // popup dialog
                no = this.openTableNumDialog() ;
            }

            // maybe use tableSelector or not select
            if (no.length == 0) return false;
            
            // get table define
            var table = this.Table.getTableByNo(no);
            if (table) {

                // set destination action
                var destination = table.destination;

                if (destination) {
                    this.requestCommand('setDestination', destination, 'Destinations');
                } else {
                    var defaultDest = GeckoJS.Session.get('defaultDestination');
                    if (defaultDest) {
                        this.requestCommand('setDestination', defaultDest, 'Destinations');
                    }
                }

                // update Table No
                curTransaction.setTableNo(no);
                cart._clearAndSubtotal();

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
            var curTransaction = cart._getTransaction();
            var num = -1 ;

            if (! cart.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                cart._clearAndSubtotal();
                return false;
            }

            if (!autoCheckNo) {
                num = this.getKeypadController().getBuffer();
                num = isNaN(parseInt(num)) ? -1 : parseInt(num) ;

                this.getKeypadController().clearBuffer();
                cart._cancelReturn();
            }

            if (num == -1) {
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
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=640,height=480';
            var inputObj = {
                disablecancelbtn: true,
                total: total,
                input:splitPayments
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Split Payments'), aFeatures, _('Split Payments'), inputObj);

            if (inputObj.ok && inputObj.input) {
                return inputObj.input;
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

            if (guestNum <= 0) {
                this.guestNum();
                guestNum = curTransaction.getNumberOfCustomers() || 0 ;
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

            // set transaction has splitpayment mode.
            curTransaction.setSplitPayments(true);

            // add payment amount to cart
            arPayments.forEach(function(pAmount) {
                cart._addPayment('cash', pAmount);
            });

        },


        /**
         * store current transaciton and close transaction.
         *
         */
        storeCheck: function() {

            var cart = this.getCartController();
            var curTransaction = cart._getTransaction();

            if (! cart.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                cart._clearAndSubtotal();
                return false;
            }

            this.getKeypadController().clearBuffer();

            cart._cancelReturn();

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                return false;
            }

            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                return false;
            }

            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                return false;
            }

            if (!curTransaction.isModified()) {
                NotifyUtils.warn(_('No change to store'));
                return false;
            }

            // save order
            if  (cart.submit(2)) {

                // backward compatible
                cart.dispatchEvent('onStore', curTransaction);

                cart.dispatchEvent('onWarning', _('STORED'));

                NotifyUtils.warn(_('This order has been stored!!'));

                cart._getCartlist().refresh();

                return true;

            }

            return false;
        },


        /**
         * recall order by order id
         *
         * @param {String} orderId   order uuid
         * @return {Boolean} true if success
         */
        recallOrder: function(orderId) {

            orderId = orderId || '';
            if (orderId.length == 0) {
                orderId = this.getKeypadController().getBuffer() || '';
                this.getKeypadController().clearBuffer();
            }

            if (orderId.length == 0 ) {
                // use recallCheck mode and select dialog
                return this.recallCheck("-1");
            }

            let orderData = this.Order.readOrder(orderId, true); // recall use master service's datas.

            if (!orderData) {
                NotifyUtils.error(_('This order object does not exist [%S]', [orderId]));
                return false;
            }

            if (orderData.TableOrderLock) {
                NotifyUtils.error(_('This order is already locked by other terminal. [%S,%S]', [orderData.TableOrderLock.machine_id, orderData.TableOrderLock.machine_addr]));
                this.log(_('This order is already locked by other terminal. [%S,%S]', [orderData.TableOrderLock.machine_id, orderData.TableOrderLock.machine_addr]));
                return false;
            }

            if (orderData.Order.status == 1) {
                NotifyUtils.warn(_('This order is already finalized!'));
                return false;
            }

            // check okay, convert to transaction data
            let data = this.Order.mappingOrderDataToTranData(orderData);
           
            if (data.display_sequences == undefined) {
                NotifyUtils.error(_('This order object can not recall [%S]', [orderId]));
                return false;
            }

            // set status to recall
            // and udpate status to open status.
            data.recall = data.status;
            data.status = 0 ;

            var curTransaction = new Transaction(true);
            curTransaction.data  = data;

            // update transaction to cart
            var cart = this.getCartController()

            cart._setTransactionToView(curTransaction);
            curTransaction.updateCartView(-1, -1);

            cart._clearAndSubtotal();

            // display to onscreen VFD
            cart.dispatchEvent('onWarning', _('RECALL# %S', [data.seq]));

            return true;

        },


        /**
         * recall by Check NO
         * 
         * @param {String} checkNo
         */
        recallCheck: function(checkNo) {

            checkNo = checkNo || '';
            if (checkNo.length == 0) {
                checkNo = this.getKeypadController().getBuffer() || '';
                this.getKeypadController().clearBuffer();
            }
            
            if (checkNo.length == 0) {
                checkNo = this.openCheckNoDialog(checkNo);
            }

            var conditions = "" ;
            if (checkNo.length == 0 || checkNo == "-1") {
                conditions = "orders.status=2";
            }else {
                conditions = "orders.check_no='"+checkNo+"' AND orders.status=2";
            }

            var orders = this.Order.getOrdersSummary(conditions, true);

            if (orders.length == 0) {
                NotifyUtils.error(_('This order object does not exist [%S]', [checkNo]));
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

            tableNo = tableNo || '';
            if (tableNo.length == 0) {
                tableNo = this.getKeypadController().getBuffer() || '';
                this.getKeypadController().clearBuffer();
            }

            if (tableNo.length == 0 ) {
                tableNo = this.openTableNumDialog(false);
            }

            var conditions = "" ;
            if (tableNo.length == 0 ) {
                conditions = "orders.status=2";
            }else {
                conditions = "orders.table_no='"+tableNo+"' AND orders.status=2";
            }

            var orders = this.Order.getOrdersSummary(conditions, true);

            if (orders.length == 0) {
                NotifyUtils.error(_('This order object does not exist [%S]', [tableNo]));
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

        },


        /**
         * onCartBeforeAddpayment
         *
         * Check the minimum charge and add PLU
         *
         * @todo if destination is outside don't check it.
         *
         * @param {Object) evt
         */
        onCartBeforeAddPayment: function(evt) {

            // let destination = getXXXX;
            var isCheckTableMinimumCharge = true;
            var table_no = evt.data.transaction.data.table_no;
            var guests = evt.data.transaction.data.no_of_customers;

            if (isCheckTableMinimumCharge && this.tableSettings.RequestMinimumCharge && table_no) {
                //
                var minimum_charge_per_table = this.tableSettings.GlobalMinimumChargePerTable;
                var minimum_charge_per_guest = this.tableSettings.GlobalMinimumChargePerGuest;

                var total = evt.data.transaction.data.total;
                switch (this.tableSettings.MinimumChargeFor)  {
                    case "1":
                        // original
                        total = evt.data.transaction.data.item_subtotal;
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

                var minimum_charge = Math.max(minimum_charge_per_table, minimum_charge_per_guest * guests);

                if (total < minimum_charge) {

                    if (GREUtils.Dialog.confirm(this._controller.topmostWindow,
                        _('Order amount does not reach Minimum Charge'),
                        _('The amount of this order does not reach Minimum Charge (%S) yet. Proceed?\nClick OK to finalize this order by Minimum Charge, \nor, click Cancel to return shopping cart and add more items.', [minimum_charge])) == false) {

                        NotifyUtils.warn(_('The amount of this order does not reach Minimum Charge (%S) yet.', [minimum_charge]));
                    } else {

                        var product = GeckoJS.BaseObject.unserialize(this.tableSettings.MinimumChargePlu);

                        if (product) {
                            var cart = this.getCartController();
                            cart.setPrice(minimum_charge - total);
                            cart.addItem(product);

                            NotifyUtils.warn(_('Add difference (%S) to finalize this order by Minimum Charge.', [minimum_charge - total]));
                        } else {
                            NotifyUtils.warn(_('The amount of this order does not reach Minimum Charge (%S) yet.', [minimum_charge]));
                        }

                    }

                    evt.preventDefault();

                }
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

            // let destination = getXXXX;
            var isCheckTableNo = true;
            var isCheckGuestNum = true;

            if (isCheckTableNo && this.tableSettings.RequireTableNo && !evt.data.txn.data.table_no) {
                this.newTable('', true);
            }

            if (isCheckGuestNum && this.tableSettings.RequireGuestNum && !evt.data.txn.data.no_of_customers) {
                this.guestNum(-1);
            }

        },


        /**
         * onCartOnSubmitSuccess
         *
         * @param {Object} evt
         */
        onCartOnSubmitSuccess: function(evt) {

            if (this.tableSettings.TableWinAsFirstWin) {
                // newTable always create new transaction object
                //this.newTable();

                // just popup table selector
                this.popupTableSelectorPanel();
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
            if (transaction.data.recall == 2) {
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

            var r = this.TableStatus.begin();

            if (r) {

                r = this.TableStatus.execute('delete from table_orders');
                if (r) r = this.TableStatus.execute('delete from table_bookings');

                // truncate sync tables
                if (r) r = this.TableStatus.execute('delete from syncs');
                if (r) r = this.TableStatus.execute('delete from sync_remote_machines');

                if (r) r = this.TableStatus.commit();

                if (!r) {
                    var errNo = this.TableStatus.lastError;
                    var errMsg = this.TableStatus.lastErrorString;

                    this.TableStatus.rollback();

                    this.dbError(errNo, errMsg,
                        _('An error was encountered while attempting to remove all table status records (error code %S) [message #501].', [errNo]));
                }
            }
            else {
                this.dbError(this.TableStatus.lastError, this.TableStatus.lastErrorString,
                    _('An error was encountered while attempting to remove all table status records (error code %S).', this.TableStatus.lastError));
            }
        },


        /**
         * transferTable
         *
         * @todo need rewrite
         */
        changeClerk: function(){

        },


        /**
         * mergeCheck
         *
         * @todo need rewrite
         */
        mergeCheck: function() {

        },


        /**
         * splitCheck
         *
         * @todo need rewrite
         */
        splitCheck: function() {

        },


        /**
         * transferTable 
         *
         * @todo need rewrite
         */
        transferTable: function(){

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

    var GuestCheckController = window.GuestCheckController =  GeckoJS.Controller.extend(__controller__);

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

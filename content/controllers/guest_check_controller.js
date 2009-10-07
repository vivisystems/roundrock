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


            this.tableSettings = this.TableSetting.getTableSettings() || {};

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

            no = no || '1';
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:no,
                type0:'number',
                digitOnly0:true,
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
         * Set Number of customers to transaction object
         *
         * @param {Number} num  default number of customers
         */
        guestNum: function(num) {

            var defaultNum = GeckoJS.Session.get('vivipos_fec_number_of_customers') || 1;
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
           
            if (num < 0) {
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
                    no = this.openTableNumDialog() ;
                }
            }

            // maybe use tableSelector or not select
            if (no.length == 0) return false;
            
            // get table define
            var table = this.Table.getTableByNo(no);
            if (table) {
                
                var curTransaction = cart._getTransaction(true); // autocreate

                if (! cart.ifHavingOpenedOrder() ) {
                    NotifyUtils.warn(_('Please open a new order first'));
                    cart._clearAndSubtotal();
                    return '';
                }

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
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=640,height=480';
            var inputObj = {
                disablecancelbtn: true,
                total: total,
                input:splitPayments
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Split Payment'), aFeatures, _('Split Payment'), inputObj);

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
         * make sure transaction does not already exist in cart when recalling orders
         *
         */

        beforeRecall: function() {
            var cart = this.getCartController();

            if (cart.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Please close the current order before recalling an existing order'));
                cart._clearAndSubtotal();
                return false;
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
                NotifyUtils.error(_('This order object does not exist [%S]', [orderId]));
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
            curTransaction.data  = data;

            // recall alway recalc promotions
            Transaction.events.dispatch('onUnserialize', curTransaction, curTransaction);
            curTransaction.calcPromotions();
            curTransaction.calcTotal();

            // update transaction to cart
            var cart = this.getCartController()

            cart._setTransactionToView(curTransaction);
            curTransaction.updateCartView(-1, -1);

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

            skipRecall = skipRecall || false;

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
            }else {
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

            if (!this.beforeRecall(orderId)) return false;
            
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

            var r = this.Table.begin();

            if (r) {

                r = this.Table.execute('delete from tables');
                if (r) r = this.Table.execute('delete from table_regions');
                if (r) r = this.Table.execute('delete from table_settings');
                if (r) r = this.Table.execute('delete from table_orders');
                if (r) r = this.Table.execute('delete from table_order_locks');
                if (r) r = this.Table.execute('delete from table_marks');
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

            // set seq
            sourceOrderSeq = sourceData.seq;
            targetOrderSeq = targetData.seq;

            let transaction = new Transaction(true, true);
            transaction.data = sourceData ;

            let targetTransaction = new Transaction(true, true);
            targetTransaction.data = targetData;

            // move all items
            transaction.moveCloneAllItems(targetTransaction);

            try {
                // save orignal orders
                Transaction.events.dispatch('onUnserialize', transaction, transaction);
                transaction.calcPromotions();
                transaction.calcTotal();
                transaction.setBackgroundMode(false);
                transaction.data.status = 2
                transaction.submit(2);

                let inherited_order_id = targetData.inherited_order_id || '' ;
                inherited_order_id = inherited_order_id.length > 0 ? (inherited_order_id+','+sourceOrderId) : sourceOrderId;

                let inherited_desc = targetData.inherited_desc || '' ;
                inherited_desc = inherited_desc.length > 0 ? (inherited_desc+','+_('Merge Check')) : _('Merge Check') ;
                
                Transaction.events.dispatch('onUnserialize', targetTransaction, targetTransaction);
                targetTransaction.calcPromotions();
                targetTransaction.calcTotal();
                targetTransaction.setBackgroundMode(false);
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
                        GREUtils.Dialog.alert(this.topmostWindow,
                            _('Data Operation Error'),
                            _('This order could not be committed. Please check the network connectivity to the terminal designated as the table service server [message #105].'));
                        this.dispatchEvent('commitOrderError', commitStatus);
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

            if (result) {

                try {
                    // save orignal orders
                    Transaction.events.dispatch('onUnserialize', transaction, transaction);
                    transaction.calcPromotions();
                    transaction.calcTotal();
                    transaction.setBackgroundMode(false);
                    transaction.submit(2);

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

                        Transaction.events.dispatch('onUnserialize', sTrans, sTrans);
                        sTrans.calcPromotions();
                        sTrans.calcTotal();
                        sTrans.setBackgroundMode(false);
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
                            GREUtils.Dialog.alert(this.topmostWindow,
                                _('Data Operation Error'),
                                _('This order could not be committed. Please check the network connectivity to the terminal designated as the table service server [message #105].'));
                            this.dispatchEvent('commitOrderError', commitStatus);
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
            
            if(data && typeof data =='object') {
                var orderId = data.orderId || '';
                var orgTableId = data.orgTableId || '';
                var newTableId = data.newTableId || '';

                result = this.Order.transferTable(orderId, orgTableId, newTableId);
            }else {
                fnTrigger = true;
                let txn = this.getCartController()._getTransaction();
                
                if (!txn || (txn.data.status != 2 && txn.data.recall != 2) ) {
                    return false ;
                }

                var newTableNo = this.openTableNumDialog();

                var orgTable = this.Table.getTableByNo(txn.data.table_no);
                var newTable = this.Table.getTableByNo(newTableNo);
                var orderId = txn.data.id;

                result = this.Order.transferTable(orderId, orgTable.id, newTable.id);
                this.recallOrder(orderId);
            }

            return result;

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
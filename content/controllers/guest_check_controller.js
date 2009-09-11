(function(){

    var __controller__ = {
        
        name: 'GuestCheck',

        components: ['CartUtils'],
        
        uses: ['Table', 'TableSetting'],

        _cartController: null,


        initial: function() {
            dump('GuestCheck initial \n');
            // add cart events
            var cart = this.getCartController();
            if(cart) {
            
                // check table no and guests before submit...
                cart.addEventListener('beforeSubmit', this.onCartBeforeSubmit, this);

                // check minimum charge and table no and guests after submit...
                cart.addEventListener('afterSubmit', this.onCartAfterSubmit, this);

                // check minimum charge and table no and guests before addPayment...
                cart.addEventListener('beforeAddPayment', this.onCartBeforeAddPayment, this);

            }

            var main = this.getMainController();
            if (main) {
                main.addEventListener('onFirstLoad', this.onMainFirstLoad, this);
                main.addEventListener('afterTruncateTxnRecords', this.onMainTruncateTxnRecords, this);
            }

            let tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};
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
         * open Table No Dialog
         * 
         * @param {Boolean} tableSelector  use numberpad or table selector
         */
        openTableNumDialog: function (tableSelector){

            tableSelector = tableSelector || false;

            if ( tableSelector ) {

                return this.popupTableSelectorPanel();
                
            }else {

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

            }

        },

        /**
         * popupTableSelectorPanel
         *
         * @todo
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
         * @param {Boolean} tableSelector  use table selector or numberpad dialog
         */
        newTable: function(no, tableSelector) {

            no = no || '';
            tableSelector = tableSelector || false;
            tableSelector = true;
           
            var cart = this.getCartController();
            var curTransaction = cart._getTransaction(true); // autocreate

            if (! cart.ifHavingOpenedOrder() ) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                cart._clearAndSubtotal();
                return '';
            }

            if (no.length == 0) {              
                no = this.getKeypadController().getBuffer() || '';
                this.getKeypadController().clearBuffer();
                cart._cancelReturn();
            }

            // use callback to select table.
            if (no.length == 0) {
                // popup dialog
                no = this.openTableNumDialog(tableSelector) ;
            }

            // maybe use tableSelector or not select
            if (no.length == 0) return '';
            
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
                
            }else {
                NotifyUtils.warn(_('[%S] is an invalid table number. Table number must be defined through table manager; Please input another table number.', [no]));
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

                // @todo OSD
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
            // orderId = '9a35400d-bfdd-46d6-85fe-8e462ee74388';

            if (orderId.length == 0 ) {
                NotifyUtils.error(_('This order object does not exist [%S]', [orderId]));
                return false;
            }
            var o = new OrderModel();

            let data = o.readOrder(orderId, true); // recall use master service's datas.

            if (!data) {
                NotifyUtils.error(_('This order object does not exist [%S]', [orderId]));
                return false;
            }
            if (data.status == 1) {
                // @todo OSD
                NotifyUtils.warn(_('This order is already finalized!'));
                return false;
            }

            if (data.display_sequences == undefined) {
                // @todo order_object been delete
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
            cart.dispatchEvent('onWarning', _('RECALL# %S', [orderId]));

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
            checkNo = '999';
            if (checkNo.length == 0 ) {
                NotifyUtils.error(_('This order object does not exist [%S]', [checkNo]));
                return false;
            }

            var o = new OrderModel();
            var orders = o.getOrdersSummary("Order.check_no='"+checkNo+"' AND Order.status=2", true);

            if (orders.length == 0) {
                NotifyUtils.error(_('This order object does not exist [%S]', [checkNo]));
                return false;
            }

            // select orders
            if (orders.length > 1) {
            }else {
                return this.recallOrder(orders[0].Order.id);
            }

        },


        recallTable: function(tableNo) {

            tableNo = tableNo || '';
            if (checkNo.length == 0) {
                checkNo = this.getKeypadController().getBuffer() || '';
                this.getKeypadController().clearBuffer();
            }
            // checkNo = '999';
            if (checkNo.length == 0 ) {
                NotifyUtils.error(_('This order object does not exist [%S]', [checkNo]));
                return false;
            }

            var o = new OrderModel();
            var orderId = o.getOrdersSummary("table_no='"+checkNo+"' AND status=2", true);

            if (orderId) {
                return this.recallOrder(orderId);
            }else {
                NotifyUtils.error(_('This order object does not exist [%S]', [checkNo]));
                return false;
            }

        },



        /**
         * XXX need rewrite
         */

        mergeCheck: function() {

            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            var curTransaction;

            curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                this._clearAndSubtotal();
                return;
            }

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                this._clearAndSubtotal();
                return;
            }
            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                this._clearAndSubtotal();
                return;
            }
            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                this._clearAndSubtotal();
                return;
            }
            var modified = curTransaction.isModified();
            if (modified) {
                NotifyUtils.warn(_('This order has been modified and must be stored first'));
            // r = this.GuestCheck.store();
            // this.dispatchEvent('onStore', curTransaction);
            }

            // r = this.GuestCheck.transferToCheckNo(no);
            var r = this.GuestCheck.mergeOrder(no, curTransaction.data);
        },

        splitCheck: function() {

            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            var curTransaction;

            curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return;
            }

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                return;
            }
            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                return;
            }
            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                return;
            }
            var modified = curTransaction.isModified();
            if (modified) {
                NotifyUtils.warn(_('This order has been modified and must be stored first'));
            // r = this.GuestCheck.store();
            // this.dispatchEvent('onStore', curTransaction);
            }

            var r = this.GuestCheck.splitOrder(no, curTransaction.data);
        },

        transferTable: function(){
            var no = this._getKeypadController().getBuffer();
            this._getKeypadController().clearBuffer();

            this._cancelReturn();

            var curTransaction;

            curTransaction = this._getTransaction();
            if (curTransaction == null) {
                NotifyUtils.warn(_('Not an open order; unable to store'));
                return;
            }

            if (curTransaction.data.status == 1) {
                NotifyUtils.warn(_('This order has been submitted'));
                return;
            }
            if (curTransaction.data.closed) {
                NotifyUtils.warn(_('This order is closed pending payment and may only be finalized'));
                return;
            }
            if (curTransaction.data.items_count == 0) {
                NotifyUtils.warn(_('This order is empty'));
                return;
            }
            var modified = curTransaction.isModified();
            if (modified) {
                // rec    // XXXX why only rec?
                NotifyUtils.warn(_('This order has been modified and must be stored first'));
            // r = this.GuestCheck.store();
            // this.dispatchEvent('onStore', curTransaction);
            }

            var r = this.GuestCheck.transferToTableNo(no);
        },

        unserializeFromOrder: function(order_id) {
            //
            order_id = order_id;

            var curTransaction = this.GuestCheck.unserializeFromOrder(order_id);

            if (curTransaction) {
                this._setTransactionToView(curTransaction);
                curTransaction.updateCartView(-1, -1);
                this._clearAndSubtotal();
            }
            return true;

        },

        onCartBeforeAddPayment: function(evt) {
            return true;

            //
            if (this._guestCheck.tableSettings.RequireTableNo && !evt.data.transaction.data.table_no) {
                this.table(this.selTableNum(''));
            }

            if (this._guestCheck.tableSettings.RequireGuestNum && !evt.data.transaction.data.no_of_customers) {
                this.guest('');
            }

            if (this._guestCheck.tableSettings.RequestMinimumCharge) {
                //
                var minimum_charge_per_table = this._guestCheck.tableSettings.GlobalMinimumChargePerTable;
                var minimum_charge_per_guest = this._guestCheck.tableSettings.GlobalMinimumChargePerGuest;
                var table_no = evt.data.transaction.data.table_no;
                var guests = evt.data.transaction.data.no_of_customers;

                var total = evt.data.transaction.data.total;
                switch (this._guestCheck.tableSettings.MinimumChargeFor)  {
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


                var tables = this._tableStatusModel.getTableStatusList();
                var tableObj = new GeckoJS.ArrayQuery(tables).filter("table_no = '" + table_no + "'");

                if (tableObj.length > 0) {
                    // set minimum charge
                    minimum_charge_per_table = tableObj[0].Table.minimum_charge_per_table || minimum_charge_per_table;
                    minimum_charge_per_guest = tableObj[0].Table.minimum_charge_per_guest || minimum_charge_per_guest;
                }

                var minimum_charge = Math.max(minimum_charge_per_table, minimum_charge_per_guest * guests);

                if (total < minimum_charge) {

                    if (GREUtils.Dialog.confirm(this._controller.topmostWindow,
                        _('Order amount does not reach Minimum Charge'),
                        _('The amount of this order does not reach Minimum Charge (%S) yet. Proceed?\nClick OK to finalize this order by Minimum Charge, \nor, click Cancel to return shopping cart and add more items.', [minimum_charge])) == false) {

                        // @todo OSD
                        NotifyUtils.warn(_('The amount of this order does not reach Minimum Charge (%S) yet.', [minimum_charge]));

                    } else {

                        var product = GeckoJS.BaseObject.unserialize(this._guestCheck.tableSettings.MinimumChargePlu);

                        if (product) {
                            this._controller.setPrice(minimum_charge - total);
                            this._controller.addItem(product);

                            // @todo OSD
                            NotifyUtils.warn(_('Add difference (%S) to finalize this order by Minimum Charge.', [minimum_charge - total]));

                        } else {
                            // @todo OSD
                            NotifyUtils.warn(_('The amount of this order does not reach Minimum Charge (%S) yet.', [minimum_charge]));

                        }

                    }

                    evt.preventDefault();

                }
            }
        },

        onCartBeforeSubmit: function(evt) {
            return true;

            if (this._guestCheck.tableSettings.RequireTableNo && !evt.data.txn.data.table_no) {
                this.table(this.selTableNum(''), evt.data.txn);
            }

            if (this._guestCheck.tableSettings.RequireGuestNum && !evt.data.txn.data.no_of_customers) {
                this.guest('', evt.data.txn);
            }

        },

        onCartAfterSubmit: function(evt) {
            return true;

            // is stored order?
            if (evt.data.data.recall == 2) {

                // this._tableStatusModel.removeCheck(evt.data.data);
                this._tableStatusModel.addCheck(evt.data.data);

                // set autoMark
                var autoMark = GeckoJS.Session.get('autoMarkAfterSubmitOrder') || {};

                if (autoMark['name'] == null) {

                    this._guestCheck.tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};
                    var markName = this._guestCheck.tableSettings.AutoMarkAfterSubmit;

                    if (markName && markName.length > 0) {
                        var datas = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableMarks');
                        if (datas != null) {
                            var marks = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datas));
                            var markObj = new GeckoJS.ArrayQuery(marks).filter("name = '" + markName + "'");

                            if (markObj && markObj.length > 0) {
                                autoMark = markObj[0];
                                GeckoJS.Session.set('autoMarkAfterSubmitOrder', autoMark);

                            } else {
                                autoMark = {};
                            }

                        }
                    }
                };

                if (autoMark['name'] != null) {

                    var table_no = evt.data.data.table_no;

                    this._tableStatusModel.setTableMark(table_no, autoMark);
                }

            }

            if (this._guestCheck.tableSettings.TableWinAsFirstWin) {
                this._controller.newTable();
            }

            // restore from backup after order was submited/stored
            var order = new OrderModel();
            //order.restoreOrderFromBackup();
            delete order;

        },

        onMainTruncateTxnRecords: function(evt) {
            return true;
            //
            var r = this._tableStatusModel.begin();
            if (r) {
                r = this._tableStatusModel.execute('delete from table_orders');
                if (r) r = this._tableStatusModel.execute('delete from table_bookings');

                // truncate sync tables
                if (r) r = this._tableStatusModel.execute('delete from syncs');
                if (r) r = this._tableStatusModel.execute('delete from sync_remote_machines');

                if (r) r = this._tableStatusModel.commit();
                if (!r) {
                    var errNo = this._tableStatusModel.lastError;
                    var errMsg = this._tableStatusModel.lastErrorString;

                    this._tableStatusModel.rollback();

                    this.dbError(errNo, errMsg,
                        _('An error was encountered while attempting to remove all table status records (error code %S).', [errNo]));
                }
            }
            else {
                this.dbError(this._tableStatusModel.lastError, this._tableStatusModel.lastErrorString,
                    _('An error was encountered while attempting to remove all table status records (error code %S).', this._tableStatusModel.lastError));
            }
        },

        onMainFirstLoad: function(evt) {
            return true;
            //
            if (this._firstRun) {
                this._firstRun = false;
                $do('load', null, 'SelectTable');

            }

            if (this._guestCheck.tableSettings.TableWinAsFirstWin) {
                this._controller.newTable();
            }
        },



        destroy: function() {
            dump('destroy \n');
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

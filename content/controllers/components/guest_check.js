(function() {

    var __component__ = {
        
        /**
         * Component GuestCheck
         */

        /*
            // Session
            vivipos_fec_price_level,
            vivipos_fec_tax_total,
            vivipos_fec_number_of_items,
            vivipos_fec_order_sequence,
            vivipos_fec_order_destination,
            vivipos_fec_number_of_customers,
            vivipos_fec_check_number,
            vivipos_fec_table_number
         */

        name: 'GuestCheck',
        _guestCheck: {},
        _tableStatusModel: null,
        _tableList: null,
        _printController: null,
        _autoMark: null,

        init: function (c) {
            // inherit Cart controller constructor
            this._super(c);

            // read switch
            this._guestCheck.tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};
            
            // @todo : check orders first and set _checkNoArray, _tableNoArray...

            this._tableStatusModel = new TableStatusModel;
            this._tableStatusModel.initial();

            // this._guestCheck = guestCheck;
            // GeckoJS.Session.set('vivipos_fec_guest_check', guestCheck);

            // add listener for newTransaction and onSubmit event
            // var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var cart = this._controller;
            if (cart) {
                cart.addEventListener('newTransaction', this.handleNewTransaction, this);
                cart.addEventListener('onSubmit', this.handleAfterSubmit, this);

                // Cancel
                cart.addEventListener('onCancel', this.handleCancel, this);

                // cart.addEventListener('onClear', this.handleClear, this);

                // Store
                cart.addEventListener('onStore', this.handleStore, this);

                // ChangeServiceClerk
                cart.addEventListener('onChangeServiceClerk', this.handleChangeServiceClerk, this);

                // TransTable
                cart.addEventListener('onTransTable', this.handleTransTable, this);

                // check table no and guests before submit...
                cart.addEventListener('beforeSubmit', this.handleBeforeSubmit, this);

                // check minimum charge and table no and guests before addPayment...
                cart.addEventListener('beforeAddPayment', this.handleBeforeAddPayment, this);

                // SplitCheck
                cart.addEventListener('onSplitCheck', this.handleSplitCheck, this);

                // MergeCheck
                cart.addEventListener('onMergeCheck', this.handleSplitCheck, this);
                
            }
            
            var print = GeckoJS.Controller.getInstanceByName('Print');
            if (print) {
                this._printController = print;

            }


            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('onFirstLoad', this.handleFirstLoad, this);
                main.addEventListener('afterTruncateTxnRecords', this.handleTruncateTxnRecords, this);

            }
            
        },

        printChecks: function(txn) {

            var printer = 1;
            var autoPrint = false;
            var duplicate = 1;
            // print check
            this._printController.printChecks(txn, printer, autoPrint, duplicate);
        },

        syncClient: function() {
            // sync data
            try {
                var exec = new GeckoJS.File("/data/vivipos_webapp/sync_client");
                var r = exec.run(["sync"], false);
                exec.close();
                return true;
            }
            catch (e) {
                NotifyUtils.warn(_('Failed to execute command (sync_client).', []));
                return false;
            }
        },

        handleTruncateTxnRecords: function(evt) {
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

        handleBeforeAddPayment: function(evt) {
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
                        _('The amount of this order does not reach Minimum Charge (%S) yet. Proceed?\n' +
                            'Click OK to finalize this order by Minimum Charge, \nor, click Cancel to ' +
                            'return shopping cart and add more items.', [minimum_charge])) == false) {

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

        handleBeforeSubmit: function(evt) {

            if (this._guestCheck.tableSettings.RequireTableNo && !evt.data.txn.data.table_no) {
                this.table(this.selTableNum(''));
            }

            if (this._guestCheck.tableSettings.RequireGuestNum && !evt.data.txn.data.no_of_customers) {
                this.guest('');
            }

        },

        handleTransTable: function(evt) {
            //
//            this._tableStatusModel.transTable(evt.data.data);
//
//            this.syncClient();
//

            if (this._guestCheck.tableSettings.TableWinAsFirstWin) {
                    this._controller.newTable();
            }

        },

        handleChangeServiceClerk: function(evt) {
            //
            this.handleStore(evt);

        },

        handleStore: function(evt) {
            //
            this._tableStatusModel.addCheck(evt.data.data);

            if (this._guestCheck.tableSettings.TableWinAsFirstWin) {
                    this._controller.newTable();
            }

            // restore from backup after order was submited/stored
            var order = new OrderModel();
            order.restoreOrderFromBackup();
            delete order;

            this.syncClient();
        },

        handleAfterSubmit: function(evt) {

            // is stored order?
            if (evt.data.data.recall == 2) {

                // this._tableStatusModel.removeCheck(evt.data.data);
                this._tableStatusModel.addCheck(evt.data.data);

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
            order.restoreOrderFromBackup();
            delete order;

            this.syncClient();
        },

        handleSplitCheck: function(evt) {
            //
            // this._tableStatusModel.addCheck(evt.data.data);

            // print check
// this.log("SplitCheck printChecks:::");
            this.printChecks(evt.data);

            // restore from backup after order was submited/stored
            var order = new OrderModel();
            order.restoreOrderFromBackup();
            delete order;

            this.syncClient();

        },

        handleMergeCheck: function(evt) {
            //
            // this._tableStatusModel.addCheck(evt.data.data);

            // print check
// this.log("MergeCheck printChecks:::");
            this.printChecks(evt.data);

            // restore from backup after order was submited/stored
            var order = new OrderModel();
            order.restoreOrderFromBackup();
            delete order;

            this.syncClient();

        },

        handleCancel: function(evt) {
            //
            if (this._guestCheck.tableSettings.TableWinAsFirstWin) {
                    this._controller.newTable();
            }
        },

        handleFirstLoad: function(evt) {
            //
            if (this._guestCheck.tableSettings.TableWinAsFirstWin) {
                    this._controller.newTable();
            }
        },

        handleNewTransaction: function(evt) {

            if ( evt.type == 'newTransaction') {
                this._guestCheck.tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};
                if (this._guestCheck.tableSettings.RequireCheckNo) {

                    this._controller.newCheck(true);
                }
            }

        },

        getTableList: function() {
            // if(this._tableList == null) {
                var tableModel = new TableModel;
                var tablelist = tableModel.find("all", {recursive: 0});
                this._tableList = tablelist;
                delete tableModel;
            // }

            return this._tableList;            

        },

        selGuestNum: function (no){

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:no, require0:true, numpad:true
            };

            GREUtils.Dialog.openWindow(this._controller.topmostWindow, aURL, _('Select Number of Customers'), aFeatures, _('Select Number of Customers'), '', _('Number'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                return inputObj.input0;
            }

            return no;

        },

        selTableNum: function (no){

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:no, require0:true, numpad:true, disablecancelbtn:true
            };

            GREUtils.Dialog.openWindow(this._controller.topmostWindow, aURL, _('Select Table Number'), aFeatures, _('Select Table Number'), '', _('Number'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                return inputObj.input0;
            }

            return no;

        },

        getNewCheckNo: function() {

            var r = this._tableStatusModel.getNewCheckNo();

            if (r >= 0) {
                var curTransaction = null;
                curTransaction = this._controller._getTransaction();
                if (curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {

                    curTransaction = this._controller._getTransaction(true);
                    if (curTransaction == null) {
                        NotifyUtils.warn(_('fatal error!!'));
                        return; // fatal error ?
                    }
                }
                GeckoJS.Session.set('vivipos_fec_check_number', r);
                curTransaction.data.check_no = r;
            }
            return r;
        },

        _isAllowMerge: function(data) {
            var r = true;
            // not allow to Merge when transaction is closed
            if (data.isClosed()) {
            // if (data.closed) {
                NotifyUtils.warn(_('The order has been pre-finalized ; Can not be merged'));
                r = false;
            }

            // not allow to split when transaction is prepaid
            if (data.data.payment_subtotal != 0) {
                NotifyUtils.warn(_('The order has been prepaid ; Can not be merged'));
                r = false;
            }

            return r;
        },

        _isAllowSplit: function(data) {

            var r = true;
            // not allow to split when transaction is closed
            if (data.isClosed()) {
            // if (data.closed) {
                NotifyUtils.warn(_('The order has been pre-finalized ; Can not be split'));
                r = false;
            }
            
            // not allow to split when transaction is prepaid
            if (data.data.payment_subtotal != 0) {
                NotifyUtils.warn(_('The order has been prepaid ; Can not be split'));
                r = false;
            }

            return r;
        },

        getNewTableNo: function() {

            if (this._tableStatusModel._tableStatusList.length <=0) {
                    this._tableStatusModel.getTableStatusList();
                    return;
            }

            var self = this;
            var i = 1;
            var r = -1;
            var isNewOrder = false;
            var curTransaction = null;
            curTransaction = this._controller._getTransaction();

            if (curTransaction != null)  {
                if (curTransaction.isModified() && curTransaction.data.recall != 2) {

                    isNewOrder = true;

                } else if (curTransaction.isModified()) {

                    // recalled check and is modified...
                    NotifyUtils.warn(_('The order must be stored first!'));

                    return;
                }
            }

            // get table status
            // var tables = this._tableStatusModel.getTableStatusList();

            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';

            var aURL = 'chrome://viviecr/content/select_table.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                isNewOrder: isNewOrder,
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

            //return;

            return "" + r;
        },

        doSelectTableFuncs: function(inputObj) {
this.log("doSelectTableFuncs:::inputObj.action:::" + inputObj.action);
            if (inputObj.ok && inputObj.index) {
                var tables = inputObj.tables;
                var id = inputObj.order_id;
                var check_no = inputObj.check_no;
                var tableObj = inputObj.tableObj;
                
                var idx = inputObj.index;
                // var i = tables[idx].table_no;
                var table_no = tableObj.table_no;

                // var id = tables[idx].order_id;
                // var destination = tables[idx].Table.destination;
                var destination = tableObj.Table.destination;

                switch (inputObj.action) {
                    case 'RecallCheck':
                        if (id) {
this.log("doSelectTableFuncs:::RecallCheck:::");
                            if (!this._controller.unserializeFromOrder(id)) {
                                //@todo OSD
                                NotifyUtils.error(_('This order object does not exist [%S]', [id]));
                                return -1
                            }

                            var curTransaction = null;
                            curTransaction = this._controller._getTransaction();
                            if (curTransaction) {

                                if (curTransaction.data.status == 1) {
                                    // @todo OSD
                                    NotifyUtils.warn(_('This order is already finalized!'));
                                    return -1;
                                }
                            } else {
                                //@todo OSD
                                NotifyUtils.error(_('This order object does not exist [%S]', [id]));
                                return -1
                            }
                        } else if (check_no) {
                            this.recallByCheckNo(check_no);
                        } else {
                            this.recallByTableNo(i);
                        }

                        break;
                    case 'SplitCheck':
this.log("doSelectTableFuncs:::SplitCheck:::");
                        break;
                    case 'MergeCheck':
this.log("doSelectTableFuncs:::MergeCheck:::");
                        break;
                    case 'SelectTableNo':
this.log("doSelectTableFuncs:::SelectTableNo:::");
                        break;
                    case 'ChangeClerk':
this.log("doSelectTableFuncs:::ChangeClerk:::");
                        break;
                    case 'MergeTable':
this.log("doSelectTableFuncs:::MergeTable:::");
                        break;
                    case 'TransTable':
this.log("doSelectTableFuncs:::TransTable:::");
                        break;
                }
            }else {
                /*
                while (i <= 200) {
                    if (!this._tableNoArray[i] || this._tableNoArray[i] == 0) {
                        this._tableNoArray[i] = 1;
                        break;
                    }
                    i++;
                }
                r = i;
                */
                return false;
            }

            // GeckoJS.Session.set('vivipos_fec_table_number', i);
            return true;
        },

        table: function(table_no) {

            // read table settings...
            this._guestCheck.tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};

            var r = this._tableStatusModel.getTableNo(table_no);

            if (r >= 0) {
                var curTransaction = null;
                curTransaction = this._controller._getTransaction();
                if (curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {

                    curTransaction = this._controller._getTransaction(true);
                    if (curTransaction == null) {
                        NotifyUtils.warn(_('fatal error!!'));
                        return -1; // fatal error ?
                    }
                }
                GeckoJS.Session.set('vivipos_fec_table_number', r);
                curTransaction.data.table_no = r;

                // set destination
                var tables = this._tableStatusModel.getTableStatusList();
                var tableObj = new GeckoJS.ArrayQuery(tables).filter("table_no = '" + r + "'");
                if (tableObj.length > 0) {

                    // set destination action
                    var destination = tableObj[0].Table.destination;
                    if (destination)
                        this.requestCommand('setDestination', destination, 'Destinations');
                }

            }
            return r;
        },

        check: function(check_no) {
            var r = this._tableStatusModel.getNewCheckNo(check_no);

            if (r >= 0) {
                var curTransaction = null;
                curTransaction = this._controller._getTransaction();
                if (curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {

                    curTransaction = this._controller._getTransaction(true);
                    if (curTransaction == null) {
                        NotifyUtils.warn(_('fatal error!!'));
                        return; // fatal error ?
                    }
                }
                GeckoJS.Session.set('vivipos_fec_check_number', r);
                curTransaction.data.check_no = r;
            } else {
                NotifyUtils.warn(_('Check# %S is in use ; Please input another Check#', [check_no]));
            }
        },

        load: function () {
            // this.log("GuestCheck load...");
        },

        guest: function(num) {
            if (!num) {
                num = GeckoJS.Session.get('vivipos_fec_number_of_customers') || 1;
                num = this.selGuestNum(num);
            }

            if (num >= 0) {
                var curTransaction = null;
                curTransaction = this._controller._getTransaction();
                if (curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {

                    curTransaction = this._controller._getTransaction(true);
                    if (curTransaction == null) {
                        NotifyUtils.warn(_('fatal error!!'));
                        return; // fatal error ?
                    }
                }
                GeckoJS.Session.set('vivipos_fec_number_of_customers', num);
                curTransaction.data.no_of_customers = num;


            }
            return num;
        },

        getCheckList: function(key, no, notCheckStatus) {
            //
            var self = this;
            var order = new OrderModel();

            var fields = null;
            var conditions = null;
            
            switch (key) {
                case 'CheckNo':
                    conditions = "orders.check_no='" + no + "' AND orders.status='2'";
                    break;
                case 'TableNo':
                    conditions = "orders.table_no='" + no + "' AND orders.status='2'";
                    break;
                case 'AllCheck':
                    conditions = "orders.status='2'";
                    break;
                case 'OrderNo':
                    conditions = "orders.sequence='" + no + "' AND orders.status='2'";
                    break;
            }
            
            var ord = order.find('all', {fields: fields, conditions: conditions, recursive: 2});

            // return all store checks...
            if (notCheckStatus) return ord;

            // var tables = this._tableStatusModel.getTableStatusList();
            
            var tableOrderIdx = this._tableStatusModel.getTableOrderIdx();

            var ordChecked = [];
            ord.forEach(function(o){

                var crc = order.getOrderChecksum(o.id);
                
                if (tableOrderIdx[o.id]) {
                    // if ((crc == tableOrderIdx[o.id].checksum) || ((o.terminal_no == tableOrderIdx[o.id].terminal_no) && (o.modified >= tableOrderIdx[o.id].modified))) {
                    if (crc == tableOrderIdx[o.id].checksum) {
                        o.table_order_status = 0;
                        ordChecked.push(o);

//                    } else if ((o.terminal_no == tableOrderIdx[o.id].terminal_no) && (o.modified >= tableOrderIdx[o.id].modified)) {

//                        ordChecked.push(o);

                    } else if ((o.terminal_no == tableOrderIdx[o.id].terminal_no) && (o.modified >= tableOrderIdx[o.id].modified)) {

                        o.table_order_status = 1;
                        ordChecked.push(o);
                    }
                } else {

                    o.table_order_status = 2;
                    ordChecked.push(o);
                }

                /*
                if (tableOrderIdx[o.id] && (crc == tableOrderIdx[o.id].checksum)) {

                    ordChecked.push(o);
                } else if () {

                }
                */
            })

            return ordChecked;
        },

        store: function() {

            if (this._controller.submit(2)) {
                this._controller.dispatchEvent('onWarning', _('STORED'));

                // @todo OSD
                NotifyUtils.warn(_('This order has been stored!!'));

                this.sleep(100);

                return true;
            }

            return false;

        },

        removeTableStatus: function(checkObj) {
            //
            this._tableStatusModel.removeCheck(checkObj);
        },

        selOrderNo: function (){

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:'', require0:true, numpad:true
            };

            GREUtils.Dialog.openWindow(this._controller.topmostWindow, aURL, _('Recall Input Sequence Number'), aFeatures, _('Input sequence number to recall'), '', _('Sequence Number'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                return inputObj.input0;
            }

            return ;

        },

        recallByOrderNo: function(no) {
            var seq = '';
            if (no)
                seq = no;
            else {
                seq = this.selOrderNo();
            }
            if (seq) return this.recall('OrderNo', seq);
        },

        recallByCheckNo: function(no) {
            // this.log("DEBUG", "GuestCheck recall by check_no..." + no);
            if (no)
                return this.recall('CheckNo', no);
            else
                return this.recall('AllCheck', 'CheckNo');
        },

        recallByTableNo: function(no) {
            // this.log("DEBUG", "GuestCheck recall by table_no..." + no);
            if (no)
                return this.recall('TableNo', no);
            else
                return this.recall('AllCheck', 'TableNo');
        },

        recall: function(key, no, silence, excludedOrderId) {
            // this.log("DEBUG", "GuestCheck recall...key:" + key + ",  no:" + no + " , excludedOrderId:" + excludedOrderId);
            switch(key) {
                case 'OrderNo':
                    // @todo not implement...
                    // var ord = this._tableStatusModel.getCheckList('OrderNo', no);
                    var ord = this.getCheckList('OrderNo', no);

                    if (ord && ord.length > 0) {
                        // AC 2009.04.29
                        var id = ord[0].id;
                        // var id = ord[idx].order_id;

                        var status = ord[0].status;

                        if (!this._controller.unserializeFromOrder(id)) {
                            //@todo OSD
                            NotifyUtils.error(_('This order object does not exist [%S]', [id]));
                            return -1
                        }

                        if (status == 1) {
                            // @todo OSD
                            NotifyUtils.warn(_('This order is already finalized!'));
                        }
                    }
                    else {
                        // @todo OSD
                        NotifyUtils.warn(_('Can not find the Order# (%S)!!', [no]));
                    }
                    break;
                case 'CheckNo':
                    // var ord = this._tableStatusModel.getCheckList('CheckNo', no);
                    var ord = this.getCheckList('CheckNo', no);

                    if (ord && ord.length > 0) {

                        // AC 2009.04.29
                        var id = ord[0].id;
                        // var id = ord[idx].order_id;

                        var status = ord[0].status;

                        if (!this._controller.unserializeFromOrder(id)) {
                            //@todo OSD
                            NotifyUtils.error(_('This order object does not exist [%S]', [id]));
                            return -1
                        }

                        // display to onscreen VFD
                        this._controller.dispatchEvent('onWarning', _('RECALL# %S', [no]));

                        if (status == 1) {
                            // @todo OSD
                            NotifyUtils.warn(_('This order is already finalized!'));
                        }
                    } else {
                        // @todo OSD
                        NotifyUtils.warn(_('Can not find the Check# %S !!', [no]));
                    }
                    break;
                case 'TableNo':
                    /*
                    var ordList = this._tableStatusModel.getCheckList('TableNo', no);
                    var ord = [];
                    ordList.forEach(function(o){
                        ord.push(GeckoJS.BaseObject.unserialize(o.order_object));
                    });
                    */
                    var ord = this.getCheckList('TableNo', no);

                    if (ord && ord.length > 1) {
                        //
                        // alert(this.dump(ord));

                        var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
                        var screenheight = GeckoJS.Session.get('screenheight') || '600';

                        var aURL = 'chrome://viviecr/content/select_checks.xul';
                        var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
                        var inputObj = {
                            checks: ord,
                            excludedOrderId: excludedOrderId
                        };

                        GREUtils.Dialog.openWindow(this._controller.topmostWindow, aURL, 'select_tables', aFeatures, inputObj);

                        if (inputObj.ok && inputObj.index) {
                            var idx = inputObj.index;
                            // return queues[idx].key;
                            
                            // AC 2009.04.29
                            var id = ord[idx].id;
                            // var id = ord[idx].order_id;

                            var status = ord[idx].status;
                            var check_no = ord[idx].check_no;

                            if (!this._controller.unserializeFromOrder(id)) {
                                //@todo OSD
                                NotifyUtils.error(_('This order object does not exist [%S]', [id]));
                                return -1
                            }

                            // display to onscreen VFD
                            this._controller.dispatchEvent('onWarning', _('RECALL# %S', [check_no]));

                            if (status == 1) {
                                // @todo OSD
                                NotifyUtils.warn(_('This order has been submited!!'));
                            }

                        }else {
                            return -1;
                        }

                    } else if (ord && ord.length > 0) {
                        // AC 2009.04.29
                        var id = ord[0].id;
                        // var id = ord[idx].order_id;

                        var status = ord[0].status;
                        var check_no = ord[0].check_no;

                        if (!this._controller.unserializeFromOrder(id)) {
                            //@todo OSD
                            NotifyUtils.error(_('This order object does not exist [%S]', [id]));
                            return -1
                        }

                        // display to onscreen VFD
                        this._controller.dispatchEvent('onWarning', _('RECALL# %S', [check_no]));

                        if (status == 1) {
                            // @todo OSD
                            NotifyUtils.warn(_('This order is already finalized!'));
                        }
                    } else {
                        // @todo OSD
                        NotifyUtils.warn(_('Can not find the Table# %S !!', [no]));
                    }
                    break;
                case 'AllCheck':
                    // @todo should be rewrite...

                    // var ord = this._tableStatusModel.getCheckList('AllCheck', no);
                    var ord = this.getCheckList('AllCheck', no);

                    if (ord && ord.length > 1) {
                        //
                        // alert(this.dump(ord));

                        var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
                        var screenheight = GeckoJS.Session.get('screenheight') || '600';

                        if (no == 'CheckNo')
                            var aURL = 'chrome://viviecr/content/select_checks.xul';
                        else if (no == 'TableNo')
                            var aURL = 'chrome://viviecr/content/select_tables.xul';

                        var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
                        var inputObj = {
                            checks: ord,
                            excludedOrderId: excludedOrderId
                        };

                        GREUtils.Dialog.openWindow(this._controller.topmostWindow, aURL, 'select_checks', aFeatures, inputObj);

                        if (inputObj.ok && inputObj.index) {
                            var idx = inputObj.index;
                            // return queues[idx].key;

                            // AC 2009.04.29
                            // var id = ord[idx].id;
                            var id = inputObj.order_id;
                            // var id = ord[idx].order_id;

                            var status = ord[idx].status;
                            var check_no = ord[idx].check_no;

                            if (silence) {
                                //
                                // return this._controller.unserializeFromOrder(id);

                            } else {

                                if (!this._controller.unserializeFromOrder(id)) {
                                    //@todo OSD
                                    NotifyUtils.error(_('This order object does not exist [%S]', [id]));
                                    return -1
                                }
                                
                                this._controller.dispatchEvent('afterRecallCheck', this._controller._getTransaction());
                            
                                // display to onscreen VFD
                                if (check_no != null && check_no != '') {
                                    this._controller.dispatchEvent('onWarning', _('RECALLED# %S', [check_no]));
                                }
                                else {
                                    this._controller.dispatchEvent('onWarning', _('ORDER RECALLED'));
                                }

                                if (status == 1) {
                                    // @todo OSD
                                    NotifyUtils.warn(_('This order is already finalized!'));
                                }
                            }
                            return id;

                        }else {
                            return -1
                        }

                    } else if (ord && ord.length > 0) {
                        // AC 2009.04.29
                        var id = ord[0].id;
                        // var id = ord[idx].order_id;

                        var status = ord[0].status;
                        var check_no = ord[0].check_no;

                        if (!this._controller.unserializeFromOrder(id)) {
                            //@todo OSD
                            NotifyUtils.error(_('This order object does not exist [%S]', [id]));
                            return -1
                        }

                        // display to onscreen VFD
                        this._controller.dispatchEvent('onWarning', _('RECALL# %S', [check_no]));

                        if (status == 1) {
                            // @todo OSD
                            NotifyUtils.warn(_('This order is already finalized!'));
                        }
                    } else {
                        // @todo OSD
                        NotifyUtils.warn(_('Can not find the Table# %S !!', [no]));
                    }
                    break;
            }

        },

        transferToOrderNo: function(no) {
            this.transfer('OrderNo', no);
        },

        transferToCheckNo: function(no) {
            this.transfer('CheckNo', no);
        },

        transferToTableNo: function(no) {
            this.transfer('TableNo', no);
        },

        transfer: function(key, no) {
            //this.log("DEBUG", "GuestCheck transfer...key:" + key + ",  no:" + no);
            switch(key) {
                case 'OrderNo':
                    break;
                case 'CheckNo':
                    // this.mergeOrder(no, data);
                    break;
                case 'TableNo':
                    break;
                case 'AllCheck':
                    break;
            }
        },

        doStore: function(oldTransaction) {

            // get checksum if recall == 2
            if (oldTransaction.data.recall == 2) {
                //
                var tableOrderObj = this._tableStatusModel.getTableOrderCheckSum(oldTransaction.data.id);

                if (tableOrderObj.length <= 0) return false;

                var orderModel = new OrderModel();
                var crc = orderModel.getOrderChecksum(oldTransaction.data.id);

                /*
                if (tableOrderIdx[o.id]) {
                    if ((crc == tableOrderIdx[o.id].checksum) || ((o.terminal_no == tableOrderIdx[o.id].terminal_no) && (o.modified >= tableOrderIdx[o.id].modified))) {

                        ordChecked.push(o);

                    }
                }
                */

                // if (crc != tableOrderObj[0].TableOrder.checksum) {
                // if ((crc != tableOrderObj[0].TableOrder.checksum) && !((oldTransaction.data.terminal_no == tableOrderObj[0].TableOrder.terminal_no) && (oldTransaction.data.modified >= tableOrderObj[0].TableOrder.modified))) {
                if ((crc != tableOrderObj[0].TableOrder.checksum) && (oldTransaction.data.terminal_no != tableOrderObj[0].TableOrder.terminal_no)) {
                    GREUtils.Dialog.alert(this._controller.topmostWindow,
                                      _('Order Checksum Fail'),
                                      _('Current order checksum fail and may not be submit. Please retry or check this order.'));

                    // sync database
                    this.syncClient();

                    return false;
                }

                var status = 2;

                if (this._controller.dispatchEvent('beforeSubmit', {
                    status: status,
                    txn: oldTransaction
                })) {

                    oldTransaction.data.status = status;
                    
                        var submitStatus = parseInt(oldTransaction.submit(status));
                        /*
                         *   1: success
                         *   null: input data is null
                         *   -1: save fail, save to backup
                         *   -2: remove fail
                         */
                        if (submitStatus == -2) {

                            GREUtils.Dialog.alert(this._controller.topmostWindow,
                                          _('Submit Fail'),
                                          _('Current order is not saved successfully, please try again...'));
                            return false;
                        }

                    

                    this._controller.dispatchEvent('onStore', oldTransaction);
                    this._controller.dispatchEvent('afterSubmit', oldTransaction);

                }

                return true;
            }
            return false;
        },

        doRecallByCheck: function(order_id) {

                var curTransaction = this.unserializeFromOrder(order_id);

                if (curTransaction == false) {

                    //@todo OSD
                    NotifyUtils.error(_('The order object does not exist [%S]', [order_id]));

                    return false;
                }

                if (curTransaction.data.status == 1) {
                    // @todo OSD
                    NotifyUtils.warn(_('This order is already finalized!'));
                    return false;
                }
                return curTransaction;
            
        },

        doRecall: function(no, excludedOrderId) {
            var ord = this.getCheckList('TableNo', no);

            if (ord && ord.length > 1) {
                //
                // alert(this.dump(ord));

                var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
                var screenheight = GeckoJS.Session.get('screenheight') || '600';

                var aURL = 'chrome://viviecr/content/select_checks.xul';
                var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
                var inputObj = {
                    checks: ord,
                    excludedOrderId: excludedOrderId
                };

                this._controller.topmostWindow.openDialog(aURL, 'select_tables', features, inputObj);

                if (inputObj.ok && inputObj.index) {
                    var idx = inputObj.index;
                    // return queues[idx].key;

                    // AC 2009.04.29
                    var id = ord[idx].id;
                    // var id = ord[idx].order_id;

                    var status = ord[idx].status;
                    var check_no = ord[idx].check_no;

                    var curTransaction = this.unserializeFromOrder(order_id);

                    if (curTransaction == false) {
                        //@todo OSD
                        NotifyUtils.error(_('This order object does not exist [%S]', [id]));
                        return false;
                    }

                    if (status == 1) {
                        // @todo OSD
                        NotifyUtils.warn(_('This order has been submited!!'));
                        return false;
                    }
                    return curTransaction;
                }else {
                    return false;
                }

            } else if (ord && ord.length > 0) {
                // AC 2009.04.29
                var order_id = ord[0].id;
                // var id = ord[idx].order_id;

                var status = ord[0].status;
                var check_no = ord[0].check_no;

                var curTransaction = this.unserializeFromOrder(order_id);

                if (curTransaction == false) {

                    //@todo OSD
                    NotifyUtils.error(_('The order object does not exist [%S]', [order_id]));

                    return false;
                }

                if (status == 1) {
                    // @todo OSD
                    NotifyUtils.warn(_('This order is already finalized!'));
                    return false;
                }
                return curTransaction;
            } else {
                // @todo OSD
                NotifyUtils.warn(_('Can not find the Table# %S !!', [no]));
                return false;
            }
        },

        doTransferByCheck: function(sourceTableNo, targetTableNo, orderId) {
            var curTransaction = null;

            curTransaction = this.doRecallByCheck(orderId);
            // curTransaction = this._controller._getTransaction();

            if (curTransaction) {

                curTransaction.data.table_no = "" + targetTableNo;

                // this.getNewTableNo();
                // this._controller.requestCommand('doRefreshTableStatusLight', null, 'SelectTable');

                if (this.doStore(curTransaction)) {

                    // @todo OSD
                    NotifyUtils.warn(_('This order has been stored!!'));

                }

                this._tableStatusModel.transTable(curTransaction.data, sourceTableNo);

                // dispatch changeclerk event
                // this._controller.dispatchEvent('onStore', curTransaction);
                this._controller.dispatchEvent('onTransTable', curTransaction);

            }

            return true;
        },

        doTransferCheck: function(sourceTableNo, targetTableNo) {

            var curTransaction = null;
            curTransaction = this.doRecall(sourceTableNo);
            // curTransaction = this._controller._getTransaction();

            if (curTransaction) {

                curTransaction.data.table_no = "" + targetTableNo;

                if (this.doStore(curTransaction)) {

                    // @todo OSD
                    NotifyUtils.warn(_('This order has been stored!!'));

                }

                this._tableStatusModel.transTable(curTransaction.data, sourceTableNo);

                // dispatch changeclerk event
                // this._controller.dispatchEvent('onStore', curTransaction);
                this._controller.dispatchEvent('onTransTable', curTransaction);

            }

            return true;
        },

        doChangeClerkByCheck: function(orderId) {
            var curTransaction = null;

            curTransaction = this.doRecallByCheck(orderId);
            // curTransaction = this._controller._getTransaction();

            if (curTransaction) {

                // get login user info...
                var user = new GeckoJS.AclComponent().getUserPrincipal();
                var service_clerk;
                var service_clerk_displayname;
                if ( user != null ) {
                    service_clerk = user.username;
                    service_clerk_displayname = user.description;
                }

                if (service_clerk) {
                    curTransaction.data.service_clerk = service_clerk;
                    curTransaction.data.service_clerk_displayname = service_clerk_displayname;
                }

                if (this.doStore(curTransaction)) {

                    // @todo OSD
                    NotifyUtils.warn(_('This order has been stored!!'));

                }

                this._controller.dispatchEvent('onChangeServiceClerk', curTransaction);

            }

            return true;
        },

        doChangeClerk: function(tableNo) {
            var curTransaction = null;

            curTransaction = this.doRecall(tableNo);
            // curTransaction = this._controller._getTransaction();

            if (curTransaction) {

                // get login user info...
                var user = new GeckoJS.AclComponent().getUserPrincipal();
                var service_clerk;
                var service_clerk_displayname;
                if ( user != null ) {
                    service_clerk = user.username;
                    service_clerk_displayname = user.description;
                }

                if (service_clerk) {
                    curTransaction.data.service_clerk = service_clerk;
                    curTransaction.data.service_clerk_displayname = service_clerk_displayname;
                }

                if (this.doStore(curTransaction)) {

                    // @todo OSD
                    NotifyUtils.warn(_('This order has been stored!!'));

                }

                this._controller.dispatchEvent('onChangeServiceClerk', curTransaction);

            }

            return true;

        },
        
        doSplitCheckByCheck: function(orderId) {
            
            var curTransaction = null;

            curTransaction = this.doRecallByCheck(orderId);
            
            if (curTransaction) {
                var order_id = curTransaction.data.id;
                
                if (this._isAllowSplit(curTransaction)) {
                    var retSplit = this.splitOrder(order_id, curTransaction.data);
                    if ( retSplit == -1) {
                        // clear recall check from cart
                       //  this._controller.cancel(true);

                        return false;
                    } else {

                        // payit
                        return retSplit;

                    }
                } else {
                    // this._controller.cancel(true);
                    return false;
                }
            }
            return true;
        },

        doSplitCheck: function(tableNo) {

            var curTransaction = null;

            curTransaction = this.doRecall(tableNo);

            if (curTransaction) {
                var order_id = curTransaction.data.id;

                if (this._isAllowSplit(curTransaction)) {
                    var retSplit = this.splitOrder(order_id, curTransaction.data);
                    if ( retSplit == -1) {
                        // clear recall check from cart
                       //  this._controller.cancel(true);

                        return false;
                    } else {

                        // payit
                        return retSplit;

                    }
                } else {
                    // this._controller.cancel(true);
                    return false;
                }
            }
            return true;

        },

        doMergeCheckByCheck: function(orderId) {

            var curTransaction = null;

            curTransaction = this.doRecallByCheck(orderId);

            if (curTransaction) {
                var order_id = curTransaction.data.id;

                if (this._isAllowMerge(curTransaction)) {
                    var retMerge = this.mergeOrder(order_id, curTransaction.data);
                    if ( retMerge == -1) {
                        // clear recall check from cart
                       //  this._controller.cancel(true);

                        return false;
                    } else {

                        // payit
                        return retMerge;

                    }
                } else {
                    // this._controller.cancel(true);
                    return false;
                }
            }
            return true;
        },

        doMergeCheck: function(tableNo) {

            var curTransaction = null;

            curTransaction = this.doRecall(tableNo);

            if (curTransaction) {
                var order_id = curTransaction.data.id;

                if (this._isAllowMerge(curTransaction)) {
                    var retMerge = this.mergeOrder(order_id, curTransaction.data);
                    if ( retMerge == -1) {
                        // clear recall check from cart
                       //  this._controller.cancel(true);

                        return false;
                    } else {

                        // payit
                        return retMerge;

                    }
                } else {
                    // this._controller.cancel(true);
                    return false;
                }
            }
            return true;
        },

        doSelectTableNo: function(inputObj) {

            if (inputObj.ok && inputObj.index) {
                // var tables = inputObj.tables;
                // var id = inputObj.order_id;
                // var check_no = inputObj.check_no;
                var tableObj = inputObj.tableObj;

                // var idx = inputObj.index;

                var table_no = tableObj.table_no;

                var destination = tableObj.Table.destination;

                if (table_no >= 0) {

                    var curTransaction = null;
                    curTransaction = this._controller._getTransaction();
                    if (curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel() || curTransaction.isStored()) {

                        this._controller.cancel(true);

                        curTransaction = this._controller._getTransaction(true);
                        if (curTransaction == null) {
                            NotifyUtils.warn(_('fatal error!!'));
                            return; // fatal error ?
                        }
                    }
                    GeckoJS.Session.set('vivipos_fec_table_number', table_no);
                    curTransaction.data.table_no = "" + table_no;

                    // set destination
                    if (destination)
                        this.requestCommand('setDestination', destination, 'Destinations');
                }
            }

            return true;
        },

        doRecallCheck: function(inputObj) {
            //
            if (inputObj.ok && inputObj.index) {
                var tables = inputObj.tables;
                var id = inputObj.order_id;
                var check_no = inputObj.check_no;
                var tableObj = inputObj.tableObj;

                var idx = inputObj.index;
                // var i = tables[idx].table_no;
                var table_no = tableObj.table_no;

                // var id = tables[idx].order_id;
                // var destination = tables[idx].Table.destination;
                var destination = tableObj.Table.destination;

                if (id) {

                    if (!this._controller.unserializeFromOrder(id)) {
                        //@todo OSD
                        NotifyUtils.error(_('This order object does not exist [%S]', [id]));
                        return -1
                    }

                    var curTransaction = null;
                    curTransaction = this._controller._getTransaction();
                    if (curTransaction) {

                        if (curTransaction.data.status == 1) {
                            // @todo OSD
                            NotifyUtils.warn(_('This order is already finalized!'));
                            return -1;
                        }
                    } else {
                        //@todo OSD
                        NotifyUtils.error(_('This order object does not exist [%S]', [id]));
                        return -1
                    }
                } else if (check_no) {
                    this.recallByCheckNo(check_no);
                } else {
                    this.recallByTableNo(i);
                }
                return true;
            }
        },

        unserializeFromOrder: function(order_id) {

            var curTransaction = new Transaction(true); // do not get new sequence
            curTransaction.unserializeFromOrder(order_id);

            if (curTransaction.data == null) {

                return false;
            }

            if (curTransaction.data.status == 2) {
                // set order status to process (0)
                curTransaction.data.status = 0;

                curTransaction.data.recall = 2;
            }

            return curTransaction;

        },

        mergeOrder: function(no, data) {

            //this.log("DEBUG", "GuestCheck merge check...no:" + no);

            var target_id = this.recall('AllCheck', 'CheckNo', true, no);

            if (target_id == -1) return -1;

            var targetCheck = this.unserializeFromOrder(target_id);
            
            // fatal error ??
            if (targetCheck == false) {
                //@todo OSD
                NotifyUtils.error(_('The target order object does not exist [%S]', [target_id]));
                return -1;
            }

            // check if target check allow to be merged...
            if (!this._isAllowMerge(targetCheck)) return -1

            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';
            var aURL = "chrome://viviecr/content/merge_check.xul";
            var aName = "Merge Check";
            var aArguments = "";
            var posX = 0;
            var posY = 0;

            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                targetCheck: targetCheck.data,
                sourceCheck: data
            };

            GREUtils.Dialog.openWindow(this._controller.topmostWindow, aURL, 'merge_checks', aFeatures, inputObj);

            // if (inputObj.ok) {
            if (inputObj.ok && inputObj.payit) {
                // return queues[idx].key;
                var id = inputObj.id;
                var check_no = inputObj.check_no;

                // recall the merged order...
                if (!this._controller.unserializeFromOrder(id)) {
                    //@todo OSD
                    NotifyUtils.error(_('The source order object does not exist [%S]', [target_id]));
                    return -1
                }

                // display to onscreen VFD
                this._controller.dispatchEvent('onWarning', _('RECALL# %S', [check_no]));

                return 1;

            } else if (inputObj.ok) {

                return 2;

            }else {
                // return null;
                if (this._guestCheck.tableSettings.TableWinAsFirstWin) {
                    this._controller.newTable();
                }
                return -1;
            }
        },

        splitOrder: function(no, data) {
            //this.log("DEBUG", "GuestCheck split check...no:" + no);
            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';
            var aURL = "chrome://viviecr/content/split_check.xul";
            var aName = _("Split Check");

            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                sourceCheck: data
            };

            GREUtils.Dialog.openWindow(this._controller.topmostWindow, aURL, aName, aFeatures, inputObj);

            if (inputObj.ok && inputObj.payit) {
                var id = inputObj.id;

                var r = this._controller.unserializeFromOrder(id);
                // fatal error ??
                if (r == false) {
                    //@todo OSD
                    NotifyUtils.error(_('The order object does not exist [%S]', [id]));
                    return -1;
                }


                var check_no = inputObj.check_no

                // display to onscreen VFD
                this._controller.dispatchEvent('onWarning', _('RECALL# %S', [check_no]));

                return 1;

            } else if (inputObj.ok) {

                return 2;

            }else {
                
                return -1;
            }
        },

        reformOrder: function(no) {
            //
        }
    }

    var GuestCheckComponent = window.GuestCheckComponent = GeckoJS.Component.extend(__component__);

})();

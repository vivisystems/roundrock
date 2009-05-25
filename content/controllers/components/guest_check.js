(function() {

    var GuestCheckComponent = window.GuestCheckComponent = GeckoJS.Component.extend({

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

        init: function (c) {
            // inherit Cart controller constructor
            this._super(c);

            // read switch
            this._guestCheck.tableWinAsFirstWin = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.TableWinAsFirstWin') || false;
            this._guestCheck.requireCheckNo = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.RequireCheckNo') || false;
            this._guestCheck.requireTableNo = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.RequireTableNo') || false;
            this._guestCheck.requireGuestNum = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.RequireGuestNum') || false;

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
                // cart.addEventListener('onSubmit', this.handleNewTransaction, this);

                // Cancel
                cart.addEventListener('onCancel', this.handleCancel, this);

                // cart.addEventListener('onClear', this.handleClear, this);

                // Store
                cart.addEventListener('onStore', this.handleNewTransaction, this);

                // ChangeServiceClerk
                cart.addEventListener('onChangeServiceClerk', this.handleChangeServiceClerk, this);

                // TransTable
                cart.addEventListener('onTransTable', this.handleTransTable, this);

                // check table no and guests before submit...
                cart.addEventListener('beforeSubmit', this.handleRequestTableNo, this);
                
            }

            // add listener for afterSubmit event
            var print = GeckoJS.Controller.getInstanceByName('Print');
            if (print) {
                print.addEventListener('afterSubmit', this.handleAfterSubmit, this);
            }

            // add listener for onStartShift event
            /*
            var shiftchange = GeckoJS.Controller.getInstanceByName('ShiftChanges');
            if (shiftchange) {
                shiftchange.addEventListener('onStartShift', this.handleNewTransaction, this);
            }
            */

            // add listener for onStartShift event
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('onFirstLoad', this.handleNewTransaction, this);
            }
            
        },

        handleRequestTableNo: function(evt) {

            if (this._guestCheck.requireTableNo && !evt.data.txn.data.table_no) {
                // NotifyUtils.warn(_('Please set table no first!'));
                // evt.preventDefault();
                // this._controller.newTable();
                this.table(this.selTableNum(''));
            }

            if (this._guestCheck.requireGuestNum && !evt.data.txn.data.no_of_customers) {
                // NotifyUtils.warn(_('Please set table no first!'));
                // evt.preventDefault();
                this.guest('');
            }
        },

        handleTransTable: function(evt) {
            //
            this._tableStatusModel.addCheck(evt.data.data);

            GeckoJS.Session.set('vivipos_guest_check_action', '');

            if (this._guestCheck.tableWinAsFirstWin) {
                    this._controller.newTable();
            }
        },

        handleChangeServiceClerk: function(evt) {
            //
            this._tableStatusModel.addCheck(evt.data.data);

            GeckoJS.Session.set('vivipos_guest_check_action', '');

            if (this._guestCheck.tableWinAsFirstWin) {
                    this._controller.newTable();
            }
        },

        handleStore: function(evt) {
            //
            this._tableStatusModel.addCheck(evt.data.data);

            GeckoJS.Session.set('vivipos_guest_check_action', '');

            if (this._guestCheck.tableWinAsFirstWin) {
                    this._controller.newTable();
            }
        },

        handleAfterSubmit: function(evt) {
            //
            this._tableStatusModel.removeCheck(evt.data.data);

            GeckoJS.Session.set('vivipos_guest_check_action', '');

            if (this._guestCheck.tableWinAsFirstWin) {
                    this._controller.newTable();
            }
        },

        handleCancel: function(evt) {
            //
            GeckoJS.Session.set('vivipos_guest_check_action', '');

            if (this._guestCheck.tableWinAsFirstWin) {
                    this._controller.newTable();
            }
        },

        handleNewTransaction: function(evt) {

            this._guestCheck.tableWinAsFirstWin = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.TableWinAsFirstWin') || false;
            this._guestCheck.requireCheckNo = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.RequireCheckNo') || false;
            this._guestCheck.requireTableNo = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.RequireTableNo') || false;
            this._guestCheck.requireGuestNum = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.RequireGuestNum') || false;

// this.log("DEBUG", "evt.type:" + evt.type);

            if ( evt.type == 'newTransaction') {
                if (this._guestCheck.requireCheckNo) {
                    // if (!GeckoJS.Session.get('vivipos_fec_check_number'))
                        // var check_no = this.getNewCheckNo();
                        this._controller.newCheck(true);
                }
            }
            if (evt.type == 'onFirstLoad' || evt.type == 'onCancel' || evt.type == 'onSubmit' || evt.type == 'onStore' || evt.type == 'afterSubmit' || evt.type == 'onChangeServiceClerk' || evt.type == 'onTransTable') {
                if (evt.type == 'onStore' || evt.type == 'onChangeServiceClerk' || evt.type == 'onTransTable') {
                    this._tableStatusModel.addCheck(evt.data.data);
                }
                if (evt.type == 'afterSubmit') {
                    try {
                        this._tableStatusModel.removeCheck(evt.data.data);
                    } catch(e) {}
                }
                GeckoJS.Session.set('vivipos_guest_check_action', '');

                if (this._guestCheck.tableWinAsFirstWin) {
                    // if (!GeckoJS.Session.get('vivipos_fec_table_number') || evt.type == "onStore" || evt.type == 'onStartShift')
                        // var table_no = this.getNewTableNo();
                        this._controller.newTable();
                }

                /*
                var action = GeckoJS.Session.get('vivipos_guest_check_action');
                if (action == 'SelectTableNo') {
                    if (this._guestCheck.requireGuestNum) {
                        var num = GeckoJS.Session.get('vivipos_fec_number_of_customers') || 1;
                        num = this.selGuestNum(num);
                        this.guest(num);
                        // this._controller.guestNum(num);
                    }
                }
                */
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
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:no, require0:true, numpad:true
            };

            window.openDialog(aURL, _('Select Number of Customers'), features, _('Select Number of Customers'), '', _('Numbers'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                return inputObj.input0;
            }

            return no;

        },

        selTableNum: function (no){

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=440,height=480';
            var inputObj = {
                input0:no, require0:true, numpad:true, disablecancelbtn:true
            };

            window.openDialog(aURL, _('Select Table Number'), features, _('Select Table Number'), '', _('Numbers'), '', inputObj);

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

//            this._tableList = null;
            /*
            var tablelist = this.getTableList();
            if (tablelist.length <= 0) {
                return this.table(this.selTableNum(''));
            }
            */
            // if (this._tableStatusModel.getTableStatusList().length <=0) {
            if (this._tableStatusModel._tableStatusList.length <=0) {
                return this.table(this.selTableNum(''));
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

            return;

            return "" + r;
        },

        doSelectTableFuncs: function(inputObj) {

            if (inputObj.ok && inputObj.index) {
                var tables = inputObj.tables;
                var idx = inputObj.index;
                var i = tables[idx].table_no;
                var id = tables[idx].order_id;
                var destination = tables[idx].table.destination;

                // set action tag to session
                GeckoJS.Session.set('vivipos_guest_check_action', inputObj.action);

                switch (inputObj.action) {
                    case 'RecallCheck':

                        this.recallByTableNo(i);

                        break;
                    case 'SplitCheck':
                        if (this.recallByTableNo(i) != -1) {

                            var curTransaction = null;
                            curTransaction = this._controller._getTransaction();
                            if (curTransaction) {
                                if (this._isAllowSplit(curTransaction)) {

                                    if (this.splitOrder(id, curTransaction.data) == -1) {
                                        // clear recall check from cart
                                        this._controller.cancel(true);
                                    };
                                } else {
                                    this._controller.cancel(true);
                                }
                            }
                        }
                        // this._controller.GuestCheck.getNewTableNo();

                        break;
                    case 'MergeCheck':
                        if (this.recallByTableNo(i) != -1) {

                            var curTransaction = null;
                            curTransaction = this._controller._getTransaction();
                            if (curTransaction) {
                                if (this._isAllowMerge(curTransaction)) {

                                    if (this.mergeOrder(id, curTransaction.data) == -1) {
                                        // clear recall check from cart
                                        this._controller.cancel(true);
                                    };
                                } else {
                                    this._controller.cancel(true);
                                }
                            }
                        }
                        // this._controller.GuestCheck.getNewTableNo();
                        
                        break;
                    case 'SelectTableNo':

                        if (i >= 0) {

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
                            GeckoJS.Session.set('vivipos_fec_table_number', i);
                            curTransaction.data.table_no = "" + i;
                            r = i;

                            // set destination
                            if (destination)
                                this.requestCommand('setDestination', destination, 'Destinations');
                        }
                        break;
                    case 'ChangeClerk':
                        // @todo ChangeClerk must be rewrited...

                        this.recallByTableNo(i);

                        // get login user info...
                        var user = new GeckoJS.AclComponent().getUserPrincipal();
                        var service_clerk;
                        var service_clerk_displayname;
                        if ( user != null ) {
                            service_clerk = user.username;
                            service_clerk_displayname = user.description;
                        }

                        var curTransaction = null;
                        curTransaction = this._controller._getTransaction();
                        if (curTransaction) {
                            if (service_clerk) {
                                curTransaction.data.service_clerk = service_clerk;
                                curTransaction.data.service_clerk_displayname = service_clerk_displayname;
                            }
                            this.store();

                            // clear recall check from cart
                            this._controller.cancel(true);

                            // dispatch changeclerk event
                            // this._controller.dispatchEvent('onStore', curTransaction);
                            this._controller.dispatchEvent('onChangeServiceClerk', curTransaction);
                        }

                        break;
                    case 'MergeTable':

                        break;
                    case 'TransTable':
                        // @todo TransTable must be rewrited...

                        var targetTableNo = Math.round(parseInt(i));
                        var sourceTableNo = inputObj.sourceTableNo;

                        if (this.recallByTableNo(sourceTableNo) != -1) {
                            var curTransaction = null;
                            curTransaction = this._controller._getTransaction();
                            if (curTransaction) {
                                this.table("" + targetTableNo);

                                // update modified time of source table status
                                this._tableStatusModel.touchTableStatus(sourceTableNo);

                                this.store();

                                // clear recall check from cart
                                this._controller.cancel(true);

                                // dispatch changeclerk event
                                // this._controller.dispatchEvent('onStore', curTransaction);
                                this._controller.dispatchEvent('onTransTable', curTransaction);
                            }

                        }
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
                return;
            }

            // GeckoJS.Session.set('vivipos_fec_table_number', i);
            return "";
        },

        table: function(table_no) {

            var r = this._tableStatusModel.getTableNo(table_no);

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
                GeckoJS.Session.set('vivipos_fec_table_number', r);
                curTransaction.data.table_no = r;

                // set destination
                var tables = this._tableStatusModel.getTableStatusList();
                var tableObj = new GeckoJS.ArrayQuery(tables).filter("table_no = '" + r + "'");
                if (tableObj.length > 0) {

                    var destination = tableObj[0].Table.destination;
                    if (destination)
                        this.requestCommand('setDestination', destination, 'Destinations');
                }

            }
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

        getCheckList: function(key, no) {
            //
            var self = this;
            var order = new OrderModel();
            var fields = ['orders.id', 
                          'orders.sequence',
                          'orders.check_no',
                          'orders.table_no',
                          'orders.status',
                          'orders.no_of_customers',
                          'orders.total',
                          'orders.transaction_created',
                          'orders.service_clerk',
                          'orders.service_clerk_displayname',
                          'orders.proceeds_clerk',
                          'orders.proceeds_clerk_displayname'
                      ];
            switch (key) {
                case 'CheckNo':
                    var conditions = "orders.check_no='" + no + "' AND orders.status='2'";
                    break;
                case 'TableNo':
                    var conditions = "orders.table_no='" + no + "' AND orders.status='2'";
                    break;
                case 'AllCheck':
                    var conditions = "orders.status='2'";
                    break;
                case 'OrderNo':
                    var conditions = null;
                    break;
            }
            
            var ord = order.find('all', {fields: fields, conditions: conditions, recursive: 2});

            return ord;
        },

        store: function() {

            this._controller.submit(2);
            this._controller.dispatchEvent('onWarning', _('STORED'));
                
            // @todo OSD
            NotifyUtils.warn(_('This order has been stored!!'));
     
        },

        removeTableStatus: function(checkObj) {
            //
            this._tableStatusModel.removeCheck(checkObj);
        },

        recallByOrderNo: function(no) {
            // this.log("DEBUG", "GuestCheck recall by order_no..." + no);
            if (no)
                return this.recall('OrderNo', no);
            else
                return this.recall('AllCheck', 'OrderNo');
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
            // this.log("DEBUG", "GuestCheck recall...key:" + key + ",  no:" + no);
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

                        this._controller.unserializeFromOrder(id);

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

                        this._controller.unserializeFromOrder(id);

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
                        var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
                        var inputObj = {
                            checks: ord,
                            excludedOrderId: excludedOrderId
                        };

                        window.openDialog(aURL, 'select_tables', features, inputObj);

                        if (inputObj.ok && inputObj.index) {
                            var idx = inputObj.index;
                            // return queues[idx].key;
                            
                            // AC 2009.04.29
                            var id = ord[idx].id;
                            // var id = ord[idx].order_id;

                            var status = ord[idx].status;
                            var check_no = ord[idx].check_no;

                            this._controller.unserializeFromOrder(id);

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

                        this._controller.unserializeFromOrder(id);

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

                        var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
                        var inputObj = {
                            checks: ord,
                            excludedOrderId: excludedOrderId
                        };

                        window.openDialog(aURL, 'select_checks', features, inputObj);

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
                                this._controller.unserializeFromOrder(id);
                                
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

                        this._controller.unserializeFromOrder(id);

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

        unserializeFromOrder: function(order_id) {

            var curTransaction = new Transaction();
            curTransaction.unserializeFromOrder(order_id);
            return curTransaction;

            var order = new OrderModel();
            return order.unserializeOrder(order_id);
        },

        mergeOrder: function(no, data) {

            //this.log("DEBUG", "GuestCheck merge check...no:" + no);

            var target_id = this.recall('AllCheck', 'CheckNo', true, no);

            if (target_id == -1) return -1;

            var targetCheck = this.unserializeFromOrder(target_id);
            // var targetCheck = this._controller._getTransaction();

            // check if target check allow to be merged...
            if (!this._isAllowMerge(targetCheck)) return -1

            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';
            var aURL = "chrome://viviecr/content/merge_check.xul";
            var aName = "Merge Check";
            var aArguments = "";
            var posX = 0;
            var posY = 0;

            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                targetCheck: targetCheck.data,
                sourceCheck: data
            };

            window.openDialog(aURL, 'merge_checks', features, inputObj);

            if (inputObj.ok) {
                // return queues[idx].key;
                var id = inputObj.id;
                var check_no = inputObj.check_no;

                // recall the merged order...
                this._controller.unserializeFromOrder(id);

                // display to onscreen VFD
                this._controller.dispatchEvent('onWarning', _('RECALL# %S', [check_no]));

            }else {
                // return null;
                return -1;
            }
        },

        splitOrder: function(no, data) {
            //this.log("DEBUG", "GuestCheck split check...no:" + no);
            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';
            var aURL = "chrome://viviecr/content/split_check.xul";
            var aName = "Split Check";
            var aArguments = "";
            var posX = 0;
            var posY = 0;

            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                sourceCheck: data
            };

            window.openDialog(aURL, 'split_checks', features, inputObj);

            if (inputObj.ok) {
                var id = inputObj.id;

                this._controller.unserializeFromOrder(id);
                var check_no = inputObj.check_no

                // display to onscreen VFD
                this._controller.dispatchEvent('onWarning', _('RECALL# %S', [check_no]));

            }else {
                return -1
            }
        },

        reformOrder: function(no) {
            //
        }

    });

})();

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
        _checkNoArray: [],
        _tableNoArray: [],
        _guestCheck: {},
        _tableStatusModel: null,

        init: function (c) {
            // inherit Cart controller constructor
            this._super(c);
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
                cart.addEventListener('onCancel', this.handleNewTransaction, this);
                // cart.addEventListener('onClear', this.handleClear, this);
                cart.addEventListener('onStore', this.handleNewTransaction, this);
                
            }

            // add listener for afterSubmit event
            var print = GeckoJS.Controller.getInstanceByName('Print');
            if (print) {
                print.addEventListener('afterSubmit', this.handleNewTransaction, this);
            }

            // add listener for onStartShift event
            var shiftchange = GeckoJS.Controller.getInstanceByName('ShiftChanges');
            if (shiftchange) {
                shiftchange.addEventListener('onStartShift', this.handleNewTransaction, this);
            }
            
        },

        handleNewTransaction: function(evt) {

            this._guestCheck.requireCheckNo = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.RequireCheckNo') || false;
            this._guestCheck.requireTableNo = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.RequireTableNo') || false;
            this._guestCheck.requireGuestNum = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.RequireGuestNum') || false;

this.log("evt.type:" + evt.type);

            if ( evt.type == 'newTransaction') {
                if (this._guestCheck.requireCheckNo) {
                    // if (!GeckoJS.Session.get('vivipos_fec_check_number'))
                        // var check_no = this.getNewCheckNo();
                        this._controller.newCheck(true);
                }
            }
            if (evt.type == 'onStartShift' || evt.type == 'onCancel' || evt.type == 'onSubmit' || evt.type == 'onStore' || evt.type == 'afterSubmit') {
                if (evt.type == 'onStore') {
                    this._tableStatusModel.addCheck(evt.data.data);
                }
                if (evt.type == 'afterSubmit') {
                    try {
                        this._tableStatusModel.removeCheck(evt.data.data);
                    } catch(e) {}
                }
                if (this._guestCheck.requireTableNo) {
                    // if (!GeckoJS.Session.get('vivipos_fec_table_number') || evt.type == "onStore" || evt.type == 'onStartShift')
                        // var table_no = this.getNewTableNo();
                        this._controller.newTable();
                }

                if (this._guestCheck.requireGuestNum) {
                    var num = GeckoJS.Session.get('vivipos_fec_number_of_customers') || 1;
                    num = this.selGuestNum(num);
                    this.guest(num);
                }
            }
        },

        selGuestNum: function (no){

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=400';
            var inputObj = {
                input0:no, require0:true, numpad:true
            };

            window.openDialog(aURL, _('Select Number of Customers'), features, _('Select Number of Customers'), '', _('Numbers'), '', inputObj);

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

        getNewTableNo: function() {
            var self = this;
            var i = 1;

            // get table status
            var tables = this._tableStatusModel.getTableStatusList();

            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';

            var aURL = 'chrome://viviecr/content/select_table.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                tables: tables
            };

            window.openDialog(aURL, 'select_table', features, inputObj);


            if (inputObj.ok && inputObj.index) {
                var idx = inputObj.index;
                i = tables[idx].table_no;
                var id = tables[idx].order_id;

                switch (inputObj.action) {
                    case 'RecallCheck':
                        // alert('RecallCheck...');
                        this.recallByTableNo(i);
                        break;
                    case 'SplitCheck':
                        this.recallByTableNo(i);
                        var curTransaction = null;
                        curTransaction = this._controller._getTransaction();
                        if (curTransaction) {
                            this.splitOrder(id, curTransaction.data);
                        }

                        // alert('SplitCheck...');
                        // var targetCheck = this.unserializeFromOrder(id);
                        // this.splitOrder(id, targetCheck);
                        break;
                    case 'MergeCheck':
                        this.recallByTableNo(i);
                        var curTransaction = null;
                        curTransaction = this._controller._getTransaction();
                        if (curTransaction) {
                            this.mergeOrder(id, curTransaction.data);
                        }
                        // alert('MergeCheck...');
                        // var targetCheck = this.unserializeFromOrder(id);
                        // this.mergeOrder(id, targetCheck);
                        break;
                    case 'SelectTableNo':
                        if (i >= 0) {
                            var curTransaction = null;
                            curTransaction = this._controller._getTransaction();
                            if (curTransaction == null || curTransaction.isSubmit() || curTransaction.isCancel()) {
                                curTransaction = this._controller._getTransaction(true);
                                if (curTransaction == null) {
                                    NotifyUtils.warn(_('fatal error!!'));
                                    return; // fatal error ?
                                }
                            }
                            GeckoJS.Session.set('vivipos_fec_table_number', i);
                            curTransaction.data.table_no = "" + i;

                            // set destination
                            this.requestCommand('setDestination', 'OUT', 'Destinations');
                        }
                        break;
                    case 'ChangeClerk':
                        this.recallByTableNo(i);
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
                        }
                        this.store();
                        this._controller.dispatchEvent('onStore', curTransaction);
                        break;
                    case 'MergeTable':
                        // var holdby = inputObj.sourceTableNo;
                        // alert(holdby);
                        // this._tableStatusModel.holdTable(i, holdby);
                        break;
                    case 'TransTable':
                        var targetTableNo = Math.round(parseInt(i));
                        var sourceTableNo = inputObj.sourceTableNo;

                        this.recallByTableNo(sourceTableNo);
                        var curTransaction = null;
                        curTransaction = this._controller._getTransaction();
                        if (curTransaction) {
                            this.table("" + targetTableNo);
                        }
                        this.store();
                        this._controller.dispatchEvent('onStore', curTransaction);
                        break;
                }
            }else {
                while (i <= 200) {
                    if (!this._tableNoArray[i] || this._tableNoArray[i] == 0) {
                        this._tableNoArray[i] = 1;
                        break;
                    }
                    i++;
                }
            }

            GeckoJS.Session.set('vivipos_fec_table_number', i);
            return "" + i;
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
            GeckoJS.Session.set('vivipos_fec_number_of_customers', num);
            return num;
        },

// @todo must be rewrite...
/*
        destination: function(dest) {
            // this.log("GuestCheck guest..." + num);
            GeckoJS.Session.set('vivipos_fec_order_destination', dest);
        },

        table: function(table_no) {
            // this.log("GuestCheck table..." + table_no);
            var r;
            this.getCheckList('AllCheck', null);
            var allowDupTableNo = true; // @todo for test...
            if (!this._tableNoArray[table_no] || this._tableNoArray[table_no] == 0 || allowDupTableNo) {
                this._tableNoArray[table_no] = 1;
                GeckoJS.Session.set('vivipos_fec_table_number', table_no);
                return table_no;
            } else {
                return -1;
            }

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
            } else {
                NotifyUtils.warn(_('Table# %S is exist!!', [table_no]));
            }
        },

        check: function(check_no) {
            // this.log("GuestCheck check..." + check_no);
            var r;
            this.getCheckList('AllCheck', null);
            if (!this._checkNoArray[check_no] || this._checkNoArray[check_no] == 0) {
                this._checkNoArray[check_no] = 1;
                GeckoJS.Session.set('vivipos_fec_check_number', check_no);
                r = check_no;
            } else {
                r = -1;
            }

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
                NotifyUtils.warn(_('Check# %S is exist!!', [check_no]));
            }
        },
*/
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
            }
            
            this._checkNoArray = [];
            this._tableNoArray = [];

            var ord = order.find('all', {fields: fields, conditions: conditions, recursive: 2});

            ord.forEach(function(o){
                var check_no = o.check_no;
                var table_no = o.table_no;

                if (check_no) {
                    self._checkNoArray[check_no] = 1;
                }

                if (table_no) {
                    self._tableNoArray[table_no] = 1;
                }
            });
//this.log(this.dump(this._checkNoArray));
//this.log(this.dump(this._tableNoArray));
            return ord;
        },

        store: function() {

            this._controller.submit(2);
            this._controller.dispatchEvent('onWarning', _('STORED'));
                
            // @todo OSD
            NotifyUtils.warn(_('This order has been stored!!'));
     
        },

        recallByOrderNo: function(no) {
            // this.log("GuestCheck recall by order_no..." + no);
            if (no)
                this.recall('OrderNo', no);
            else
                this.recall('AllCheck', 'OrderNo');
        },

        recallByCheckNo: function(no) {
            // this.log("GuestCheck recall by check_no..." + no);
            if (no)
                this.recall('CheckNo', no);
            else
                this.recall('AllCheck', 'CheckNo');
        },

        recallByTableNo: function(no) {
            // this.log("GuestCheck recall by table_no..." + no);
            if (no)
                this.recall('TableNo', no);
            else
                this.recall('AllCheck', 'TableNo');
        },

        recall: function(key, no, silence) {
            // this.log("GuestCheck recall...key:" + key + ",  no:" + no);
            switch(key) {
                case 'OrderNo':
                    // @todo not implement...
                    // var ord = this._tableStatusModel.getCheckList('OrderNo', no);
                    var ord = this.getCheckList('CheckNo', no);

                    if (ord && ord.length > 0) {
                        // AC 2009.04.29
                        var id = ord[idx].id;
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
                        var id = ord[idx].id;
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
                    var ord = this.getCheckList('CheckNo', no);

                    if (ord && ord.length > 1) {
                        //
                        // alert(this.dump(ord));

                        var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
                        var screenheight = GeckoJS.Session.get('screenheight') || '600';

                        var aURL = 'chrome://viviecr/content/select_checks.xul';
                        var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
                        var inputObj = {
                            checks: ord
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
                            // return null;
                        }

                    } else if (ord && ord.length > 0) {
                        // AC 2009.04.29
                        var id = ord[idx].id;
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
                            checks: ord
                        };

                        window.openDialog(aURL, 'select_checks', features, inputObj);

                        if (inputObj.ok && inputObj.index) {
                            var idx = inputObj.index;
                            // return queues[idx].key;

                            // AC 2009.04.29
                            var id = ord[idx].id;
                            // var id = ord[idx].order_id;

                            var status = ord[idx].status;
                            var check_no = ord[idx].check_no;

                            if (silence) {
                                //


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
                            // return null;
                        }

                    } else if (ord && ord.length > 0) {
                        // AC 2009.04.29
                        var id = ord[idx].id;
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
            //this.log("GuestCheck transfer...key:" + key + ",  no:" + no);
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
            var order = new OrderModel();
            return order.unserializeOrder(order_id);
        },

        mergeOrder: function(no, data) {

            //this.log("GuestCheck merge check...no:" + no);

            var target_id = this.recall('AllCheck', 'CheckNo', true);

            var targetCheck = this.unserializeFromOrder(target_id);

            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';
            var aURL = "chrome://viviecr/content/merge_check.xul";
            var aName = "Merge Check";
            var aArguments = "";
            var posX = 0;
            var posY = 0;

            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                targetCheck: targetCheck,
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
            }
        },

        splitOrder: function(no, data) {
            //this.log("GuestCheck split check...no:" + no);
            var screenwidth = GeckoJS.Session.get('screenwidth') || '800';
            var screenheight = GeckoJS.Session.get('screenheight') || '600';
            var aURL = "chrome://viviecr/content/split_check.xul";
            var aName = "Split Check";
            var aArguments = "";
            var posX = 0;
            var posY = 0;

            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                sourceCheck: data,
                usedCheckNo: this._checkNoArray
            };

            window.openDialog(aURL, 'split_checks', features, inputObj);

            if (inputObj.ok) {
                var id = inputObj.id;

                this._controller.unserializeFromOrder(id);
                var check_no = inputObj.check_no

                // display to onscreen VFD
                this._controller.dispatchEvent('onWarning', _('RECALL# %S', [check_no]));

            }else {
                // return null;
            }
        },

        reformOrder: function(no) {
            //
        }

    });

})();

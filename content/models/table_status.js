(function() {

    /**
     * TableStatus Model
     */
    var __model__ = {

        name: 'TableStatus',

//        behaviors: ['Sync'],

        _checkNoArray: [],
        _tableNoArray: [],
        _guestCheck: null,
        _checkList: null,
        _tableList: null,
        _tableStatusList: null,

        initial: function (c) {
            // this._super(c);
GREUtils.log("table status initialize...");

            this._checkList = GeckoJS.Session.get('vivipos_fec_guest_check_check_list');
            this._tableList = GeckoJS.Session.get('vivipos_fec_guest_check_table_list');
            this._tableStatusList = GeckoJS.Session.get('vivipos_fec_guest_check_table_status_list');
            if (!this._tableStatusList) {
GREUtils.log("in table status initialize...");
                this.getTableList();
                this.getCheckList("AllCheck");
                this.getTableStatusList();
            }
        },

/*
        initial: function() {

            this.view = null,

            this.data = {

                id: '',
                items: {},
                table_no: 0,
                table_name: '',
                region: '',
                seats: 0,
                active: false,
                tag: '',
                booking: {},
                status: 0,
                created: '',
                modified: ''
            };

            this.create();


        },
*/
        serialize: function() {
            // @todo 
            return GeckoJS.BaseObject.serialize(this.data);
        },

        unserialize: function(data) {
            // @todo
            this.data = GeckoJS.BaseObject.unserialize(data);
        },

        resetCheckNoArray: function() {
            //
            var self = this;
            this._checkNoArray = [];
            this._checkList.forEach(function(o){
                self._checkNoArray[o.check_no] = 1;
            });
        },

        getNewCheckNo: function() {
GREUtils.log("getNewCheckNo...");
            this.resetCheckNoArray();
            var i = 1;
            var cnt = 0;
            var maxCheckNo = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.MaxCheckNo') || 999;
            // var ar = this.getCheckList('AllCheck', null);
            var ar = this._checkList;
            while (true) {
                i = SequenceModel.getSequence('check_no');
GREUtils.log("in getNewCheckNo:" + i);
                if (i > maxCheckNo) {
                    i = 0;
                    SequenceModel.resetSequence('check_no');
                } else if (!this._checkNoArray[i] || this._checkNoArray[i] == 0) {
                    this._checkNoArray[i] = 1;
                    GeckoJS.Session.set('vivipos_fec_check_number', i);
                    return "" + i;
                    break;
                }

                if (cnt++ > maxCheckNo) {
                    // @todo OSD
                    NotifyUtils.error(_('Can not get new check no!!'));
                    return "";
                    break;
                } ;
            }
        },

        getTableStatusList: function(reload) {
GREUtils.log("getTableStatusList...");
            if (!reload) {
                var tables = GeckoJS.Session.get('vivipos_fec_guest_check_table_status_list');
                if (tables) {
                    GREUtils.log("getTableStatusList from session...");
                    GREUtils.log(GeckoJS.BaseObject.dump(tables));
                    return tables;
                }
            }
            var self = this;
            var i = 1;
            // var ar = this.getCheckList('AllCheck', null);
            var ar = this._checkList;

            var tableList = this._tableList;
            var tables = [];

            tableList.forEach(function(o){
                tables[o.table_no] = GeckoJS.BaseObject.clone(o);
            });

            ar.forEach(function(o) {
                if (o.table_no) {
                    if (tables[o.table_no]) {
                        if (tables[o.table_no].sequence) {
                            // multi checks in the same table...
                            tables[o.table_no].checks += 1;
                            tables[o.table_no].guests += Math.round(parseInt(o.no_of_customers));
                        } else {
                            tables[o.table_no].sequence = o.sequence;
                            tables[o.table_no].check_no = o.check_no;
                            tables[o.table_no].total = o.total;
                            tables[o.table_no].no_of_customers = o.no_of_customers;
                            tables[o.table_no].checks = 1;
                            tables[o.table_no].transaction_created = o.transaction_created;
                            tables[o.table_no].order_id = o.id;
                            tables[o.table_no].clerk = o.service_clerk_displayname;

                            tables[o.table_no].guests = Math.round(parseInt(o.no_of_customers));
                            // tables[o.table_no - 1].table_label = o.table_name;

                            tables[o.table_no].holdby = o.holdby;
                        }
                    } else {
                        GREUtils.log("error tables object...");
                        GREUtils.log(GeckoJS.BaseObject.dump(o));
                    }
                }
            });

            var tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};
            var min = tableSettings.TableRemindTime || 120;
            var start_time = Math.round(Date.now().addMinutes(-min) / 1000);
            var end_time = Math.round(Date.now().addMinutes(min) / 1000);
            var conditions = "table_bookings.booking>='" + start_time +
                            "' AND table_bookings.booking<='" + end_time +
                            "'";
            var bookingModel = new TableBookingModel();
            var bookings = bookingModel.find('all', {conditions: conditions});

            bookings.forEach(function(o){
                tables[o.table_no].booking = o;
            });

            tables.forEach(function(tableObj){
                var table_no = tableObj.table_no;
                self.setTableStatus(table_no, tableObj);
            });

// GREUtils.log(GeckoJS.BaseObject.dump(tables));
            GeckoJS.Session.set('vivipos_fec_guest_check_table_status_list', tables);
            return tables;
        },

        getCheckNo: function() {
            //
        },

        getTableNo: function(table_no) {
            //
            if (table_no) {
                this._tableNoArray[table_no] = 1;
            }
            return table_no;
        },

        getTableList: function(reload) {
GREUtils.log("getTableList...");
            if (!reload) {
                var tables = GeckoJS.Session.get('vivipos_fec_guest_check_table_list');
                if (tables) {
                    GREUtils.log("getTableList from session...");
                    return tables;
                }
            }
            var tableModel = new TableModel();
            var tableList = tableModel.find('all', {});

            GeckoJS.Session.set('vivipos_fec_guest_check_table_list', tableList);

            return this._tableList = tableList;
        },

        getCheckList: function(key, no, reload) {
GREUtils.log("getCheckList...");
            if (!reload) {
                var checks = GeckoJS.Session.get('vivipos_fec_guest_check_check_list');
                if (checks) {
                    GREUtils.log("getCheckList from session...");
                    var orders = [];
                    switch (key) {
                        case 'OrderNo':
                        case 'AllCheck':
                            // @todo
                            checks.forEach(function(o){
                                orders.push(o);
                            });
                            return orders;
                            break;
                        case 'CheckNo':
                            checks.forEach(function(o){
                                if (o.check_no == no) orders.push(o);
                            });
                            return orders;
                            break;
                        case 'TableNo':
                            checks.forEach(function(o){
                                if (o.table_no == no) orders.push(o);
                            });
                            return orders;
                            break;
                    }
                    return checks;
                }
            }
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

            var ord = order.find('all', {fields: fields, conditions: conditions, recursive: 0});

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

            GeckoJS.Session.set('vivipos_fec_guest_check_check_list', ord);

            return this._checkList = ord;
        },

        addCheck: function(checkObj) {
            //
GREUtils.log("add check...");
            var isNewCheck = true;
            var newCheck = null;
            this._checkList.forEach(function(o){
                if (o.check_no == checkObj.check_no) {

                    o.check_no = checkObj.check_no;
                    o.table_no = checkObj.table_no;
                    o.status = checkObj.status;
                    o.no_of_customers = checkObj.no_of_customers;
                    o.total = checkObj.total;
                    o.transaction_created = checkObj.transaction_created;
                    o.service_clerk = checkObj.service_clerk;
                    o.service_clerk_displayname = checkObj.service_clerk_displayname;
                    o.proceeds_clerk = checkObj.proceeds_clerk;
                    o.proceeds_clerk_displayname = checkObj.proceeds_clerk_displayname;

                    isNewCheck = false;
                } else {

                    newCheck = {};
                    newCheck.id = checkObj.id;
                    newCheck.sequence = checkObj.seq;
                    newCheck.check_no = checkObj.check_no;
                    newCheck.table_no = checkObj.table_no;
                    newCheck.status = checkObj.status;
                    newCheck.no_of_customers = checkObj.no_of_customers;
                    newCheck.total = checkObj.total;
                    var now = Math.round(new Date().getTime() / 1000) - 1;
                    newCheck.transaction_created = now; //checkObj.transaction_created;
                    newCheck.service_clerk = checkObj.service_clerk;
                    newCheck.service_clerk_displayname = checkObj.service_clerk_displayname;
                    newCheck.proceeds_clerk = checkObj.proceeds_clerk;
                    newCheck.proceeds_clerk_displayname = checkObj.proceeds_clerk_displayname;

                    isNewCheck = true;
                }
            });
            if (isNewCheck && newCheck) {
                this._checkList.push(newCheck);
            }

            if (checkObj.check_no) {
                this._checkNoArray[checkObj.check_no] = 1;
            }

            if (checkObj.table_no) {
                this._tableNoArray[checkObj.table_no] = 1;
            }

            GeckoJS.Session.set('vivipos_fec_guest_check_check_list', this._checkList);

            var tableObj = {};

            this.setTableStatus(tableObj.table_no, tableObj);

            this.getTableStatusList(true);
        },

        removeCheck: function(checkObj) {
GREUtils.log("remove check...");
            var i = 0;
            var idx = -1;
            this._checkList.forEach(function(o){
                if (checkObj.seq == o.sequence) {
                    idx = i;
                }
                i++;
            });
            if (idx != -1) {
                this._checkList.splice(idx, 1);
                GeckoJS.Session.set('vivipos_fec_guest_check_check_list', this._checkList);

                this.getTableStatusList(true);
                
                return checkObj;
            }
            return null;
        },

        holdTable: function(table_no, holdby) {
GREUtils.log("hold table...");
            this._tableList.forEach(function(o){
                if (o.table_no == table_no) {
                    o.holdby = holdby;
                }
            });
            
            GeckoJS.Session.set('vivipos_fec_guest_check_table_list', this._tableList);
            var list = this.getTableStatusList(true);
            return list;
        },

        getTableStatus: function(table_no) {
            //
            return this._tableStatusList[table_no];
        },

        setTableStatus: function(table_no, tableObj) {
            return;
            //
            GREUtils.log(GeckoJS.BaseObject.dump(tableObj));
            // return this._tableStatusList[table_no] = GeckoJS.BaseObject.clone(tableObj);
            
            var tableStatusNewObj = {};
            var order_id = tableObj.order_id;
            var conditions = "table_statuses.order_id='" + order_id + "'";
            var tableStatusObj = this.find('first', {conditions: conditions});
            if (tableStatusObj) {
                this.id = tableStatusObj.id;
                var table_obj = GeckoJS.BaseObject.serialize(tableObj.Table);
                var order_obj = GeckoJS.BaseObject.serialize(tableObj.Order);
                tableStatusNewObj = {
                    order_id: tableObj.order_id,
                    check_no: tableObj.check_no,
                    table_no: tableObj.table_no,
                    sequence: tableObj.sequence,
                    guests: tableObj.no_of_customers,
                    holdby: tableObj.holdby,
                    clerk: tableObj.clerk,
                    booking: tableObj.booking,
                    lock: false,
                    status: 1,
                    table_object: table_obj,
                    order_object: order_obj
                };
            } else {
                this.id = '';
                var table_obj = GeckoJS.BaseObject.serialize(tableObj.Table);
                var order_obj = GeckoJS.BaseObject.serialize(tableObj.Order);
                tableStatusNewObj = {
                    order_id: tableObj.order_id,
                    check_no: tableObj.check_no,
                    table_no: tableObj.table_no,
                    sequence: tableObj.sequence,
                    guests: tableObj.no_of_customers,
                    holdby: tableObj.holdby,
                    clerk: tableObj.clerk,
                    booking: tableObj.booking,
                    lock: false,
                    status: 1,
                    table_object: table_obj,
                    order_object: order_obj
                };
            }

            this.save(tableStatusNewObj);
        }

    };

    

    var TableStatusModel = window.TableStatusModel = GeckoJS.Model.extend(__model__);

})();

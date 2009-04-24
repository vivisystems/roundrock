(function() {

    /**
     * TableStatus Model
     */
    var __model__ = {

        name: 'TableStatus',

        hasMany: ['TableStatusOrder', 'TableBooking'],

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

//            this._checkList = GeckoJS.Session.get('vivipos_fec_guest_check_check_list');
//            this._tableList = GeckoJS.Session.get('vivipos_fec_guest_check_table_list');
//            this._tableStatusList = GeckoJS.Session.get('vivipos_fec_guest_check_table_status_list');
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
            var self = this;

            // read all order status
            var tableStatus = this.find('all', {});

            // set checklist
            this._checkList = tableStatus.concat([]);

            // gen tables status
            var tables = [];
            tableStatus.forEach(function(o) {
                if (o.order_id) {
                    if (o.table_no) {
                        if (tables[o.table_no]) {
                            //
                            tables[o.table_no].checks += 1;
                            tables[o.table_no].guests += Math.round(parseInt(o.guests));

                        } else {
                            tables[o.table_no] = GeckoJS.BaseObject.clone(o);
                            tables[o.table_no].checks = 1;
                            tables[o.table_no].guests = Math.round(parseInt(o.guests));
                            tables[o.table_no].order = [];
                        }
                        tables[o.table_no].table = GeckoJS.BaseObject.unserialize(tables[o.table_no].table_object);
                        // tables[o.table_no].order = GeckoJS.BaseObject.unserialize(tables[o.table_no].order_object);
                        tables[o.table_no].order.push( GeckoJS.BaseObject.unserialize(o.order_object));
                    }
                } else {
                    if (o.table_no) {
                        tables[o.table_no] = GeckoJS.BaseObject.clone(o);
                        // tables[o.table_no]
                    }
                }

            });

            // add empty tables...
            self._tableList.forEach(function(o){
                if (tables[o.table_no] == null && o.active) {
                    tables[o.table_no] = {
                        order_id: '',
                        check_no: '',
                        table_no: o.table_no,
                        sequence: '',
                        guests: 0,
                        holdby: o.holdby,
                        clerk: '',
                        booking: 0,
                        lock: false,
                        status: 0,
                        terminal_no: '',

                        table_object: null,
                        order_object: null
                    };
                    tables[o.table_no].table = GeckoJS.BaseObject.clone(o);
                }
            });

            // read booking info
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

            this._tableStatusList = tables;
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
reload = true;
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

//            return this._checkList;
            var checks = this._checkList;
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
            return this._checkList;

GREUtils.log("getCheckList...");
reload = true;

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
GREUtils.log("add check...");
            var tableObj = {
                order_id: checkObj.id,
                check_no: checkObj.check_no,
                table_no: checkObj.table_no,
                sequence: checkObj.seq,
                guests: checkObj.no_of_customers,
                holdby: '',
                clerk: checkObj.service_clerk,
                booking: 0,
                lock: false,
                status: 0,
                terminal_no: checkObj.terminal_no,

                table_object: this._tableList[checkObj.table_no - 1],
                order_object: checkObj
            };
            this.setTableStatus(tableObj.table_no, tableObj);

            this.getTableStatusList(true);
        },

        removeCheck: function(checkObj) {
            var i = 0;
            var order_id = checkObj.id;
            var tableObj = {
                order_id: order_id,
                check_no: '',
                table_no: '',
                sequence: '',
                guests: 0,
                holdby: '',
                clerk: '',
                booking: 0,
                lock: false,
                status: 0,
                terminal_no: '',

                table_object: null,
                order_object: null
            };

            // this.setTableStatus(tableObj.table_no, tableObj);
            this.setTableStatus("Delete Table Status::::", tableObj);
            this.getTableStatusList(true);

            return checkObj;

        },

        holdTable: function(table_no, holdby) {
// GREUtils.log("hold table...");
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
// GREUtils.log("******setTableStatus:" + table_no || "");
            
            var tableStatusNewObj = {};
            var order_id = tableObj.order_id;
            var conditions = "table_statuses.order_id='" + order_id + "'";
            var tableStatusObj = this.find('first', {conditions: conditions});

            if (tableStatusObj) {
                this.id = tableStatusObj.id;
                var table_obj = GeckoJS.BaseObject.serialize(tableObj.table_object);
                var order_obj = GeckoJS.BaseObject.serialize(tableObj.order_object);
                tableStatusNewObj = {
                    order_id: tableObj.order_id,
                    check_no: tableObj.check_no,
                    table_no: tableObj.table_no,
                    sequence: tableObj.sequence,
                    guests: tableObj.guests,
                    holdby: tableObj.holdby,
                    clerk: tableObj.clerk,
                    booking: tableObj.booking,
                    lock: false,
                    status: 1,
                    terminal_no: tableObj.terminal_no,
                    table_object: table_obj,
                    order_object: order_obj
                };

                if (tableObj.sequence == '') {
                    this.del(tableObj.id);
                    var cond = "table_status_id='" + tableStatusObj.id + "'";
                    this.TableStatusOrder.delAll(cond);
                } else {
                    var retObj = this.save(tableStatusNewObj);
                    var order = {
                        table_status_id: retObj.id,
                        order_object: order_obj
                    };
                    this.TableStatusOrder.id = '';
                    this.TableStatusOrder.save(order);
                }
            } else {
                
                this.id = '';
                var table_obj = GeckoJS.BaseObject.serialize(tableObj.table_object);
                var order_obj = GeckoJS.BaseObject.serialize(tableObj.order_object);
                tableStatusNewObj = {
                    order_id: tableObj.order_id,
                    check_no: tableObj.check_no,
                    table_no: tableObj.table_no,
                    sequence: tableObj.sequence,
                    guests: tableObj.guests,
                    holdby: tableObj.holdby,
                    clerk: tableObj.clerk,
                    booking: tableObj.booking,
                    lock: false,
                    status: 1,
                    table_object: table_obj,
                    order_object: order_obj
                };
                if (tableObj.sequence != '') {
                    var retObj = this.save(tableStatusNewObj);
                    var order = {
                        table_status_id: retObj.id,
                        order_object: order_obj
                    };
                    this.TableStatusOrder.id = '';
                    this.TableStatusOrder.save(order);
                }
            }
        }
    };

    var TableStatusModel = window.TableStatusModel = GeckoJS.Model.extend(__model__);

})();

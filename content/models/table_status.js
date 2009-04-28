(function() {

    /**
     * TableStatus Model
     */
    var __model__ = {

        name: 'TableStatus',

        hasMany: ['TableBooking'],

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

    getRemoteService: function(method) {
        this.syncSettings = (new SyncSetting()).read();

        if (this.syncSettings && this.syncSettings.active == 1) {

            //  http://localhost:3000/sequences/getSequence/check_no
            // check connection status
            this.url = this.syncSettings.protocol + '://' +
                        this.syncSettings.hostname + ':' +
                        this.syncSettings.port + '/' +
                        'sequences/' + method;

            this.username = 'vivipos';
            this.password = this.syncSettings.password ;

            return this.url;

        }else {
            return false;
        }
    },

    requestRemoteService: function(url, key, value) {

                    var reqUrl = url + '/' + key;

                    if (value != null) reqUrl += '/' + value;

                    var username = this.username ;
                    var password = this.password ;

                    var req = new XMLHttpRequest();

                    req.mozBackgroundRequest = true;

                    /* Request Timeout guard */
                    /*
                    var timeout = null;
                    timeout = setTimeout(function() {
                        clearTimeout(timeout);
                        req.abort();
                    }, 15000);
                    */
                    /* Start Request with http basic authorization */
                    var seq = -1;
                    req.open('GET', reqUrl, false, username, password);
                    var onstatechange = function (aEvt) {
                        if (req.readyState == 4) {
                            if(req.status == 200) {
                                var result = GeckoJS.BaseObject.unserialize(req.responseText);
                                if (result.status == 'ok') {
                                    seq = result.value;
                                }else {
                                    seq = -1;
                                }
                            }else {
                                seq = -1;
                            }
                        }
                        delete req;
                    };

                    // req.onreadystatechange = onstatechange
                    req.send(null);
                    onstatechange();
                    return seq;

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
        //@todo rack
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
        // @todo rack

            // read all order status
            var tableStatus = this.find('all', {});
            
            return this.genTablesArray(tableStatus);
        },

        genTablesArray: function(tableStatus) {

            var self = this;
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

            // read booking info,
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
        },

        genTableStatusObj: function(tableObj) {
            var tableStatusObj = {};

            var table_obj = GeckoJS.BaseObject.serialize(tableObj.table_object);
            var order_obj = GeckoJS.BaseObject.serialize(tableObj.order_object);
            tableStatusObj = {
                id: tableObj.id,
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

            return tableStatusObj;
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
            this.setTableStatus( this.genTableStatusObj(tableObj));

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
            this.setTableStatus( this.genTableStatusObj( tableObj));
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
        // @todo rack
            return this._tableStatusList[table_no];
        },

        setTableStatus: function(tableStatusObj) {
        // @todo rack
            var tableStatusNewObj = {};
            var order_id = tableStatusObj.order_id;
            var conditions = "table_statuses.order_id='" + order_id + "'";
            var tableStatusObjTmp = this.find('first', {conditions: conditions});

            // tableStatus record exist
            if (tableStatusObjTmp) {

                if (tableStatusObj.sequence == '') {
                    // remove tableStatus record
                    this.del(tableStatusObjTmp.id);
                } else {
                    // update tableStatus record
                    this.id = tableStatusObjTmp.id;
                    var retObj = this.save(tableStatusObj);
                }
            } else {
                if (tableStatusObj.sequence != '') {
                    // add new tableStatus record
                    this.id = '';
                    var retObj = this.save(tableStatusObj);
                }
            }
        }
    };

    var TableStatusModel = window.TableStatusModel = GeckoJS.Model.extend(__model__);

})();

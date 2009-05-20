(function() {

    /**
     * TableStatus Model
     */
    var __model__ = {

        name: 'TableStatus',

        useDbConfig: 'table',

        belongsTo: ['Table'],

        hasMany: ['TableBooking', 'TableOrder'],

        behaviors: ['Sync'], // for local use when connect master fail...

        _checkNoArray: [],
        _tableNoArray: [],
        _guestCheck: null,
        _checkList: null,
        _tableList: null,
        _tableStatusList: null,

        initial: function (c) {
            // this._super(c);

            //            this._checkList = GeckoJS.Session.get('vivipos_fec_guest_check_check_list');
            //            this._tableList = GeckoJS.Session.get('vivipos_fec_guest_check_table_list');
            //            this._tableStatusList = GeckoJS.Session.get('vivipos_fec_guest_check_table_status_list');
            if (!this._tableStatusList) {
                this.getTableList();
                this.getCheckList("AllCheck");
                this.getTableStatusList();
            }
        },

        getRemoteService: function(method) {
            this.syncSettings = (new SyncSetting()).read();

            if (this.syncSettings && this.syncSettings.active == 1) {

                var hostname = this.syncSettings.table_hostname || 'localhost';
                if (hostname == 'localhost' || hostname == '127.0.0.1') return false;
                
                //  http://localhost:3000/sequences/getSequence/check_no
                // check connection status
                this.url = this.syncSettings.protocol + '://' +
                hostname + ':' +
                this.syncSettings.port + '/' +
                'table_status/' + method;

                this.username = 'vivipos';
                this.password = this.syncSettings.password ;

                //dump('table services url ' + this.url + "\n");

                return this.url;

            }else {
                return false;
            }
        },

        requestRemoteService: function(method, url, value) {

            var reqUrl = url ;

            var username = this.username ;
            var password = this.password ;

            // for use asynchronize mode like synchronize mode
            // mozilla only
            var reqStatus = {};
            reqStatus.finish = false;

            var req = new XMLHttpRequest();

            req.mozBackgroundRequest = true;

            /* Request Timeout guard */
            var timeout = null;
            timeout = setTimeout(function() {
                try {
                    req.abort();
					
                }catch(e) {
                    // dump('timeout exception ' + e + "\n");
                }
            }, 15000);

            /* Start Request with http basic authorization */
            var data = [];

            req.open(method, reqUrl, true/*, username, password*/);
            
            req.setRequestHeader('Authorization', 'Basic ' + btoa(username +':'+password));

            req.onreadystatechange = function (aEvt) {
                if (req.readyState == 4) {
                    reqStatus.finish = true;
                    if(req.status == 200) {
                        var result = GeckoJS.BaseObject.unserialize(req.responseText);
                        if (result.status == 'ok') {
                            data = result.value;
                        }
                    }
                }
            };

            // req.onreadystatechange = onstatechange
            var request_data = null;
            if(method == 'POST') {
                req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                req.setRequestHeader("Content-length", "request_data=".length + value.length);
                req.setRequestHeader("Connection", "close");
                request_data = "request_data="+value;
            }

            try {
                // Bypassing the cache
                req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;

                req.send(request_data);
                
                // block ui until request finish or timeout
                var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                while(!reqStatus.finish) {
                    thread.processNextEvent(true);
                }


            }catch(e) {
                data = [];
                // dump('send exception ' + e + "\n");
            }finally {
                if(timeout) clearTimeout(timeout);
                if(req)                 delete req;
                if (reqStatus) delete reqStatus;
            }
            return data;

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

        getNewCheckNo: function(no) {
            //@todo rack
            this.resetCheckNoArray();
            var i = 1;
            var cnt = 0;
            var maxCheckNo = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.MaxCheckNo') || 999;

            // minimize maxCheckNo is 30
            maxCheckNo = Math.max(maxCheckNo, 30);

            // var ar = this.getCheckList('AllCheck', null);
            var ar = this._checkList;
            if (no) {
                if (!this._checkNoArray[no] || this._checkNoArray[no] == 0) {
                    this._checkNoArray[no] = 1;
                    // GeckoJS.Session.set('vivipos_fec_check_number', no);
                    return "" + no;
                } else {
                    // @todo OSD
                    // NotifyUtils.error(_('Can not get new check no [%S]!!', [no]));
                    return -1;
                }
            } else {
                while (true) {
                    i = SequenceModel.getSequence('check_no');

                    if (i > maxCheckNo) {
                        i = 0;
                        SequenceModel.resetSequence('check_no');
                    } else if (!this._checkNoArray[i] || this._checkNoArray[i] == 0) {
                        this._checkNoArray[i] = 1;
                        // GeckoJS.Session.set('vivipos_fec_check_number', i);
                        return "" + i;
                        break;
                    }

                    if (cnt++ > maxCheckNo) {
                        // @todo OSD
                        // NotifyUtils.error(_('Can not get new check no!!'));
                        return -1;
                        break;
                    }
                }
            }
        },

        getTableStatusList: function(reload) {
GREUtils.log("getTableStatusList...");
            var remoteUrl = this.getRemoteService('getTableStatusList');
            var tableStatus = null;
GREUtils.log('remoteUrl:' + remoteUrl);
            if (remoteUrl) {
                try {
                    tableStatus = this.requestRemoteService('GET', remoteUrl, null);
GREUtils.log('tableStatus:' + tableStatus);
                }catch(e) {
                    tableStatus = [];
                }

            }else {
                // read all order status
                /*
                var fields = ['tables.table_no',
                            'tables.table_name',
                            'tables.seats',
                            'tables.active',
                            'tables.tag',
                            'tables.destination',
                            'table_regions.name AS "Table.region"',
                            'tables.table_region_id',
                            'table_regions.image AS "Table.image"',
                            'table_maps.id AS "Table.map_id"'
                        ];
                */
                var fields = null;
                tableStatus = this.find('all', {fields: fields, recursive: 2});
GREUtils.log("getTableStatusList...");
// GREUtils.log(GeckoJS.BaseObject.dump(tableStatus));
            }
            
            return this.genTablesArray(tableStatus);
        },

        genTablesArray: function(tableStatus) {
            var self = this;
            // set checklist
            this._checkList = tableStatus.concat([]);
GREUtils.log("genTablesArray:::");
            // gen tables status
            var tables = [];
            tableStatus.forEach(function(o) {
                o.seats = o.Table.seats;
                o.table_name = o.Table.table_name;
                o.guests = 0;
                o.checks = o.TableOrder ? o.TableOrder.length : 0;
                if (o.checks > 0) {
                    o.TableOrder.forEach(function(orderObj){
                        var guests = Math.round(parseInt(orderObj.guests)) || 0;
GREUtils.log("guests:::" + guests);
                        o.guests = o.guests + guests;
                    });
                    o.clerk = o.TableOrder[0].clerk;
                    o.total = o.TableOrder[0].total;
                    o.check_no = o.TableOrder[0].check_no;
                    o.sequence = o.TableOrder[0].sequence;
GREUtils.log("dump o:::");
GREUtils.log(GeckoJS.BaseObject.dump(o));
                };

                if (o.TableBooking && o.TableBooking.length > 0) {
                    o.booking = o.TableBooking[0].booking;
                }

                tables.push(o);
            });
GREUtils.log("dump tables:::");
GREUtils.log(GeckoJS.BaseObject.dump(tables));
            return tables;

            // add empty tables...
            self.getTableList();
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
            var bookings = bookingModel.find('all', {
                conditions: conditions
            });

            bookings.forEach(function(o){
                tables[o.table_no].booking = o;
            });

            this._tableStatusList = tables;
            return tables;
        },

        genTablesArray2: function(tableStatus) {

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
                        if (o.order_object)
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
            self.getTableList();
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
            var bookings = bookingModel.find('all', {
                conditions: conditions
            });

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
            // GREUtils.log("DEBUG", "getTableList...");
            reload = true;
            if (!reload) {
                var tables = GeckoJS.Session.get('vivipos_fec_guest_check_table_list');
                if (tables) {
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
                // GREUtils.log("DEBUG", "getCheckList from session...");
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

//            var table_obj = GeckoJS.BaseObject.serialize(tableObj.table_object);
//            var order_obj = GeckoJS.BaseObject.serialize(tableObj.order_object);

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
                status: tableObj.status,
                terminal_no: tableObj.terminal_no,

                table_id: tableObj.table_id,
                total: tableObj.total,
                table_status_id: tableObj.table_status_id

//                table_object: table_obj,
//                order_object: order_obj
            };

            return tableStatusObj;
        },

        addCheck: function(checkObj) {
            // GREUtils.log("DEBUG", "add check...");
            this.getTableList();
            var index = -1;
            var i = 0;
            this._tableList.forEach(function(o){
                //
                if (o.table_no == checkObj.table_no) {
                    index = i;
                }
                i++;
            })
            var tableObj = {
                order_id: checkObj.id,
                check_no: checkObj.check_no,
                table_no: checkObj.table_no,
                sequence: "" + checkObj.seq,
                guests: checkObj.no_of_customers,
                holdby: '',
                clerk: checkObj.service_clerk,
                booking: 0,
                lock: false,
                status: 0,
                terminal_no: checkObj.terminal_no,

                total: checkObj.total,

                table_id: (index > -1) ? this._tableList[index].id : '',
                table_status_id: (index > -1) ? this._tableList[index].TableStatus.id : '',

//                table_object: this._tableList[checkObj.table_no - 1],
//                order_object: checkObj
            };
            this.setTableStatus( this.genTableStatusObj(tableObj));

            this.getTableStatusList(true);
        },

        removeCheck: function(checkObj) {
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

        holdTable: function(table_no, holdTable) {
            // GREUtils.log("DEBUG", "hold table...");
            /*
            this._tableList.forEach(function(o){
                if (o.table_no == table_no) {
                    o.holdby = holdby;
                }
            });
            */

            var sourceTable = holdTable || {};
            var holdby = sourceTable.table_no;
            if (sourceTable.status == -1) holdby = sourceTable.holdby;
            var order_id = '';
            var tableObj = {
                order_id: sourceTable.order_id,
                check_no: '',
                table_no: table_no,
                sequence: '',
                guests: 0,
                holdby: '' + holdby,
                // holdby: '' + sourceTable.table_no,
                clerk: sourceTable.clerk,
                booking: 0,
                lock: false,
                status: sourceTable.status,
                terminal_no: '',

                table_object: null,
                order_object: null
            };
            // this.setTableStatus(tableObj.table_no, tableObj);
            this.setTableStatus( this.genTableStatusObj( tableObj));
            // this.getTableStatusList(true);

            // GeckoJS.Session.set('vivipos_fec_guest_check_table_list', this._tableList);
            var list = this.getTableStatusList(true);
            return list;
        },

        getTableStatus: function(table_no) {
            // @todo rack
            return this._tableStatusList[table_no];
        },

        setTableStatus: function(tableStatusObj) {

            // this.setTableMap(tableStatusObj);

            // @todo rack
            
            var remoteUrl = this.getRemoteService('setTableStatus');
            var tableStatus = null;

            if (remoteUrl) {

                tableStatus = this.requestRemoteService('POST', remoteUrl, GeckoJS.BaseObject.serialize(tableStatusObj));

                return ;
            }


            if (tableStatusObj.order_id && tableStatusObj.holdby) {
                var table_no = tableStatusObj.table_no;
                var conditions = "table_statuses.table_no='" + table_no + "' AND table_statuses.holdby='" + tableStatusObj.holdby + "' AND table_statuses.table_no='" + tableStatusObj.table_no + "'";
                var tableStatusObjTmp = this.find('first', {
                    conditions: conditions
                });
            }
            else if (tableStatusObj.order_id) {
                var table_no = tableStatusObj.table_no;
                var conditions = "table_statuses.table_no='" + table_no + "'";
                var tableStatusObjTmp = this.find('first', {
                    conditions: conditions
                });
            }

            // tableStatus record exist
            if (tableStatusObjTmp) {
                if (tableStatusObj.status == -1) {
                    this.del(tableStatusObjTmp.id);
                }
                else if (tableStatusObj.sequence == '' && !tableStatusObj.holdby) {
                    // remove tableStatus record
                    // this.del(tableStatusObjTmp.id);
                    this.delAll(conditions);
                } else {
                    // update tableStatus record
GREUtils.log("status_id update:::" + this.id);
                    this.id = tableStatusObjTmp.id;
                    var retObj = this.saveStatus(tableStatusObj);
                }
            } else {
                if (tableStatusObj.sequence != '' || tableStatusObj.holdby) {
                    // add new tableStatus record
GREUtils.log("status_id new:::" + this.id);
                    this.id = '';
                    var retObj = this.saveStatus(tableStatusObj);

                }
            }


        },

        saveStatus: function(statusObj) {
GREUtils.log("statusObj:::");
GREUtils.log(GeckoJS.BaseObject.dump(statusObj));
            var tableOrderObj = this.save(statusObj);

GREUtils.log("tableOrderObj:::");
GREUtils.log(GeckoJS.BaseObject.dump(tableOrderObj));
            var tableOrderModel = new TableOrderModel();
            var statusOrderObj = tableOrderModel.save(statusObj);
GREUtils.log("statusOrderObj:::");
GREUtils.log(GeckoJS.BaseObject.dump(statusOrderObj));
        },

        setTableMap: function (tableStatusObj) {

            var tableMapModel = new TableMapModel();

            if (tableStatusObj.order_id && tableStatusObj.holdby) {
                var order_id = tableStatusObj.order_id;
                var conditions = "table_statuses.order_id='" + order_id + "' AND table_statuses.holdby='" + tableStatusObj.holdby + "' AND table_statuses.table_no='" + tableStatusObj.table_no + "'";
                var tableStatusObjTmp = this.find('first', {
                    conditions: conditions
                });
            }
            else if (tableStatusObj.order_id) {
                var table_no = tableStatusObj.table_no;
                var conditions = "table_statuses.table_no='" + table_no + "'";
                var tableStatusObjTmp = tableMapModel.find('first', {
                    conditions: conditions,
                    recursive: -2
                });
            }

            // tableStatus record exist
            if (tableStatusObjTmp) {
                if (tableStatusObj.status == -1) {
//                    this.del(tableStatusObjTmp.id);
GREUtils.log("del:::");
                }
                else if (tableStatusObj.sequence == '' && !tableStatusObj.holdby) {
                    // remove tableStatus record
                    // this.del(tableStatusObjTmp.id);
//                    this.delAll(conditions);
GREUtils.log("delAll:::");
                } else {
                    // update tableStatus record
                    tableMapModel.id = tableStatusObjTmp.id;
                    var retObj = tableMapModel.saveStatus(tableStatusObj);
GREUtils.log("save update:::");
                }
            } else {
                if (tableStatusObj.sequence != '' || tableStatusObj.holdby) {
                    // add new tableStatus record
                    // tableMapModel.id = '';
                    var retObj = tableMapModel.saveStatus(tableStatusObj);
GREUtils.log("save new:::");
                }
            }
        }
    };

    var TableStatusModel = window.TableStatusModel = GeckoJS.Model.extend(__model__);

})();

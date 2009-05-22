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
//                this.getCheckList("AllCheck");
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

            if (remoteUrl) {
                try {
                    tableStatus = this.requestRemoteService('GET', remoteUrl, null);

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
                        o.guests = o.guests + guests;
                    });
                    o.clerk = o.TableOrder[0].clerk;
                    o.total = o.TableOrder[0].total;
                    o.check_no = o.TableOrder[0].check_no;
                    o.sequence = o.TableOrder[0].sequence;
                };

                if (o.TableBooking && o.TableBooking.length > 0) {
                    o.booking = o.TableBooking[0].booking;
                }

                tables.push(o);
            });
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
            var tableList = tableModel.find('all', {recursive: 2});

            GeckoJS.Session.set('vivipos_fec_guest_check_table_list', tableList);

            return this._tableList = tableList;
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
//            return;
            
//            this.getTableList();
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
                table_status_id: (index > -1) ? this._tableList[index].TableStatus.id : ''

//                table_object: this._tableList[checkObj.table_no - 1],
//                order_object: checkObj
            };

            this.setTableStatus( this.genTableStatusObj(tableObj));

            // this.getTableStatusList(true);
        },

        removeCheck: function(checkObj) {

            this.TableOrder.delAll("order_id='" + checkObj.id + "'");


            // touch modified time...
            var conditions = "table_statuses.table_no='" + checkObj.table_no + "'";
            var tableStatusObjTmp = this.find('first', {
                conditions: conditions,
                recursive: 2
            });

            // @todo maintain status field...
            if (tableStatusObjTmp) {
                this.id = tableStatusObjTmp.id;

                var tableStatus = this.save(tableStatusObjTmp);

                var self = this;
                if (!(tableStatusObjTmp.TableOrder && tableStatusObjTmp.TableOrder.length > 0)) {
                    var hostby = this.find("all", {conditions: "table_statuses.hostby='" + checkObj.table_no + "'", recursive: 0});
                    if (hostby) {
                        hostby.forEach(function(o){
                            // self.hostTable(o.table_no, o.table_no);
                            self.id = o.id;
                            o.hostby = '';
                            self.save(o);
                        })
                    }
                }
            }
            return checkObj;

        },

        holdTable: function(table_no, holdTable) {
            // GREUtils.log("DEBUG", "hold table...");

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

            this.setTableHostBy(table_no, holdTable);

            var list = this.getTableStatusList(true);
            return list;
        },

        getTableStatus: function(table_no) {
            // @todo rack
            return this._tableStatusList[table_no];
        },

        setTableHostBy: function(table_no, holdTable) {
            var hostTableNo = holdTable;
            // var conditions = "table_statuses.table_no='" + table_no + "' AND table_statuses.holdby='" + tableStatusObj.holdby + "' AND table_statuses.table_no='" + tableStatusObj.table_no + "'";
            var conditions = "table_statuses.table_no='" + table_no + "'";
            var tableStatusObjTmp = this.find('first', {
                conditions: conditions
            });

            var hostbyObj = null;
            if (hostTableNo == table_no) {
                hostbyObj = {hostby: ''};
            }
            else {
                hostbyObj = {hostby: hostTableNo};
            }

            // tableStatus record exist
            if (tableStatusObjTmp) {

                this.id = tableStatusObjTmp.id;
                this.save( hostbyObj );
            }
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

            /*
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
            */

            var table_no = tableStatusObj.table_no;
            var conditions = "table_statuses.table_no='" + table_no + "'";
            var tableStatusObjTmp = this.find('first', {
                conditions: conditions
            });

            // tableStatus record exist
            if (tableStatusObjTmp) {
                if (tableStatusObj.status == -1) {
//                    this.del(tableStatusObjTmp.id);
                }
                else if (tableStatusObj.sequence == '' && !tableStatusObj.holdby) {
                    // remove tableStatus record
                    // this.del(tableStatusObjTmp.id);
//                    this.delAll(conditions);
GREUtils.log("remove all");
                } else {
                    // update tableStatus record
GREUtils.log("status_id update:::" + tableStatusObjTmp.id);
                    this.id = tableStatusObjTmp.id;
                    // var retObj = this.saveStatus(tableStatusObj);
                    var tableOrderObj = this.save(tableStatusObj);
                    this.TableOrder.id = ''; // append table order
                    var statusOrderObj = this.TableOrder.save(tableStatusObj);
                }
            } else {
                if (tableStatusObj.sequence != '' || tableStatusObj.holdby) {
                    // add new tableStatus record
GREUtils.log("status_id new:::" + this.id);
                    this.id = '';
//                    var retObj = this.saveStatus(tableStatusObj);

                }
            }


        }

    };

    var TableStatusModel = window.TableStatusModel = GeckoJS.Model.extend(__model__);

})();

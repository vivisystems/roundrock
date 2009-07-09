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
        _connected: false,
        _guestCheck: null,
        _checkList: null,
        _tableList: null,
        _tableStatusList: null,
        _tableOrders: null,
        _tableOrdersOrg: null,
        _tableStatusLastTime: 0,
        _tableOrderLastTime: 0,
        _tableStatusArray: [],
        _tableStatusIdxById: {},
        _tableOrderByOrderId: {},

        initial: function (c) {
            if (!this._tableStatusList) {
// GREUtils.log("initial list...");
                this.getTableStatusList();
            }
        },

        syncClient: function() {
            // sync data
            try {
                var exec = new GeckoJS.File("/data/vivipos_webapp/sync_client");
                var r = exec.run(["sync"], false); // nonblock mode
                exec.close();
                return true;
            }
            catch (e) {
                NotifyUtils.warn(_('Failed to execute command (sync_client).', []));
                return false;
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

        getTableStatuses: function(lastModified) {

            var self = this;

            var remoteUrl = this.getRemoteService('getTableStatuses');
            var tableStatus = null;

            if (remoteUrl) {
                try {
                    tableStatus = this.requestRemoteService('GET', remoteUrl + "/" + lastModified, null);
// GREUtils.log("getTableStatuses:::" + lastModified);
                    // do not need
                    tableStatus.forEach(function(o){

                        var item = GREUtils.extend({}, o.TableStatus);
                        for (var key in item) {
                            o[key] = item[key];
                        }
                    });

                    this._connected = true;
                }catch(e) {
                    tableStatus = [];
                    this._connected = false;

                }

            }else {
                // read all order status
                this._connected = true;
                var fields = null;
                var conditions = "table_statuses.modified > '" + lastModified + "'";
                var orderby = 'table_statuses.table_no';

                tableStatus = this.find('all', {fields: fields, conditions: conditions, recursive: 1, order: orderby});

            }
//GREUtils.log("getList:::");
//GREUtils.log(GeckoJS.BaseObject.dump(tableStatus));
            // if table status changed, sync database...
            if (tableStatus.length > 0) {
                this.syncClient();
            }

            return tableStatus;
        },

        getTableStatusList: function(reload) {

            var self = this;

            var tableOrder = this.getTableOrders(this._tableOrderLastTime);

            var tableStatus = this.getTableStatuses(this._tableStatusLastTime);

            if (this._tableStatusList && this._tableStatusList.length > 0) {
                //
                tableStatus.forEach(function(o){

                    // @todo not update when add or delete table...
                    var index = self._tableStatusIdxById[o.id];

                    if (self._tableStatusList[index]) {
                        self._tableStatusList[index] = o;
                    }

                });

            } else {

                this._tableStatusList = tableStatus.concat([]);

                for (var i = 0; i < tableStatus.length; i++) {
                    this._tableStatusIdxById['' + tableStatus[i].id] = i;
                };
            }

            return this.genTablesArray(this._tableStatusList);
        },

        genTablesArray: function(tableStatus) {
            var self = this;
            // set checklist
            this._checkList = tableStatus.concat([]);

//            this._tableOrderByOrderId = {};

            // gen tables status

            // var tables = [];
            if (tableStatus) {
                tableStatus.forEach(function(o) {
                    delete o.order;
                    delete o.TableOrder;
                    o.TableOrder = new GeckoJS.ArrayQuery(this._tableOrders).filter("table_no = '" + o.table_no + "'");
// GREUtils.log("table_no:::" + o.table_no + " , length:::" + o.TableOrder.length);

                    o.seats = o.Table.seats;
                    o.table_name = o.Table.table_name;
                    o.guests = 0;

                    o.clerk = '';
                    o.total = 0;
                    o.check_no = 0;
                    o.sequence = '';
                    o.start_time = 0;

                    // o.checks = o.TableOrder ? o.TableOrder.length : 0;
                    o.checks = o.TableOrder.length;
                    if (o.checks > 0) {
                        o.TableOrder.forEach(function(orderObj){
                            var guests = Math.round(parseInt(orderObj.guests)) || 0;
                            o.guests = o.guests + guests;
//                            self._tableOrderByOrderId[orderObj.order_id] =
//                                {
//                                    status_id: orderObj.table_status_id,
//                                    table_id: orderObj.table_id,
//                                    checksum: orderObj.checksum,
//                                    modified: orderObj.modified,
//                                    terminal_no: orderObj.terminal_no
//                                }
                        });
                        o.clerk = o.TableOrder[0].clerk;
                        o.total = o.TableOrder[0].total;
                        o.check_no = o.TableOrder[0].check_no;
                        o.sequence = o.TableOrder[0].sequence;
                        o.start_time = o.TableOrder[0].transaction_created;
                    };

                    if (o.TableBooking && o.TableBooking.length > 0) {

                        o.booking = o.TableBooking[0].booking;
                    }

                    // add orders

//                    o.TableOrder = new GeckoJS.ArrayQuery(this._tableOrders).filter("table_no = '" + o.table_no + "'");

                    // set last status modify time
                    if (o.modified > self._tableStatusLastTime) {
                        self._tableStatusLastTime = o.modified;
                    }
                    // this._tableStatusLastTime = this._tableStatusLastTime < o.modified ? o.modified : this._tableStatusLastTime;

                }, this);
            }
// GREUtils.log("getTableStatusList:::");
// GREUtils.log(GeckoJS.BaseObject.dump(tableStatus));
            return tableStatus;

        },

        getTableOrderIdx: function() {
            this.getTableOrders(this._tableOrderLastTime);
            return this._tableOrderByOrderId;
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
                // var tables = GeckoJS.Session.get('vivipos_fec_guest_check_table_list');
                if (tables) {
                    return tables;
                }
            }
            var tableModel = new TableModel();
            var tableList = tableModel.find('all', {recursive: 2});

            // GeckoJS.Session.set('vivipos_fec_guest_check_table_list', tableList);

            return this._tableList = tableList;
        },

        touchTableStatus: function(table_no) {
            // touch modified time...
            var remoteUrl = this.getRemoteService('touchTableStatus');
            var tableStatus = null;

            if (remoteUrl) {

                tableStatus = this.requestRemoteService('GET', remoteUrl + '/' + table_no, null);

                return ;
            }

            var conditions = "table_statuses.table_no='" + table_no + "'";
            var tableStatusObjTmp = this.find('first', {
                conditions: conditions,
                recursive: 0
            });

            // @todo maintain status field...
            if (tableStatusObjTmp) {
                this.id = tableStatusObjTmp.id;

                var tableStatus = this.save(tableStatusObjTmp);
                
            }
        },

        _touchTableStatus: function(table_no) {
            // touch modified time...

            var conditions = "table_statuses.table_no='" + table_no + "'";
            var tableStatusObjTmp = this.find('first', {
                conditions: conditions,
                recursive: 0
            });

            // @todo maintain status field...
            if (tableStatusObjTmp) {
                this.id = tableStatusObjTmp.id;

                var tableStatus = this.save(tableStatusObjTmp);
                
            }
        },

        transTable: function(checkObj, sourceTableNo) {
            // GREUtils.log("DEBUG", "add check...");

            var index = -1;
            var i = 0;

            this._tableStatusList.forEach(function(o){
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
                status: checkObj.status,
                terminal_no: checkObj.terminal_no,
                transaction_created: checkObj.created,
                checksum: checkObj.checksum,

                total: checkObj.total,

//                table_id: (index > -1) ? this._tableStatusList[index].table_id : '',
                table_status_id: (index > -1) ? this._tableStatusList[index].id : '',

            };

            tableObj["org_table_no"] = sourceTableNo;

            var remoteUrl = this.getRemoteService('transTable');
            var tableStatus = null;

            if (remoteUrl) {

                tableStatus = this.requestRemoteService('POST', remoteUrl, GeckoJS.BaseObject.serialize(tableObj));

                return ;
            }

            this._setTableStatus(tableObj);
            this._touchTableStatus(sourceTableNo);
        },

        holdTable: function(table_no, holdTable) {
            // GREUtils.log("DEBUG", "hold table...");

            this.setTableHostBy(table_no, holdTable);

            // return;
            var list = this.getTableStatusList(this._tableStatusLastTime);
            return list;
        },

        getTableOrderCheckSum: function(order_id) {
            var self = this;

            var remoteUrl = this.getRemoteService('getTableOrderCheckSum');
            var tableOrder = null;

            if (remoteUrl) {
                try {
                    tableOrder = this.requestRemoteService('GET', remoteUrl + "/" + order_id, null);

                    this._connected = true;
                }catch(e) {
                    tableOrder = [];
                    this._connected = false;

                }

            }else {
                // read all order status
                this._connected = true;
                var fields = null;
                var conditions = "table_orders.id='" + order_id + "'";

                tableOrder = this.TableOrder.find('all', {fields: fields, conditions: conditions, recursive: 0});

            }

            return tableOrder;

        },

        getTableStatus: function(table_no) {

            return this._tableStatusList[table_no];

        },

        setTableHostBy: function(table_no, holdTable) {
            var hostTableNo = holdTable;

            var remoteUrl = this.getRemoteService('setTableHostBy');
            var tableStatus = null;

            if (remoteUrl) {

                // tableStatus = this.requestRemoteService('POST', remoteUrl, GeckoJS.BaseObject.serialize({table_no: table_no, holdTable: holdTable}));
                tableStatus = this.requestRemoteService('GET', remoteUrl + '/' + table_no + '/' + holdTable, null);

                return ;
            }

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

        addCheck: function(checkObj) {
            var index = -1;
            var i = 0;

            this._tableStatusList.forEach(function(o){
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
                status: checkObj.status,
                terminal_no: checkObj.terminal_no,
                transaction_created: checkObj.created,
                checksum: checkObj.checksum,

                total: checkObj.total,

//                table_id: (index > -1) ? this._tableStatusList[index].table_id : '',
                table_status_id: (index > -1) ? this._tableStatusList[index].id : '',

            };

            // this.setTableStatus2( this.genTableStatusObj(tableObj));
            this.setTableStatus( tableObj);

        },

        setTableStatus: function(tableStatusObj) {

            var remoteUrl = this.getRemoteService('setTableStatus');
            var tableStatus = null;

            if (remoteUrl) {

                tableStatus = this.requestRemoteService('POST', remoteUrl, GeckoJS.BaseObject.serialize(tableStatusObj));

                return ;
            }

            if (tableStatusObj.table_status_id) {
                this.id = tableStatusObj.table_status_id;
                var tableOrderObj = this.save(tableStatusObj);
            }

            var tableOrderObj = this.TableOrder.find("first", {conditions: "table_orders.id='" + tableStatusObj.order_id + "'"});
//GREUtils.log("table_orders.order_id='" + tableStatusObj.order_id + "'");
//GREUtils.log(GeckoJS.BaseObject.dump(tableOrderObj));
            if (tableOrderObj) {
                this.TableOrder.id = tableOrderObj.id;
            } else {
                this.TableOrder.id = ''; // append table order
            }

            // this.TableOrder.id = "";
            tableStatusObj.id = tableStatusObj.order_id;
            this.TableOrder.save(tableStatusObj);

            return;

        },

        _setTableStatus: function(tableStatusObj) {

            if (tableStatusObj.table_status_id) {
                this.id = tableStatusObj.table_status_id;
                var tableOrderObj = this.save(tableStatusObj);
            }

            var tableOrderObj = this.TableOrder.find("first", {conditions: "table_orders.id='" + tableStatusObj.order_id + "'"});
//GREUtils.log("table_orders.order_id='" + tableStatusObj.order_id + "'");
//GREUtils.log(GeckoJS.BaseObject.dump(tableOrderObj));
            if (tableOrderObj) {
                this.TableOrder.id = tableOrderObj.id;
            } else {
                this.TableOrder.id = ''; // append table order
            }

            // this.TableOrder.id = "";
            tableStatusObj.id = tableStatusObj.order_id;
            this.TableOrder.save(tableStatusObj);

            return;

        },

        getTableOrders: function(lastModified) {

            var self = this;

            var remoteUrl = this.getRemoteService('getTableOrders');
            var tableOrder = null;

            if (remoteUrl) {
                try {
                    tableOrder = this.requestRemoteService('GET', remoteUrl + "/" + lastModified, null);

                    //@todo do not need, just for ArrayQuery.filter
                    tableOrder.forEach(function(o){

                        var item = GREUtils.extend({}, o.TableOrder);
                        for (var key in item) {
                            o[key] = item[key];
                        }
                    });

                    this._connected = true;
                }catch(e) {
                    tableOrder = [];
                    this._connected = false;

                }

            }else {
                // read all order status
                this._connected = true;
                var fields = null;
                var conditions = "table_orders.modified > '" + lastModified + "'";
                var orderby = 'table_orders.modified';

                tableOrder = this.TableOrder.find('all', {fields: fields, conditions: conditions, recursive: 0, order: orderby});

            }

// GREUtils.log("tableOrder:::" + lastModified);
//GREUtils.log(GeckoJS.BaseObject.dump(tableOrder));

            // first get order list...
            if (this._tableOrders == null) {

                // clone table orders...
                this._tableOrders = tableOrder.concat([]);

                this._tableOrders.forEach(function(orderObj){

                    self._tableOrderLastTime = self._tableOrderLastTime > orderObj.TableOrder.modified ? self._tableOrderLastTime : orderObj.TableOrder.modified;

                }, this);

            } else {

                if (tableOrder.length > 0) {

                    this.syncClient();

                    tableOrder.forEach(function(orderObj){

                        if (self._tableOrderByOrderId[orderObj.TableOrder.id]) {

                            self._tableOrderByOrderId[orderObj.TableOrder.id].status = orderObj.TableOrder.status;
                            self._tableOrderByOrderId[orderObj.TableOrder.id].table_no = orderObj.TableOrder.table_no;
                            self._tableOrderByOrderId[orderObj.TableOrder.id].checksum = orderObj.TableOrder.checksum;
                            self._tableOrderByOrderId[orderObj.TableOrder.id].modified = orderObj.TableOrder.modified;
                            self._tableOrderByOrderId[orderObj.TableOrder.id].terminal_no = orderObj.TableOrder.terminal_no;

                            self._tableOrders[self._tableOrderByOrderId[orderObj.TableOrder.id].index] = orderObj;

                        } else {

                            self._tableOrders.push(orderObj);

                        }

                        self._tableOrderLastTime = self._tableOrderLastTime > orderObj.TableOrder.modified ? self._tableOrderLastTime : orderObj.TableOrder.modified;

                    }, this);
                }

            }
// GREUtils.log("self._tableOrders:::" + lastModified);
//GREUtils.log(GeckoJS.BaseObject.dump(self._tableOrders));
            // leave the orders of status = 2
            self._tableOrders = new GeckoJS.ArrayQuery(self._tableOrders).filter("status = 2");

            // rebuild tableOrder index...
            var index = 0;
            self._tableOrderByOrderId = {};
            self._tableOrders.forEach(function(orderObj){
                self._tableOrderByOrderId[orderObj.TableOrder.id] =
                    {
                        index: index,
                        status: orderObj.TableOrder.status,
                        table_no: orderObj.TableOrder.table_no,
                        checksum: orderObj.TableOrder.checksum,
                        modified: orderObj.TableOrder.modified,
                        terminal_no: orderObj.TableOrder.terminal_no
                    };
                    index++;
            }, this);

            return this._tableOrders;
        }

    };

    var TableStatusModel = window.TableStatusModel = GeckoJS.Model.extend(__model__);

})();

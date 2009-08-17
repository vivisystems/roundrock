(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    /**
     * TableStatus Model
     */
    var __model__ = {

        name: 'TableStatus',

        useDbConfig: 'table',

        belongsTo: ['Table'],

        // hasMany: ['TableBooking', 'TableOrder'],
        hasMany: ['TableBooking'],

        behaviors: ['Sync', 'Training'], // for local use when connect master fail...

        timeout: 15,
        _delta: 0,

        _connected: false,
        _guestCheck: null,
        _checkList: null,
        _tableList: null,
        _tableStatusList: null,
        _tableStatuses: null,
        _tableOrders: null,
        _tableOrdersOrg: null,
        _tableStatusLastTime: 0,
        _tableOrderLastTime: 0,
        _tableStatusArray: [],
        _tableStatusIdxById: {},
        _tableOrderByOrderId: {},
        _tableBookings: null,
        _tableNoArray: [],

        initial: function (c) {

            this._validateTables();

            this.setTableStatusOptions();
            
            if (!this._tableStatusList) {
                
                this.getTableStatusList();
            }

        },

        getLocalService: function(method,force_remote) {
            this.syncSettings = (new SyncSetting()).read();

            if (this.syncSettings && this.syncSettings.active == '1') {

                var hostname = 'localhost';

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

        getRemoteService: function(method,force_remote) {
            this.syncSettings = (new SyncSetting()).read();

            if (this.syncSettings && this.syncSettings.active == '1' && this.syncSettings.table_active == '1') {

                var hostname = this.syncSettings.hostname || 'localhost';

                // always use webservice when network table service active
                // if ((hostname == 'localhost' || hostname == '127.0.0.1') && !force_remote) return false;
                
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

            this.log('DEBUG', 'requestRemoteService: ' + reqUrl + ', with method: ' + method);

            // for use asynchronize mode like synchronize mode
            // mozilla only
            var reqStatus = {};
            reqStatus.finish = false;

            var req = new XMLHttpRequest();

            req.mozBackgroundRequest = true;

            /* Request Timeout guard */
            var timeoutSec = this.timeout * 1000;
            var timeout = null;
            timeout = setTimeout(function() {
                try {
                    req.abort();
					
                }catch(e) {
                    // dump('timeout exception ' + e + "\n");
                }
            }, timeoutSec);

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
                var now = Date.now().getTime();

                var thread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;
                
                while (!reqStatus.finish) {

                    if (Date.now().getTime() > (now+timeoutSec)) break;

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

        _validateTables: function() {
            try {
                // validate table_status belongsTo table
                var conditions = "tables.id IS NULL";
                var tableStatuses = this.find("all", {conditions: conditions});

                if (tableStatuses && tableStatuses.length > 0) {
                    tableStatuses.forEach(function(tableStatus){
                        this.del(tableStatus.id);
                    }, this);
                }

                // validate table hasOne table_status
                var tableModel = new TableModel();
                var condTables = "table_statuses.id IS NULL";
                var tables = tableModel.find("all", {conditions: condTables, recursive: 1});

                if (tables && tables.length > 0) {
                    tables.forEach(function(table){

                        var newTableStatus = {table_id:table.id, table_no: table.table_no};

                        this.id = '';
                        this.save(newTableStatus);
                    }, this);

                }
                delete tableModel;

            } catch (e) {
                this.log('ERROR', e.errmsg);
            }

        },

        getNewCheckNo: function(no) {

            var i = 1;
            var cnt = 0;
            var maxCheckNo = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings.MaxCheckNo') || 999;

            // minimize maxCheckNo is 30
            maxCheckNo = Math.max(maxCheckNo, 30);

            // remove duplicate check no check...
            // var ar = this.getCheckList('AllCheck', null);
            var ar = this._checkList;
            if (no) {

                return "" + no;

            } else {
                while (true) {
                    i = SequenceModel.getSequence('check_no');

                    if (i > maxCheckNo) {
                        i = 0;
                        SequenceModel.resetSequence('check_no');
                    } else {
                        return "" + i;
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
                    tableStatus.forEach(function(o){
                        self.Table.convertDataTypes(o.Table);
                        self.convertDataTypes(o.TableStatus);
                        var item = GREUtils.extend({}, o.TableStatus);
                        for (var key in item) {
                            o[key] = item[key];
                        }
                    });

                    this._connected = true;
                }catch(e) {

                    tableStatus = [];
                    this._connected = false;
                    this.dump(e);

                }

            }else {
                // read all order status
                this._connected = true;
                var fields = null;
                // var conditions = "table_statuses.modified > '" + lastModified + "'";
                var conditions = "tables.active AND table_statuses.modified > '" + lastModified + "'";
                var orderby = 'table_statuses.table_no';

                tableStatus = this.find('all', {fields: fields, conditions: conditions, recursive: 1, order: orderby});

            }

            this._tableStatuses = tableStatus;


            return tableStatus;
        },

        getTableStatusList: function(reload) {

            var self = this;
            if (this._delta > 0) this._delta--;

            var tableBooking = this.getTableBookings();

            var tableOrder = this.getTableOrders(this._tableOrderLastTime - this._delta);

//            if (this._tableStatuses)
//                var tableStatus = this._tableStatuses;
//            else
                var tableStatus = this.getTableStatuses(this._tableStatusLastTime - this._delta);

            if (this._tableStatusList && this._tableStatusList.length > 0) {
                //
                tableStatus.forEach(function(o){

                    // @todo not update when add or delete table...
                    var index = self._tableStatusIdxById[o.id];

                    if (self._tableStatusList[index]) {
                        // self._tableStatusList[index] = o;
                        for (var key in o) {
                            self._tableStatusList[index][key] = o[key];
                        }
                    }

                });

            } else {

                this._tableStatusList = tableStatus.concat([]);
                this._tableNoArray = [];

                for (var i = 0; i < tableStatus.length; i++) {
                    this._tableStatusIdxById['' + tableStatus[i].id] = i;
                    this._tableNoArray[tableStatus[i].Table.table_no] = tableStatus[i].Table.table_no;
                };
            }

            return this.genTablesArray(this._tableStatusList);
        },

        genTablesArray: function(tableStatus) {
            var self = this;
            // set checklist
            this._checkList = tableStatus.concat([]);

            var now = Math.round(Date.now().getTime() / 1000);

            // gen tables status

            // var tables = [];
            if (tableStatus) {
                tableStatus.forEach(function(o) {
                    delete o.order;
                    delete o.TableOrder;
                    o.TableOrder = new GeckoJS.ArrayQuery(this._tableOrders).filter("table_no = '" + o.table_no + "'");
                    delete o.TableBooking;
                    o.TableBooking = new GeckoJS.ArrayQuery(this._tableBookings).filter("table_no = '" + o.table_no + "'");

                    o.table_region_id = o.Table.table_region_id;

                    o.seats = o.Table.seats;
                    o.table_name = o.Table.table_name;
                    o.guests = 0;

                    o.clerk = '';
                    o.total = 0;
                    o.check_no = 0;
                    o.sequence = '';

                    if (o.hostby == '0') o.hostby = '';

                    // mark
                    // if (!o.mark || (o.start_time > now) || (o.end_time < now)) {
                    if (!o.mark || (o.end_time < now)) {
                        o.mark = '';
                        o.start_time = 0;
                        o.end_time = 0;
                        o.mark_user = '';
                        o.mark_op_deny = false;
                    }


                    // o.checks = o.TableOrder ? o.TableOrder.length : 0;
                    o.checks = o.TableOrder.length;
                    if (o.checks > 0) {
                        o.TableOrder.forEach(function(orderObj){
                            var guests = Math.round(parseInt(orderObj.guests)) || 0;
                            o.guests = o.guests + guests;
                        });
                        o.clerk = o.TableOrder[0].clerk;
                        o.total = o.TableOrder[0].total;
                        o.check_no = o.TableOrder[0].check_no;
                        o.sequence = o.TableOrder[0].sequence;
                        o.transaction_created = o.TableOrder[0].transaction_created;
                    };

                    if (o.TableBooking && o.TableBooking.length > 0) {

                        o.booking = o.TableBooking[0].booking;
                    }

                    // set last status modify time
                    if (o.modified > self._tableStatusLastTime) {
                        self._tableStatusLastTime = o.modified;
                    }

                }, this);
            }

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
            if (table_no in this._tableNoArray)
                return table_no;
            else
                return '';

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
            // GREUtils.log("DEBUG", "transTable...");
        },

        holdTable: function(table_no, holdTable) {
            // GREUtils.log("DEBUG", "hold table...");

            this.setTableHostBy(table_no, holdTable);

            // return;
            var list = this.getTableStatusList(this._tableStatusLastTime);
            return list;
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

        setTableMark: function(table_no, markObj) {

            var user = GeckoJS.Session.get('user') || {};
            // markObj.mark_user = user.username;
            markObj.mark_user = user ? user.displayname : _('unknown user');
            

            var now = Math.round(Date.now().getTime() / 1000);
            markObj.start_time = now;
            if (markObj.period > 0) {
                markObj.end_time = now + markObj.period * 60;
            } else {
                // last to ten years
                markObj.end_time = now + 86400 * 365 * 10;
            }

            var remoteUrl = this.getRemoteService('setTableMark');
            var tableStatus = null;

            if (remoteUrl) {

                tableStatus = this.requestRemoteService('POST', remoteUrl, GeckoJS.BaseObject.serialize({table_no: table_no, markObj: markObj}));
                // this._delta = 1;
                
                return ;
            }

            var conditions = "table_statuses.table_no='" + table_no + "'";
            var tableStatusObjTmp = this.find('first', {
                conditions: conditions
            });

            // tableStatus record exist
            if (tableStatusObjTmp) {

                this.id = tableStatusObjTmp.id;

                if (markObj.name) {
                    tableStatusObjTmp.start_time = markObj.start_time;
                    tableStatusObjTmp.end_time = markObj.end_time;
                    tableStatusObjTmp.mark_user = markObj.mark_user;
                    tableStatusObjTmp.mark = markObj.name;
                    tableStatusObjTmp.mark_op_deny = markObj.opdeny;
                } else {
                    tableStatusObjTmp.start_time = 0;
                    tableStatusObjTmp.end_time = 0;
                    tableStatusObjTmp.mark_user = '';
                    tableStatusObjTmp.mark = '';
                    tableStatusObjTmp.mark_op_deny = false;
                }

                this.save( tableStatusObjTmp );

                // this._delta = 1;
            }
        },

        setTableMarks: function(regionTables, markObj) {

            var user = GeckoJS.Session.get('user') || {};
            // markObj.mark_user = user.username;
            markObj.mark_user = user ? user.displayname : _('unknown user');

            var now = Math.round(Date.now().getTime() / 1000);
            markObj.start_time = now;
            if (markObj.period > 0) {
                markObj.end_time = now + markObj.period * 60;
            } else {
                // last to ten years
                markObj.end_time = now + 86400 * 365 * 10;
            }
            

            var tables = GeckoJS.Array.objectExtract(regionTables, '{n}.TableStatus.table_no');

            var remoteUrl = this.getRemoteService('setTableMarks');
            var tableStatus = null;

            if (remoteUrl) {

                tableStatus = this.requestRemoteService('POST', remoteUrl, GeckoJS.BaseObject.serialize({tables: tables, markObj: markObj}));
                // this._delta = 3;

                return ;
            }

            // local
            tables.forEach(function(table_no){
                //

                var conditions = "table_statuses.table_no='" + table_no + "'";
                var tableStatusObjTmp = this.find('first', {
                    conditions: conditions
                });

                // tableStatus record exist
                if (tableStatusObjTmp) {

                    this.id = tableStatusObjTmp.id;

                    if (markObj.name) {
                        tableStatusObjTmp.start_time = markObj.start_time;
                        tableStatusObjTmp.end_time = markObj.end_time;
                        tableStatusObjTmp.mark_user = markObj.mark_user;
                        tableStatusObjTmp.mark = markObj.name;
                        tableStatusObjTmp.mark_op_deny = markObj.opdeny;
                    } else {
                        tableStatusObjTmp.start_time = 0;
                        tableStatusObjTmp.end_time = 0;
                        tableStatusObjTmp.mark_user = '';
                        tableStatusObjTmp.mark = '';
                        tableStatusObjTmp.mark_op_deny = false;
                    }

                    this.save( tableStatusObjTmp );
                }

            }, this);

            // this._delta = 3;
        },

        addCheck: function(checkObj) {

            return ;

            
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
                clerk: checkObj.service_clerk_displayname,
                booking: 0,
                lock: false,
                status: checkObj.status,
                terminal_no: checkObj.terminal_no,
                transaction_created: checkObj.created,
                checksum: checkObj.checksum,

                total: checkObj.total,

//                table_id: (index > -1) ? this._tableStatusList[index].table_id : '',
                table_status_id: (index > -1) ? this._tableStatusList[index].id : ''

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

            return;

        },

        _setTableStatus: function(tableStatusObj) {

            if (tableStatusObj.table_status_id) {
                this.id = tableStatusObj.table_status_id;
                var tableOrderObj = this.save(tableStatusObj);
            }

            return;

        },

        getTableBookings: function() {
            var now = Math.round(new Date().getTime());
            var tableSettings = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || {};
            var remindTime = (now + tableSettings.TableRemindTime * 60 * 1000) / 1000;

            var bookTimeOut = (tableSettings.TableBookingTimeout * 60 *1000) / 1000;
            var bookNow =  now / 1000 - bookTimeOut;
            var justNow = now / 1000;

            var conditions = "table_bookings.booking < '" + remindTime + "' AND table_bookings.booking > '" + bookNow + "'";

            var orderby = "table_bookings.booking";
            this._tableBookings = this.TableBooking.find("all", {conditions: conditions, order: orderby});
        },

        getTableOrders: function(lastModified) {

            var self = this;

            var orderModel = new OrderModel();
            var orders = null;

            orders = orderModel.getCheckList('AllCheck', '', lastModified);
            delete (orderModel);

            var tableOrder = null;
            if (orders && orders.length > 0) {
                tableOrder = [];
                orders.forEach(function(o){
                    var tableOrderTmp = { TableOrder:
                        {
                            id: o.Order.id,
                            total: o.Order.total,
                            table_no: o.Order.table_no,
                            check_no: o.Order.check_no,
                            clerk: o.Order.service_clerk_displayname,
                            sequence: o.Order.sequence,
                            guests: o.Order.no_of_customers,
                            transaction_created: o.Order.transaction_created,
                            checksum: null,
                            created: o.Order.created,
                            modified: o.Order.modified,
                            status: o.Order.status,
                            terminal_no: o.Order.terminal_no
                        }}
                    tableOrder.push( tableOrderTmp);

                });

                tableOrder.forEach(function(o){
                    var item = GREUtils.extend({}, o.TableOrder);
                        for (var key in item) {
                            o[key] = item[key];
                        }
                });

                this._connected = true;

            }


            // first get order list...
            if (this._tableOrders == null && (tableOrder && tableOrder.length > 0)) {

                // clone table orders...
                this._tableOrders = tableOrder.concat([]);

                this._tableOrders.forEach(function(orderObj){

                    self._tableOrderLastTime = self._tableOrderLastTime > orderObj.TableOrder.modified ? self._tableOrderLastTime : orderObj.TableOrder.modified;

                }, this);

            } else {

                if (tableOrder && tableOrder.length > 0) {

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
        },

        getRegions: function() {

            var remoteUrl = this.getRemoteService('getRegions');
            var regions = null;

            if (remoteUrl) {
                try {
                    regions = this.requestRemoteService('GET', remoteUrl, null);

                    //@todo
                    regions.forEach(function(o){

                        var item = GREUtils.extend({}, o.TableRegion);
                        for (var key in item) {
                            o[key] = item[key];
                        }
                    });
                    this._connected = true;
                }catch(e) {
                    regions = [];
                    this._connected = false;

                }

            }else {
                // read all regions
                this._connected = true;

                var regionModel = new TableRegionModel();
                regions = regionModel.find('all', {
                        fields: ['id', 'name']
                    });
                delete regionModel;

            }

            return regions;
        },

        getTableStatusOptions: function() {

            var remoteUrl = this.getRemoteService('getTableStatusOptions');
            var options = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || false;
            var tableMarks = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableMarks');
            var marksData;

            if (remoteUrl) {
                try {

                    var remote_options = this.requestRemoteService('GET', remoteUrl, null);

                    if (remote_options) {
                        options = remote_options.options;
                        options.MinimumChargePlu = GeckoJS.BaseObject.serialize(options.MinimumChargePlu);
                        marksData = remote_options.marks;

                    }

                    this._connected = true;
                    
                }catch(e) {
                    options = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || false;
                    tableMarks = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableMarks');
                    this._connected = false;

                }

            }else {
                // read all regions
                this._connected = true;

                options = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || false;
                tableMarks = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableMarks');

            }

            if (tableMarks != null && (marksData == [] || marksData == null)) {
                marksData = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(tableMarks));
            }
            if (!marksData || marksData.length <= 0) marksData = [];

            return {options: options, marksData: marksData};
        },

        setTableStatusOptions: function() {

            // save options of table status to local file /tmp/tableStatusPrefs
            var remoteUrl = this.getLocalService('setTableStatusOptions', true);

            var optionsData = {}
            var marksData = [];

            var options = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableSettings') || false;
            options.MinimumChargePlu = GeckoJS.BaseObject.unserialize(options.MinimumChargePlu);
            // options.MinimumChargePlu = btoa(options.MinimumChargePlu);

            var tableMarks = GeckoJS.Configure.read('vivipos.fec.settings.GuestCheck.TableMarks');
            var marksData = [];
            if (tableMarks != null)
                marksData = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(tableMarks));
            if (marksData.length <= 0) marksData = [];

            if (remoteUrl) {
                var optDatas = {options: options, marks: marksData};

                this.requestRemoteService('POST', remoteUrl, GeckoJS.BaseObject.serialize(optDatas));

            }

            options.MinimumChargePlu = GeckoJS.BaseObject.serialize(options.MinimumChargePlu);

            return options;

        }

    };

    var TableStatusModel = window.TableStatusModel = AppModel.extend(__model__);

})();

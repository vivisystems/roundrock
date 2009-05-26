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
        _tableStatusLastTime: 0,
        _tableStatusArray: [],
        _tableStatusIdxById: {},

        initial: function (c) {
            // this._super(c);
// GREUtils.log("initial...");
            //            this._checkList = GeckoJS.Session.get('vivipos_fec_guest_check_check_list');
            //            this._tableList = GeckoJS.Session.get('vivipos_fec_guest_check_table_list');
            //            this._tableStatusList = GeckoJS.Session.get('vivipos_fec_guest_check_table_status_list');
            if (!this._tableStatusList) {
//                 this.getTableList();
//                this.getCheckList("AllCheck");
// GREUtils.log("initial list...");
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

        getTableStatuses: function(lastModified) {
// GREUtils.log("getTableStatuses..." + lastModified );
            var self = this;
            // var remoteUrl = this.getRemoteService('getTableStatusList');
            var remoteUrl = this.getRemoteService('getTableStatuses');
            var tableStatus = null;

            if (remoteUrl) {
                try {
// GREUtils.log("remoteUrl:::" + remoteUrl);
                    tableStatus = this.requestRemoteService('GET', remoteUrl + "/" + lastModified, null);
GREUtils.log("getTableStatuses:::" + lastModified + " , length:" + tableStatus.length);
GREUtils.log(GeckoJS.BaseObject.dump(tableStatus));
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
// GREUtils.log("remoteUrl except false:::" + remoteUrl);
                }

            }else {
// GREUtils.log("remoteUrl local:::" + remoteUrl);
                // read all order status
                this._connected = true;
                var fields = null;
                var conditions = "table_statuses.modified > '" + lastModified + "'";

                tableStatus = this.find('all', {fields: fields, conditions: conditions, recursive: 2});

            }
            
            return tableStatus;
        },

        getTableStatusList: function(reload) {

            var self = this;

            var tableStatus = this.getTableStatuses(this._tableStatusLastTime);

            if (this._tableStatusList && this._tableStatusList.length > 0) {
                //
                tableStatus.forEach(function(o){

                    // @todo do not work!!!
                    var index = self._tableStatusIdxById[o.id];
GREUtils.log("getTableStatusList:::" + index + " , id:::" + o.id);
// GREUtils.log(GeckoJS.BaseObject.dump(o));
                    if (typeof index == "undefined") {
// GREUtils.log("getTableStatusList2:::" + index + " , id:::" + o.id);
                        self._tableStatusLastTime = 0;
                        self._tableStatusList = null;
                    } else {

                        if (self._tableStatusList[index]) {
                            self._tableStatusList[index] = o;
                        }
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

            // gen tables status

            // var tables = [];
            if (tableStatus) {
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
                        o.start_time = o.TableOrder[0].transaction_created;
                    };

                    if (o.TableBooking && o.TableBooking.length > 0) {

                        o.booking = o.TableBooking[0].booking;
                    }

                    // set last status modify time
                    if (o.modified > self._tableStatusLastTime) {
                        self._tableStatusLastTime = o.modified;
                    }
                    // this._tableStatusLastTime = this._tableStatusLastTime < o.modified ? o.modified : this._tableStatusLastTime;

                });
            }

            return tableStatus;

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
                transaction_created: tableObj.transaction_created,

                table_id: tableObj.table_id,
                total: tableObj.total,
                table_status_id: tableObj.table_status_id

            };

            return tableStatusObj;
        },

        addCheck: function(checkObj) {
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
                status: 0,
                terminal_no: checkObj.terminal_no,
                transaction_created: checkObj.created,

                total: checkObj.total,

                table_id: (index > -1) ? this._tableStatusList[index].table_id : '',
                table_status_id: (index > -1) ? this._tableStatusList[index].id : ''

            };

            this.setTableStatus( this.genTableStatusObj(tableObj));

        },

        touchTableStatus: function(table_no) {
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

        removeCheck: function(checkObj) {

            var remoteUrl = this.getRemoteService('removeCheck');
            var tableStatus = null;

            if (remoteUrl) {

                // tableStatus = this.requestRemoteService('POST', remoteUrl, GeckoJS.BaseObject.serialize({table_no: table_no, holdTable: holdTable}));
                tableStatus = this.requestRemoteService('GET', remoteUrl + '/' + checkObj.table_no + '/' + checkObj.id, null);

                return ;
            }

            this.TableOrder.delAll("order_id='" + checkObj.id + "'");

            this.touchTableStatus(checkObj.table_no);

            return checkObj;

        },

        holdTable: function(table_no, holdTable) {
            // GREUtils.log("DEBUG", "hold table...");

            this.setTableHostBy(table_no, holdTable);

            // return;
            var list = this.getTableStatusList(this._tableStatusLastTime);
            return list;
        },

        getTableStatus: function(table_no) {
            // @todo rack
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

        setTableStatus: function(tableStatusObj) {

            // this.setTableMap(tableStatusObj);

            // @todo rack
            
            var remoteUrl = this.getRemoteService('setTableStatus');
            var tableStatus = null;

            if (remoteUrl) {

                tableStatus = this.requestRemoteService('POST', remoteUrl, GeckoJS.BaseObject.serialize(tableStatusObj));

                return ;
            }

            var table_no = tableStatusObj.table_no;
            var conditions = "table_statuses.table_no='" + table_no + "'";
            var tableStatusObjTmp = this.find('first', {
                conditions: conditions
            });

            // tableStatus record exist
            if (tableStatusObjTmp) {
                
                    // update tableStatus record
                    this.id = tableStatusObjTmp.id;
                    // var retObj = this.saveStatus(tableStatusObj);
                    var tableOrderObj = this.save(tableStatusObj);

                    // save TableOrder...
                    var tableOrderObj = this.TableOrder.find("first", {conditions: "table_orders.order_id='" + tableStatusObj.order_id + "'"});

                    if (tableOrderObj) {
                        this.TableOrder.id = tableOrderObj.id;
                    } else {
                        this.TableOrder.id = ''; // append table order
                    }
                    var statusOrderObj = this.TableOrder.save(tableStatusObj);
                
            }

        }

    };

    var TableStatusModel = window.TableStatusModel = GeckoJS.Model.extend(__model__);

})();

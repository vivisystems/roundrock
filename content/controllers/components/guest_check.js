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

        initial: function () {
            this.log("GuestCheck initial...");
            // @todo : check orders first and set _checkNoArray, _tableNoArray...
        },

        getNewCheckNo: function() {
            var i = 1;
            var ar = this.getCheckList('AllCheck', null);
            while (i <= 200) {
                if (!this._checkNoArray[i] || this._checkNoArray[i] == 0) {
                    this._checkNoArray[i] = 1;
                    break;
                }
                i++;
            }
            GeckoJS.Session.set('vivipos_fec_check_number', i);
            return "" + i;
        },

        getNewTableNo: function() {
            var i = 1;
            var ar = this.getCheckList('AllCheck', null);

            var tables = [];
            for(var k=1; k <= 100; k++) {
                let o = {};
                o.table_no = k;
                tables.push(o);
            }

            ar.forEach(function(o) {
                if (o.table_no) {
                    if (tables[o.table_no - 1].sequence) {
                        tables[o.table_no - 1].sequence = tables[o.table_no - 1].sequence + ", " + o.sequence;
                        tables[o.table_no - 1].check_no = tables[o.table_no - 1].check_no + ", " + o.check_no;
                    } else {
                        tables[o.table_no - 1].sequence = o.sequence;
                        tables[o.table_no - 1].check_no = o.check_no;
                    }
                }
            });

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

        load: function () {
            // this.log("GuestCheck load...");
        },

        guest: function(num) {
            // this.log("GuestCheck guest..." + num);
            GeckoJS.Session.set('vivipos_fec_number_of_customers', num);
        },

        destination: function(dest) {
            // this.log("GuestCheck guest..." + num);
            GeckoJS.Session.set('vivipos_fec_order_destination', dest);
        },

        table: function(table_no) {
            // this.log("GuestCheck table..." + table_no);
            this.getCheckList('AllCheck', null);
            var allowDupTableNo = true; // @todo for test...
            if (!this._tableNoArray[table_no] || this._tableNoArray[table_no] == 0 || allowDupTableNo) {
                this._tableNoArray[table_no] = 1;
                GeckoJS.Session.set('vivipos_fec_table_number', table_no);
                return table_no;
            } else {
                return -1;
            }
        },

        check: function(check_no) {
            // this.log("GuestCheck check..." + check_no);
            this.getCheckList('AllCheck', null);
            if (!this._checkNoArray[check_no] || this._checkNoArray[check_no] == 0) {
                this._checkNoArray[check_no] = 1;
                GeckoJS.Session.set('vivipos_fec_check_number', check_no);
                return check_no;
            } else {
                return -1;
            }
        },

        getCheckList: function(key, no) {
            //
            var self = this;
            var order = new OrderModel();
            var fields = ['orders.id', 'orders.sequence', 'orders.check_no',
                          'orders.table_no', 'orders.status'];
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

            var ord = order.find('all', {fields: fields, conditions: conditions});

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

            return ord;
        },

        store: function(count) {
            if (count > 0) {
                // this.log("GuestCheck store..." + no);
                this._controller.addMarker('subtotal');
                this._controller.submit(2);

                this._controller.dispatchEvent('onWarning', _('STORED'));

                // @todo OSD
                NotifyUtils.warn(_('This order has been stored!!'));
            } else {
                // @todo OSD
                NotifyUtils.warn(_('This order is empty!!'));
            }
        },

        recallByOrderNo: function(no) {
            // this.log("GuestCheck recall by order_no..." + no);
            if (no)
                this.recall('OrderNo', no);
            else
                this.recall('AllCheck');
        },

        recallByCheckNo: function(no) {
            // this.log("GuestCheck recall by check_no..." + no);
            if (no)
                this.recall('CheckNo', no);
            else
                this.recall('AllCheck');
        },

        recallByTableNo: function(no) {
            // this.log("GuestCheck recall by table_no..." + no);
            if (no)
                this.recall('TableNo', no);
            else
                this.recall('AllCheck');
        },

        recall: function(key, no) {
            // this.log("GuestCheck recall...key:" + key + ",  no:" + no);
            switch(key) {
                case 'OrderNo':
                    var order = new OrderModel();
                    var fields = ['orders.id', 'orders.sequence', 'orders.check_no',
                                  'orders.table_no', 'orders.status'];
                    var conditions = "orders.sequence='" + no + "'";
                    var ord = order.find('all', {fields: fields, conditions: conditions});

                    if (ord && ord.length > 0) {
                        var id = ord[0].id;
                        var status = ord[0].status;

                        this._controller.unserializeFromOrder(id);

                        if (status == 1) {
                            // @todo OSD
                            NotifyUtils.warn(_('This order has been submited!!'));
                        }
                    }
                     else {
                        // @todo OSD
                        NotifyUtils.warn(_('Can not find the Order# (%S)!!', [no]));
                    }
                    break;
                case 'CheckNo':
                    var order = new OrderModel();
                    var fields = ['orders.id', 'orders.sequence', 'orders.check_no',
                                  'orders.table_no', 'orders.status'];
                    var conditions = "orders.check_no='" + no + "' AND orders.status='2'";
                    var ord = order.find('all', {fields: fields, conditions: conditions});

                    if (ord && ord.length > 0) {

                        var id = ord[0].id;
                        var status = ord[0].status;

                        this._controller.unserializeFromOrder(id);

                        // display to onscreen VFD
                        this._controller.dispatchEvent('onWarning', _('RECALL# %S', [no]));

                        if (status == 1) {
                            // @todo OSD
                            NotifyUtils.warn(_('This order has been submited!!'));
                        }
                    } else {
                        // @todo OSD
                        NotifyUtils.warn(_('Can not find the Check# %S !!', [no]));
                    }
                    break;
                case 'TableNo':
                    var order = new OrderModel();
                    var fields = ['orders.id', 'orders.sequence', 'orders.check_no',
                                  'orders.table_no', 'orders.status'];
                    var conditions = "orders.table_no='" + no + "' AND orders.status='2'";
                    var ord = order.find('all', {fields: fields, conditions: conditions});

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

                        window.openDialog(aURL, 'select_checks', features, inputObj);

                        if (inputObj.ok && inputObj.index) {
                            var idx = inputObj.index;
                            // return queues[idx].key;
                            var id = ord[idx].id;
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
                        var id = ord[0].id;
                        var status = ord[0].status;
                        var check_no = ord[0].check_no;

                        this._controller.unserializeFromOrder(id);

                        // display to onscreen VFD
                        this._controller.dispatchEvent('onWarning', _('RECALL# %S', [check_no]));

                        if (status == 1) {
                            // @todo OSD
                            NotifyUtils.warn(_('This order has been submited!!'));
                        }
                    } else {
                        // @todo OSD
                        NotifyUtils.warn(_('Can not find the Table# %S !!', [no]));
                    }
                    break;
                case 'AllCheck':
                    var order = new OrderModel();
                    var fields = ['orders.id', 'orders.sequence', 'orders.check_no',
                                  'orders.table_no', 'orders.status'];
                    var conditions = "orders.status='2'";
                    var ord = order.find('all', {fields: fields, conditions: conditions});

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

                        window.openDialog(aURL, 'select_checks', features, inputObj);

                        if (inputObj.ok && inputObj.index) {
                            var idx = inputObj.index;
                            // return queues[idx].key;
                            var id = ord[idx].id;
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
                        var id = ord[0].id;
                        var status = ord[0].status;
                        var check_no = ord[0].check_no;

                        this._controller.unserializeFromOrder(id);

                        // display to onscreen VFD
                        this._controller.dispatchEvent('onWarning', _('RECALL# %S', [check_no]));

                        if (status == 1) {
                            // @todo OSD
                            NotifyUtils.warn(_('This order has been submited!!'));
                        }
                    } else {
                        // @todo OSD
                        NotifyUtils.warn(_('Can not find the Table# %S !!', [no]));
                    }
                    break;
            }

        }
    });

})();

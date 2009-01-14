(function() {

    var GuestCheckComponent = window.GuestCheckComponent = GeckoJS.Component.extend({

    /**
     * Component GuestCheck
     */

            /*
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
            var i = 0;
            while (i < 500) {
                if (!this._checkNoArray[i] || this._checkNoArray[i] == 0) {
                    this._checkNoArray[i] = 1;
                    break;
                }
                i++;
            }
            GeckoJS.Session.set('vivipos_fec_check_number', i);
            return i;
        },

        getNewCheckNo: function() {
            var i = 0;
            while (i < 500) {
                if (!this._tableNoArray[i] || this._tableNoArray[i] == 0) {
                    this._tableNoArray[i] = 1;
                    break;
                }
                i++;
            }
            GeckoJS.Session.set('vivipos_fec_table_number', i);
            return i;
        },

        releaseCheckNo: function(check_no) {
            if (!this._checkNoArray[check_no] || this._checkNoArray[check_no] == 1) {
                this._checkNoArray[check_no] = 0;
                this.log("GuestCheck releaseCheckNo..." + check_no);
            }
        },

        releaseTableNo: function(table_no) {
            if (!this._checkNoArray[table_no] || this._checkNoArray[table_no] == 1) {
                this._checkNoArray[table_no] = 0;
                this.log("GuestCheck releaseTableNo..." + table_no);
            }
        },

        load: function () {
            this.log("GuestCheck load...");
        },

        guest: function(num) {
            //
            this.log("GuestCheck guest..." + num);
            GeckoJS.Session.set('vivipos_fec_number_of_customers', num);
        },

        table: function(table_no) {
            //
            this.log("GuestCheck table..." + table_no);
            if (!this._tableNoArray[table_no] || this._tableNoArray[table_no] == 0) {
                this._tableNoArray[table_no] = 1;
                GeckoJS.Session.set('vivipos_fec_table_number', table_no);
                return table_no;
            } else {
                return -1;
            }

            GeckoJS.Session.set('vivipos_fec_table_number', table_no);
        },

        check: function(check_no) {
            //
            this.log("GuestCheck check..." + check_no);
            if (!this._checkNoArray[check_no] || this._checkNoArray[check_no] == 0) {
                this._checkNoArray[check_no] = 1;
                GeckoJS.Session.set('vivipos_fec_check_number', check_no);
                return check_no;
            } else {
                return -1;
            }
        },

        getCheckList: function() {
            //
        },

        recallByOrderNo: function(no) {
            this.log("GuestCheck recall by order_no...");
            this.recall('OrderNo', no);
        },

        recallByCheckNo: function(no) {
            this.log("GuestCheck recall by check_no...");
            this.recall('CheckNo', no);
        },

        recallByTableNo: function(no) {
            this.log("GuestCheck recall by table_no...");
            this.recall('TableNo', no);
        },

        recall: function(key, no) {
            //
            this.log("GuestCheck recall...");
        }
    });

})();

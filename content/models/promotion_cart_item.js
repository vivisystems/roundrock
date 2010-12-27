(function(){

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var  __promotion_cart_item_model__ = {

        name: 'PromotionCartItem',
        useDbConfig: 'memory',

        saveTransactionItems: function(transaction_data) {

            //this.truncate();

            for ( var index in transaction_data.items) {
                var item = GREUtils.extend({}, transaction_data.items[index]);
                if (item.condiments) {
                    item.condiments = GeckoJS.BaseObject.getKeys(item.condiments).join(',');
                }else {
                    item.condiments = "";
                }
                item.org_qty = item.current_qty;
                this.create();
                this.save(item);
            }
        },

        // @todo transaction order discount / surcharge ??
        saveTransactionAdditions: function(transaction_data) {

        },

        appendItem: function(item) {

            var condiments = "";
            if (item.condiments) {
                condiments = GeckoJS.BaseObject.getKeys(item.condiments).join(',');
            }

            var sql = "INSERT OR REPLACE INTO promotion_cart_items VALUES("
                    + "'"+ item.index+"',"
                    + "'"+ item.id+"',"
                    + "'"+ this.escapeString(item.name) +"',"
                    + "'"+ item.no+"',"
                    + "'"+ item.barcode+"',"
                    + "'"+ item.cate_no+"',"
                    + "'"+ item.link_group+"',"
                    + item.current_qty+","
                    + item.current_qty+","
                    + item.current_price+","
                    + item.current_subtotal+","
                    + item.current_subtotal+","
                    + item.current_tax+","
                    + item.current_discount+","
                    + item.current_surcharge+","
                    + "'"+ this.escapeString(condiments) +"',"
                    + item.current_condiment+","
                    + "'"+ this.escapeString(item.destination) +"'"
                    + ")";

                var datasource = this.getDataSource();
                
                try {

                    datasource.connect();
                    if(sql && datasource.conn) datasource.conn.executeSimpleSQL(sql);

//                    var sql2 = "UPDATE promotion_cart_items SET current_qty=org_qty, current_subtotal=org_subtotal;";
//                    if(sql2 && datasource.conn) datasource.conn.executeSimpleSQL(sql2);

                }catch(e) {
                    this.log('ERROR', 'appendItem: promotion_cart_items error. SQL:' + sql, e);
                }

        },

        removeItem: function(item) {

            var sql = 'DELETE FROM promotion_cart_items WHERE "index"=' + "'"+item.index +"'";

            var datasource = this.getDataSource();

            try {

                datasource.connect();
                if(sql && datasource.conn) datasource.conn.executeSimpleSQL(sql);

                // reset all items 's qty and subtotal
//                this.resetItems();

            }catch(e) {
                this.log('ERROR', 'removeItem: promotion_cart_items error. SQL:' + sql, e);
            }

        },

        truncate: function() {
            var sql = "DELETE FROM promotion_cart_items";
            var datasource = this.getDataSource();

            try {

                datasource.connect();
                if(sql && datasource.conn) datasource.conn.executeSimpleSQL(sql);

            }catch(e) {
                this.log('ERROR', 'truncate: promotion_cart_items error. SQL:' + sql, e);
            }

        },

        resetItems: function() {

            var datasource = this.getDataSource();

            try {

                var sql2 = "UPDATE promotion_cart_items SET current_qty=org_qty, current_subtotal=org_subtotal;";
                if(sql2 && datasource.conn) datasource.conn.executeSimpleSQL(sql2);

            }catch(e) {
                this.log('ERROR', 'resetItems: promotion_cart_items error. SQL:' + sql2, e);
            }

        },

        reserveItems: function(items) {

            items.forEach(function(item){
                
                var index = item.index;
                var qty = item.current_qty;
                var subtotal = item.current_subtotal;

                var sql = "UPDATE promotion_cart_items SET current_qty=current_qty-"+qty+
                          ", current_subtotal=current_subtotal-"+subtotal+" WHERE \"index\"='"+index+"'";
                      
                //this.log("reserveItems sql " + sql);
                
                try {
                    this.getDataSource().conn.executeSimpleSQL(sql);
                }catch(e) {
                    this.log('ERROR', 'reserveItems: promotion_cart_items error. SQL:' + sql, e);
                }

            }, this);

        }

    };

    var PromotionCartItemModel = window.PromotionCartItemModel = AppModel.extend(__promotion_cart_item_model__);

})();

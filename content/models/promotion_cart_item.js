(function(){

    var  __promotion_cart_item_model__ = {
        name: 'PromotionCartItem',
        useDbConfig: 'memory',

        saveTransactionItems: function(transaction_data) {

            this.truncate();

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
        saveTransactionOrder: function(transaction_data) {

        },


        reserveItems: function(items) {

            items.forEach(function(item){
                
                var id = item.id;
                var qty = item.current_qty;
                var subtotal = item.current_subtotal;

                var sql = "UPDATE promotion_cart_items SET current_qty=current_qty-"+qty+
                          ", current_subtotal=current_subtotal-"+subtotal+" WHERE id='"+id+"'";
                      
                // this.log("reserveItems sql " + sql);
                
                try {
                    this.getDataSource().conn.executeSimpleSQL(sql);
                }catch(e) {
                }

            }, this);

        }

    };

    var PromotionCartItemModel = window.PromotionCartItemModel = GeckoJS.Model.extend(__promotion_cart_item_model__);

})();

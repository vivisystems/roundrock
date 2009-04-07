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
                this.create();
                this.save(item);
            }
        },

        saveTransactionOrder: function(transaction_data) {

        }

    };

    var PromotionCartItemModel = window.PromotionCartItemModel = GeckoJS.Model.extend(__promotion_cart_item_model__);

})();

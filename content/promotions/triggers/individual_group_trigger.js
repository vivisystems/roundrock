(function() {

    /**
     * IndividualGroup trigger klass
     */
    var __klass__ = {
    
        name: 'IndividualGroup',

        triggerGroups: [],

        startup: function() {
            var settings = this.getSettings();
            this.triggerGroups = settings.data.concat([]);
            // this.log('statup ' + this.dump(this.triggerGroups));
        },

        execute: function() {

            if (this.triggerGroups.length == 0) return false;

            var groupItem = this.triggerGroups.splice(0,1)[0];
            //this.log('groupItem = ' + this.dump(groupItem));
            if (!groupItem) return false;

            var productLinkGroupId = groupItem.id;
            if (!productLinkGroupId) return false;

            var settings = this.getSettings();

            if (parseInt(settings.amount_value) <= 0) return false;

            // this.log(this.dump(settings));
            var cartItemModel = this.getCartItemModel();

            var amount_value = parseInt(settings.amount_value);
            var amount_type = settings.amount_type;
            var amount_mode = settings.amount_mode;
            var destination = settings.destination;

            var condition = " link_group like '%"+productLinkGroupId+"%' ";
            if (destination) {
                condition += " AND destination='"+destination+"' ";
            }

            var sql = "SELECT SUM(current_qty) AS qty, SUM(current_qty*current_price) AS subtotal FROM promotion_cart_items WHERE "+condition+" ";

            //this.log('execute ' + sql) ;

            var result = cartItemModel.getDataSource().fetchAll(sql);

            if (result.length == 0) return false;

            var subtotal_qty = result[0]['qty'];
            var subtotal = result[0]['subtotal'];

            //this.log(this.dump(result));

            var amount = 0 ;

            if (amount_type == 'by_qty') {
                amount = Math.floor(subtotal_qty/amount_value);
            }else {
                amount = Math.floor(subtotal/amount_value);
            }

            if (amount <= 0) return false;

            // setting amount for mode and process matchedItems
            var matchedQty = 0;
            var matchedItems = [];
            var cartItems = [];

            // ONLY DISTINCT cart item
            var sql2 = "SELECT DISTINCT(ROWID) AS ROWID,promotion_cart_items.* FROM promotion_cart_items WHERE " + condition + " AND promotion_cart_items.current_price > 0 ORDER BY promotion_cart_items.current_price ";
            cartItems = cartItemModel.getDataSource().fetchAll(sql2);

            switch (amount_mode) {
                case "single":
                    amount = 1;
                    if (amount_type == 'by_qty') {
                        matchedItems = this.processMatchedItemsByItemsQty(cartItems, amount_value);
                    }else {
                        matchedItems = this.processMatchedItemsByItemsSubtotal(cartItems, amount_value);
                    }
                    break;

                case "more":
                    amount = 1;
                    if (amount_type == 'by_qty') {
                        matchedItems = this.processMatchedItemsByItemsQty(cartItems, subtotal_qty);
                    }else {
                        matchedItems = this.processMatchedItemsByItemsSubtotal(cartItems, subtotal);
                    }
                    break;

                case "multiple":
                    if (amount_type == 'by_qty') {
                        matchedItems = this.processMatchedItemsByItemsQty(cartItems, amount*amount_value);
                    }else {
                        matchedItems = this.processMatchedItemsByItemsSubtotal(cartItems, amount*amount_value);
                    }
                    break;

            }

            //this.log('matchedItems ' + this.dump(matchedItems));
            if (matchedItems.length) {
                this.setMatchedAmount(amount);
                return true;
            }
            
            return false;

        },

        isRepeatable: function() {

            //this.log('IndividualPlu isRepeatable ' + (this.triggerGroups.length > 0));
            return (this.triggerGroups.length > 0);

        }
    };

    PromotionTrigger.extend('IndividualGroup', __klass__);

})();

(function() {

    /**
     * MultiGroup trigger klass
     */
    var __klass__ = {
    
        name: 'MultiGroup',

        startup: function() {

        },

        execute: function() {

            var settings = this.getSettings();

            var firstGroup = settings.first_group;
            var secondGroup = settings.second_group;
            var firstAmountValue = isNaN(parseInt(settings.first_amount_value)) ? 0 : parseInt(settings.first_amount_value);
            var secondAmountValue = isNaN(parseInt(settings.second_amount_value)) ? 0 : parseInt(settings.second_amount_value);
            var amount_type = settings.amount_type;
            var amount_mode = settings.amount_mode;
            var firstDestination = settings.first_destination;
            var secondDestination = settings.second_destination;

            if (!firstGroup || !secondGroup || !firstAmountValue || !secondAmountValue) {
                //this.log('no group' + firstGroup + ', ' + secondGroup + ',' + firstAmountValue + ',' + secondAmountValue);
                return false;
            }

            var cartItemModel = this.getCartItemModel();

            var condition1, condition2 , sql, result;
            var first_subtotal_qty=0, first_subtotal=0, second_subtotal_qty=0, second_subtotal=0;

            // first group
            condition1 = " link_group like '%"+firstGroup+"%' ";
            if (firstDestination) {
                condition1 += " AND destination='"+firstDestination+"' ";
            }
            sql = "SELECT SUM(current_qty) AS qty, SUM(current_qty*current_price) AS subtotal FROM promotion_cart_items WHERE "+condition1+" ";
            //this.log('execute ' + sql) ;
            
            result = cartItemModel.getDataSource().fetchAll(sql);
            if (result.length == 0) return false;

            first_subtotal_qty = result[0]['qty'] || 0;
            first_subtotal = result[0]['subtotal'] || 0;

            // second group
            condition2 = " link_group like '%"+secondGroup+"%' ";
            if (secondDestination) {
                condition2 += " AND destination='"+secondDestination+"' ";
            }
            sql = "SELECT SUM(current_qty) AS qty, SUM(current_qty*current_price) AS subtotal FROM promotion_cart_items WHERE "+condition2+" ";
            //this.log('execute ' + sql) ;

            result = cartItemModel.getDataSource().fetchAll(sql);
            if (result.length == 0) return false;

            second_subtotal_qty = result[0]['qty'] || 0;
            second_subtotal = result[0]['subtotal'] || 0;

            //this.log('' + first_subtotal_qty + ', ' + first_subtotal + ',' + second_subtotal_qty + ',' + second_subtotal);

            // set promotion maximus amount
            var amount = 0 ;

            if (amount_type == 'by_qty') {
                amount = Math.min(Math.floor(first_subtotal_qty/firstAmountValue), Math.floor(second_subtotal_qty/secondAmountValue));
            }else {
                amount = Math.min(Math.floor(first_subtotal/firstAmountValue), Math.floor(second_subtotal/secondAmountValue));
            }

            //this.log('amount = ' + amount );
            
            if (amount <= 0) return false;

            // setting amount for mode and process matchedItems
            var matchedQty = 0;
            var matchedItems1 = [], matchedItems2 = [];
            var matchedItemsSubtotal1 = 0, matchedItemsSubtotal2 = 0;
            var cartItems1 = [], cartItems2 = [];

            // ONLY DISTINCT cart item for first group
            sql = "SELECT DISTINCT(ROWID) AS ROWID,promotion_cart_items.* FROM promotion_cart_items WHERE " + condition1 + " ORDER BY promotion_cart_items.current_price";
            cartItems1 = cartItemModel.getDataSource().fetchAll(sql);
            //this.log('execute ' + sql) ;

            // ONLY DISTINCT cart item for second group
            sql = "SELECT DISTINCT(ROWID) AS ROWID,promotion_cart_items.* FROM promotion_cart_items WHERE " + condition2 + " ORDER BY promotion_cart_items.current_price";
            cartItems2 = cartItemModel.getDataSource().fetchAll(sql);
            //this.log('execute ' + sql) ;

            //this.log(this.dump(cartItems1) + this.dump(cartItems2));
            
            switch (amount_mode) {
                case "single":
                    amount = 1;
                    if (amount_type == 'by_qty') {                       
                        this.processMatchedItemsByItemsQty(cartItems1, firstAmountValue);
                        matchedItems1 = this.getMatchedItems();
                        matchedItemsSubtotal1 = this.getMatchedItemsSubtotal();

                        this.processMatchedItemsByItemsQty(cartItems2, secondAmountValue);
                        matchedItems2 = this.getMatchedItems();
                        matchedItemsSubtotal2 = this.getMatchedItemsSubtotal();                       
                    }else {
                        this.processMatchedItemsByItemsSubtotal(cartItems1, firstAmountValue);
                        matchedItems1 = this.getMatchedItems();
                        matchedItemsSubtotal1 = this.getMatchedItemsSubtotal();

                        this.processMatchedItemsByItemsSubtotal(cartItems2, secondAmountValue);
                        matchedItems2 = this.getMatchedItems();
                        matchedItemsSubtotal2 = this.getMatchedItemsSubtotal();
                    }
                    break;

                case "more":
                    amount = 1;
                    if (amount_type == 'by_qty') {
                        this.processMatchedItemsByItemsQty(cartItems1, first_subtotal_qty);
                        matchedItems1 = this.getMatchedItems();
                        matchedItemsSubtotal1 = this.getMatchedItemsSubtotal();

                        this.processMatchedItemsByItemsQty(cartItems2, second_subtotal_qty);
                        matchedItems2 = this.getMatchedItems();
                        matchedItemsSubtotal2 = this.getMatchedItemsSubtotal();                       
                    }else {
                        this.processMatchedItemsByItemsSubtotal(cartItems1, first_subtotal);
                        matchedItems1 = this.getMatchedItems();
                        matchedItemsSubtotal1 = this.getMatchedItemsSubtotal();

                        this.processMatchedItemsByItemsSubtotal(cartItems2, second_subtotal);
                        matchedItems2 = this.getMatchedItems();
                        matchedItemsSubtotal2 = this.getMatchedItemsSubtotal();
                    }
                    break;

                case "multiple":
                    if (amount_type == 'by_qty') {
                        this.processMatchedItemsByItemsQty(cartItems1, amount * firstAmountValue);
                        matchedItems1 = this.getMatchedItems();
                        matchedItemsSubtotal1 = this.getMatchedItemsSubtotal();

                        this.processMatchedItemsByItemsQty(cartItems2, amount * secondAmountValue);
                        matchedItems2 = this.getMatchedItems();
                        matchedItemsSubtotal2 = this.getMatchedItemsSubtotal();                       
                    }else {
                        this.processMatchedItemsByItemsSubtotal(cartItems1, amount * firstAmountValue);
                        matchedItems1 = this.getMatchedItems();
                        matchedItemsSubtotal1 = this.getMatchedItemsSubtotal();

                        this.processMatchedItemsByItemsSubtotal(cartItems2, amount * secondAmountValue);
                        matchedItems2 = this.getMatchedItems();
                        matchedItemsSubtotal2 = this.getMatchedItemsSubtotal();
                    }
                    break;

            }

            if (matchedItems1.length > 0 && matchedItems2.length > 0) {
                this.setMatchedAmount(amount);
                this.setMatchedItems(matchedItems1.concat(matchedItems2));
                this.setMatchedItemsSubtotal(matchedItemsSubtotal1+matchedItemsSubtotal2);

                //this.log('subtotal: ' + this.getMatchedItemsSubtotal());
                //this.log(this.dump(this.getMatchedItems()));
                return true;
            }else {
                this.setMatchedAmount(0);
                this.setMatchedItems([]);
                this.setMatchedItemsSubtotal(0);
            }
            
            return false;

        }

    };

    PromotionTrigger.extend('MultiGroup', __klass__);

})();

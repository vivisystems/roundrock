(function() {

    /**
     * CheapestOneFree type klass
     */
    var __klass__ = {
    
        name: 'CheapestOneFree',

        execute: function() {

            var settings = this.getSettings();

            var type = settings.type;
            var maximum_qty = settings.maximum_qty;
            var value = settings.value;

            var trigger = this.getTrigger();
            var amount_mode = trigger.getSettings().amount_mode;

            var discount = 0 ;

            var amount = trigger.getMatchedAmount();
            var items = trigger.getMatchedItems();

            var available_qty = maximum_qty * amount;

            var itemsByPrice = {};
            var itemsByPriceArray = [] ;

            var total_qty = 0;
            
            items.forEach(function(item){

                var qty = item.current_qty;
                var price = item.current_price;

                if (itemsByPrice[price+'']) {
                    itemsByPrice[price+''] += qty;
                }else {
                    itemsByPrice[price+''] = qty;
                }

                total_qty += qty;

            });

            // check if available_qty > total_qty ?
            if (available_qty>total_qty) available_qty = total_qty;

            for (let p in itemsByPrice) {
                itemsByPriceArray.push({
                    price: parseFloat(p),
                    qty: itemsByPrice[p]
                    });
            }

            itemsByPriceArray = new GeckoJS.ArrayQuery(itemsByPriceArray).orderBy("price asc");
            // this.log(this.dump(itemsByPriceArray));

            if (itemsByPriceArray.length > 0) {

                var discount_qty = 0 ;

                switch(amount_mode) {
                    case 'single':
                    case 'more':
                        //discount_qty = (available_qty < itemsByPriceArray[0].qty) ? available_qty : itemsByPriceArray[0].qty;
                        discount_qty = available_qty;
                        break;

                    case 'multiple':
                        discount_qty = available_qty;
                        break;
                    
                }
                
                // 
                while (discount_qty>0) {

                    let discount_item = (itemsByPriceArray.splice(0,1))[0];
                    let cheapest_price = discount_item.price;
                    let cheapest_qty = discount_item.qty;

                    let qty2 = (discount_qty>cheapest_qty) ? cheapest_qty : discount_qty ;

                    switch(type) {
                        case 'by_fixed_value':
                            discount += (0 - parseFloat((cheapest_price-value)*qty2));
                            break;
                        case 'by_amount_off':
                            discount += (0 - parseFloat(value*qty2));
                            break;
                        case 'by_percentage_off':
                            discount += (0 - parseFloat((cheapest_price * value / 100)*qty2));
                            break;
                    }
                    
                    discount_qty -= qty2;
                    
                }
                
                this.setDiscountSubtotal(discount);

            }

            return true;
        }

    };

    PromotionType.extend('CheapestOneFree', __klass__);

})();

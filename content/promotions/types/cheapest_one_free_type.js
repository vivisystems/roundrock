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

            var discount = 0 ;
            var cheapest_itemId = '';
            var cheapest_qty = 0;
            var cheapest_price = -1;

            var amount = trigger.getMatchedAmount();
            var items = trigger.getMatchedItems();

            var available_qty = maximum_qty * amount;
            
            items.forEach(function(item){
                var id = item.id;
                var qty = item.current_qty;
                var price = item.current_price;

                if (price < cheapest_price || cheapest_price < 0) {
                    cheapest_itemId = id;
                    cheapest_price = price;
                    cheapest_qty = qty;
                }

            }, this);

            if (cheapest_itemId) {
                var qty = (available_qty < cheapest_qty) ? available_qty : cheapest_qty;

                switch(type) {
                    case 'by_fixed_value':
                        discount = parseFloat((cheapest_price-value)*qty);
                        break;
                    case 'by_amount_off':
                        discount = parseFloat(value*qty);
                        break;
                    case 'by_percentage_off':
                        discount = parseFloat((cheapest_price * value / 100)*qty);
                        break;
                }
                
                this.setDiscountSubtobal(discount);

            }

            return true;
        }

    };

    PromotionType.extend('CheapestOneFree', __klass__);

})();

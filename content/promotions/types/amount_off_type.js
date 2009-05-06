(function() {

    /**
     * AmountOff type klass
     */
    var __klass__ = {
    
        name: 'AmountOff',

        execute: function() {

            var settings = this.getSettings();
            var type = settings.type;
            var value = settings.value;

            var trigger = this.getTrigger();

            var discount = 0;

            switch(type) {

                case "by_qty":
                    var qty = trigger.getMatchedItemsQty();
                    discount = parseFloat(qty*value);
                    break;

                case "by_subtotal":
                    var amount = trigger.getMatchedAmount();
                    discount = parseFloat(amount*value);
                    break;
            }

            this.setDiscountSubtobal(discount);
            
            return true;
        }

    };

    PromotionType.extend('AmountOff', __klass__);

})();

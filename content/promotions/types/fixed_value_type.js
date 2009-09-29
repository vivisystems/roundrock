(function() {

    /**
     * FixedValue type klass
     */
    var __klass__ = {
    
        name: 'FixedValue',

        execute: function() {
            
            var settings = this.getSettings();

            var type = settings.type;
            var value = settings.value;

            var trigger = this.getTrigger();

            var discount = 0;
            var subtotal =0;
            var qty = 0;

            switch(type) {
                case "by_qty":
                    subtotal = trigger.getMatchedItemsSubtotal();
                    qty = trigger.getMatchedItemsQty();
                    discount = (0 - parseFloat(subtotal - qty*value));
                    break;

                case "by_subtotal":
                    subtotal = trigger.getMatchedItemsSubtotal();
                    discount = (0 - parseFloat(subtotal - value));
                    break;
            }

            this.setDiscountSubtotal(discount);

            return true;

        }

    };

    PromotionType.extend('FixedValue', __klass__);

})();

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
                    discount = (0 - parseFloat(qty*value));
                    break;

                case "by_subtotal":
                    var amount = trigger.getMatchedAmount();
                    discount = (0 - parseFloat(amount*value));
                    break;
            }

            //this.log('amount off discount = ' + discount);

            this.setDiscountSubtobal(discount);
            
            return true;
        }

    };

    PromotionType.extend('AmountOff', __klass__);

})();

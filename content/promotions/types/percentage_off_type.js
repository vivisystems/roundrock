(function() {

    /**
     * PercentageOff type klass
     */
    var __klass__ = {
    
        name: 'PercentageOff',

        execute: function() {
            
            var settings = this.getSettings();
            var value = settings.value;

            var trigger = this.getTrigger();

            var subtotal = trigger.getMatchedItemsSubtotal();

            var discount =  (0 - parseFloat(subtotal * value / 100));

            this.setDiscountSubtotal(discount);

            return true;
        }

    };

    PromotionType.extend('PercentageOff', __klass__);

})();

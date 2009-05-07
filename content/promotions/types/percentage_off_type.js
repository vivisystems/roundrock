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

            var discount =  parseFloat(subtotal * value / 100);

            this.setDiscountSubtobal(discount);

            return true;
        }

    };

    PromotionType.extend('PercentageOff', __klass__);

})();

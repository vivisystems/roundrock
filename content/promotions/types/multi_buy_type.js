(function() {

    /**
     * MultiBuy type klass
     */
    var __klass__ = {
    
        name: 'MultiBuy',

        execute: function() {
            
            var settings = this.getSettings();

            var type = settings.type;
            var quantities = settings.data;

            //this.log('type = ' + type + '   datas ' + this.dump(quantities));
            var trigger = this.getTrigger();

            var discount = 0 ;

            var amount = trigger.getMatchedAmount();
            var subtotal = trigger.getMatchedItemsSubtotal();

            //this.log('amount ' + amount );
            var items = trigger.getMatchedItems();

            //this.log('items ' + this.dump(items) );

            var hasPromotions = false;
            var promotionQty = 0;
            var promotionValue = 0;
            
            for (var i = quantities.length -1; i >=0; i--) {

                var setting = quantities[i];

                if (amount >= setting.quantity) {
                    hasPromotions = true;
                    promotionQty = setting.quantity;
                    promotionValue = setting.value;
                    break;
                }
            }

            if (hasPromotions) {

                switch(type) {
                    case 'by_fixed_value':
                        discount = (0 - parseFloat(subtotal - amount*promotionValue));
                        break;
                    case 'by_amount_off':
                        //discount = (0 - parseFloat(promotionValue*amount)); // preitem amount off
                        discount = (0 - parseFloat(promotionValue)); // subtotal amount off
                        break;
                    case 'by_percentage_off':
                        discount = (0 - parseFloat(subtotal * promotionValue / 100));
                        break;
                }

                this.setDiscountSubtotal(discount);

            }
            
            return hasPromotions;

        }

    };

    PromotionType.extend('MultiBuy', __klass__);

})();

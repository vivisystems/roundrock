(function() {

var __klass__ = {
    
    name: 'Test1',


    startup: function() {
        this.log('Test1 Trigger startup');

        this._cartItemModel = new PromotionCartItemModel();
    },

    /*
     * Type Action
     */
    execute: function() {
        // abstract
        this.log('Test1 Trigger');

        var cartItemModel = this._cartItemModel;

        var triggerQtys= cartItemModel.getDataSource().fetchAll("select sum(current_qty-reserved_qty) as qty from promotion_cart_items where id='f70b4ba1-0698-4958-b105-6e6e44317d83' group by id");

        if (triggerQtys.length <= 0) return false;

        var triggerQty = Math.floor(triggerQtys[0]['qty'] / 3);

        if (triggerQty >=1 ) {
            // alert('ddd '  +  triggerQty);
        }else {
            return false;
        }

        return true;
    },


    reserveTriggerItems: function() {
        alert(this.dump(this.triggerItems));
    }


};

PromotionTrigger.extend('Test1', __klass__);

})();

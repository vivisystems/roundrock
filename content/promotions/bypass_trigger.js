(function() {

var __klass__ = {
    
    name: 'Bypass',

    /*
     * Bypass Trigger will filtered all items
     */
    execute: function() {
        // abstract
        // this.log('Test1 Trigger');
        return true;
    }


};

PromotionTrigger.extend('Bypass', __klass__);

})();

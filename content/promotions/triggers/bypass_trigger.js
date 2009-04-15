(function() {

    /**
     * bypass trigger klass 
     */
    var __klass__ = {
    
        name: 'Bypass',

        execute: function() {
            return true;
        }

    };

    PromotionTrigger.extend('Bypass', __klass__);

})();

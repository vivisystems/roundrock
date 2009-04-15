(function() {

    /**
     * bypass type klass
     */
    var __klass__ = {
    
        name: 'Bypass',

        execute: function() {
            return true;
        }

    };

    PromotionType.extend('Bypass', __klass__);

})();

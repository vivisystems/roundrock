(function(){

    // key is in prefs 's registry key
    var key = 'amount_off';
    var sessionKey = "promotions_manager.type.settings."+key;

    /**
     * Controller Promotions Manager
     * 
     */
    var __controller__ = {

        name: 'AmountOffTypeSetting',

        /*
         * initial promotions rules for register
         */
        initial: function() {

            var settings = GeckoJS.Session.get(sessionKey) || null;

            this.setSettings(settings);

        },

        setSettings: function(settings) {
            this.updateForm(settings);
        },

        getSettings: function() {

            var formData = this.Form.serializeToObject('amountOffForm');

            // set to sessions
            GeckoJS.Session.set(sessionKey, formData);

        },

        updateForm: function(item) {

            if (item) {
                this.Form.unserializeFromObject('amountOffForm', item);
            }else {
                this.Form.reset('amountOffForm');
            }
            
        }


    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'AmountOffTypeSetting');
    }, false);

    // when promotion rule modify
    window.addEventListener('promotion_modify', function() {
        $do('getSettings', null, 'AmountOffTypeSetting');
    }, false);

    
})();

(function(){

    // key is in prefs 's registry key
    var key = 'percentage_off';
    var sessionKey = "promotions_manager.type.settings."+key;

    /**
     * Controller Promotions Manager
     * 
     */
    var __controller__ = {

        name: 'PercentageOffTypeSetting',

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

            var formData = this.Form.serializeToObject('percentageOffForm');

            // set to sessions
            GeckoJS.Session.set(sessionKey, formData);

        },

        updateForm: function(item) {

            if (item) {
                this.Form.unserializeFromObject('percentageOffForm', item);
            }else {
                this.Form.reset('percentageOffForm');
            }
            
        }


    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'PercentageOffTypeSetting');
    }, false);

    // when promotion rule modify
    window.addEventListener('promotion_modify', function() {
        $do('getSettings', null, 'PercentageOffTypeSetting');
    }, false);

    
})();

(function(){

    // key is in prefs 's registry key
    var key = 'fixed_value';
    var sessionKey = "promotions_manager.type.settings."+key;

    /**
     * Controller Promotions Manager
     * 
     */
    var __controller__ = {

        name: 'FixedValueTypeSetting',

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

            var formData = this.Form.serializeToObject('fixedValueForm');

            // set to sessions
            GeckoJS.Session.set(sessionKey, formData);

        },

        updateForm: function(item) {

            if (item) {
                this.Form.unserializeFromObject('fixedValueForm', item);
            }else {
                this.Form.reset('fixedValueForm');
            }
            
        }


    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'FixedValueTypeSetting');
    }, false);

    // when promotion rule modify
    window.addEventListener('promotion_modify', function() {
        $do('getSettings', null, 'FixedValueTypeSetting');
    }, false);

    
})();

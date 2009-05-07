(function(){

    // key is in prefs 's registry key
    var key = 'cheapest_one_free';
    var sessionKey = "promotions_manager.type.settings."+key;

    /**
     * Controller Promotions Manager
     * 
     */
    var __controller__ = {

        name: 'CheapestOneFreeTypeSetting',

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

            var formData = this.Form.serializeToObject('cheapestOneFreeForm');

            // set to sessions
            GeckoJS.Session.set(sessionKey, formData);

        },

        updateForm: function(item) {

            if (item) {
                this.Form.unserializeFromObject('cheapestOneFreeForm', item);
            }else {
                this.Form.reset('cheapestOneFreeForm');
            }
            
        }


    };

    GeckoJS.Controller.extend(__controller__);


    window.addEventListener('load', function() {
        $do('initial', null, 'CheapestOneFreeTypeSetting');
    }, false);

    // when promotion rule modify
    window.addEventListener('promotion_modify', function() {
        $do('getSettings', null, 'CheapestOneFreeTypeSetting');
    }, false);

    
})();

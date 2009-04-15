(function(){

    // key is in prefs 's registry key
    var key = 'bypass';
    var sessionKey = "promotions_manager.type.settings."+key;
    
    /**
     * Controller Promotions Manager
     * 
     */
    var __bypass_type_setting_controller__ = {

        name: 'BypassTypeSetting',

        /*
         * initial promotions rules for register
         */
        initial: function() {
        },
        
        getSettings: function() {
            // always update settings to empty object
            GeckoJS.Session.set(sessionKey, {});
        }

    };

    GeckoJS.Controller.extend(__bypass_type_setting_controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'BypassTypeSetting');
    }, false);

    // when promotion rule modify
    window.addEventListener('promotion_modify', function() {
        $do('getSettings', null, 'BypassTypeSetting');
    }, false);

    
})();

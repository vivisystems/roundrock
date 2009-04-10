(function(){

    // key is in prefs 's registry key
    var key = 'bypass';
    var sessionKey = "promotions_manager.trigger.settings."+key;

    /**
     * Controller Promotions Manager
     * 
     */
    var __bypass_trigger_setting_controller__ = {

        name: 'BypassTriggerSetting',

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

    GeckoJS.Controller.extend(__bypass_trigger_setting_controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'BypassTriggerSetting');
    }, false);

    // when promotion rule modify
    window.addEventListener('promotion_modify', function() {
        $do('getSettings', null, 'BypassTriggerSetting');
    }, false);

    
})();

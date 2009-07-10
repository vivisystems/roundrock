(function(){

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/localekeyboard_controller.js');

    /**
     * Controller Startup
     */
    function startup() {
       
        var locale = $('#locale')[0];
        var kbmap = $('#kbmap')[0];

        doSetOKCancel(
            function(){
                var changed = false;

                var locale = $('#locale')[0];
                var kbmap = $('#kbmap')[0];

                var topwin = GREUtils.XPCOM.getUsefulService("window-mediator").getMostRecentWindow(null);

                if (locale) {
                    changed = (locale.currentLocale != locale.selectedLocale)
                }

                if (kbmap) {
                    changed = changed || kbmap.currentKbmap != kbmap.selectedKbmap;
                }

                if (changed) {
                    if (GREUtils.Dialog.confirm(topwin, _('confirm language and keyboard mapping change'),
                                                        _('Language and Keyboard mapping changes require system restart to take effect. If you save the changes now, the system will restart automatically after you return to the Main Screen. Do you want to save your changes?')
                                                        )) {
                        // change both XUL and OS locales
                        locale.changeOSLocale();
                        locale.changeLocale();

                        // change keyboard mapping
                        kbmap.changeOSKbmap();

                        GeckoJS.Observer.notify(null, 'prepare-to-restart', this);

                    }
                    else {
                        return false;
                    }
                }

                return true;
            },
            function(){
                return true;
            }
        );
    };
    
    window.addEventListener('load', startup, false);

})();

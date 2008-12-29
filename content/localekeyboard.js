(function(){

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/localekeyboard_controller.js');

    /**
     * Controller Startup
     */
    function startup() {
       
        var locale = $('#locale')[0];
        var kbmap = $('#kbmap')[0];

        this.oldLocale = (locale) ? locale.currentLocale : null;
        this.oldKbmap = (kbmap) ? kbmap.currentKbmap : null;

        doSetOKCancel(
            function(){
                var changed = false;

                var locale = $('#locale')[0];
                var kbmap = $('#kbmap')[0];

                if (locale) {
                    // change both XUL and OS locales
                    locale.changeOSLocale();
                    locale.changeLocale();

                    changed = (locale.currentLocale != this.oldLocale)
                }

                if (kbmap) {
                    // change keyboard mapping
                    kbmap.changeOSKbmap();

                    changed = changed || kbmap.currentKbmap != this.oldKbmap;
                }

                if (changed) {
                    if (GREUtils.Dialog.confirm(null, _('confirm locale and keyboard mapping change'),
                                                      _('Locale and Keyboard mapping changes required system restart to take effect. If you save the changes now, the system will restart automatically after you return to the Main Screen. Do you want to save your changes?')
                                                      )) {
                        GeckoJS.Observer.notify(null, 'prepare-to-restart', this);
                        alert('notified restart');
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

(function(){

    // include controllers  and register itself

    // GeckoJS.include('chrome://viviecr/content/controllers/localekeyboard_controller.js');

    /**
     * Controller Startup
     */
    function startup() {
       
        //$do('load', null, 'LocaleKeyboard');

        doSetOKCancel(
            function(){
                //$do('save', null, 'LocaleKeyboard');

                var locale = $('#locale')[0];
                var keyboard = $('#keyboard')[0];

                if (locale) {
                    // change both XUL and OS locales
                    locale.changeOSLocale();
                    locale.changeLocale();
                }

                if (keyboard) {
                    // change keyboard mapping
                    keyboard.changeOSKbmap();
                }

                window.goRestartApplication();
            },
            function(){
                return true;
            }
        );
    };
    
    window.addEventListener('load', startup, false);

})();

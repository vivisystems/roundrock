(function(){

    /**
     * Controller LocaleKeyboard
     */

    GeckoJS.Controller.extend( {
        name: 'LocaleKeyboard',

        // select the indicated keyboard layout

        selectKbmap: function () {
            var selectedKbmap = $('#kbmap')[0].selectedKbmap;

            $('#keyboard-layout')[0].setAttribute('src', 'chrome://viviecr/content/skin/kblayouts/' + selectedKbmap + '.png');
        }


    });

})();

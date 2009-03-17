(function(){

    /**
     * Controller LocaleKeyboard
     */

    var __controller__ = {
        name: 'LocaleKeyboard',

        // select the indicated keyboard layout

        selectKbmap: function () {
            var selectedKbmap = $('#kbmap')[0].selectedKbmap;

            $('#keyboard-layout')[0].setAttribute('src', 'chrome://viviecr/content/skin/kblayouts/' + selectedKbmap + '.png');
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();

(function(){

    /**
     * Controller LocaleKeyboard
     */

    GeckoJS.Controller.extend( {
        name: 'LocaleKeyboard',
        _currencies: [],

        // select the indicated keyboard layout

        selectKeyboard: function () {
            var selectedKbmap = $('#keyboard')[0].selectedKbmap;

            $('#keyboard-layout')[0].setAttribute('src', 'chrome://viviecr/content/skin/kblayouts/' + selectedKbmap + '.png');
        }


    });

})();

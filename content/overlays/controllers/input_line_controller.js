( function() {

    var __controller__ = {

        name: 'InputLine',

        uses: false,

        _cartController: null,

        _keypadController: null,

        _inputBox: null,

        initial: function() {

            var self = this;
            
            var keypadController = this._keypadController = GeckoJS.Controller.getInstanceByName('Keypad');
            var inputBox = this._inputBox = document.getElementById('inputLineTextBox');
            
            if (inputBox) {
                inputBox.addEventListener('input', function(evt){
                    keypadController.buf = evt.target.value;
                }, true);
            }

        },

        destroy: function() {

            var inputBox = this._inputBox = document.getElementById('inputLineTextBox');
            if(inputBox) {

                inputBox.removeEventListener('input', function(evt){

                }, true);

            }

        }

    };
    
    GeckoJS.Controller.extend( __controller__ );

    // mainWindow register stock initial
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {
        window.addEventListener('load', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                    main.requestCommand('initial', null, 'InputLine');
            }

        }, false);

        window.addEventListener('focus', function() {
            var inputBox = this._inputBox = document.getElementById('inputLineTextBox');
            if (inputBox) {
                inputBox.focus();
            }
        }, false);

        window.addEventListener('unload', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.requestCommand('destroy', null, 'InputLine');
            }

        }, false);

    }
    
} )();

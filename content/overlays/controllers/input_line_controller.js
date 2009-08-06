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

            // register listener for main controller event 'onUpdateOptions'
            var mainController = this._keypadController = GeckoJS.Controller.getInstanceByName('Main');
            if (mainController) {
                mainController.addEventListener('onUpdateOptions', this.updateDecimalPoint, this);
            }
            if (inputBox) {
                inputBox.addEventListener('input', function(evt){
                    keypadController.buf = evt.target.value;
                }, true);
            }

            this.updateDecimalPoint();
        },

        updateDecimalPoint: function() {
            var autoAdjust = GeckoJS.Configure.read('vivipos.fec.settings.AutoSetDecimalPoint');
            var precision = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;

            if (autoAdjust) {
                this._inputBox.setAttribute('style', 'text-align: right');
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

( function() {

    var __controller__ = {

        name: 'InputLine',

        uses: false,

        _cartController: null,

        _keypadController: null,

        _mainController: null,

        _inputBox: null,

        initial: function() {

            var keypadController = this._keypadController = GeckoJS.Controller.getInstanceByName('Keypad');
            var inputBox = this._inputBox = document.getElementById('inputLineTextBox');
	    if (!inputBox) return;

            // register listener for main controller event 'onUpdateOptions'
            var mainController = this._mainController = GeckoJS.Controller.getInstanceByName('Main');
            if (mainController) {
                mainController.addEventListener('onUpdateOptions', this.updateDecimalPoint, this);
            }
            if (inputBox) {
                inputBox.addEventListener('input', function(evt){
                    keypadController.buf = evt.target.value;
                }, true);

                inputBox.focus();
            }

            this.updateDecimalPoint();


            var self = this;

            window.inputLineKeypress = function(keycode) {
                self.onPress.call(self, keycode);
            };
        },

        getCartController: function() {
            if (!this._cartController) {
                this._cartController = GeckoJS.Controller.getInstanceByName('Cart'); 
            }
            return this._cartController;
            
        },


        getKeypadController: function() {
            return this._keypadController;
        },

        getMainController: function() {
            return this._mainController;
        },


        updateDecimalPoint: function() {

            var autoAdjust = GeckoJS.Configure.read('vivipos.fec.settings.AutoSetDecimalPoint');
            var precision = parseInt(GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0);

            var inputBox = this._inputBox = document.getElementById('inputLineTextBox');

            if (autoAdjust) {
                this._inputBox.setAttribute('style', 'text-align: right');
                
                if (precision > 0) {
                    
                    // we need to calculate real font render width;
                    var fontWidth = this.detectFontWidth();
                    var imgHalfWidth = 4; // image width = 7px
                    //var imgHalfWidth = 1; // image width = 1 200px

                    var inputFieldWidth = inputBox.inputField.clientWidth;
                    var inputFieldBgSeek = inputFieldWidth - imgHalfWidth - precision * fontWidth ;

                    // set css style
                    //inputBox.inputField.style.backgroundImage = "url(chrome://viviecr/skin/images/numdot.png)"; 7px
                    inputBox.inputField.style.backgroundImage = "url(chrome://viviecr/skin/images/numdot2.png)"; //1 200px
                    inputBox.inputField.style.backgroundRepeat = "no-repeat";
                    inputBox.inputField.style.backgroundPosition = inputFieldBgSeek +"px 100%";
                }else {
                    inputBox.inputField.style.backgroundImage = "";
                    inputBox.inputField.style.backgroundRepeat = "";
                    inputBox.inputField.style.backgroundPosition = "";
                }
            }else {
                this._inputBox.setAttribute('style', 'text-align: left');
               
                inputBox.inputField.style.backgroundImage = "";
                inputBox.inputField.style.backgroundRepeat = "";
                inputBox.inputField.style.backgroundPosition = "";

            }
        },

        onPress: function(keycode) {

            // fixed quick user switch in password type.
            var keypad = this.getKeypadController();
            if (keycode == 13 && keypad.target == 'Cart') {
                var cart = this.getCartController();
                cart.data = keypad.getBuffer();
                keypad.clearBuffer();
                cart.addItemByBarcode(cart.data);
            }
            
        },

        detectFontWidth: function() {

            var h = document.getElementById("detectFontContainer");
            var d = document.createElementNS("http://www.w3.org/1999/xhtml","html:div");
            var s = document.createElementNS("http://www.w3.org/1999/xhtml","html:span");
            var fontWidth = 0;
            
            try {
                h.style.display = "block";
                d.appendChild(s);
                s.textContent       = "0123456789ABCDEF";
                h.appendChild(d);
                var defaultWidth   = s.offsetWidth;

                // remove fontDetectContainer
                h.removeChild(d);

                h.style.display = "none";

                fontWidth = Math.floor(defaultWidth/16);

            }catch(e) {
            }

            return fontWidth;
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

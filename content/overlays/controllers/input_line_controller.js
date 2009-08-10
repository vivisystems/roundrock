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
            var precision = parseInt(GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0);

            var inputBox = this._inputBox = document.getElementById('inputLineTextBox');

            if (autoAdjust) {
                this._inputBox.setAttribute('style', 'text-align: right');
                
                if (precision > 0) {
                    
                    // we need to calculate real font render width;
                    var fontWidth = this.detectFontWidth();
                    var imgHalfWidth = 4; // image width = 7px

                    var inputFieldWidth = inputBox.inputField.clientWidth;
                    var inputFieldBgSeek = inputFieldWidth - imgHalfWidth - precision * fontWidth ;

                    // set css style
                    inputBox.inputField.style.backgroundImage = "url(chrome://viviecr/skin/images/numdot.png)";
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

(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'Keypad',

        buf: '',
        target: 'Cart',
        _numberOnly: false,

        setNumberOnly: function(val) {
            this._numberOnly = val;
        },

        setTarget: function(target) {
            this.target = target;
        },

        getBuffer: function(formatted) {
            if (!formatted)
                return this.buf;

            if (this.buf == '' || this.buf.indexOf('.') != -1) return this.buf;
            
            if (GeckoJS.Configure.read('vivipos.fec.settings.AutoSetDecimalPoint')) {
                var decimalPlaces = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices');
                if (decimalPlaces > 0) {
                    if (this.buf.length > decimalPlaces) {
                        var index = this.buf.length - decimalPlaces;
                        return this.buf.substr(0, index) + '.' + this.buf.substr(index, decimalPlaces);
                    }
                    else if (this.buf.length == decimalPlaces) {
                        return '0.' + this.buf;
                    }
                    else {
                        return '0.' + GeckoJS.String.padLeft(this.buf, decimalPlaces, '0');
                    }
                }
            }
            return this.buf;
        },
	
        clearBuffer: function() {
            this.buf = "";
            this.dispatchEvent('onClearBuffer', this.buf);
        },
	
        addBuffer: function(s) {
            this.dispatchEvent('beforeAddBuffer', this.buf);
            this.buf += s;
            this.dispatchEvent('onAddBuffer', this.buf);
        },
	
        getCartController: function() {
            return GeckoJS.Controller.getInstanceByName('Cart');
        },
		
        getMainController: function() {
            return GeckoJS.Controller.getInstanceByName('Main');
        },

        /**
         * sampleAction
         */

        sendCharcode: function(chars) {
            for (var i = 0; i < chars.length; i++) {
                this.data = {charCode: chars.charCodeAt(i), keyCode: null};
                this.keypress();
            }
        },
        
        sendKeycode: function(code) {
            this.data = {keyCode: parseInt(code),
                         charCode: null};
            this.keypress();
        },

        keypress: function(evt, handleKeyCode) {
            
            evt = evt || this.data;
		
            if (!handleKeyCode && evt.originalTarget) {
                if (evt.originalTarget.tagName.indexOf('input') != -1 || evt.originalTarget.tagName.indexOf('textarea') != -1 || evt.originalTarget.tagName.indexOf('textbox') != -1) return false;
            }

            var charPress = String.fromCharCode(evt.charCode);
            var keyCode = evt.keyCode;

            switch(keyCode) {
                // ESCAPE
                case 27:
                    if (this.target == 'Cart') {
                        this.getCartController().clear();
                        this.clearBuffer();
                    }
                    else {
                        this.getMainController().clear();
                    }
                    return true;
                    break;

                // TAB
                case 0x09:
                    if (!this._numberOnly) {
                        this.getCartController().setPrice(this.getBuffer());
                        this.clearBuffer();
                    }
                    return true;
                    break;

                // END
                case 35:
                    if (!this._numberOnly) {
                        this.getCartController().addMarker('subtotal');
                    }
                    return true;
                    break;
                // BACKSPACE
                case 8:
                    if (this.buf.length > 0) {
                        this.buf = this.buf.substring(0, this.buf.length - 1);
                        this.addBuffer('');
                    }
                    return true;
                    break;

                // ENTER
                case 13:
                    if (this.target == 'Cart') {
                        var cart = this.getCartController();
                        cart.data = this.getBuffer();
                        this.clearBuffer();
                        this.getCartController().addItemByBarcode(cart.data);
                    }
                    else {
                        this.getMainController().enter();
                    }
                    return true;
                    break;

            }
            if (handleKeyCode) return false;

            if (evt.ctrlKey || evt.altKey || evt.metaKey || (evt.charCode == 0) ) return;


            switch(charPress) {
			
                case '*':
                    if (!this._numberOnly && this.getBuffer().length > 0 ) {
                        this.getCartController().setQty(this.getBuffer(), false, '', true);
                        this.clearBuffer();
                    }
                    break;
				
                case '0':
                    // skip first 0
                    /*if(this.getBuffer().length >0) */this.addBuffer(charPress);
                    break;
				
                case '.':
                    if(!this._numberOnly && this.getBuffer().indexOf('.') == -1) this.addBuffer(charPress);
                    break;

                default:
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addBuffer(charPress);
                    break;
            }
            return true;

        }

    };

    AppController.extend(__controller__);

   // mainWindow self register guest check initial
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {
        var keypadController = GeckoJS.Controller.getInstanceByName('Keypad');
        window.addEventListener('keypress', function(event) {
            keypadController.keypress(event);
        }, false);
    }

})();

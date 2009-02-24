(function(){

    /**
     * Class ViviPOS.KeypadController
     */
    // GeckoJS.define('ViviPOS.KeypadController');

    GeckoJS.Controller.extend( {
        name: 'Keypad',
        // charpress buffer
        buf: "",
        target: 'Cart',

        setTarget: function(target) {
            this.target = target;
        },

        getBuffer: function() {
            return this.buf;
        },
	
        clearBuffer: function() {
            this.buf = "";
        //	this.dispatchEvent('onClearBuffer', this.buf);
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

        keypress: function() {
            var evt = this.data;
		
            var charPress = String.fromCharCode(evt.charCode);
            var keyCode = evt.keyCode;

            switch(charPress) {
			
                case 'x':
                case 'X':
                case '*':
                    if (this.getBuffer().length > 0 ) {

                    this.getCartController().setQty(this.getBuffer());
                    this.clearBuffer();
                    }
                    break;
				
                case '0':
                    // skip first 0
                    /*if(this.getBuffer().length >0) */this.addBuffer(charPress);
                    break;
				
                case '.':
                    // skip first . and repeat .
                    //if(this.getBuffer().length >0 && this.getBuffer().indexOf('.') == -1) this.addBuffer(charPress);
                    if(this.getBuffer().indexOf('.') == -1) this.addBuffer(charPress);
                    break;
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
                    break;
			
                // TAB
                case 0x09:
                    this.getCartController().setPrice(this.getBuffer());
                    this.clearBuffer();
                    break;
			
                // END
                case 35:
                    this.getCartController().addMarker('subtotal');
                    break;
                // BACKSPACE
                case 8:
                    if (this.buf.length > 0) {
                        this.buf = this.buf.substring(0, this.buf.length - 1);
                        this.addBuffer('');
                    }
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
                    break;
			
            }
        }
	
	
    });

})();
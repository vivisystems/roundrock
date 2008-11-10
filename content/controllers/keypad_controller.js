(function(){

    /**
     * Class ViviPOS.KeypadController
     */
    // GeckoJS.define('ViviPOS.KeypadController');

    GeckoJS.Controller.extend( {
        name: 'Keypad',
        // charpress buffer
        buf: "",
	
	
        getBuffer: function() {
            return this.buf;
        },
	
        clearBuffer: function() {
            this.buf = "";
        //	this.dispatchEvent('onClearBuffer', this.buf);
        },
	
        addBuffer: function(s) {
            this.buf += s;
            this.dispatchEvent('onAddBuffer', this.buf);
        },
	
        getCartController: function() {
            return GeckoJS.Controller.getInstanceByName('Cart');
        },
		
        /**
         * sampleAction
         */
        keypress: function() {
            var evt = this.data;
		
            var charPress = String.fromCharCode(evt.charCode);
            var keyCode = evt.keyCode;
		
            switch(charPress) {
			
                case 'X':
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
                    if(this.getBuffer().length >0 && this.getBuffer().indexOf('.') == -1) this.addBuffer(charPress);
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
                case 0x27:
                    this.getCartController().getSubtotal();
                    this.clearBuffer();
                    break;
			
                // TAB
                case 0x09:
                    this.getCartController().setPrice(this.getBuffer());
                    this.clearBuffer();
                    break;
			
                // END
                case 0x35:
                    this.getCartController().getSubtotal();
                    break;
                // ENTER
                case 13:
                    var cart = this.getCartController();
                    cart.data = null;
                    this.getCartController().addItemByBarcode();
                    break;
			
            }
        }
	
	
    });

})();

(function(){

    /**
     * Class ViviPOS.VfdController
     */
    GeckoJS.define('ViviPOS.VfdController');

    ViviPOS.VfdController = GeckoJS.Controller.extend( {
        name: 'Vfd',
        _vfdObj: null,

        initial: function() {

            var self = this;
            var keypad = GeckoJS.Controller.getInstanceByName('Keypad');
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            // hook keypadcontroller
            if(keypad) {
                keypad.addEventListener('onAddBuffer', function(evt) {
                    self.onAddBuffer(evt);
                });
            }
            if(cart) {
                cart.addEventListener('onSetQty', function(evt) {
                    self.onSetQty(evt);
                });
                cart.addEventListener('onClear', function(evt) {
                    self.onClear(evt);
                });
                cart.addEventListener('onCancel', function(evt) {
                    self.onCancel(evt);
                });

                cart.addEventListener('onGetSubtotal', function(evt) {
                    self.onGetSubtotal(evt);
                });

                cart.addEventListener('onSubmit', function(evt) {
                    self.onSubmit(evt);
                });

            }

        },

        getVfd: function() {
            if(this._vfdObj == null) {
                this._vfdObj = $("#onscreenvfd")[0];
            }
            return this._vfdObj;
        },
	
        onAddBuffer: function(evt) {
            this.getVfd().setText(_('I') + ': ' + evt.data);
        },
	
        onSetQty: function(evt) {
            this.getVfd().setText(_('QTY') + ': '+ evt.data);
        },
	
        onGetSubtotal: function(evt) {
            var transaction = evt.data;
            this.getVfd().setText(_('TOTAL') + ': ' + transaction.getRemainTotal());
        },

        onClear: function(evt) {
            var transaction = evt.data;
            this.getVfd().setText(_('TOTAL') + ': ' + transaction.getRemainTotal());
        },
	
        onCancel: function(evt) {
            //var transaction = evt.data;
            this.getVfd().setText(_('CANCELED'));
            //this.getVfd().setText(_('TOTAL') + ': ' + transaction.getTotal());
        },

        onSubmit: function(evt) {
            var transaction = evt.data;
            var buf = _('TOTAL') + ': ' + transaction.getTotal() ;
            buf += "    " + _('CHG') + ': ' + (0-transaction.getRemainTotal()) ;
            this.getVfd().setText(buf);
        },

        /**
         * sampleAction
         */
        _keypress: function(evt) {
            var charCode = evt.target.data.charCode;
		
            this.getVfd().setText('ppp: ' + evt.target.data.keyCode);
	
        }
	
    });

})();

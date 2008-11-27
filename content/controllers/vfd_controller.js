(function(){

    /**
     * Class ViviPOS.VfdController
     */
    GeckoJS.define('ViviPOS.VfdController');

    ViviPOS.VfdController = GeckoJS.Controller.extend( {
        name: 'Vfd',
        _vfdObj: null,
        roundPrecision: 0,

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
                cart.addEventListener('onQueue', function(evt) {
                    self.onQueue(evt);
                });

                cart.addEventListener('onGetSubtotal', function(evt) {
                    self.onGetSubtotal(evt);
                });

                cart.addEventListener('onSubmit', function(evt) {
                    self.onSubmit(evt);
                });

            }

            // emulate clear vfd
            this.roundPrecision = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;
            this.onClear({data: null});

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
            this.getVfd().setText(_('TAL') + ': ' + transaction.getRemainTotal(true));
        },

        onClear: function(evt) {

            var transaction = evt.data;
            var remain = "0";

            if (transaction != null) {
                remain = transaction.getRemainTotal(true);
            }else {
                remain = this.format(0);
            }

            this.getVfd().setText(_('TAL') + ': ' +  remain);
        },
	
        onCancel: function(evt) {
            var transaction = evt.data;
            if (transaction == null) return;
            this.getVfd().setText(_('CANCELED') + '  SEQ#' + transaction.data.seq);
            //this.getVfd().setText(_('TOTAL') + ': ' + transaction.getTotal());
        },

        onQueue: function(evt) {
            var transaction = evt.data;
            if (transaction == null) return;
            this.getVfd().setText(_('QUEUED') + '  SEQ#' + transaction.data.seq);
            //this.getVfd().setText(_('TOTAL') + ': ' + transaction.getTotal());
        },

        onSubmit: function(evt) {
            var transaction = evt.data;
            if (transaction == null) {
                this.getVfd().setText('TAL: ' + this.format(0));
                return;
            }
            var buf = _('TAL') + ': ' + transaction.getTotal(true) ;
            buf += " " + _('CG') + ': ' + (0-transaction.getRemainTotal(true)) ;
            this.getVfd().setText(buf);
        },

        /**
         * sampleAction
         */
        _keypress: function(evt) {
            var charCode = evt.target.data.charCode;
		
            this.getVfd().setText('ppp: ' + evt.target.data.keyCode);
	
        },

        format: function(number) {
            var options = {
                places: this.roundPrecision
            };
            // format display precision
            return GeckoJS.NumberHelper.format(number, options);

        }
	
    });

})();

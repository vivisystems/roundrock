(function(){

    /**
     * Class ViviPOS.VfdController
     */
    GeckoJS.define('ViviPOS.VfdController');

    ViviPOS.VfdController = GeckoJS.Controller.extend( {
        name: 'Vfd',
        _vfdObj: null,
	
        getVfd: function() {
            if(this._vfdObj == null) {
                this._vfdObj = $("#onscreenvfd")[0];
            }
            return this._vfdObj;
        },
	
        onAddBuffer: function(evt) {
            this.getVfd().setText(_('F') + ': ' + evt.data);
        },
	
        onSetQty: function(evt) {
            this.getVfd().setText(_('QTY') + ': '+ evt.data);
        },
	
        onGetSubtotal: function(evt) {
            this.getVfd().setText(_('TOTAL') + ': ' + evt.data);
        },

        onClear: function() {
            this.getVfd().setText(_('TOTAL') + ': ' + "0.000");
        },
	
        afterAddItem: function(evt){
            var item = evt.data;
        },
	
        onSubmit: function(evt) {
            var submitData = evt.data;
            var buf = _('TOTAL') + ': ' + submitData.total ;
            buf += "    " + _('CHG') + ': ' + submitData.amount ;
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

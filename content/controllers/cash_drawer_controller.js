(function(){

    /**
     * Class ViviPOS.CashDrawerController
     */
    var CashDrawer = GeckoJS.Controller.extend( {
        name: 'CashDrawer',
        _drawer: null,
	
        getDrawer: function() {
            if(this._drawer == null) this._drawer = new ViviPOS.CashDrawerModel();
		
            return this._drawer;
        },
	
        /**
         * sampleAction
         */
        open: function() {
            this.getDrawer().open();
        }
	
    });

    CashDrawer.prototype.tt = function() {
        
    };

})();

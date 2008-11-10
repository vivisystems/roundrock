(function(){

    /**
     * Class ViviPOS.CashDrawerController
     */
    GeckoJS.Controller.extend( {
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

})();

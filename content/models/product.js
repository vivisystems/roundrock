( function() {
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
        
    // GREUtils.define('ViviPOS.ProductModel');
    // ViviPOS.ProductModel = GeckoJS.Model.extend({
    var ProductModel = window.ProductModel = AppModel.extend({
        name: 'Product',
        useDbConfig: 'default',
        
        checkUnique: function() {
	    return 	this.items;
        }
    });
} )();

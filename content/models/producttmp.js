// GREUtils.define('ViviPOS.ProductModel');
// ViviPOS.ProductModel = GeckoJS.Model.extend({
var ProducttmpModel = window.ProducttmpModel = GeckoJS.Model.extend({
    name: 'Producttmp',
    useDbConfig: 'default',
    
    checkUnique: function() {
	return 	this.items;
    }
    
});

// GREUtils.define('ViviPOS.ProductModel');
// ViviPOS.ProductModel = GeckoJS.Model.extend({
var ProductModel = window.ProductModel = AppModel.extend({
    name: 'Product',
    useDbConfig: 'default',
    
    checkUnique: function() {
	return 	this.items;
    }
});

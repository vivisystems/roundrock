GREUtils.define('ViviPOS.ProductModel');
ViviPOS.ProductModel = GeckoJS.Model.extend({
    name: 'Product',
    useDbConfig: 'default',
    
    checkUnique: function() {
	return 	this.items;
    }
    
});

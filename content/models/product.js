// GREUtils.define('ViviPOS.ProductModel');
// ViviPOS.ProductModel = GeckoJS.Model.extend({
var ProductModel = window.ProductModel = GeckoJS.Model.extend({
    name: 'Product',
    hasMany: ['SetItem', {name: 'CondimentGroup', primaryKey: 'cond_group', foreignKey:'id'}],
    useDbConfig: 'default',
    
    checkUnique: function() {
	return 	this.items;
    }
    
});

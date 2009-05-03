// GREUtils.define('ViviPOS.StockRecordModel');
// ViviPOS.StockRecordModel = GeckoJS.Model.extend({
var StockRecordModel = window.StockRecordModel = GeckoJS.Model.extend( {
    name: 'StockRecord',
    
    //useDbConfig: 'default',
    
    belongsTo: [ 'Product' ],
    
    checkUnique: function() {
	return 	this.items;
    }
    
});

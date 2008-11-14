//GREUtils.define('ViviPOS.OrderDetailModel');
//ViviPOS.OrderDetailModel = GeckoJS.Model.extend({
var OrderDetailModel = window.OrderDetailModel =  GeckoJS.Model.extend({
	name: 'OrderDetail',
	belongsTo: ['Order']
    
});

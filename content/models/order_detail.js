GREUtils.define('ViviPOS.OrderDetailModel');
ViviPOS.OrderDetailModel = GeckoJS.Model.extend({
	name: 'OrderDetail',
	belongsTo: ['Order']
    
});

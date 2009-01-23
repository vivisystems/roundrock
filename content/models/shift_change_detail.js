// GREUtils.define('ViviPOS.PlugroupDetailModel');
// ViviPOS.PlugroupDetailModel = GeckoJS.Model.extend({
var ShiftChangeDetailModel = window.ShiftChangeDetailModel = GeckoJS.Model.extend({
	name: 'ShiftChangeDetail',
    useDbConfig: 'order',
	belongsTo: ['ShiftChange']
});

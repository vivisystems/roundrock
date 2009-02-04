var ShiftChangeDetailModel = window.ShiftChangeDetailModel = GeckoJS.Model.extend({
	name: 'ShiftChangeDetail',
    useDbConfig: 'order',
	belongsTo: ['ShiftChange']
});

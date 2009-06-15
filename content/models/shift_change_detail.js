var ShiftChangeDetailModel = window.ShiftChangeDetailModel = GeckoJS.Model.extend({
    name: 'ShiftChangeDetail',

    useDbConfig: 'order',

    autoRestoreFromBackup: true,

    belongsTo: ['ShiftChange'],

    behaviors: ['Sync', 'Training']
});

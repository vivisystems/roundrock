var CashdrawerRecordModel = window.CashdrawerRecordModel = GeckoJS.Model.extend({
    name: 'CashdrawerRecord',

    useDbConfig: 'order',

    behaviors: ['Sync', 'Training']
});

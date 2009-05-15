var TableRegionModel = window.TableRegionModel = GeckoJS.Model.extend({
    name: 'TableRegion',

    useDbConfig: 'table',

    hasMany: ['Table'],

    behaviors: ['Sync']
});
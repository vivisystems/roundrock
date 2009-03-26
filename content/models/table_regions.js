var TableRegionModel = window.TableRegionModel = GeckoJS.Model.extend({
    name: 'TableRegion',

    hasMany: ['Table'],

    behaviors: ['Sync']
});
GREUtils.define('ViviPOS.CondimentModel');
ViviPOS.CondimentModel = GeckoJS.Model.extend({
    name: 'Condiment',
    hasMany: ['CondimentDetail']
});

var TableModel = window.TableModel = GeckoJS.Model.extend({
    name: 'Table',

    belongsTo: ['TableRegion'],
    
    hasMany: ['TableBooking'],

    behaviors: ['Sync']
});
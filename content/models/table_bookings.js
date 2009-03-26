var TableBookingModel = window.TableBookingModel = GeckoJS.Model.extend({
    name: 'TableBooking',

    belongsTo: ['Table'],

    behaviors: ['Sync']
});
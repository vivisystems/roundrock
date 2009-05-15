var TableBookingModel = window.TableBookingModel = GeckoJS.Model.extend({
    name: 'TableBooking',

    useDbConfig: 'table',

    belongsTo: ['Table'],

    behaviors: ['Sync']
});
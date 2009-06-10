(function() {
    var UserModel = window.UserModel = GeckoJS.Model.extend({
        name: 'User',

        belongsTo: ['Job']
    });
})();

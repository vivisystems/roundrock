(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var UserModel = window.UserModel = AppModel.extend({
        name: 'User',

        belongsTo: ['Job']
    });
})();

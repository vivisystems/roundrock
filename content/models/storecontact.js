(function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var __model__ = {

        name: 'StoreContact'
        
    };

    var StoreContactModel = window.StoreContactModel = AppModel.extend(__model__);

})();


(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var SetItemModel = window.SetItemModel = AppModel.extend({
        name: 'SetItem'
    });
})();

( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var CategoryModel = window.CategoryModel = AppModel.extend({
        name: 'Category'
    });
    
} )();

( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    //GREUtils.define('ViviPOS.PlugroupModel');
    //ViviPOS.PlugroupModel = AppModel.extend({
    var PlugroupModel = window.PlugroupModel = AppModel.extend({
        name: 'Plugroup'
    });
} )();

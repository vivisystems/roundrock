( function() {

     var __model__ = {
        name: 'App',
        
        /**
        *
        * @public
        * @function
        * @param {Object} data
        */
        saveToBackup: function( data ) {
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;
            if ( isTraining ) return true;
            
            return this._super( data );
        },
        
        restoreFromBackup: function() {
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;
            if ( isTraining ) return true;
            
            return this._super();
        }
    };
    
    var AppModel = window.AppModel = GeckoJS.Model.extend( __model__ );
} )();

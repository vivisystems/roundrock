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
        },

        /**
         * get backup content if exists 
         * 
         * XXX need move to SDK ?
         * 
         * @return {String} database content.
         */
        getBackupContent: function() {

            var backupDbConfig = 'backup';
            var newDataSource = GeckoJS.ConnectionManager.getDataSource(backupDbConfig);

            var content = "";

            if (!newDataSource) return content;

            var backupPath = newDataSource.path;

            var backupFile = backupPath + "/" + this.table + ".db";

            var f = new GeckoJS.File(backupFile);

            if (!f.exists()) return content;

            f.open("r");
            content = f.read();
            f.close();
            delete f;

            return content;

        },

        /**
         * Remove backup file if exists
         *
         * XXX need move to SDK ?
         *
         * @return {Boolean} true if file removed success
         */
        removeBackupFile: function() {

            var backupDbConfig = 'backup';
            var newDataSource = GeckoJS.ConnectionManager.getDataSource(backupDbConfig);

            if (!newDataSource) return false;

            var backupPath = newDataSource.path;

            var backupFile = backupPath + "/" + this.table + ".db";


            dump('remove = ' + backupFile + '\n');

            return GeckoJS.File.remove(backupFile);

        }


    };
    
    var AppModel = window.AppModel = GeckoJS.Model.extend( __model__ );
} )();

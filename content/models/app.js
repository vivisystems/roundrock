( function() {

    var __model__ = {
        name: 'App',
        
        /**
        *
        * @public
        * @function
        * @param {Object} data
        */
        saveToBackup: function( data, updateTimestamp ) {
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;
            if ( isTraining ) return true;
            if (!data) return true;

            // update created and modified
            if (!updateTimestamp) {

                var updateTS = function(d) {
                    if (typeof d.created == 'undefined') {
                        d.created = Math.round( (new Date()).getTime() / 1000) ;
                    }
                    d['modified'] = Math.round( (new Date()).getTime() / 1000) ;
                };


                if(typeof data == 'object' && data.constructor.name == 'Array') {
                    data.map(updateTS);
                }else if(typeof data == 'object') {
                    updateTS(data);
                }
            }

            return this._super( data, updateTimestamp );
        },
        
        restoreFromBackup: function() {
            var isTraining = GeckoJS.Session.get( "isTraining" ) || false;
            if ( isTraining ) return true;
            
            return this._super();
        },

        /**
         * rename backup file with status
         *
         * @param {Number} newStatus
         * @param {Number} orgStatus
         */
        renameBackupFileWithStatus: function(newStatus, orgStatus) {

            newStatus = newStatus || false;
            orgStatus = orgStatus || false;
            var backupDbConfig = 'backup';
            var newDataSource = GeckoJS.ConnectionManager.getDataSource(backupDbConfig);

            if (!newDataSource) return false;

            var backupPath = newDataSource.path;

            var backupFile = backupPath + "/" + this.table + ".db";
            var newBackupFile = backupPath + "/" + this.table + ".db";

            if (orgStatus) {
                backupFile = backupPath + "/" + this.table + "_" + orgStatus + ".db";
            }
            if (newStatus) {
                newBackupFile = backupPath + "/" + this.table + "_" + newStatus + ".db";
            }

            if (backupFile != newBackupFile) {

                if (GeckoJS.File.exists(newBackupFile)) {
                    // append data into
                    try {
                        var d1 = GREUtils.JSON.decodeFromFile(backupFile);
                        var d2 = GREUtils.JSON.decodeFromFile(newBackupFile);

                        // clone data
                        for (let key in d1) {
                            d2[key] = GREUtils.extend({}, d2[key], d1[key]);
                        }
                        
                        // save
                        GREUtils.JSON.encodeToFile(newBackupFile, d2);

                        // remove old
                        GeckoJS.File.remove(backupFile);
                        
                        return true;

                    }catch(e) {
                    }
                    return false;
                }else {

                    if (GeckoJS.File.exists(backupFile)) {
                        var result = GeckoJS.File.copy( backupFile, newBackupFile);

                        if (result) {
                            GeckoJS.File.remove(backupFile);
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                }
                return false;
            }

            return false;
            
        },

        /**
         * get backup content if exists 
         * 
         * XXX need move to SDK ?
         * 
         * @return {String} database content.
         */
        getBackupContent: function(status) {

            status = status || false;
            var backupDbConfig = 'backup';
            var newDataSource = GeckoJS.ConnectionManager.getDataSource(backupDbConfig);

            var content = "";

            if (!newDataSource) return content;

            var backupPath = newDataSource.path;

            var backupFile = backupPath + "/" + this.table + ".db";

            if (status) {
                backupFile = backupPath + "/" + this.table + "_" + status + ".db";
            }

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
        removeBackupFile: function(status) {

            status = status || false;
            var backupDbConfig = 'backup';
            var newDataSource = GeckoJS.ConnectionManager.getDataSource(backupDbConfig);

            if (!newDataSource) return false;

            var backupPath = newDataSource.path;

            var backupFile = backupPath + "/" + this.table + ".db";

            if (status) {
                backupFile = backupPath + "/" + this.table + "_" + status + ".db";
            }

            return GeckoJS.File.remove(backupFile);

        },

        /**
         * escape string for sqlite
         *
         * support string or array
         * 
         */
        escapeString: function(data) {
            
            if (!data) return data;

            var re = new RegExp("[']+", "g");

            // is array
            if (typeof data == 'object' && data.constructor.name == 'Array') {

                return data.map(function(s) {
                    s.replace(re, "''");
                });

            }else {
                return data.replace(re, "''");
            }
            
        }


    };
    
    var AppModel = window.AppModel = GeckoJS.Model.extend( __model__ );
} )();

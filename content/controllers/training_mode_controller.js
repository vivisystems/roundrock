( function() {
    /**
	 * Class TrainingMode
	 */
	 
    var __controller__ = {
        name: "TrainingMode",
	 	
        _orderDBConfig: "DATABASE_CONFIG.order",
        _trainingOrderDBConfig: "DATABASE_CONFIG.training_order",
        _emptyTrainingOrderDBConfg: "DATABASE_CONFIG.empty_training_order",
        _defaultTrainingOrderDBConfg: "DATABASE_CONFIG.default_training_order",
        _origSyncActive: null,
        
        /**
         * This private method can be used to replace designated DB by means of CP directive.
         * @param dbToReplace is a preference key in string format.
         * @param dbToBeReplace is a preference key in string format.
         */
        _copyToReplaceDB: function( dbToReplace, dbToBeReplaced ) {
            var confDBToReplace =
            GeckoJS.Configure.read( dbToReplace );
            var confDBToBeReplaced =
            GeckoJS.Configure.read( dbToBeReplaced );
            var pathDBToReplace =
            confDBToReplace.path + '/' + confDBToReplace.database;
            var pathDBToBeReplaced =
            confDBToBeReplaced.path + '/' + confDBToBeReplaced.database;
        	
            GREUtils.File.run( "/bin/cp", [ pathDBToReplace, pathDBToBeReplaced ], true );
        },
        
        _vacuumTrainingDB: function() {
            this._copyToReplaceDB( this._emptyTrainingOrderDBConfg, this._trainingOrderDBConfig );
        },
        
        vacuumTrainingDB: function() {
            if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to VACUUM training database?' ) ) )
                return;
            this._vacuumTrainingDB();
        },
        
        _takeCurrentDBToBeDefaultDB: function() {
            this._copyToReplaceDB( this._orderDBConfig, this._defaultTrainingOrderDBConfg );
        },
        
        takeCurrentDBToBeDefaultDB: function() {
            if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to take current database to be default database?' ) ) )
                return;
            this._takeCurrentDBToBeDefaultDB();
        },
        
        _takeDefaultDBToBeTrainingDB: function() {
            this._copyToReplaceDB( this._defaultTrainingOrderDBConfg, this._trainingOrderDBConfig );
        },
        
        takeDefaultDBToBeTrainingDB: function() {
            if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to take default database to be training database?' ) ) )
                return;
            this._takeDefaultDBToBeTrainingDB();
        },

        enableSyncActive: function() {
            // setting global SyncSetting
            if( SyncSetting._setting && this._origSyncActive == 1 ) {
                SyncSetting._setting.active = 1;
            }


        },

        disableSyncActive: function() {
            // setting global SyncSetting
            if( SyncSetting._setting && SyncSetting._setting.active == 1 ) {
                SyncSetting._setting.active = 0;
            }
            
        },

        start: function() {
            var isTraining = GeckoJS.Session.get( "isTraining" );
	 		
            var trainingModeController = GeckoJS.Controller.getInstanceByName( "TrainingMode" );
	 		
            if ( isTraining ) {
                if ( GREUtils.Dialog.confirm( window, '', _( 'Are you going to leave the training mode?' ) ) ) {
                    GeckoJS.Session.set( "isTraining", 0 );
	 				
                    GeckoJS.Observer.notify( null, "TrainingMode", "exit" );

                    // enableSyncActive
                    this.enableSyncActive();
                }
            } else {
                var cart = GeckoJS.Controller.getInstanceByName( "Cart" );
	 			
                if ( cart.ifHavingOpenedOrder() ) {
                    alert( _( "The training mode can be launched only if there is no opened order." ) );
                    return;
                }
	 			
                if ( GREUtils.Dialog.confirm( window, '', _( "Are you sure you want to start training?" ) ) ) {
                    // set up the flag indicating that we are now in the training mode.
                    GeckoJS.Session.add( "isTraining", 1 );
			 		
                    GeckoJS.Observer.notify( null, "TrainingMode", "start" );

                    this._origSyncActive = ( ( new SyncSetting() ).read() ).active;
                    
                    // disableSyncActive
                    this.disableSyncActive();

                }
            }
        }
    };
	 
    GeckoJS.Controller.extend( __controller__ );
} )();

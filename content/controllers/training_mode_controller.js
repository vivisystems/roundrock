( function() {

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: "TrainingMode",
        
        _actions: {
            vacuum: "vacuum",
            takeCurrentDBToBeDefaultDB: "takeCurrentDBToBeDefaultDB",
            takeDefaultDBToBeTrainingDB: "takeDefaultDBToBeTrainingDB",
            takeTrainingDBToBeDefaultDB: "takeTrainingDBToBeDefaultDB"
        },
        
        _dbConfigs: [ {
                origin: "DATABASE_CONFIG.order",
                training: "DATABASE_CONFIG.training_order",
                emptyTraining: "DATABASE_CONFIG.empty_training_order",
                defaultTraining: "DATABASE_CONFIG.default_training_order"
            }, {
                origin: "DATABASE_CONFIG.table",
                training: "DATABASE_CONFIG.training_table",
                emptyTraining: "DATABASE_CONFIG.empty_training_table",
                defaultTraining: "DATABASE_CONFIG.default_training_table"
            }/*, {
                origin: "DATABASE_CONFIG.default",
                training: "DATABASE_CONFIG.training_default",
                emptyTraining: "DATABASE_CONFIG.empty_training_default",
                defaultTraining: "DATABASE_CONFIG.default_training_default"
            }, {
                origin: "DATABASE_CONFIG.acl",
                training: "DATABASE_CONFIG.training_acl",
                emptyTraining: "DATABASE_CONFIG.empty_training_acl",
                defaultTraining: "DATABASE_CONFIG.default_training_acl"
            }, {
                origin: "DATABASE_CONFIG.extension",
                training: "DATABASE_CONFIG.training_extension",
                emptyTraining: "DATABASE_CONFIG.empty_training_extension",
                defaultTraining: "DATABASE_CONFIG.default_training_extension"
            }, {
                origin: "DATABASE_CONFIG.journal",
                training: "DATABASE_CONFIG.training_journal",
                emptyTraining: "DATABASE_CONFIG.empty_training_journal",
                defaultTraining: "DATABASE_CONFIG.default_training_journal"
            }, {
                origin: "DATABASE_CONFIG.inventory",
                training: "DATABASE_CONFIG.training_inventory",
                emptyTraining: "DATABASE_CONFIG.empty_training_inventory",
                defaultTraining: "DATABASE_CONFIG.default_training_inventory"
            }*/
        ],
        
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
        
        _replaceDBByAction: function( action ) {
            var dbToReplace, dbToBeReplaced;
            switch ( action ) {
                case this._actions.vacuum:
                    dbToReplace = "emptyTraining";
                    dbToBeReplaced = "training";
                    break;
                case this._actions.takeCurrentDBToBeDefaultDB:
                    dbToReplace = "origin";
                    dbToBeReplaced = "defaultTraining";
                    break;
                case this._actions.takeDefaultDBToBeTrainingDB:
                    dbToReplace = "defaultTraining";
                    dbToBeReplaced = "training";
                    break;
                case this._actions.takeTrainingDBToBeDefaultDB:
                    dbToReplace = "training";
                    dbToBeReplaced = "defaultTraining";
                    break;
                default:
                    dbToReplace = null;
                    dbToBeReplaced = null;
            }
            
            this._dbConfigs.forEach( function( config ) {
                this._copyToReplaceDB( config[ dbToReplace ], config[ dbToBeReplaced ] );
            }, this );
        },
        
        _vacuumTrainingDB: function() {
            this._replaceDBByAction( this._actions.vacuum );
        },
        
        vacuumTrainingDB: function() {
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, _( 'Training Mode' ), _( 'Are you sure you want to pack the training database?' ) ) )
                return;
            this._vacuumTrainingDB();
        },
        
        _takeCurrentDBToBeDefaultDB: function() {
            this._replaceDBByAction( this._actions.takeCurrentDBToBeDefaultDB );
        },
        
        takeCurrentDBToBeDefaultDB: function() {
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, _( 'Training Mode' ), _( 'Are you sure you want to take the current database to be the default training database?' ) ) )
                return;
            this._takeCurrentDBToBeDefaultDB();
        },
        
        _takeDefaultDBToBeTrainingDB: function() {
            this._replaceDBByAction( this._actions.takeDefaultDBToBeTrainingDB );
        },
        
        takeDefaultDBToBeTrainingDB: function() {
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, _( 'Training Mode' ), _( 'Are you sure you want to reset the training database to the default training database?' ) ) )
                return;
            this._takeDefaultDBToBeTrainingDB();
        },
        
        _takeTrainingDBToBeDefaultDB: function() {
            this._replaceDBByAction( this._actions.takeTrainingDBToBeDefaultDB );
        },
        
        takeTrainingDBToBeDefaultDB: function() {
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, _( 'Training Mode' ), _( 'Are you sure you want to take the current training database to be the default training database?' ) ) )
                return;
            this._takeTrainingDBToBeDefaultDB();
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
	 		
            var cart = GeckoJS.Controller.getInstanceByName( "Cart" );
            
            if ( isTraining ) {
                if ( cart.ifHavingOpenedOrder() ) {
                    GREUtils.Dialog.alert( 
                        this.topmostWindow,
                        _( 'Training Mode' ),
                        _( 'Training mode can be terminated only if there is no open order.' )
                    );
                    return;
                }
                
                if ( GREUtils.Dialog.confirm( this.topmostWindow, _( 'Training Mode' ), _( 'Are you going to leave the training mode?' ) ) ) {
                    GeckoJS.Session.set( "isTraining", 0 );
	 				
                    GeckoJS.Observer.notify( null, "TrainingMode", "exit" );

                    this.log('FATAL', 'Leaving training mode');

                    // enableSyncActive
                    this.enableSyncActive();
                }
            } else {
                if ( cart.ifHavingOpenedOrder() ) {
                    GREUtils.Dialog.alert(
                        this.topmostWindow,
                        _( 'Training Mode' ),
                        _( 'Please complete or cancel the current order first.' )
                    );
                    return;
                }
	 			
                if ( GREUtils.Dialog.confirm( this.topmostWindow, _( 'Training Model' ), _( "Are you sure you want to start training?" ) ) ) {
                    // set up the flag indicating that we are now in the training mode.
                    GeckoJS.Session.add( "isTraining", 1 );
			 		
                    GeckoJS.Observer.notify( null, "TrainingMode", "start" );

                    this.log('FATAL', 'Entering training mode');

                    this._origSyncActive = ( ( new SyncSetting() ).read() ).active;
                    
                    // disableSyncActive
                    this.disableSyncActive();
                }
            }
        }
    };
	 
    AppController.extend( __controller__ );
} )();

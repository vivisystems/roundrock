( function() {
    var __controller__ = {

        name: "TrainingMode",
	 	
        /*_orderDBConfig: "DATABASE_CONFIG.order",
        _trainingOrderDBConfig: "DATABASE_CONFIG.training_order",
        _emptyTrainingOrderDBConfg: "DATABASE_CONFIG.empty_training_order",
        _defaultTrainingOrderDBConfg: "DATABASE_CONFIG.default_training_order",*/
        
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
            }
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
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, _( 'Training Mode' ), _( 'Are you sure you want to VACUUM training database?' ) ) )
                return;
            this._vacuumTrainingDB();
        },
        
        _takeCurrentDBToBeDefaultDB: function() {
            this._replaceDBByAction( this._actions.takeCurrentDBToBeDefaultDB );
        },
        
        takeCurrentDBToBeDefaultDB: function() {
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, _( 'Training Mode' ), _( 'Are you sure you want to take current database to be default database?' ) ) )
                return;
            this._takeCurrentDBToBeDefaultDB();
        },
        
        _takeDefaultDBToBeTrainingDB: function() {
            this._replaceDBByAction( this._actions.takeDefaultDBToBeTrainingDB );
        },
        
        takeDefaultDBToBeTrainingDB: function() {
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, _( 'Training Mode' ), _( 'Are you sure you want to take default database to be training database?' ) ) )
                return;
            this._takeDefaultDBToBeTrainingDB();
        },
        
        _takeTrainingDBToBeDefaultDB: function() {
            this._replaceDBByAction( this._actions.takeTrainingDBToBeDefaultDB );
        },
        
        takeTrainingDBToBeDefaultDB: function() {
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, _( 'Training Mode' ), _( 'Are you sure you want to take training database to be default database?' ) ) )
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
	 		
            var trainingModeController = GeckoJS.Controller.getInstanceByName( "TrainingMode" );
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

                    // enableSyncActive
                    this.enableSyncActive();
                }
            } else {
                if ( cart.ifHavingOpenedOrder() ) {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Training Mode'),
                                          _('Please complete or cancel the current order first.'));
                    return;
                }
	 			
                if ( GREUtils.Dialog.confirm( this.topmostWindow, _( 'Training Model' ), _( "Are you sure you want to start training?" ) ) ) {
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

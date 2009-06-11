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
	 	
	 	execute: function( cmd, param ) {
            try {
                var exec = new GeckoJS.File( cmd );
                var r = exec.run( param, true );
                // this.log("ERROR", "Ret:" + r + "  cmd:" + cmd + "  param:" + param);
                exec.close();
                return true;
            }
            catch ( e ) {
                NotifyUtils.warn( _( 'Failed to execute command (%S).', [ cmd + ' ' + param ] ) );
                return false;
            }
        },
        
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
        	
        	this.execute( "/bin/cp", [ pathDBToReplace, pathDBToBeReplaced ] );
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
	 	
	 	start: function() {
	 		var isTraining = GeckoJS.Session.get( "isTraining" );
	 		
	 		var trainingModeController = GeckoJS.Controller.getInstanceByName( "TrainingMode" );
	 		
	 		if ( isTraining ) {
	 			if ( GREUtils.Dialog.confirm( window, '', _( 'Are you going to leave the training mode?' ) ) ) {
	 				GeckoJS.Session.set( "isTraining", 0 );
	 				
	 				//Vacuum the training DB by just substituting an empty one for it.
	 				//this.vacuumTrainingDB();
	 				
	 				//trainingModeController.dispatchEvent( "startTrainingMode", "exit" );
	 				GeckoJS.Observer.notify( null, "TrainingMode", "exit" );
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
			 		
			 		//Vacuum the training DB by just substituting an empty one for it.
	 				//this.vacuumTrainingDB();
			 		
			 		//trainingModeController.dispatchEvent( "startTrainingMode", "start" );
			 		GeckoJS.Observer.notify( null, "TrainingMode", "start" );
			 	}
		 	}
	 	}
	 };
	 
	 GeckoJS.Controller.extend( __controller__ );
} )();

( function() {
	/**
	 * Class TrainingMode
	 */
	 
	 var __controller__ = {
	 	name: "TrainingMode",
	 	
	 	_orderDBConfig: "DATABASE_CONFIG.order",
	 	_trainingOrderDBConfig: "DATABASE_CONFIG.training_order",
	 	_emptyTrainingOrderDBConfg: "DATABASE_CONFIG.empty_training_order",
	 	
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
        
        _vacuumTrainingDB: function() {
        	var trainingOrderDBConf =
        		GeckoJS.Configure.read( this._trainingOrderDBConfig );
        	var emptyTrainingOrderDBConf =
        		GeckoJS.Configure.read( this._emptyTrainingOrderDBConfg );
        	var trainingOrderDB =
        		trainingOrderDBConf.path + '/' + trainingOrderDBConf.database;
        	var emptyTrainingOrderDB =
        		emptyTrainingOrderDBConf.path + '/' + emptyTrainingOrderDBConf.database;
        	
        	this.execute( "/bin/cp", [ emptyTrainingOrderDB, trainingOrderDB ] );
        },
        
        vacuumTrainingDB: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to VACUUM training database?' ) ) )
                return;
            this._vacuumTrainingDB();
        },
        
        _takeCurrentDBToBeTrainingDB: function() {
        	var trainingOrderDBConf =
        		GeckoJS.Configure.read( this._trainingOrderDBConfig );
        	var orderDBConf =
        		GeckoJS.Configure.read( this._orderDBConfig );
        	var trainingOrderDB =
        		trainingOrderDBConf.path + '/' + trainingOrderDBConf.database;
        	var orderDB =
        		orderDBConf.path + '/' + orderDBConf.database;
        	
        	this.execute( "/bin/cp", [ orderDB, trainingOrderDB ] );
        },
        
        takeCurrentDBToBeTrainingDB: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to take current database to be training database?' ) ) )
                return;
        	this._takeCurrentDBToBeTrainingDB();
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

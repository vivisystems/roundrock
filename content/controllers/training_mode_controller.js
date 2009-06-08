( function() {
	/**
	 * Class TrainingMode
	 */
	 
	 var __controller__ = {
	 	name: "TrainingMode",
	 	
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
        
        vacuumTrainingDB: function() {
        	var trainingOrderDBConf =
        		GeckoJS.Configure.read( "DATABASE_CONFIG.training_order" );
        	var emptyTrainingOrderDBConf =
        		GeckoJS.Configure.read( "DATABASE_CONFIG.empty_training_order" );
        	var trainingOrderDB =
        		trainingOrderDBConf.path + '/' + trainingOrderDBConf.database;
        	var emptyTrainingOrderDB =
        		emptyTrainingOrderDBConf.path + '/' + emptyTrainingOrderDBConf.database;
        	
        	this.execute( "/bin/cp", [ emptyTrainingOrderDB, trainingOrderDB ] );
        },
	 	
	 	start: function() {
	 		var isTraining = GeckoJS.Session.get( "isTraining" );
	 		
	 		var trainingModeController = GeckoJS.Controller.getInstanceByName( "TrainingMode" );
	 		
	 		if ( isTraining ) {
	 			if ( GREUtils.Dialog.confirm( window, '', _( 'Are you going to leave the training mode?' ) ) ) {
	 				GeckoJS.Session.set( "isTraining", 0 );
	 				
	 				//Vacuum the training DB by just substituting an empty one for it.
	 				this.vacuumTrainingDB();
	 				
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
	 				this.vacuumTrainingDB();
			 		
			 		//trainingModeController.dispatchEvent( "startTrainingMode", "start" );
			 		GeckoJS.Observer.notify( null, "TrainingMode", "start" );
			 	}
		 	}
	 	}
	 };
	 
	 GeckoJS.Controller.extend( __controller__ );
} )();

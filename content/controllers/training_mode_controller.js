( function() {
	/**
	 * Class TrainingMode
	 */
	 
	 var __controller__ = {
	 	name: "TrainingMode",
	 	
	 	start: function() {
	 		var isTraining = GeckoJS.Session.get( "isTraining" );
	 		
	 		var trainingModeController = GeckoJS.Controller.getInstanceByName( "TrainingMode" );
	 		
	 		if ( isTraining ) {
	 			if ( GREUtils.Dialog.confirm( window, '', _( 'Are you going to leave the training mode?' ) ) ) {
	 				GeckoJS.Session.set( "isTraining", 0 );
	 				
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
			 		
			 		//trainingModeController.dispatchEvent( "startTrainingMode", "start" );
			 		GeckoJS.Observer.notify( null, "TrainingMode", "start" );
			 	}
		 	}
	 	}
	 };
	 
	 GeckoJS.Controller.extend( __controller__ );
} )();

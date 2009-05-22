/**
 * GeckoJS.TrainingBehavior instance.
 *
 * @name GeckoJS.AclComponent
 * @extends GeckoJS.Component
 *
 */
var TrainingBehavior = window.TrainingBehavior = GeckoJS.Behavior.extend( {
    name: 'Training'
} );

TrainingBehavior.prototype.beforeSave = function( event ) {

    if ( !event )  return ;
    
    var isTraining = GeckoJS.Session.get( "isTraining" );
    
    if ( isTraining ) {
    	GREUtils.log( 'We are now in the training model' );
    	event.preventDefault();
   	}
};

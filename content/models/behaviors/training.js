/**
 * GeckoJS.TrainingBehavior instance.
 *
 * @name GeckoJS.AclComponent
 * @extends GeckoJS.Component
 *
 */
var TrainingBehavior = window.TrainingBehavior = GeckoJS.Behavior.extend( {
    name: "Training",
    dbConfig: "training_order"
} );

TrainingBehavior.prototype.switchRelativeDBConf = function( model ) {
	function switchSpecifiedDBConf( relation ) {
		model[ relation ].forEach( function( relativeModel ) {
			var modelName = relativeModel.name;   		
			if( model[ modelName ] ) {
                            // init useDbConfigBak 
                            if( !model[ modelName ].useDbConfigBak ) {
                                model[ modelName ].useDbConfigBak = model[ modelName ].useDbConfig;
                            }
                            model[ modelName ].useDbConfig = model.useDbConfig;
                        }
		});
	}
	
	switchSpecifiedDBConf( "hasOne" );
	switchSpecifiedDBConf( "hasMany" );
	switchSpecifiedDBConf( "belongsTo" );
};

TrainingBehavior.prototype.switchDBConf = function() {
    // do not switch if current db config is 'backup'
    if ( this.model.useDbConfig == 'backup' )
        return;
    
    var isTraining = GeckoJS.Session.get( "isTraining" );
    if( !this.model.useDbConfigBak )
    	this.model.useDbConfigBak = this.model.useDbConfig;

    if ( isTraining ) {
    	this.model.useDbConfig = this.dbConfig;
    } else {
        this.model.useDbConfig = this.model.useDbConfigBak;
    }
    this.switchRelativeDBConf( this.model );
};

TrainingBehavior.prototype.beforeSave = function( event ) {
    if ( !event )  return ;
    this.switchDBConf();
};

TrainingBehavior.prototype.beforeFind = function( event ) {
    if ( !event )  return ;
    this.switchDBConf();
};

TrainingBehavior.prototype.beforeDelete = function( event ) {
    if ( !event )  return ;
    this.switchDBConf();
};

TrainingBehavior.prototype.beforeTruncate = function( event ) {
    if ( !event )  return ;
    this.switchDBConf();
};

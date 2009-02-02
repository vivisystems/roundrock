/**
 * GeckoJS.SyncBehavior instance.
 *
 * @name GeckoJS.AclComponent
 * @extends GeckoJS.Component
 *
 */
var SyncBehavior = window.SyncBehavior = GeckoJS.Behavior.extend({
    name: 'Sync'
});

SyncBehavior.prototype.getSyncModel = function() {
    if (this.syncModel == null)  {
        this.log('TRACE', 'getSyncModel ' );
        this.syncModel = new SyncModel(null, -1);
        this.log('TRACE', 'getSyncModel after : ' + this.config );
        this.syncModel.useDbConfig = this.config;
    }
    this.log('TRACE', 'getSyncModel before return ' );
    return this.syncModel;
};

SyncBehavior.prototype.getMachineId = function() {
    if (this.machineId == null)  {
        this.log('TRACE', 'getMachineId ' );
        this.machineId = "T001"; //GeckoJS.Configure.read("vivipos.fec.settings.TerminalID");
    }
    return this.machineId;
};


SyncBehavior.prototype.afterTruncate = function(event) {

    if (!event || !event.data)  return ;

    this.log('TRACE', 'SyncBehavior afterTruncate > ' + this.model.name + ',' + event.data);

    var sync = null;

    sync = this.getSyncModel();

    // check if not active
    if (!sync.isActive()) return;

    var machine_id = this.getMachineId();

    if (!machine_id) return ;

    var data = {
        crud: 'truncate',
        machine_id: machine_id,
        method_id: "",
        method_type: this.model.name,
        method_table: this.model.table
    };

    sync.create();
    sync.save(data);


};

SyncBehavior.prototype.afterSave = function(event) {

    if (!event)  return ;

    this.log('TRACE', 'SyncBehavior afterSave > ' + this.model.name + ',' + event.data + ', ' + this.model.id);


    var sync = null;

    sync = this.getSyncModel();

    // check if not active
    this.log('TRACE', 'afterSave before isActive ' );
    if (!sync.isActive()) return;
    this.log('TRACE', 'afterSave after isActive ' );

    this.log('TRACE', 'afterSave before getMachineId ' );
    var machine_id = this.getMachineId();

    if (!machine_id) return ;

    var data = {
        crud: 'create',
        machine_id: machine_id,
        method_id: this.model.id,
        method_type: this.model.name,
        method_table: this.model.table
    };

    if (event.data) {
        // create
        data.crud = 'create';
    }else {
        // update
        data.crud = 'update';
    }
    
    sync.create();
    sync.save(data);

};

SyncBehavior.prototype.afterDelete = function(event) {

    if (!event || !event.data)  return ;
    
    this.log('TRACE', 'SyncBehavior afterDelete > ' + this.model.name + ',' + event.data);

    var sync = null;

    sync = this.getSyncModel();
    
    // check if not active
    if (!sync.isActive()) return;

    var machine_id = this.getMachineId();

    if (!machine_id) return ;

    var data = {
        crud: 'delete',
        machine_id: machine_id,
        method_id: event.data,
        method_type: this.model.name,
        method_table: this.model.table
    };

    sync.create();
    sync.save(data);

};

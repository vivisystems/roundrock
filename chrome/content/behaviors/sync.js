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

SyncBehavior.syncSetting = null;

SyncBehavior.prototype.getSync = function() {
    
    if (!this.syncModel) {
        this.syncModel = new Sync(null, -1);
    }

    this.syncModel.useDbConfig = this.model.useDbConfig ;
    /* ifdef DEBUG */
    this.log('DEBUG', 'sync useDbconfig: ' + this.syncModel.useDbConfig );
    /* endif DEBUG */
   
    return this.syncModel;
};

SyncBehavior.prototype.getSyncSetting = function() {

    if (SyncBehavior.syncSetting) return SyncBehavior.syncSetting;

    SyncBehavior.syncSetting = (new SyncSetting()).read() || {active: 0};
   
    return SyncBehavior.syncSetting;
};

SyncBehavior.prototype.isActive = function() {

    var active = (this.getSyncSetting().active == 1);

    if (this.model.useDbConfig == 'backup' || this.model.useDbConfig == 'memory') return 0;

    return active;

};


SyncBehavior.prototype.getMachineId = function() {

    if (this.machineId) return this.machineId;

    this.machineId = this.getSyncSetting().machine_id;
    
    return this.machineId;
};


SyncBehavior.prototype.afterTruncate = function(event) {

    if (!event || !event.data)  return ;

//    this.log('TRACE', 'SyncBehavior afterTruncate > ' + this.model.name + ',' + event.data);

    // check if not active
    if(!this.isActive()) return;

    // get machineId
    var machineId = this.getMachineId();
    if (!machineId) return ;

    var sync = this.getSync();

    var data = {
        crud: 'truncate',
        machine_id: machineId,
        from_machine_id: machineId,
        method_id: "",
        method_type: this.model.name,
        method_table: this.model.table
    };

    sync.create();
    sync.save(data);


};

SyncBehavior.prototype.afterSave = function(event) {

    if (!event)  return ;

//    this.log('ERROR', 'SyncBehavior afterSave > ' + this.model.name + ',' + event.data + ', ' + this.model.id);

    // check if not active
    if(!this.isActive()) return;

    // get machineId
//    this.log('ERROR', 'getMachineId ');
    var machineId = this.getMachineId();
    if (!machineId) return ;

//    this.log('ERROR', 'getMachineId ' + machineId);


//    this.log('ERROR', 'getSync');

    var sync = this.getSync();

//    this.log('ERROR', 'getSync return ');

    var data = {
        crud: 'create',
        machine_id: machineId,
        from_machine_id: machineId,
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
    
//    this.log('TRACE', 'SyncBehavior afterDelete > ' + this.model.name + ',' + event.data);

    // check if not active
    if(!this.isActive()) return;

    // get machineId
    var machineId = this.getMachineId();
    if (!machineId) return ;

    var sync = this.getSync();

    var data = {
        crud: 'delete',
        machine_id: machineId,
        from_machine_id: machineId,
        method_id: event.data,
        method_type: this.model.name,
        method_table: this.model.table
    };

    sync.create();
    sync.save(data);

};


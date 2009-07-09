( function() {
    
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var TableModel = window.TableModel = AppModel.extend({
        name: 'Table',

        useDbConfig: 'table',

        belongsTo: ['TableRegion'],

        // hasOne: [{name: 'TableStatus', 'primaryKey': 'table_no', 'foreignKey': 'table_no'}, 'TableMap'],
        hasOne: ['TableStatus'],
        
        hasMany: ['TableBooking', 'TableOrder'],

        behaviors: ['Sync', 'Training']
    /*
        createDBTables: function() {

            var sql_tables = 'CREATE TABLE "tables" ("id" VARCHAR,"table_no" INTEGER,"table_name" VARCHAR,"table_region_id" VARCHAR,"seats" INTEGER,"active" BOOL,"tag" VARCHAR)';
            var sql_table_regions = 'CREATE TABLE "table_regions" ("id" VARCHAR, "name" VARCHAR, "image" VARCHAR)';
            var sql_table_bookings = 'CREATE TABLE "table_bookings" ("id" VARCHAR,"table_id" VARCHAR,"booking" INTEGER,"contact" VARCHAR,"telephone" VARCHAR,"address" VARCHAR,"note" VARCHAR, "table_no" INTEGER)';
            var sql_table_statuses = 'CREATE TABLE "table_statuses" ("id" VARCHAR, "table_no" INTEGER, "table_name" VARCHAR, "seats" INTEGER, "active" BOOL, "status" INTEGER, "tag" VARCHAR, "service_time" INTEGER, "booking" INTEGER, "host_by" INTEGER)';

            var regionModel = new TableRegionModel;
            var bookingModel = new TableBookingModel;
            var statusModel = new TableStatusModel;
            
            GREUtils.log(GeckoJS.BaseObject.dump(this.schema().fields));
            GREUtils.log(GeckoJS.BaseObject.dump(regionModel.schema().fields));
            GREUtils.log(GeckoJS.BaseObject.dump(bookingModel.schema().fields));
            GREUtils.log(GeckoJS.BaseObject.dump(statusModel.schema().fields));

            if (this.schema().fields == false) this.execute(sql_tables);
            if (regionModel.schema().fields == false) this.execute(sql_tables);
            if (bookingModel.schema().fields == false) this.execute(sql_tables);
            if (statusModel.schema().fields == false) this.execute(sql_tables);
    //        for (var v in this.schema().fields) {
    //            tpl[v] = true;
    //        }
        }
    */
    });
} )();

( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
    
    var CondimentGroupModel = window.CondimentGroupModel = AppModel.extend({
        name: 'CondimentGroup',
        hasMany: ['Condiment'],

        removeCondimentGroup: function(iid) {
            this.del(iid);

            var cond = "condiment_group_id='" + iid + "'";

            this.Condiment.delAll(cond);
        }
    });
} )();

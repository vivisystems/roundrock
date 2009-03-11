var CondimentGroupModel = window.CondimentGroupModel = GeckoJS.Model.extend({
    name: 'CondimentGroup',
    hasMany: ['Condiment'],

    removeCondimentGroup: function(iid) {
        this.del(iid);

        var cond = "condiment_group_id='" + iid + "'";

        this.Condiment.delAll(cond);
    }
});

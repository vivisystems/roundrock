var ShiftChangeModel = window.ShiftChangeModel = GeckoJS.Model.extend({
    name: 'ShiftChange',

    useDbConfig: 'order',

    autoRestoreFromBackup: true,
    
    hasMany: ['ShiftChangeDetail'],

    behaviors: ['Sync', 'Training'],
    
    saveShiftChange: function(data) {
        if(!data) return true;

        var r = this.saveShiftChangeMaster(data);
        this.saveShiftChangeDetail(data);

        return r;
    },

    saveShiftChangeMaster: function(data) {

        this.id = '';
        var r = this.save(data);
        if (!r) {
            r = this.saveToBackup(data);
        }
        return r;
    },

    saveShiftChangeDetail: function(data) {

        for (var i = 0; i < data.shiftChangeDetails.length; i++) {
            var o = data.shiftChangeDetails[i];
            var detail = {};
            detail['shift_change_id'] = this.id;
            detail['type'] = o.type;
            detail['name'] = o.name;
            detail['change'] = o.change;
            detail['amount'] = o.amount;
            detail['excess_amount'] = o.excess_amount;
            detail['count'] = o.count;
            
            this.ShiftChangeDetail.id = '';
            if (!this.ShiftChangeDetail.save(detail)) {
                this.ShiftChangeDetail.saveToBackup(detail);
            }
        }
    }
});

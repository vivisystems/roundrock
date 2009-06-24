var ShiftChangeModel = window.ShiftChangeModel = GeckoJS.Model.extend({
    name: 'ShiftChange',

    useDbConfig: 'order',

    autoRestoreFromBackup: true,
    
    hasMany: ['ShiftChangeDetail'],

    behaviors: ['Sync', 'Training'],
    
    saveShiftChange: function(data) {
        if(!data) return true;

        var s;
        var r = this.saveShiftChangeMaster(data);
        if (r) {
            s = this.saveShiftChangeDetail(data);
            if (s) {
                return r;
            }
            else {
                this.lastError = this.ShiftChangeDetail.lastError;
                this.lastErrorString = this.ShiftChangeDetail.lastErrorString;
                return s;
            }
        }
        else {
            return r;
        }
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

        var s = true;
        for (var i = 0; s && i < data.shiftChangeDetails.length; i++) {
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
                s = this.ShiftChangeDetail.saveToBackup(detail);
            }
        }
        return s;
    }
});

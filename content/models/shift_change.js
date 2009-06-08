var ShiftChangeModel = window.ShiftChangeModel = GeckoJS.Model.extend({
    name: 'ShiftChange',

    useDbConfig: 'order',

    hasMany: ['ShiftChangeDetail'],

    behaviors: ['Sync', 'Training'],
    
    saveShiftChange: function(data) {
        if(!data) return true;

        var r;
        r = this.saveShiftChangeMaster(data);
        r = this.saveShiftChangeDetail(data) && r;

        return r;
    },

    saveShiftChangeMaster: function(data) {

        this.id = '';
        return this.save(data);
        
    },

    saveShiftChangeDetail: function(data) {

        var r = true;

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
                r = false;
                break;
            }
        }
        return r;
    }
});

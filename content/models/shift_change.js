var ShiftChangeModel = window.ShiftChangeModel = GeckoJS.Model.extend({
    name: 'ShiftChange',

    useDbConfig: 'order',

    hasMany: ['ShiftChangeDetail'],

    saveShiftChange: function(data) {
        if(!data) return;

        var r;
        r = this.saveShiftChangeMaster(data);
        r = this.saveShiftChangeDetail(data);

    },

    saveShiftChangeMaster: function(data) {

        var r;
        
        var changeData = data;
        this.id = '';
        this.begin();
        r = this.save(changeData);
        this.commit();

        return r;
    },

    saveShiftChangeDetail: function(data) {

        var r;
        var self = this;
        var payments = [];

        data.detail.forEach(function(o){
            var detail = {};
            detail['shift_change_id'] = self.id;
            detail['topic'] = o.name + '-' + o.memo1;
            detail['amount'] = o.amount;
            payments.push(detail);
        });

        this.ShiftChangeDetail.id = '';

        this.ShiftChangeDetail.begin();
        r = this.ShiftChangeDetail.saveAll(payments);
        this.ShiftChangeDetail.commit();
        return r;
    }
});

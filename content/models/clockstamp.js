GREUtils.define('ViviPOS.ClockStampModel');
ViviPOS.ClockStampModel = GeckoJS.Model.extend({
    name: 'ClockStamp',
    indexes: ['username', 'created', 'clockin_date'],

    saveStamp: function(type, username) {

        var data = {};
        data['username'] = username;
        //data['created'] = parseInt(new Date().getTime() / 1000);      // 18:45
        //data['created_date'] = new Date().toString("yyyy-MM-dd HH:mm:ss");      // 18:45
        //data['modified'] = parseInt(new Date().getTime() / 1000);      // 18:45
        //data['modified_date'] = new Date().toString("yyyy-MM-dd HH:mm:ss");      // 18:45

        var today = new Date();
        switch (type) {
            case "clockin":
                data['clockin'] = 1;
                data['clockbreak'] = 0;
                data['clockout'] = 0;
                data['clockin_time'] = today.toString("yyyy-MM-dd HH:mm:ss");
                data['clockin_date'] = today.toString("yyyy-MM-dd");
                this.create();
                break;
                
            case "clockbreak":
                var last = this.findLastStamp(username);
                if (last && last['clockbreak'] == 0 && last['clockout'] == 0) {
                    data['clockin'] = 1;
                    data['clockbreak'] = 1;
                    data['clockout'] = 0;
                    this.id = last.id;
                }else {
                    alert('Not yet clock in...');
                    return;
                    data['clockin'] = 0;
                    data['clockbreak'] = 0;
                    data['clockout'] = 1;
                    this.create();
                }
                
                data['clockout_time'] = today.toString("yyyy-MM-dd HH:mm:ss");
                break;
            case "clockout":
                var last = this.findLastStamp(username);
                if (last && last['clockbreak'] == 1 && last['clockout'] == 0) {
                    alert('Not yet clock in after clock break...');
                    return;
                    data['clockin'] = 1;
                    data['clockbreak'] = 0;
                    data['clockout'] = 1;
                    this.id = last.id;
                }else if (last && last['clockout'] == 0) {
                    data['clockin'] = 1;
                    data['clockbreak'] = 0;
                    data['clockout'] = 1;
                    this.id = last.id;
                }else {
                    alert('Not yet clock in...');
                    return;
                    data['clockin'] = 0;
                    data['clockbreak'] = 0;
                    data['clockout'] = 1;
                    this.create();
                }

                data['clockout_time'] = today.toString("yyyy-MM-dd HH:mm:ss");
                break;
        }

        this.save(data);
    },

    findLastStamp: function(username) {

        return this.find('first', {conditions: "username='"+username+"'", order: "created DESC"});
    },

    beforeSave: function(evt) {
        
        return true;
    }
    
});
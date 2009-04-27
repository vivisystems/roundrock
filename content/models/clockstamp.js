var ClockStampModel = GeckoJS.Model.extend({
    name: 'ClockStamp',
    indexes: ['username', 'job', 'created', 'clockin_date'],

    saveStamp: function(type, username, job, displayname) {

        var data = {};
        var today = new Date();

        if (!displayname) displayname = username;
        data['username'] = username;
        data['displayname'] = displayname;
        
        switch (type) {
            case "clockin":
                var last = this.findLastStamp(username);
                // automatically clocks out last job if necessary
                if (last && !last['clockout']) {
                    // clock out previous job first
                    last['clockout'] = 1;
                    last['clockout_time'] = today.toString("yyyy-MM-dd HH:mm:ss");
                    this.id = last.id;
                    this.save(last);
                }
                // clock in a new job
                data['clockin'] = 1;
                data['job'] = job;
                data['clockout'] = 0;
                data['clockin_time'] = today.toString("yyyy-MM-dd HH:mm:ss");
                data['clockin_date'] = today.toString("yyyy-MM-dd");
                this.create();
                break;
                
            case "clockout":
                var last = this.findLastStamp(username);

                if (last && last['clockout'] == false) {
                    data['clockin'] = 1;
                    data['clockout'] = 1;
                    this.id = last.id;
                    data['clockout_time'] = today.toString("yyyy-MM-dd HH:mm:ss");
                }
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

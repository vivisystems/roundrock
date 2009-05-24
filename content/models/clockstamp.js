var ClockStampModel = GeckoJS.Model.extend({
    name: 'ClockStamp',

    indexes: ['username', 'job', 'created', 'clockin_date'],

    useDbConfig: 'order',
    
    behaviors: ['Sync'],

    saveStamp: function(type, username, job, displayname) {

        var data = {};
        var today = new Date();
        var last;
        var r;

        if (!displayname) displayname = username;
        data['username'] = username;
        data['displayname'] = displayname;
        
        switch (type) {
            case "clockin":
                last = this.findLastStamp(username);
                // check for db error
                if (this.lastError) {
                    return false;
                }
                
                // automatically clocks out last job if necessary
                if (last && !last['clockout']) {
                    // clock out previous job first
                    last['clockout'] = 1;
                    last['clockout_time'] = today.toString("yyyy-MM-dd HH:mm:ss");
                    this.id = last.id;
                    r = this.save(last);
                    if (!r) {
                        return false;
                    }
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
                last = this.findLastStamp(username);

                if (this.lastError) {
                    return false;
                }
                
                if (last && last['clockout'] == false) {
                    data['clockin'] = 1;
                    data['clockout'] = 1;
                    this.id = last.id;
                    data['clockout_time'] = today.toString("yyyy-MM-dd HH:mm:ss");
                }
                break;
        }

        return this.save(data);
    },

    findLastStamp: function(username) {

        return this.find('first', {conditions: "username='"+username+"'", order: "created DESC"});
    },

    beforeSave: function(evt) {
        
        return true;
    }
    
});

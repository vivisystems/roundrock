var ClockStampModel = GeckoJS.Model.extend({
    name: 'ClockStamp',

    indexes: ['username', 'job', 'created'],

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

        // first let's try to get a lock on the database
        r = this.begin();
        this.log('begin (' + r + ') errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')');
        //r = this.execute('BEGIN EXCLUSIVE');

        // if we got the lock
        if (r) {
            try {

                switch (type) {
                    case "clockin":
                        last = this.findLastStamp(username);
                        this.log('clockin findLastStamp errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')');
                        if (this.lastError)
                            throw new Exception();

                        // automatically clocks out last job if necessary
                        if (last && !last['clockout']) {
                            // clock out previous job first
                            last['clockout'] = 1;
                            last['clockout_time'] = today.toString("yyyy-MM-dd HH:mm:ss");

                            // update last time stamp
                            this.id = last.id;
                            r = this.save(last);
                            this.log('clockin saveLastStamp (' + r + ') errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')');
                            if (!r) {
                                throw new Exception();
                            }
                        }

                        // clock in a new job
                        data['clockin'] = 1;
                        data['job'] = job;
                        data['clockout'] = 0;
                        data['clockin_time'] = today.toString("yyyy-MM-dd HH:mm:ss");
                        this.id = null;
                        break;

                    case "clockout":
                        last = this.findLastStamp(username);
                        this.log('clockout findLastStamp errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')');
                        if (this.lastError)
                            throw new Exception();

                        if (last && !last['clockout']) {
                            data['clockin'] = 1;
                            data['clockout'] = 1;
                            this.id = last.id;
                            data['clockout_time'] = today.toString("yyyy-MM-dd HH:mm:ss");
                        }
                        break;
                }

                r = this.save(data);
                this.log('clockin/out save Stamp (' + r + ') errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')');
                if (!r)
                    throw new Exception();

                r = this.commit();
                this.log('clockin/out commit (' + r + ') errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')');
                if (!r)
                    throw new Exception();
                return r;
            }
            catch(e) {
                var errNo = this.lastError;
                var errMsg = this.lastErrorString;

                r = this.rollback();
                this.log('rollback (' + r + ') errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')');

                return false;
            }
        }
        else {
            // unable to begin transaction
            return false;
        }
    },

    findLastStamp: function(username) {
        return this.find('first', {conditions: "username='"+username+"'", order: "created DESC"});
    },

    beforeSave: function(evt) {
        return true;
    }
    
});

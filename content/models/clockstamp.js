var ClockStampModel = GeckoJS.Model.extend({
    name: 'ClockStamp',

    indexes: ['username', 'job', 'created'],

    useDbConfig: 'order',

    behaviors: ['Sync', 'Training'],

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

        // if we got the lock
        if (r) {
            try {

                switch (type) {
                    case "clockin":
                        last = this.findLastStamp(username);
                        if (parseInt(this.lastError) != 0) {
                            throw 'clockin findLastStamp errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')';
                        }

                        // automatically clocks out last job if necessary
                        if (last && !last['clockout']) {
                            // clock out previous job first
                            last['clockout'] = 1;
                            last['clockout_time'] = today.toString("yyyy-MM-dd HH:mm:ss");

                            // update last time stamp
                            this.id = last.id;
                            r = this.save(last);
                            if (!r) {
                                throw 'clockin saveLastStamp (' + r + ') errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')';
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
                        if (parseInt(this.lastError) != 0) {
                            throw 'clockout findLastStamp errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')';
                        }

                        if (last && !last['clockout']) {
                            data['clockin'] = 1;
                            data['clockout'] = 1;
                            this.id = last.id;
                            data['clockout_time'] = today.toString("yyyy-MM-dd HH:mm:ss");
                        }
                        break;
                }

                r = this.save(data);
                if (!r)
                    throw 'clockin/out save Stamp (' + r + ') errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')';

                r = this.commit();
                if (!r)
                    throw 'clockin/out commit (' + r + ') errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')';
                return r;
            }
            catch(errMsg) {
                this.rollback();

                this.log('ERROR', errMsg);

                return false;
            }
        }
        else {
            this.log('ERROR', 'saveStamp unable to obtain database lock (' + r + ') errNo (' + this.lastError + ') errMsg (' + this.lastErrorString + ')');
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

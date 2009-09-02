(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'ClockStamp',

        indexes: ['username', 'job', 'created'],

        useDbConfig: 'order',

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true,

        // returns -1 if error
        findLastStamp: function(username) {
            var result = this.find('first', {conditions: "username='"+username+"'", order: "created DESC"});
            if (parseInt(this.lastError) != 0) {
                this.log('ERROR',
                         'An error was encountered while retrieving last timestamp (error code ' + this.lastError + '): ' + this.lastErrorString);
                return -1;
            }
            return result;
        },

        saveStamp: function(type, branch_id, username, job, displayname) {

            var data = {};
            var today = new Date();
            var last;
            var r;

            if (!displayname) displayname = username;
            data['username'] = username;
            data['displayname'] = displayname;
            data['branch_id'] = branch_id;

            switch (type) {
                case "clockin":
                    last = this.findLastStamp(username);
                    if (last == -1) {
                        return false;
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
                            this.log('ERROR',
                                     'An error was encountered while saving clockin timestamp (error code ' + this.lastError + '): ' + this.lastErrorString);

                            //@db saveToBackup
                            r = this.saveToBackup(last);
                            if (r) {
                                this.log('ERROR', 'record saved to backup');
                            }
                            else {
                                this.log('ERROR', 'record could not be saved to backup:\n' + this.dump(last));
                                return false;
                            }
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
                    if (last == -1) {
                        return false;
                    }

                    if (last && !last['clockout']) {
                        data['clockin'] = 1;
                        data['clockout'] = 1;
                        data['id'] = last.id;
                        this.id = last.id;
                        data['clockout_time'] = today.toString("yyyy-MM-dd HH:mm:ss");
                    }
                    break;
            }

            r = this.save(data);
            if (!r) {
                this.log('ERROR',
                         'An error was encountered while saving timestamp (error code ' + this.lastError + '): ' + this.lastErrorString);

                //@db saveToBackup
                r = this.saveToBackup(data);
                if (r) {
                    this.log('ERROR', 'record saved to backup');
                }
                else {
                    this.log('ERROR', 'record could not be saved to backup\n' + this.dump(data));
                }
            }
            return r;
        }
    }

    var ClockStampModel = window.ClockStampModel = AppModel.extend(__model__);
    
})();

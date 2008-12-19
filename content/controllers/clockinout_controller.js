(function(){


    /**
     * Class ViviPOS.ClockInOutController
     */
    GeckoJS.Controller.extend( {
        name: 'ClockInOut',
        userpanel: null,
        users: null,
        jobpanel: null,
        jobs: null,
        joblist: null,
        jobtimes: null,
        lastUser: null,
        
        loadUsers: function () {

            var userModel = new UserModel();
            var users = userModel.find('all', {
                order: "username"
            });
            var userpanel = document.getElementById('userscrollablepanel');
            if (userpanel) {
                userpanel.datasource = users;
            }
            this.users = users;
            this.userpanel = userpanel;
        },
        
        loadJobs: function () {
            var jobModel = new JobModel();
            var jobs = jobModel.find('all', {
                order: "jobname"
            });
            
            if (jobs) {
                jobs.sort(function(a, b) {
                    if (a.jobname < b.jobname) return -1;
                    else if (a.jobname > b.jobname) return 1;
                    else return 0;
                });
                this.jobs = jobs;

                if (this.jobpanel == null) {
                    this.jobpanel = document.getElementById('jobscrollablepanel');
                }
                if (this.jobpanel) {
                    this.jobpanel.datasource = jobs;
                }
            }

            this.joblist = document.getElementById('simpleListBoxSummary');
        },

        view: function () {
            var username;
            var userpass = $('#user_password').val();

            if (this.userpanel && this.users) {
                var index = this.userpanel.selectedIndex;
                if (index > -1 && index < this.users.length) {
                    username = this.users[index].username;
                }
            }

            if (this.Acl.securityCheck(username, userpass, true)) {
                this.listSummary();
                this._lastUser = username;
            } else {
                alert('Please Check Username and Password...');
            }
        },

        clockIn: function () {

            var username;
            var userpass = document.getElementById('user_password').value;
            var index = -1;
            var job;

            if (this.userpanel && this.users) {
                var index = this.userpanel.selectedIndex;
                if (index > -1 && index < this.users.length) {
                    username = this.users[index].username;
                }
            }
            
            if (this.jobpanel) {
                index = this.jobpanel.selectedIndex;
                if (index > -1) job = this.jobs[index].jobname;
                alert(index);
            }

            if (index == -1) {
                alert('Please Select a Job Function')
            }
            else {
                if (this.Acl.securityCheck(username, userpass, true)) {

                    alert('Clock In...' + username);
                    var clockstamp = new ClockStampModel();
                    clockstamp.saveStamp('clockin', username, job);
                    this.listSummary();
                    this.lastUser = username;
                } else {
                    alert('Please Check Username and Password...');
                }
            }
        },

        clockOut: function () {
            var username;
            var userpass = $('#user_password').val();

            if (this.userpanel && this.users) {
                var index = this.userpanel.selectedIndex;
                if (index > -1 && index < this.users.length) {
                    username = this.users[index].username;
                }
            }

            if (this.Acl.securityCheck(username, userpass, true)) {
                
                // alert('Clock Out...' + username);
                var clockstamp = new ClockStampModel();
                // clockstamp.saveStamp({username: username, clockout: true, clockin:false});
                clockstamp.saveStamp('clockout', username);
                this.listSummary();
                // this.log(this.dump(clockstamp.find('all', {order: "created DESC"})));
            } else {
                alert('Please Check Username and Password...');
            }
        },

        clearSummary: function () {
            if (this.joblist) this.joblist.resetData();
            this.jobtimes = null;
        },
        
        listSummary: function () {
            var username;
            if (this.userpanel && this.users) {
                var index = this.userpanel.selectedIndex;
                if (index > -1 && index < this.users.length) {
                    username = this.users[index].username;
                }
            }

            var joblist = this.joblist;
            var clockstamp = new ClockStampModel();
            var today = new Date();
            var stamps = clockstamp.find('all', {
                conditions: "username='" + username + "' AND clockin_date='" + today.toString("yyyy-MM-dd") + "'",
                order: "created"
            });
            var oldTimes = this.jobtimes;
            this.jobtimes = stamps;
            
            if (stamps) {
                stamps.forEach(function(o){
                    o.clockin_time = o.clockin_time ? o.clockin_time.substring(11, 19) : '--:--:--';
                    o.clockout_time = o.clockout_time ? o.clockout_time.substring(11, 19) : '--:--:--';
                });
                if (oldTimes) {
                    var lastIndex = oldTimes.length - 1;
                    joblist.updateItemAt(lastIndex, stamps[lastIndex] );
                    if (stamps.length > oldTimes.length) {
                        joblist.insertItemAt(lastIndex + 1, stamps[lastIndex + 1] );
                    }
                }
                else {
                    joblist.loadData(stamps);
                }

                joblist.selectedIndex = stamps.length - 1;
                joblist.ensureIndexIsVisible(joblist.selectedIndex);
            } else {
                joblist.resetData();
            }
           
        },

        cancel: function () {
                window.close();
        },
    });

})();

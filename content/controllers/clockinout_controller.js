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
        publicAttendance: false,
        
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

            this.publicAttendance = GeckoJS.Configure.read('vivipos.fec.settings.PublicAttendance') || false;
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
            if (username == null) {
                //@todo OSD
                OsdUtils.warn(_('Please select a user first'));
            }
            else if (this.publicAttendance || this.Acl.securityCheck(username, userpass, true)) {
                this.listSummary(username);
            }
            else {
                if (userpass == '')
                    //@todo OSD
                    OsdUtils.warn(_('Please enter the passcode'));
                else
                    //@todo OSD
                    OsdUtils.warn(_('Authentication Failed!\nPlease make sure the passcode is correct'));
            }
        },

        clockIn: function () {

            var username;
            var userpass = document.getElementById('user_password').value;
            var job;
            var index;

            if (this.userpanel && this.users) {
                index = this.userpanel.selectedIndex;
                if (index > -1 && index < this.users.length) {
                    username = this.users[index].username;
                }
            }
            
            if (this.jobpanel) {
                index = this.jobpanel.selectedIndex;
                if (index > -1) job = this.jobs[index].jobname;
            }

            if (username == null) {
                //@todo OSD
                OsdUtils.warn(_('Please select a user first'));
            }
            else {
                if (this.Acl.securityCheck(username, userpass, true)) {

                    if (job == null) {

                        // check if user has default job
                        var userModel = new UserModel();
                        var user_name = userModel.findByIndex('all', {
                            index: 'username',
                            value: username
                        });

                        if (user_name && user_name.length > 0) {
                            job = user_name[0].default_job;
                        }
                    }

                    if (job == null) {
                        //@todo OSD
                        OsdUtils.warn(_('Please select a job first'));

                        // auto-switch to Job list
                        document.getElementById('deck').selectedIndex = 0;
                        return;
                    }
                    var clockstamp = new ClockStampModel();
                    clockstamp.saveStamp('clockin', username, job);

                    this.listSummary(username);
                } else {
                    if (userpass == '')
                        //@todo OSD
                        OsdUtils.warn(_('Please enter the passcode'));
                    else
                        //@todo OSD
                        OsdUtils.warn(_('Authentication Failed!\nPlease make sure the passcode is correct'));
                }
            }
            document.getElementById('user_password').value = '';
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
            if (username == null) {
                //@todo OSD
                OsdUtils.warn(_('Please select a user first'));
            }
            else {
                document.getElementById('user_password').value = '';

                if (this.Acl.securityCheck(username, userpass, true)) {
                
                    var clockstamp = new ClockStampModel();
                    var last = clockstamp.findLastStamp(username);

                    if (last && !last.clockout) {
                        clockstamp.saveStamp('clockout', username);
                    }
                    else {
                        //@todo OSD
                        OsdUtils.warn(_('Not clocked in yet'));
                    }
                    this.listSummary(username);
                }
                else {
                    if (userpass == '')
                        //@todo OSD
                        OsdUtils.warn(_('Please enter the passcode'));
                    else
                        //@todo OSD
                        OsdUtils.warn(_('Authentication Failed!\nPlease make sure the passcode is correct'));
                }
            }
        },

        clearSummary: function () {
            if (this.joblist) this.joblist.resetData();
            this.jobtimes = null;
        },
        
        listSummary: function (username) {

            var joblist = this.joblist;
            var clockstamp = new ClockStampModel();
            var today = new Date();
            var stamps = clockstamp.find('all', {
                conditions: "username='" + username + "' AND clockin_date='" + today.toString("yyyy-MM-dd") + "'",
                order: "created"
            });
            if (username != this.lastUser) this.clearSummary();
            this.lastUser = username;

            var oldTimes = this.jobtimes;
            this.jobtimes = stamps;

            if (stamps && stamps.length > 0) {
                this.log('[' + username + ']: ' + GeckoJS.BaseObject.dump(stamps));
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
                if (joblist.selectedIndex > -1) joblist.ensureIndexIsVisible(joblist.selectedIndex);
            }
           
            // bring summary list to front
            var deck = document.getElementById('deck');
            deck.selectedIndex = 1;

        },

        showJobList: function () {
            document.getElementById('deck').selectedIndex = 0;
        },

        cancel: function () {
                window.close();
        },

        validateForm: function () {

        }
    });

})();

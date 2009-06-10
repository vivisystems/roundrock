(function(){


    /**
     * Class ViviPOS.ClockInOutController
     */
    var __controller__ = {
        name: 'ClockInOut',
        userpanel: null,
        users: null,
        jobpanel: null,
        jobs: null,
        joblist: null,
        lastUser: null,
        publicAttendance: false,
        
        loadUsers: function () {

            var userModel = new UserModel();
            var users = userModel.find('all', {
                order: "username"
            });

            if (parseInt(userModel.lastError) != 0) {
                this.dbError(userModel.lastError, userModel.lastErrorString,
                             _('An error was encountered while retrieving employee records (error code %S).', [userModel.lastError]));
            }

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
            
            if (parseInt(jobModel.lastError) != 0) {
                this.dbError(jobModel.lastError, jobModel.lastErrorString,
                             _('An error was encountered while retrieving jobs (error code %S).', [jobModel.lastError]));
            }

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
        
		/**
		 * Called after the button 'view' attendance is clicked.
		 */
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
                NotifyUtils.warn(_('Please select a user first.'));
            }
            else if (this.publicAttendance || this.Acl.securityCheck(username, userpass, true)) {
                this.listSummary(username);
                $('#user_password').val('');
            }
            else {
                if (userpass == '')
                    //@todo OSD
                    NotifyUtils.warn(_('Please enter the passcode.'));
                else
                    //@todo OSD
                    NotifyUtils.warn(_('Authentication Failed! Please make sure the passcode is correct.'));
                    $('#user_password').val('');
            }
        },

        clockIn: function () {

            var username;
            var userpass = document.getElementById('user_password').value;
            var jobname;
            var displayname;
            var index;

            if (this.userpanel && this.users) {
                index = this.userpanel.selectedIndex;
                if (index > -1 && index < this.users.length) {
                    username = this.users[index].username;
                    displayname = this.users[index].displayname;
                }
            }
            
            if (this.jobpanel) {
                index = this.jobpanel.selectedIndex;
                if (index > -1) jobname = this.jobs[index].jobname;
            }

            if (username == null) {
                //@todo OSD
                NotifyUtils.warn(_('Please select a user first.'));
            }
            else {
                if (this.Acl.securityCheck(username, userpass, true)) {

                    if (jobname == null) {

                        // check if user has default job
                        var userModel = new UserModel();
                        var userByName = userModel.findByIndex('all', {
                            index: 'username',
                            value: username
                        });

                        if (parseInt(userModel.lastError) != 0) {
                            this.dbError(userModel.lastError, userModel.lastErrorString,
                                         _('An error was encountered while retrieving employee records (error code %S).', [userModel.lastError]));

                            NotifyUtils.error(_('Failed to clock user in.'));
                        }
                        else {
                            if (userByName && userByName.length > 0) {
                                jobname = userByName[0].Job.jobname;
                            }
                        }
                    }

                    if (jobname == null) {
                        //@todo OSD
                        NotifyUtils.warn(_('Please select a job first.'));

                        // auto-switch to Job list
                        document.getElementById('deck').selectedIndex = 0;
                        return;
                    }
                    var clockstamp = new ClockStampModel();
                    var r = clockstamp.saveStamp('clockin', username, jobname, displayname);
                    if (r) {
                        this.listSummary(username);
                        $('#user_password').val('');
                    }
                    else {
                        //@db
                        this.dbError(clockstamp.lastError, clockstamp.lastErrorString,
                                     _('An error was encountered while clocking employee [%S] in (error code %S).', [displayname, clockstamp.lastError]));

                        NotifyUtils.error(_('Failed to clock user in.'));
                    }
                } else {
                    if (userpass == '')
                        //@todo OSD
                        NotifyUtils.warn(_('Please enter the passcode.'));
                    else
                        //@todo OSD
                        NotifyUtils.warn(_('Authentication Failed!. Please make sure the passcode is correct.'));
                        $('#user_password').val('');
                }
            }
            document.getElementById('user_password').value = '';
        },

        clockOut: function () {
            var username;
            var userpass = $('#user_password').val();
            var displayname;

            if (this.userpanel && this.users) {
                var index = this.userpanel.selectedIndex;
                if (index > -1 && index < this.users.length) {
                    username = this.users[index].username;
                    displayname = this.users[index].displayname;
                }
            }
            if (username == null) {
                //@todo OSD
                NotifyUtils.warn(_('Please select a user first.'));
            }
            else {
                document.getElementById('user_password').value = '';

                if (this.Acl.securityCheck(username, userpass, true)) {
                
                    var clockstamp = new ClockStampModel();
                    var last = clockstamp.findLastStamp(username);

                    if (parseInt(clockstamp.lastError) != 0) {
                        this.dbError(clockstamp.lastError, clockstamp.lastErrorString,
                                     _('An error was encountered while retrieving employee attendance record (error code %S).', [clockstamp.lastError]));
                        NotifyUtils.error(_('Failed to clock user out.'));
                        return;
                    }
                    else if (last && !last.clockout) {
                        var r = clockstamp.saveStamp('clockout', username);
                        if (!r) {
                            this.dbError(clockstamp.lastError, clockstamp.lastErrorString,
                                         _('An error was encountered while clocking employee [%S] out (error code %S).', [displayname, clockstamp.lastError]));
                            NotifyUtils.error(_('Failed to clock user out.'));
                            return;
                        }
                    }
                    else {
                        //@todo OSD
                        NotifyUtils.warn(_('Not clocked in yet.'));
                    }
                    this.listSummary(username);
                    $('#user_password').val('');
                }
                else {
                    if (userpass == '')
                        //@todo OSD
                        NotifyUtils.warn(_('Please enter the passcode.'));
                    else
                        //@todo OSD
                        NotifyUtils.warn(_('Authentication Failed! Please make sure the passcode is correct.'));
                        $('#user_password').val('');
                }
            }
        },

        clearSummary: function () {
            if (this.joblist) this.joblist.resetData();
        },
        
        listSummary: function (username) {

            var joblist = this.joblist;
            var clockstamp = new ClockStampModel();
            var today = new Date();
            var stamps = clockstamp.find('all', {
                conditions: "username='" + username + "'" +
                            " AND ( substr( clockout_time, 1, 10 ) ='" + today.toString("yyyy-MM-dd") + "'" +
                                   " OR substr(clockin_time, 1, 10) ='" + today.toString("yyyy-MM-dd") + "'" +
                                   " OR clockout = 0 )",
                order: "created"
            });
            if (parseInt(clockstamp.lastError) != 0) {
                this.dbError(clockstamp.lastError, clockstamp.lastErrorString,
                             _('An error was encountered while retrieving employee attendance record (error code %S). ', [clockstamp.lastError]));
                return;
            }
            if (username != this.lastUser) this.clearSummary();
            this.lastUser = username;

            if (stamps && stamps.length > 0) {
                stamps.forEach(function(o){
                    o.clockin_time = o.clockin_time ? o.clockin_time.substring(5, 16) : '';
                    o.clockout_time = o.clockout_time ? o.clockout_time.substring(5, 16) : '';
                });
                joblist.loadData(stamps);
                joblist.selectedIndex = stamps.length - 1;
                if (joblist.selectedIndex > -1) joblist.ensureIndexIsVisible(joblist.selectedIndex);
            }
            else {
                this.clearSummary();
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

        },


        dbError: function(model, alertStr) {
            this.log('WARN', 'Database exception: ' + model.lastErrorString + ' [' +  model.lastError + ']');
            GREUtils.Dialog.alert(window,
                                  _('Data Operation Error'),
                                  alertStr + '\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();

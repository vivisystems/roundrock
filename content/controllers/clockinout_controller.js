(function(){


    /**
     * Class ViviPOS.ClockInOutController
     */
    GeckoJS.Controller.extend( {
        name: 'ClockInOut',
        _listObj: null,
        _listJob: null,
        _listJobs: null,
        _listDatas: null,
        _lastUser: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('simpleListBoxSummary');
            }
            return this._listObj;
        },
        
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
            
            if (jobs)
                jobs.sort(function(a, b) {
                    if (a.jobname < b.jobname) return -1;
                    else if (a.jobname > b.jobname) return 1;
                    else return 0;
                });

            if (this._listJob == null) this._listJob = this.query("#simpleListBoxJobs")[0];
            if (this._listJob) {
                this._listJob.loadData(jobs);
                this._listJobs = jobs;
            }
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
            var username = $('#user_name').val();
            var userpass = $('#user_password').val();
            var index = -1;
            var job;
            
            if (this._listJob) {
                index = this._listJob.selectedIndex;
                if (index > -1) job = this._listJobs[index].jobname;
            }

            if (index == -1) {
                alert('Please Select a Job Function')
            }
            else {
                if (this.Acl.securityCheck(username, userpass, true)) {

                    // alert('Clock In...' + username);
                    var clockstamp = new ViviPOS.ClockStampModel();
                    // clockstamp.saveStamp({username: username, clockin: true, clockout: false});
                    clockstamp.saveStamp('clockin', username, job);
                    this.listSummary();
                    this._lastUser = username;
                    // this.log(this.dump(clockstamp.find('all', {order: "created DESC"})));
                } else {
                    alert('Please Check Username and Password...');
                }
            }
        },

        clockBreak: function () {
            var username = $('#user_name').val();
            var userpass = $('#user_password').val();
            if (this.Acl.securityCheck(username, userpass, true)) {

                // alert('Clock Out...' + username);
                var clockstamp = new ViviPOS.ClockStampModel();
                // clockstamp.saveStamp({username: username, clockout: true, clockin:false});
                clockstamp.saveStamp('clockbreak', username);
                this.listSummary();
                // this.log(this.dump(clockstamp.find('all', {order: "created DESC"})));
            } else {
                alert('Please Check Username and Password...');
            }
        },

        clockOut: function () {
            var username = $('#user_name').val();
            var userpass = $('#user_password').val();
            if (this.Acl.securityCheck(username, userpass, true)) {
                
                // alert('Clock Out...' + username);
                var clockstamp = new ViviPOS.ClockStampModel();
                // clockstamp.saveStamp({username: username, clockout: true, clockin:false});
                clockstamp.saveStamp('clockout', username);
                this.listSummary();
                // this.log(this.dump(clockstamp.find('all', {order: "created DESC"})));
            } else {
                alert('Please Check Username and Password...');
            }
        },

        clearSummary: function () {
            var listObj = this.getListObj();
            if (listObj) listObj.resetData();
            this._listDatas = null;
        },
        
        listSummary: function () {
            var listObj = this.getListObj();
            var username = $('#user_name').val();
            var clockstamp = new ViviPOS.ClockStampModel();
            var today = new Date();
            var stamps = clockstamp.find('all', {
                conditions: "username='" + username + "' AND clockin_date='" + today.toString("yyyy-MM-dd") + "'",
                order: "created"
            });
            var oldDatas = this._listDatas;
            this._listDatas = stamps;
            
            if (stamps) {
                stamps.forEach(function(o){
                    o.clockin_time = o.clockin_time ? o.clockin_time.substring(11, 19) : '--:--:--';
                    o.clockout_time = o.clockout_time ? o.clockout_time.substring(11, 19) : '--:--:--';
                });
                if (oldDatas) {
                    var lastIndex = oldDatas.length - 1;
                    listObj.updateItemAt(lastIndex, stamps[lastIndex] );
                    if (stamps.length > oldDatas.length) {
                        listObj.insertItemAt(lastIndex + 1, stamps[lastIndex + 1] );
                    }
                }
                else {
                    listObj.loadData(stamps);
                }

                listObj.selectedIndex = stamps.length - 1;
                listObj.ensureIndexIsVisible(listObj.selectedIndex);
            } else {
                listObj.resetData();
            }
        },

        cancel: function () {
                window.close();
        },
    });

})();

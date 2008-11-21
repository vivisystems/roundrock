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
        
        view: function () {
            var username = $('#user_name').val();
            var userpass = $('#user_password').val();
            
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

        setUser: function () {
            var user = this.Acl.getUserPrincipal();
            var self = this;

            if (user) {
                $('#user_name').val(user.username);
                $('#sign_status').val(user.username + ' sign-on');
                $('.userbtn').each(function(){
                    if (this.id == 'user_' + user.username) {
                        this.checked = true;
                    }
                });
            } else {
                $('#sign_status').val('sign-off');
            }
        },
        
        setJobList: function (jobs) {
            if (this._listJob == null) this._listJob = this.query("#simpleListBoxJobs")[0];
            if (this._listJob) {
                this._listJob.loadData(jobs);
                this._listJobs = jobs;
            }
        },

        cancel: function () {
                window.close();
        },

        setUsername: function (username) {
            //alert('User: ' + username);
            $('#user_name').val(username);

            if ((this._lastUser == username) || GeckoJS.Configure.read('vivipos.fec.settings.PublicAttendance')) {
                this.listSummary();
            }
            else {
                this.clearSummary();
            }
        }
    });

})();

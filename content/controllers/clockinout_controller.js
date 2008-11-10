(function(){


    /**
     * Class ViviPOS.ClockInOutController
     */
    GeckoJS.Controller.extend( {
        name: 'ClockInOut',
        _listObj: null,
        _listDatas: null,

        getListObj: function() {
            if(this._listObj == null) this._listObj = this.query("#simpleListBoxSummary")[0];
            return this._listObj;
        },
        
        clockIn: function () {
            var username = $('#user_name').val();
            var userpass = $('#user_password').val();
            if (this.Acl.securityCheck(username, userpass, true)) {
                
                // alert('Clock In...' + username);
                var clockstamp = new ViviPOS.ClockStampModel();
                // clockstamp.saveStamp({username: username, clockin: true, clockout: false});
                clockstamp.saveStamp('clockin', username);
                this.listSummary();
                // this.log(this.dump(clockstamp.find('all', {order: "created DESC"})));
            } else {
                alert('Please Check Username and Password...');
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

        listSummary: function (jobs) {
            var self= this;
            var listObj = this.getListObj();
            var username = $('#user_name').val();
            var clockstamp = new ViviPOS.ClockStampModel();
            var today = new Date();
            var stamps = clockstamp.find('all', {
                conditions: "username='" + username + "' AND clockin_date='" + today.toString("yyyy-MM-dd") + "'",
                order: "created"
            });
            this._listDatas = stamps;
            if (stamps) {
                stamps.forEach(function(o){
                    o.clockin_time = o.clockin_time ? o.clockin_time.substring(11, 18) : '--:--:--';
                    o.clockout_time = o.clockout_time ? o.clockout_time.substring(11, 18) : '--:--:--';
                    // self.log('clockin_time:' + o.clockin_time);
                    // self.log('stamps this:' + self.dump(o));
                });
                // this.log('stamps:' + this.dump(stamps));
                listObj.loadData(stamps);

                this._listObj.selectedIndex = 0;
                this._listObj.ensureIndexIsVisible(0);
            } else {
                this._listObj.resetData();
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

        cancel: function () {
                window.close();
        },

        setUsername: function (username) {
            // alert('UserName: ' + GeckoJS.BaseObject.dump(this.data));
            // alert('User: ' + username);
            $('#user_name').val(username);
            this.listSummary();
        }
    });

})();

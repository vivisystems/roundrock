(function(){


    /**
     * Class ViviPOS.ChangeUserController
     */

    var __controller__ = {
        name: 'ChangeUser',
        users: null,
        userpanel: null,

        loadUsers: function () {

            var allowQuickLogin = GeckoJS.Configure.read('vivipos.fec.settings.login.allowquicklogin');

            // turn quicklogin indicator on/off
            var quickLogin = document.getElementById('quickLogin');
            if (quickLogin) quickLogin.setAttribute('disabled', !allowQuickLogin);

            var userModel = new UserModel();
            var users = userModel.find('all', {
                order: 'username'
            });

            if (parseInt(userModel.lastError) != 0) {
                this._dbError(userModel.lastError, userModel.lastErrorString,
                             _('An error was encountered while retrieving employee records (error code %S).', [userModel.lastError]));
            }

            for (var i = 0; i < users.length; i++) {
                if (users[i].displayname == null || users[i].displayname.length == 0) {
                    users[i].displayname = users[i].username;
                }
            };
            
            var userpanel = document.getElementById('userscrollablepanel');
            if (userpanel) {
                userpanel.datasource = users;
            }
            this.users = users;
            this.userpanel = userpanel;

            this.validateForm();
        },

        checkUser: function () {

            var username;
            var userpass = $('#user_password').val() || '';
            var allowQuickLogin = GeckoJS.Configure.read('vivipos.fec.settings.login.allowquicklogin');

            userpass = userpass.replace(/^\s*/, '').replace(/\s*$/, '');
            if (userpass.length == 0) return;

            $('#user_password').val('');

            if (this.userpanel && this.users) {

                var index = this.userpanel.selectedIndex;
                if (index > -1 && index < this.users.length) {
                    username = this.users[index].username;
                }

                // case 1 - username is null and allowQuickLogin
                // case 2 - username is null and not allowQuickLogin
                // case 3 - username is not null
                if (username == null) {
                    if (allowQuickLogin) {
                        if (!this.Acl.securityCheckByPassword(userpass, false)) {
                            // @todo OSD
                            NotifyUtils.error(_('Authentication failed! Please make sure the password is correct.'));
                        }
                    }
                    else {
                        // @todo OSD
                        // we shouldn't be here if validateForm works correctly, but will display warning just in case
                        NotifyUtils.error(_('Authentication failed! Please select a user'));
                    }
                }
                else {
                    if (!this.Acl.securityCheck(username, userpass)) {
                        // @todo OSD
                        NotifyUtils.error(_('Authentication failed! Please make sure the password is correct.'));
                    }
                }

                if (this.Acl.getUserPrincipal()) {
                    opener.$do('setClerk', null, 'Main');
                    window.close();
                }
            }
        },

        validateForm: function () {
            var password = $('#user_password').val().replace(/^\s*/, '').replace(/\s*$/, '');
            var allowQuickLogin = GeckoJS.Configure.read('vivipos.fec.settings.login.allowquicklogin');
            var index = this.userpanel.selectedIndex;

            if (allowQuickLogin) {
                document.getElementById('signinBtn').setAttribute('disabled', password.length == 0);
            }
            else {
                document.getElementById('signinBtn').setAttribute('disabled', password.length == 0 || index == null || index == -1);
            }
        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('WARN', 'Database error: ' + errstr + ' [' +  errno + ']');
            GREUtils.Dialog.alert(window,
                                  _('Data Operation Error'),
                                  errmsg + '\n' + _('Please restart the terminal, and if the problem persists, contact technical support immediately.'));
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();

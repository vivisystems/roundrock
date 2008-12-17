(function(){


    /**
     * Class ViviPOS.ChangeUserController
     */
    //GeckoJS.define('ViviPOS.ChangeUserController');

    GeckoJS.Controller.extend( {
        name: 'ChangeUser',
        users: null,
        userpanel: null,

        loadUsers: function () {

            var allowQuickLogin = GeckoJS.Configure.read('vivipos.fec.settings.login.allowquicklogin');
            
            var userModel = new UserModel();
            var users = userModel.find('all', {
                order: 'username'
            });

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

            document.getElementById('quicklogin').setAttribute('selected', allowQuickLogin ? true : false);
        },

        checkUser: function () {

            var username;
            var userpass = $('#user_password').val() || '';
            var allowQuickLogin = GeckoJS.Configure.read('vivipos.fec.settings.login.allowquicklogin');

            userpass = userpass.replace(/^\s*/, '').replace(/\s*$/, '');
            if (userpass.length == 0) return;
            
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
                            OsdUtils.error(_('Authentication failed!\nPlease make sure the password is correct.'));
                        }
                    }
                    else {
                        // @todo OSD
                        // we shouldn't be here if validateForm works correctly, but will display warning just in case
                        OsdUtils.error(_('Authentication failed!\nPlease select a user'));
                    }
                }
                else {
                    if (!this.Acl.securityCheck(username, userpass)) {
                        // @todo OSD
                        OsdUtils.error(_('Authentication failed!\nPlease make sure username and password are correct.'));
                    }
                }
                if (this.Acl.getUserPrincipal()) {
                    opener.$do('setClerk', null, 'Main');
                    window.close();
                }
                else {
                    $('#user_password').val('');
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
        }

    });

})();

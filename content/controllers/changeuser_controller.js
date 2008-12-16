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
                if (username == null && allowQuickLogin) {
                    var userModel = new UserModel();
                    var users = userModel.findByIndex('all', {
                        index: 'password',
                        value: userpass
                    });

                    if (users && users.length > 0) username = users[0].username;
                }
                
                if (this.Acl.securityCheck(username, userpass)) {
                    opener.$do('setClerk', null, 'Main');
                    window.close();
                } else {
                    $('#user_password').val('');
                    if (username == null && allowQuickLogin) {
                        // @todo OSD.text to be replaced with OSD.warn
                        OsdUtils.text('<span color="red" font_desc="Times 20">'
                                      +_('Authentication failed!\nPlease make sure that the password is correct.'
                                      +'</span>'), 100, -200);
                    }
                    else {
                        // @todo OSD.text to be replaced with OSD.warn
                        OsdUtils.text('<span color="red" font_desc="Times 20">'
                                      +_('Authentication failed!\nPlease make sure username and password are correct.'
                                      +'</span>'), 100, -200);
                    }
                }
            }
        },

    });

})();

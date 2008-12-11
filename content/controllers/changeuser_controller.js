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

        checkUser: function () {
            
            var username;
            var userpass = $('#user_password').val();

            if (this.userpanel && this.users) {
                var index = this.userpanel.selectedIndex;
                if (index > -1 && index < this.users.length) {
                    username = this.users[index].username;
                }
            }
            if (this.Acl.securityCheck(username, userpass)) {
                opener.$do('setClerk', null, 'Main');
                window.close();
            } else {
                $('#user_password').val('');
                alert('Please Check User <' + username + '> and Password...');
            }
        },

    });

})();

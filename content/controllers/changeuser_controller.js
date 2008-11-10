(function(){


    /**
     * Class ViviPOS.ChangeUserController
     */
    //GeckoJS.define('ViviPOS.ChangeUserController');

    GeckoJS.Controller.extend( {
        name: 'ChangeUser',

        checkUser: function () {
            var username = $('#user_name').val();
            var userpass = $('#user_password').val();

            if (this.Acl.securityCheck(username, userpass)) {
                $do('checkClerk', null, 'Main');
                window.close();
            } else {
                alert('Please Check Username and Password...');
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

        signOff: function () {
            if (GREUtils.Dialog.confirm(null, "confirm sign-off", "Are you sure to sign off?") == false) {
                    return;
            }
            this.Acl.invalidate();
            this.setUser();
        // window.close();
        },

        cancel: function () {
            var user = this.Acl.getUserPrincipal();
            var self = this;

            if (user) {
                window.close();
            }
        },

        setUsername: function (username) {
            $('#user_name').val(username);
        }
    });

})();

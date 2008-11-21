(function(){
    GeckoJS.include('chrome://viviecr/content/models/user.js');

    // include controllers  and register itself
    GeckoJS.include('chrome://viviecr/content/controllers/changeuser_controller.js');

    /**
     * Controller Startup
     */
    function startup() {
        
        var users;

        function getUsers() {
            var datas;
            var userModel = new ViviPOS.UserModel();
            users = userModel.find('all', {
                order: "no"
            });
            for(var k in users) {
                datas = users[k];
            }
            createUsersBtn();

        }

        function createUsersBtn() {
            var userspad = document.getElementById("userspad");
            var datas;

            for(var k in users) {
                datas = users[k];
                if ( k < 3)
                    var button = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:button");
                else
                    var button = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:vivibutton");
                button.setAttribute('oncommand', "$do('setUsername', '" + datas['username'] + "', 'ChangeUser')");
                button.setAttribute('label', datas['username']);
                button.setAttribute("image", "chrome://viviecr/content/skin/images/operator.png");
                button.setAttribute('class', "userbtn");
                button.setAttribute('type', "radio");
                button.setAttribute('group', "operator");
                button.setAttribute('id', "user_" + datas['username']);
                userspad.appendChild(button);
            }
        }

        getUsers();
        $do('setUser', null, 'ChangeUser');
        
        $('#clearBtn')[0].addEventListener('command', clearUserPass, false);
        $('#user_password').focus();
    };

    /**
     * Clear User Password box
     */
    function clearUserPass() {

        $('#user_password').val('');

    }
    
    

    window.addEventListener('load', startup, false);


})();



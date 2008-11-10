(function(){
    GeckoJS.include('chrome://viviecr/content/models/user.js');
    GeckoJS.include('chrome://viviecr/content/models/clockstamp.js');

    // include controllers  and register itself
    GeckoJS.include('chrome://viviecr/content/controllers/clockinout_controller.js');

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
                var button = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:button");
                button.setAttribute('oncommand', "$do('setUsername', '" + datas['username'] + "', 'ClockInOut')");
                button.setAttribute('label', datas['username']);
                button.setAttribute("image", "chrome://viviecr/content/skin/images/operator.png");
                button.setAttribute('class', "userbtn");
                button.setAttribute('type', "radio");
                button.setAttribute('group', "operator");
                // button.setAttribute('username', datas['username']);
                button.setAttribute('id', "user_" + datas['username']);
                userspad.appendChild(button);
            }
        }

        getUsers();
        $do('setUser', null, 'ClockInOut');
        $do('listSummary', null , 'ClockInOut');

        $('#clearBtn')[0].addEventListener('command', clearUserPass, false);
        $('#user_password').focus();

        clocktick();
    };

    /**
     * Clear User Password box
     */
    function clearUserPass() {

        $('#user_password').val('');

    }

    function clocktick(){
        var clock_time = new Date();
        var clock_hours = clock_time.getHours();
        var clock_minutes = clock_time.getMinutes();
        var clock_seconds = clock_time.getSeconds();
        /*
        var clock_suffix = "AM";
        if (clock_hours > 11){
            clock_suffix = "PM";
            clock_hours = clock_hours - 12;
        }
        */
        if (clock_hours == 0){
            clock_hours = 12;
        }
        if (clock_hours < 10){
            clock_hours = "0" + clock_hours;
        }
        if (clock_minutes < 10){
            clock_minutes = "0" + clock_minutes;
        }
        if (clock_seconds < 10){
            clock_seconds = "0" + clock_seconds;
        }
        // $('#clock_now').val(clock_hours + ":" + clock_minutes + ":" + clock_seconds + " " + clock_suffix);
        $('#clock_now').val(clock_hours + ":" + clock_minutes + ":" + clock_seconds);
        window.setTimeout(clocktick, 1000, 0, 0);
    }

    window.addEventListener('load', startup, false);

})();




(function(){
    GeckoJS.include('chrome://viviecr/content/models/user.js');
    GeckoJS.include('chrome://viviecr/content/models/clockstamp.js');
    GeckoJS.include('chrome://viviecr/content/models/job.js');

    // include controllers  and register itself
    GeckoJS.include('chrome://viviecr/content/controllers/clockinout_controller.js');

    /**
     * Controller Startup
     */
    function startup() {
        
        var users;
        var jobs;

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

        function getJobs() {
            var jobModel = new JobModel();

            jobs = jobModel.find('all', {
                order: "no"
            });

            jobs.sort(function(a, b) {
                if (a.jobname < b.jobname) return -1;
                else if (a.jobname > b.jobname) return 1;
                else return 0;
            });
        }

        getUsers();
        getJobs();
        $do('setJobList', jobs, 'ClockInOut');
        
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




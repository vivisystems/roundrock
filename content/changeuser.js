(function(){
    GeckoJS.include('chrome://viviecr/content/models/user.js');

    // include controllers  and register itself
    GeckoJS.include('chrome://viviecr/content/controllers/changeuser_controller.js');

    /**
     * Controller Startup
     */
    function startup() {
        
        $do('loadUsers', null, 'ChangeUser');
        
        $('#clearBtn')[0].addEventListener('command', clearUserPass, false);
        $('#delBtn')[0].addEventListener('command', delUserPass, false);
        $('#user_password').focus();
    };

    /**
     * Clear User Password box
     */
    function clearUserPass() {
        $('#user_password').val('');

    }
    
    /**
     * Delete one character from User Password
     */
    function delUserPass() {
        var pwd = $('#user_password').val();
        if (pwd && pwd.length > 0) pwd = pwd.substring(0, pwd.length - 1);
        $('#user_password').val(pwd);

    }
    

    window.addEventListener('load', startup, false);


})();



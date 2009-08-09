(function(){
    /**
     * Controller Startup
     */
    function startup() {
        
        $do('loadUsers', null, 'ChangeUser');
        
        $('#clearBtn')[0].addEventListener('command', clearTextBox, false);
        $('#user_password').focus();

    };

    function clearTextBox() {

        var focused = document.commandDispatcher.focusedElement;
        focused.value = '';

    };
    
    window.addEventListener('load', startup, false);


})();



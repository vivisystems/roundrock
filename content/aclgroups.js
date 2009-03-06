(function(){
    
    /**
     * Controller Startup
     */
    function startup() {

        $do('createRoleList', null, 'AclGroups');
        $do('load', null, 'AclGroups');

    };

    window.addEventListener('load', startup, false);

})();



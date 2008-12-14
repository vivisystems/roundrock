(function(){
    GeckoJS.include('chrome://viviecr/content/controllers/aclgroups_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('createRoleList', null, 'AclGroups');
        $do('load', null, 'AclGroups');

    };

    window.addEventListener('load', startup, false);

})();



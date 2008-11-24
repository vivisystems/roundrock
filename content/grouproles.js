(function(){
    GeckoJS.include('chrome://viviecr/content/controllers/rolegroups_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('createRoleList', null, 'RoleGroups');
        $do('load', null, 'RoleGroups');

    };

    window.addEventListener('load', startup, false);

})();



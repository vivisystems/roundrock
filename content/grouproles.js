(function(){
    // GeckoJS.include('chrome://viviecr/content/models/user.js');

    // include controllers  and register itself

    // GeckoJS.include('chrome://viviecr/content/controllers/users_controller.js');
    GeckoJS.include('chrome://viviecr/content/controllers/rolegroups_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('createRoleList', null, 'RoleGroups');
        $("#simpleListBoxRoleGroups").bind('select', function(evt) {
            $do('select', evt, "RoleGroups");
        })
        $do('load', null, 'RoleGroups');
/*
        $("#simpleListBoxUser").bind('select', function(evt) {
            $do('select', evt, 'Users');
        });
        $do('load', null, 'Users');
*/

    /*
        $("#simpleListBoxUser").bind('select', function(evt) {
            $do('select', evt, 'Users');
        }).each(function() {
            GREUtils.log(GeckoJS.BaseObject.dump('simpleListBoxUser:' + this.selectedIndex));
            this.selectedIndex = -1;
            this.selectedIndex = 0;
        });
        $("#simpleListBoxRoleGroups").bind('select', function(evt) {
            $do('select', evt, "RoleGroups");
        }).each(function() {
            this.selectedIndex = 0;
            GeckoJS.BaseObject.dump('simpleListBoxRoleGroups:' + this.selectedIndex);
        });
    */
    };

    window.addEventListener('load', startup, false);

})();



(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/select_rolegroup_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', inputObj, 'SelectRolegroup');

        // used in select_rolegroup
        doSetOKCancel(
            function(){
                inputObj.rolegroup = document.getElementById('rolegroup').value;
                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return true;
            }
            );

    };

    window.addEventListener('load', startup, false);

})();



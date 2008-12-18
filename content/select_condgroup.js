(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/select_condgroup_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', inputObj.cond_group, 'SelectCondgroup');

        document.getElementById('cond_group').value = inputObj.cond_group;

        doSetOKCancel(
            function(){
                inputObj.cond_group = document.getElementById('cond_group').value;
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



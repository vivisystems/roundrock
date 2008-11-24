(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/select_condiment_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', inputObj.condgroup, 'SelectCondiment');

        // document.getElementById('condiments').value = inputObj.condiments;

        doSetOKCancel(
            function(){
                // inputObj.condiments = document.getElementById('condiments').value;
                inputObj.condiments = document.getElementById('condimentscrollablepanel').value;
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



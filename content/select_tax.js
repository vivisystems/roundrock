(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/select_tax_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', inputObj.rate, 'SelectTax');

        document.getElementById('rate').value = inputObj.rate;

        doSetOKCancel(
            function(){
                inputObj.rate = document.getElementById('rate').value;
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



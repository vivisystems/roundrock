(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    /**
     * Controller Startup
     */
    function startup() {

        document.getElementById('devicescrollablepanel').datasource = inputObj.devices;
        
        doSetOKCancel(
            function(){
                inputObj.device = document.getElementById('devicescrollablepanel').value;
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



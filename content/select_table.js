(function(){    

    // include controllers  and register itself

    /**
     * Controller Startup
     */
    function startup() {
        var inputObj = window.arguments[0];
        
        $do('load', null, 'SelectTable');


        doSetOKCancel(
            function(){
                // inputObj.index = document.getElementById('tableScrollablepanel').value;
                inputObj.ok = true;
                // delete window.viewHelper;

                return true;
            },
            function(){
                inputObj.ok = false;
                // delete window.viewHelper;
                return true;
            }
            );

    };

    window.addEventListener('load', startup, false);

})();

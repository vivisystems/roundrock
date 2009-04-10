var inputObj = window.arguments[0];
var titleObj = null;
var org_title = '';
var tableSettings = {};

(function(){    

    // include controllers  and register itself
    var selectFunc = null;


    /**
     * Controller Startup
     */
    function startup() {

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

(function(){
    // include controllers  and register itself
//    GeckoJS.include('chrome://viviecr/content/controllers/selectqueue_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        var args = window.args = window.arguments[0].wrappedJSObject;
        
        // alert('userParent: ' + window.opener.ViviPOS.MainController);
        // alert('Parent: ' + window.opener.screenwidth);
        $("#simpleListBoxQueue")[0].addEventListener('select', function(evt) {
            $do('select', evt, 'SelectQueue');
        }, false);

        doSetOKCancel(function(){
            $do('ok', args, 'SelectQueue');
            return true;
        });


        $do('load', null, 'SelectQueue');
        
    };

    window.addEventListener('load', startup, false);

})();



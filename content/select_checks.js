(function(){

    var inputObj = window.arguments[0];
    var tableOrderStatusStr = {0: '***', 1: _('Checksum Error'), 2: _('Lost Status')};

    /**
     * Controller Startup
     */
    function startup() {


        $do('initial', inputObj, 'SelectChecks');

        doSetOKCancel(
            function(){

                inputObj.ok = true;

                return true;
            },
            function(){
                inputObj.ok = false;
                inputObj.order_id = '';
                return true;
            }
            );

    }

    window.addEventListener('load', startup, false);

})();



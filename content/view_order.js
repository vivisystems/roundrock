(function(){

    var inputObj = window.arguments[0];

    /**
     * Controller Startup
     */
    function startup() {

        doSetOKCancel(
            function(){
                return true;
            },
            function(){
                return true;
            }
        );
        $do('load', inputObj, 'ViewOrder');
    };

    window.addEventListener('load', startup, false);

})();


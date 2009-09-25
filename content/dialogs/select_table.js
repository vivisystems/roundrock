(function(){

    /**
     * Controller Startup
     */
    function startup() {
        var inputObj = window.arguments[0];

        $do('load', inputObj, 'SelectTable');

    }

    window.addEventListener('load', startup, false);

})();

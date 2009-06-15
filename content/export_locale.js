(function(){

    /**
     * Controller Startup
     */
    function startup() {
        $do('load', window.arguments[0], 'ExportLocale');
    };

    window.addEventListener('load', startup, false);

})();



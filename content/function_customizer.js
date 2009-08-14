(function(){

    /**
     * Controller Startup
     */
    function ready() {


        $do('ready', window.arguments[0], 'FunctionCustomizer');

    };

    function startup() {

        centerWindowOnScreen();

        $do('load', window.arguments[0], 'FunctionCustomizer');

    };

    window.addEventListener('DOMContentLoaded', ready, false);
    window.addEventListener('load', startup, false);

})();



(function(){

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'Accounts');
        $do('load', null, 'AccountTopics');

    };

    window.addEventListener('load', startup, false);

})();



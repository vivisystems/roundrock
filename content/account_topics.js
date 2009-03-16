(function(){
    include('chrome://viviecr/content/models/account.js');
    include('chrome://viviecr/content/models/account_topic.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/controllers/account_topics_controller.js');
    include('chrome://viviecr/content/controllers/accounts_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'Accounts');
        $do('load', null, 'AccountTopics');

    };

    window.addEventListener('load', startup, false);

})();



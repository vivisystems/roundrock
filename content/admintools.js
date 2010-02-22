(function(){

    /**
     * Controller Startup
     */
    function startup() {
        alert('load');
        $do('load', null, 'AdminTools');

    };

    window.addEventListener('load', startup, false);

})();



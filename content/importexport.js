(function(){

    /**
     * Controller Startup
     */
    function startup() {

        // set progressmeter mode to determined
        var progress = document.getElementById('progress');
        progress.mode = 'determined';
        progress.value = 0;

        $do('load', null, 'ImportExport');

    };

    window.addEventListener('load', startup, false);

})();



(function(){

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'Localization');

        doSetOKCancel(
            function(){
                var data = {cancel: false};
                $do('exitCheck', data, 'Localization');

                return !data.cancel;
            },
            function(){
                return true;
            }
        );

    };

    window.addEventListener('load', startup, false);

})();



(function(){

    /**
     * Controller Startup
     */
    function startup() {

        $do('initial', false, 'Devices');
        $do('load', null, 'Devices');

        doSetOKCancel(
            function(){
                var data = {cancel: false};
                $do('save', data, 'Devices');
                return !data.cancel;
            },
            function(){
                return true;
            }
        );
    };
    
    window.addEventListener('load', startup, false);

})();

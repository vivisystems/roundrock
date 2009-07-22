(function(){
    
    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'Jobs');

        doSetOKCancel(
            function(){
                var data = {close: true};
                $do('confirmExit', data, 'Jobs');
                return data.close;
            },

            function(){
                var data = {close: true};
                $do('confirmExit', data, 'Jobs');
                return data.close;
            }
        );
    };

    window.addEventListener('load', startup, false);

})();



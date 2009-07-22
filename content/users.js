(function(){

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'Users');

        doSetOKCancel(
            function(){
                var data = {close: true};
                $do('confirmExit', data, 'Users');
                return data.close;
            },

            function(){
                var data = {close: true};
                $do('confirmExit', data, 'Users');
                return data.close;
            }
        );

    };

    window.addEventListener('load', startup, false);

})();



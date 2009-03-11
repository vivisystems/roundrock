(function(){

    /**
     * Controller Startup
     */
    function startup() {
 
        $do('initial', false, 'RemoteControl');

        doSetOKCancel(
            function(){
                var result = {data: false};
                $do('save', result, 'RemoteControl');
                return result.data;
            },

            function(){
                return true;
            }
            );
    };
    

    window.addEventListener('load', startup, false);

})();

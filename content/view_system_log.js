(function(){

    var inputObj = null;
    try{
        inputObj = window.arguments[0];
    }catch(e) {
    }
    

    /**
     * Controller Startup
     */
    function startup() {

        doSetOKCancel(
            function(){
                return true;
            },
            function(){
                return true;
            }
        );


        $do('load', inputObj, 'ViewSystemLog');
    };

    window.addEventListener('load', startup, false);

})();


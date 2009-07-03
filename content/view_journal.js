(function(){

    var inputObj = window.arguments[0];

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
        $do('load', inputObj, 'ViewJournal');
    };

    window.addEventListener('load', startup, false);

})();


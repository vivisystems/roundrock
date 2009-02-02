(function(){
    var title = window.arguments[0];
    var details = window.arguments[1];
    
    /**
     * Controller Startup
     */
    function startup() {

        document.getElementById('title').setAttribute("label", title);
        
        if (details != null) {
            details = GeckoJS.Array.objectExtract(details, '{s}');
            var payments = document.getElementById('paymentscrollablepanel');
            payments.datasource = details;
        }
    };

    window.addEventListener('load', startup, false);

})();

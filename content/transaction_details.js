(function(){
    
    /**
     * Controller Startup
     */
    function startup() {

        document.getElementById('title').setAttribute("label", title);
        
        if (details != null) {
            details = GeckoJS.Array.objectExtract(details, '{s}');
            var txns = document.getElementById('txnscrollablepanel');
            txns.datasource = details;
        }
    };

    window.addEventListener('load', startup, false);

})();

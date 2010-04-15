(function(){
    var data = window.arguments[0];
    
    /**
     * Controller Startup
     */
    function startup() {
    	if (data && data.message) {
            document.getElementById('dialog-title').setAttribute('value', data.message);
            if (data.date != null) {
                document.getElementById('dialog-footnote').setAttribute('value', data.date);
            }
            else {
                document.getElementById('dialog-footnote').hidden = true;
            }
    	}
    }
    
    window.addEventListener('load', startup, false);

})();

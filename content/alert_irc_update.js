(function(){
    var inputData = window.arguments[0];
    
    /**
     * Controller Startup
     */
    function startup() {

    	switch(inputData.type) {
    		default:
    		case 'progress':
    			return showProgressBox(inputData);
    			break;
    			
    		case 'info':
    			return showInfoBox(inputData);
    			break;
    	}
    	
    }
    
    function showProgressBox(data) {
    	
    	document.getElementById('progressBox').setAttribute('hidden', false);
    	document.getElementById('infoBox').setAttribute('hidden', true);
    	
    	if (data.caption) {
    		document.getElementById('progress-caption').setAttribute('value', data.caption);
    	}
    	
    }

    
    function showInfoBox(data) {

    	document.getElementById('progressBox').setAttribute('hidden', true);
    	document.getElementById('infoBox').setAttribute('hidden', false);

    	if (data.caption) {
    		document.getElementById('info-caption').setAttribute('value', data.caption);
    	}
    	
    	if (data.packages) {
    		
    		var packagesDesc = "";
    		
    		data.packages.forEach( function(pack) {
    			let activation = (new Date(pack.activation * 1000)).toLocaleDateString();
    			let desc = pack.description;
    			
    			packagesDesc += activation + "\n";
    			packagesDesc += desc + "\n\n";
    			
    		});
    		
    		document.getElementById('info-packages').setAttribute('value', packagesDesc);
    		
    	}
    	

    }
    
    window.addEventListener('load', startup, false);

})();

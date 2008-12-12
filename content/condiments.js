(function(){

GeckoJS.include('chrome://viviecr/content/models/condiment_group.js');
GeckoJS.include('chrome://viviecr/content/models/condiment.js');
    
/**
 * Controller Startup
 */
function startup() {
    
	$do('createCondimentPanel', null, "Condiments");

};

window.addEventListener('load', startup, false);


})();



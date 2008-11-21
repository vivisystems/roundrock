(function(){
//GeckoJS.include('chrome://viviecr/content/models/user.js');
//GeckoJS.include('chrome://viviecr/content/models/category.js');
//GeckoJS.include('chrome://viviecr/content/models/product.js');
// GeckoJS.include('chrome://viviecr/content/models/tax.js');

// include controllers  and register itself

//GeckoJS.include('chrome://viviecr/content/controllers/categories_controller.js');
//GeckoJS.include('chrome://viviecr/content/controllers/products_controller.js');
//GeckoJS.include('chrome://viviecr/content/controllers/taxes_controller.js');

// 
// GeckoJS.include('chrome://viviecr/content/fecposutils.js');

/**
 * Controller Startup
 */
function startup() {
	$("#simpleListBoxTax")[0].addEventListener('select', function(evt) {
		$do('select', evt, 'Taxes');
	}, false);
	$do('load', null, 'Taxes');
	$("#simpleListBoxTax")[0].selectedIndex = 0;

};


window.addEventListener('load', startup, false);


})();



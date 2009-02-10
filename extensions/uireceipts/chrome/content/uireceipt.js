(function(){

// include extension locale properties
GeckoJS.StringBundle.createBundle("chrome://uireceipts/locale/messages.properties");

// include extension models

GeckoJS.include('chrome://uireceipts/content/models/uniform_invoice.js');
GeckoJS.include('chrome://uireceipts/content/models/uniform_invoice_marker.js');

// include extension controller
GeckoJS.include('chrome://uireceipts/content/uireceipt_controller.js');

/**
 * Controller Startup
 */
function startup() {
    $do('initial', null, 'UIReceipts');
};

window.addEventListener('load', startup, false);


})();



(function(){

// include extension locale properties
GeckoJS.StringBundle.createBundle("chrome://uireceipts/locale/messages.properties");

// include extension models

GeckoJS.include('chrome://uireceipts/content/models/unified_invoice.js');
GeckoJS.include('chrome://uireceipts/content/models/unified_invoice_marker.js');

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



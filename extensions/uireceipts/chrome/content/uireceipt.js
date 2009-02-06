(function(){

// include project locale properties
GeckoJS.StringBundle.createBundle("chrome://uireceipts/locale/messages.properties");

// include project controller
GeckoJS.include('chrome://uireceipts/content/uireceipt_controller.js');

/**
 * Controller Startup
 */
function startup() {
    $do('initial', null, 'UIReceipts');
};

window.addEventListener('load', startup, false);


})();



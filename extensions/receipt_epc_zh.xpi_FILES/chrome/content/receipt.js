(function(){

// include project controllers
GeckoJS.include('chrome://receipt_epc_zh/content/receipt_controller.js');
/**
 * Controller Startup
 */
function startup() {

    var statusbar = document.getElementById('statusbar-display');
    if (statusbar) {
        // main window
        $do('load', true, "Receipt_EPC_ZH");
    }
    else {
        // control panel
        $do('load', false, "Receipt_EPC_ZH");
    }

};

window.addEventListener('load', startup, false);


})();



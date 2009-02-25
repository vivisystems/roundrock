(function(){

    // include controller

    GeckoJS.include('chrome://viviecr/content/controllers/components/tax.js');
    GeckoJS.include('chrome://viviecr/content/helpers/nsi_taxes_view.js');
    GeckoJS.include('chrome://viviecr/content/controllers/taxes_controller.js');

/**
 * Controller Startup
 */
    function startup() {
        $do('createAddonTaxList', null, 'Taxes');

        $do('load', null, 'Taxes');

    };

    window.addEventListener('load', startup, false);


})();



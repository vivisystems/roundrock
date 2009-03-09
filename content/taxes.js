(function(){

    // include controller


/**
 * Controller Startup
 */
    function startup() {
        $do('createAddonTaxList', null, 'Taxes');

        $do('load', null, 'Taxes');

    };

    window.addEventListener('load', startup, false);


})();



(function(){

    // include controller


/**
 * Controller Startup
 */
    function startup() {
        
        $do('createSingleTaxList', null, 'Taxes');
        $do('load', null, 'Taxes');

    };

    window.addEventListener('load', startup, false);


})();



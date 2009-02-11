(function(){
    include('chrome://viviecr/content/models/category.js');
    include('chrome://viviecr/content/models/product.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/reports/controllers/inventories_controller.js');
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/controllers/components/browser_print.js');
    include('chrome://viviecr/content/reports/controllers/components/csv_export.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'Inventories');

    };

    window.addEventListener('load', startup, false);

})();



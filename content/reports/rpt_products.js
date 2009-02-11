(function(){
    include('chrome://viviecr/content/models/category.js');
    include('chrome://viviecr/content/models/product.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/reports/controllers/rpt_products_controller.js');
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/controllers/components/browser_print.js');
    include('chrome://viviecr/content/reports/controllers/components/csv_export.js');

    // include('chrome://viviecr/content/seethrough_js/seethrough.js');

    /**
     * Controller Startup
     */
    function startup() {

        $('#togglesize')[0].addEventListener('command', toggleSize, false);
        $do('load', null, 'RptProducts');

    };

    function toggleSize() {
        var splitter = document.getElementById('splitter_zoom');
        if (splitter.getAttribute("state") == "collapsed") {
            splitter.setAttribute("state", "open");
        } else {
            splitter.setAttribute("state", "collapsed");
        }
    }

    window.addEventListener('load', startup, false);

})();



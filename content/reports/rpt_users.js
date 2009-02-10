(function(){
    // include('chrome://viviecr/content/models/category.js');
    // include('chrome://viviecr/content/models/product.js');
    include('chrome://viviecr/content/models/user.js');

    // include controllers  and register itself

    include('chrome://viviecr/content/reports/controllers/rpt_users_controller.js');
    include('chrome://viviecr/content/reports/template.js');

    /**
     * Controller Startup
     */
    function startup() {

        $('#togglesize')[0].addEventListener('command', toggleSize, false);
        $do('load', null, 'RptUsers');

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



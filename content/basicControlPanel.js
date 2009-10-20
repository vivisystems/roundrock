(function(){

    var isShowing = false;

    /**
     * Window Startup
     */
    function startup() {
        centerWindowOnScreen();
        var departmentsButton = document.getElementById('departmentsButton');
        var plusButton        = document.getElementById('plusButton');
        var condimentsButton  = document.getElementById('condimentsButton');
        var stockButton       = document.getElementById('stockButton');
        var reportsButton     = document.getElementById('reportsButton');
        var plugroupsButton   = document.getElementById('plugroupsButton');
        var customersButton   = document.getElementById('customersButton');

        departmentsButton.label = GeckoJS.StringBundle.getPrefLocalizedString('vivipos.fec.settings.controlpanels.product.departments.label');
        plusButton.label        = GeckoJS.StringBundle.getPrefLocalizedString('vivipos.fec.settings.controlpanels.product.plus.label');
        condimentsButton.label  = GeckoJS.StringBundle.getPrefLocalizedString('vivipos.fec.settings.controlpanels.product.condiments.label');
        stockButton.label       = GeckoJS.StringBundle.getPrefLocalizedString('vivipos.fec.settings.controlpanels.product.stocks.label');
        reportsButton.label     = GeckoJS.StringBundle.getPrefLocalizedString('vivipos.fec.settings.controlpanels.product.reports.label');
        plugroupsButton.label   = GeckoJS.StringBundle.getPrefLocalizedString('vivipos.fec.settings.controlpanels.product.plugroups.label');
        customersButton.label   = GeckoJS.StringBundle.getPrefLocalizedString('vivipos.fec.settings.controlpanels.activity.customers.label');
    };

    window.loadDepartment = function loadDepartment() {
        var aURL = 'chrome://viviecr/content/departments.xul';
        var aName = _('Departments');
        var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=800,height=600';
        GREUtils.Dialog.openWindow(window, aURL, aName, aFeatures);
    };

    window.loadPlus = function loadPlus() {
        var aURL = 'chrome://viviecr/content/plus.xul';
        var aName = _('Products');
        var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=800,height=600';
        GREUtils.Dialog.openWindow(window, aURL, aName, aFeatures);
    };

    window.loadPlugroups = function loadPlugroups() {
        var aURL = 'chrome://viviecr/content/plugroups.xul';
        var aName = _('Product Groups');
        var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=800,height=600';
        GREUtils.Dialog.openWindow(window, aURL, aName, aFeatures);
    };

    window.loadCondiments = function loadCondiments() {
        var aURL = 'chrome://viviecr/content/condiments.xul';
        var aName = _('Condiments');
        var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=800,height=600';
        GREUtils.Dialog.openWindow(window, aURL, aName, aFeatures);
    };

    window.loadReports = function loadReports() {
        var aURL = 'chrome://viviecr/content/reportPanel.xul';
        var aName = _('Reports');
        var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=800,height=600';
        GREUtils.Dialog.openWindow(window, aURL, aName, aFeatures);
    };

    window.loadCustomers = function loadCustomers() {
        var aURL = 'chrome://customers/content/customers.xul';
        var aName = _('Customers');
        var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=800,height=600';
        GREUtils.Dialog.openWindow(window, aURL, aName, aFeatures);
    };

    window.loadStockcontrol = function loadStockcontrol() {
        var aURL = 'chrome://viviecr/content/stock_records.xul';
        var aName = _('');
        var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=800,height=600';
        GREUtils.Dialog.openWindow(window, aURL, aName, aFeatures);
    };

    window.savePreferences = function savePreferences() {
        window.close();
    };

    window.advancedControlPanel = function advancedControlPanel() {
        if (GeckoJS.Session.get( "isTraining" )) {
            GREUtils.Dialog.alert(window, _('Training Mode'), _('Control Panel is disabled during training.'));
            return;
        }
        var aURL = 'chrome://viviecr/content/controlPanel.xul';
        var aName = _('Control Panel');
        var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=800,height=600';
        GREUtils.Dialog.openWindow(window, aURL, aName, aFeatures);
    };


    window.addEventListener('load', startup, true);



})();

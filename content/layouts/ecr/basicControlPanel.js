(function(){

    var isShowing = false;

    /**
     * Window Startup
     */
    function startup() {
        centerWindowOnScreen();

        var plusButton        = document.getElementById('plusButton');
        var reportsButton     = document.getElementById('reportsButton');

        var plusControlPanel = GeckoJS.Configure.read('vivipos.fec.settings.controlpanels.product.plus');
        var reportsControlPanel = GeckoJS.Configure.read('vivipos.fec.settings.controlpanels.product.reports');

        if (plusControlPanel) {
            if (plusControlPanel.roles == '' || GeckoJS.AclComponent.isUserInRole(plusControlPanel.roles)) {
                var plusLabel = plusControlPanel.label;
                if (plusLabel.indexOf('chrome://') == 0) {
                    var keystr = 'vivipos.fec.settings.controlpanels.product.plus.label';
                    plusLabel = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
                }
                plusButton.label = plusLabel;
            }
            else {
                plusButton.hidden = true;
            }
        }

        if (reportsControlPanel) {
            if (reportsControlPanel.roles == '' || GeckoJS.AclComponent.isUserInRole(reportsControlPanel.roles)) {
                var reportsLabel = reportsControlPanel.label;
                if (reportsLabel.indexOf('chrome://') == 0) {
                    var keystr = 'vivipos.fec.settings.controlpanels.product.reports.label';
                    reportsLabel = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
                }
                reportsButton.label = reportsLabel;
            }
            else {
                reportsButton.hidden = true;
            }
        }

        var advancedButton = document.getElementById('advancedSettings');
        var showAdvanced = window.arguments[0];

        if (advancedButton) {
            advancedButton.hidden = !showAdvanced;
        }
    };

    window.loadPlus = function loadPlus() {
        var aURL = 'chrome://viviecr/content/plus.xul';
        var aName = _('Products');
        var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=800,height=600';
        GREUtils.Dialog.openWindow(window, aURL, aName, aFeatures);
    };

    window.loadReports = function loadReports() {
        var aURL = 'chrome://viviecr/content/reportPanel.xul';
        var aName = _('Reports');
        var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=800,height=600';
        GREUtils.Dialog.openWindow(window, aURL, aName, aFeatures);
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

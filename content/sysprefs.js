(function(){
   
    /**
     * Controller Startup
     */
    function startup() {

        // initialize rounding policy selection menus
        var rt = GeckoJS.Configure.read('vivipos.fec.settings.RoundingTaxes') || 'to-nearest-precision';
        var rp = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';

        var rpNode = document.getElementById('roundingprices');
        if (rpNode) rpNode.value = rp;
        
        var rtNode = document.getElementById('roundingtaxes');
        if (rtNode) rtNode.value = rt;

        // initialize revalue policy selection menu
        var rv = GeckoJS.Configure.read('vivipos.fec.settings.AutoRevaluePrices') || 'none';
        var rvNode = document.getElementById('autorevalueprices');
        if (rvNode) rvNode.value = rv;

        // initialize stored order policy when changing shift
        var sc = GeckoJS.Configure.read('vivipos.fec.settings.StoredOrderWhenShiftChange') || 'none';
        var scNode = document.getElementById('storedorderwhenshiftchange');
        if (scNode) scNode.value = sc;

        // initialize stored order policy when changing shift
        var sp = GeckoJS.Configure.read('vivipos.fec.settings.StoredOrderWhenEndPeriod') || 'none';
        var spNode = document.getElementById('storedorderwhenendperiod');
        if (spNode) spNode.value = sp;

        //$do('load', null, 'Sound');

        var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
        var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
        document.getElementById('prefwin').width=width;
        document.getElementById('prefwin').height=height;

        // calculate available disk space...
        var obj = GREUtils.XPCOM.createInstance('@mozilla.org/file/local;1', 'nsILocalFile');
        obj.initWithPath("/data");
        var size = obj.diskSpaceAvailable;
        var diskspace = document.getElementById('disk_unused');
        if (diskspace) diskspace.value = GeckoJS.NumberHelper.toReadableSize(size);

        //
        var weekmenulist = document.getElementById('weekmenulist');
        var date = new Date();
        date.setDate(date.getDate() - (date.getDay() + 1));
        for (var i=-1; i < 7; i++) {
            var menuitem = document.createElementNS( "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem" );
            menuitem.setAttribute( 'value', i );
            if (i < 0) {
                menuitem.setAttribute( 'label', _("Do not pack"));
            } else {
                menuitem.setAttribute( 'label', date.toLocaleFormat("%A"));
            }
            date.setDate(date.getDate() + 1);
            weekmenulist.appendChild( menuitem );
        }

        document.getElementById('orderweeklypack').value = document.getElementById('orderweeklypack').value;

        // csv export charset
        var charsetmenu = document.getElementById('import_export_charset');
        var bundleCharsetTitles = document.getElementById('bundleCharsetTitles');

        var charSets = _('vivipos.fec.registry.import_export.charsets') == 'vivipos.fec.registry.import_export.charsets' ? ['utf-8'] : _('vivipos.fec.registry.import_export.charsets').split(',');

        for (var i in charSets) {
            var charset = GeckoJS.String.trim(charSets[i]);
            var charsetTitle = charset;
            try {
                charsetTitle = bundleCharsetTitles.getString(charset+".title");
            }catch(e){}

            charsetmenu.appendItem(charsetTitle, charset, '');
        }

        var selectedCharSet = GeckoJS.Configure.read('vivipos.fec.registry.import_export.charset') || 'utf-8';
        charsetmenu.value = selectedCharSet;

    };
    

    window.addEventListener('load', startup, false);

    window.addEventListener('dialogextra1', function(){
        closePreferences();
    }, false);


})();

function rebuildDatabases() {

    // popup progress bar
    this.showWaitingPanel(_('Rebuilding databases...'));

    // release CPU for progressbar ...
    GeckoJS.BaseObject.sleep(500);

    //close all connection
    GeckoJS.ConnectionManager.closeAll();

    GREUtils.File.run('/data/scripts/rebuild_databases.sh', [], true);

    // unpopup progressbar
    this.dismissWaitingPanel();
}

function showWaitingPanel(message) {

    var waitPanel = document.getElementById( 'wait_panel' );

    // set the content of the label attribute be default string, taking advantage of the statusText attribute.
    var caption = document.getElementById( 'wait_caption' );
    caption.label = message;

    waitPanel.openPopupAtScreen( 0, 0 );

    return waitPanel;
}

function dismissWaitingPanel() {
    var waitPanel = document.getElementById( 'wait_panel' );
    waitPanel.hidePopup();
}

function closePreferences() {
    try {

        // mainWindow register promotions rules
        var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

        // change button height
        var main = mainWindow.GeckoJS.Controller.getInstanceByName('Main');
       	main.requestCommand('updateOptions', null, 'Main');

    }
    catch(e) {};

    GREUtils.Dialog.alert(window, _('General Options'), _('General options saved'));

    window.close();
}

function setVolume(volume, silent) {
    if (silent == null) silent = true;
    $do('setVolume', [volume * 10, silent], 'Sound');
}

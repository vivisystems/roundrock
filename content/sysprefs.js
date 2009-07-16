(function(){
   
    /**
     * Controller Startup
     */
    function startup() {

        var rt = GeckoJS.Configure.read('vivipos.fec.settings.RoundingTaxes') || 'to-nearest-precision';
        var rp = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
        var defaultUser = GeckoJS.Configure.read('vivipos.fec.settings.DefaultUser');
        var defaultTaxStatus = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');
        var trackSalePeriod = GeckoJS.Configure.read('vivipos.fec.settings.SequenceTracksSalePeriod');

        var rpNode = document.getElementById('roundingprices');
        if (rpNode) rpNode.value = rp;
        
        var rtNode = document.getElementById('roundingtaxes');
        if (rtNode) rtNode.value = rt;
        
        $do('initUser', defaultUser, 'Users');
        $do('initTaxStatus', defaultTaxStatus, 'Taxes');

        this.adjustSequenceLength(trackSalePeriod);
        //$do('load', null, 'Sound');

        var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
        var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
        document.getElementById('prefwin').width=width;
        document.getElementById('prefwin').height=height;
        document.getElementById('prefwin').dlgbuttons="accept,help";

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

    };
    

    window.addEventListener('load', startup, false);

    window.addEventListener('dialogextra1', function(){
        VirtualKeyboard.toggle();
    }, false);


})();

function rebuildDatabases() {

    // popup progress bar
    var waitPanel = document.getElementById( 'wait_panel' );
    var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
    var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;

    waitPanel.sizeTo(600, 120);
    var x = (width - 600) / 2;
    var y = (height - 240) / 2;
    waitPanel.openPopupAtScreen(x, y);
	
	var sleepTime = 0;
    // release CPU for progressbar ...
    if (!sleepTime) {
      sleepTime = 1000;
    }
    GeckoJS.BaseObject.sleep(sleepTime);

    //close all connection
    GeckoJS.ConnectionManager.closeAll();
    
    GREUtils.File.run('/data/scripts/rebuild_databases.sh', [], true);

    // unpopup progressbar
    waitPanel.hidePopup();
}

function adjustSequenceLength(trackSalePeriod) {
    var maxlen = trackSalePeriod ? 4 : 12;
    var lenObj = document.getElementById('sequencenumberlength');
    var len = parseInt(lenObj.value);

    if (isNaN(len) || len > maxlen) {
        len = maxlen;
    }
    lenObj.setAttribute('max', maxlen);

    GeckoJS.Configure.write('vivipos.fec.settings.SequenceNumberLength', len);
    lenObj.value = len;
}

function closePreferences() {
    try {

        // mainWindow register promotions rules
        var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

        // change button height
        var main = mainWindow.GeckoJS.Controller.getInstanceByName('Main');
       	main.requestCommand('updateOptions', null, 'Main');

        $do('setDefaultUser', null, 'Users');
        $do('setDefaultTaxStatus', null, 'Taxes');
    }
    catch(e) {};
}

function setVolume(volume, silent) {
    if (silent == null) silent = true;
    $do('setVolume', [volume * 10, silent], 'Sound');
}

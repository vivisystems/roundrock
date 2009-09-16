[&INIT]
{eval}
    counter = 1;

    var buf = '';

    // get handle to Keypad controller
    var mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
        .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );

    if (mainWindow) {
        var rcp = mainWindow.GeckoJS.Controller.getInstanceByName( 'Keypad' );
        if (rcp) {
            buf = rcp.getBuffer();
            rcp.clearBuffer();
        }
    }
    if (buf && !isNaN(buf)) {
        counter = parseInt(buf);
    }
    else {
        counter = GeckoJS.Session.get('queue-counter');
    }
    if (counter == null || counter == '' || isNaN(counter)) counter = 1;

    GeckoJS.Session.set('queue-counter', counter - -1);
{/eval}
[&QSON]${'Ticket: '|left:8}${counter|right:4}[&QSOFF]
[&RESET]
${(new Date()).toLocaleFormat('%Y-%m-%d %H:%M:%S')|center:24}
[&CR]
[&CR]
[&CR]
[&CR]
[&CR]
[&PC]

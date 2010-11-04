// set up event listener to intercept invocation of Main.initial()
// and dispatch events to execute roundrock startup tasks

function roundrock_startup(evt) {
    GeckoJS.Dispatcher.removeEventListener('onDispatch', roundrock_startup);

    GeckoJS.StringBundle.createBundle("chrome://roundrock/locale/messages.properties");
    if (!GeckoJS.Session.get('restarting')) {
        $do('integrityCheck', evt, 'BDBData');
        $do('initial', evt, 'BigDisk');
    }
}

GeckoJS.Dispatcher.addEventListener('onDispatch', roundrock_startup);


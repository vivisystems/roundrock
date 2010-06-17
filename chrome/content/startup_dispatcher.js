// set up event listener to intercept invocation of Main.initial()
// and dispatch events to execute roundrock startup tasks

function roundrock_startup(evt) {
    GeckoJS.Dispatcher.removeEventListener('onDispatch', roundrock_startup);
    $do('integrityCheck', evt, 'BDBData');

    if (!GeckoJS.Session.get('restarting')) {
        $do('initial', evt, 'BigDisk');
    }
}

GeckoJS.Dispatcher.addEventListener('onDispatch', roundrock_startup);


// set up event listener to intercept invocation of Main.initial()
// and dispatch events to execute roundrock startup tasks

function roundrock_startup(evt) {
    // issues the vivipos-started upstart event
    try {
        var exec = new GeckoJS.File('/usr/bin/sudo');
        var r = exec.run(['/sbin/initctl', 'emit', '--no-wait', 'vivipos-started']);
        exec.close();
    }
    catch (e) {
        GREUtils.log('FATAL', 'Failed to issue vivipos-started');
    }

    GeckoJS.Dispatcher.removeEventListener('onDispatch', roundrock_startup);
    $do('integrityCheck', evt, 'BDBData');

    if (!GeckoJS.Session.get('restarting')) {
        $do('initial', evt, 'BigDisk');
    }
}

GeckoJS.Dispatcher.addEventListener('onDispatch', roundrock_startup);


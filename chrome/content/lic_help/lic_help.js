(function(){

    var curProcD = "";
    var dallas = "";
    var mac = "";
    var system = "";
    var vendor = "";
    var bundle = null;
    var result = null;

    function getLicenseStub() {
        
        var prog = curProcD +"/export_license_stub";
        var output = "/tmp/vivipos_stub.txt";

        GREUtils.File.run(prog, [], true);

        var lines = GREUtils.File.readAllLine(output);

        lines.forEach(function(line){

            var t = line.split('=');
            switch(t[0]) {
                case 'dallas':
                    dallas = t[1];
                    break;
                case 'system_name':
                    system = t[1];
                    break;
                case 'vendor_name':
                    vendor = t[1];
                    break;
                case 'mac_address':
                    mac = t[1];
                    break;

            }
        });

        document.getElementById('lblDallas').value = dallas;
        document.getElementById('lblMac').value = mac;
        document.getElementById('lblSystem').value = system;
        document.getElementById('lblVendor').value = vendor;

    }

    function restart() {

        var title =""
        var msg = "";
        try {
            title = bundle.GetStringFromName('confirm_restart.title');
            msg = bundle.GetStringFromName('confirm_restart.message');
        }catch(e) {
            title = 'confirm restart';
            msg = 'Do you want to restart VIVIPOS';
        }

        if (GREUtils.Dialog.confirm(window, title, msg)) {
                    result.restart = true;
                    window.close();
        }

    }

    function shutdown() {

        var title =""
        var msg = "";
        try {
            title = bundle.GetStringFromName('confirm_shutdown.title');
            msg = bundle.GetStringFromName('confirm_shutdown.message');
        }catch(e) {
            title = 'confirm shutdown';
            msg = 'Do you want to shutdown VIVIPOS';
        }

        if (GREUtils.Dialog.confirm(window, title, msg)) {
                    result.shutdown = true;
                    window.close();
        }

    }

    function exportLRF() {
        var mountPoint = checkMedia(true);

        if (!mountPoint) return;


        var sourceFile = "/tmp/vivipos_stub.txt";

        // remove mountpoint files
        GREUtils.File.remove(mountPoint + '/vivipos_stub.txt' );

        // copy
        GREUtils.File.copy(sourceFile, mountPoint);

        // sync io
        GREUtils.File.run('/bin/sync', [], true);

        var message  = 'License Stub File (vivipos_stub.txt) has copied to ';

        try {
            message = bundle.GetStringFromName('exportLRF_success.message');
        }catch(e) {}

        alert(message + ' ' + mountPoint );
        
    }

    function importLF() {

        var mountPoint = checkMedia(true);

        if (!mountPoint) return;

        var sourceFile = mountPoint + "/vivipos.lic";
        var targetDir = "/etc/";

        var message = "" ;

        if(!GREUtils.File.exists(sourceFile)) {

            message  = 'License File (vivipos.lic) not exists';

            try {
                message = bundle.GetStringFromName('importLF_notexists.message');
            }catch(e) {}

            alert(message);
            return false;
        }

        // remove old license file
        GREUtils.File.remove(targetDir + 'vivipos.lic' );
        // copy
        GREUtils.File.copy(sourceFile, targetDir);
        // sync io
        GREUtils.File.run('/bin/sync', [], true);

        // try decode jsc with new license file
        var loader = null;
        var checkJsc = "chrome://vivipos/content/lic_help/decodeCheck.jsc" ;
        try {
           var loader = Components.classes["@firich.com.tw/jssubscript_loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
            loader.loadSubScript(checkJsc);
            include();
        }catch(e) {

            if (e.name == 'NS_ERROR_FAILURE' && checkJsc.indexOf('jsc') != -1) {
                // decode error

                message  = 'License File (vivipos.lic) verify check error';
                try {
                    message = bundle.GetStringFromName('importLF_verifyerror.message');
                }catch(e) {}
                alert(message);
                return false;
            }
        }

        message  = 'License File (vivipos.lic) imported successfully';

        try {
            message = bundle.GetStringFromName('importLF_success.message');
        }catch(e) {}

        alert(message);

        result.retry = true;
        window.close();

    }


    function checkMedia(prompt) {

        prompt = prompt || false;
        
        // check last insert usb drive
        var osLastMedia = GREUtils.File.readAllLine('/tmp/last_media');

        var last_media = "";
        var deviceNode = "";
        var deviceReady = false;

        var deviceMount = "/media/";
        var hasMounted = false;

        if (osLastMedia.length > 0) last_media = osLastMedia[0];

        if (last_media) {

                var tmp = last_media.split('/');
                deviceNode = tmp[tmp.length-1];
                deviceMount +=  deviceNode + '/';
                
                if (GREUtils.File.isDir(deviceMount)) {
                    return deviceMount;
                }
        }

        if (prompt) {

            var message  = 'Media not found!! Please attach the USB thumb drive...';

            try {
                message = bundle.GetStringFromName('check_media.message');
            }catch(e) {}

            alert(message);

        }

        return false;

    }

 /**
  * Window Startup
  */
    function startup() {

        if (window.arguments) result = window.arguments[0];
        
        // var args = window.args = window.arguments[0].wrappedJSObject;
        centerWindowOnScreen();

        var directory_service = Components.classes["@mozilla.org/file/directory_service;1"]
        .getService(Components.interfaces.nsIProperties);

        curProcD = directory_service.get('CurProcD', Components.interfaces.nsIFile).path;

        bundle = document.getElementById('vivipos_strings').stringBundle;

        getLicenseStub();

        document.getElementById('btnShutdown').addEventListener('click', shutdown, true);
        document.getElementById('btnRestart').addEventListener('click', restart, true);
        document.getElementById('btnExport').addEventListener('click', exportLRF, true);
        document.getElementById('btnImport').addEventListener('click', importLF, true);
        

    }

    window.addEventListener('load', startup, true);

})();

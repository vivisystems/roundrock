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
        /*
        document.getElementById('lblMac').value = mac;
        document.getElementById('lblSystem').value = system;
        document.getElementById('lblVendor').value = vendor;
        */

    }


    function updateExtensionErrorInfo() {

        document.getElementById('lblExtId').value = result['EXT_ID'];
        document.getElementById('lblExtName').value = result['EXT_NAME'];
        document.getElementById('lblExtVersion').value = result['EXT_VERSION'];
        document.getElementById('lblExtCreator').value = result['EXT_CREATOR'];
        document.getElementById('lblExtHomepage').value = result['EXT_HOMEPAGE'];

        var msg = bundle.GetStringFromName('extension_lic_err' + result['RESULT'] +'.message');
        document.getElementById('lblErrMsg').value = msg;


        var expDate = "";
        if (result['EXPIRE_DATE']) {
            try {
                expDate = new Date(parseInt(result['EXPIRE_DATE'])*1000).toString();
                document.getElementById('lblExpDate').value = expDate;
            }catch(e) {
                document.getElementById('lblExpDate').setAttribute('hidden', true);
            }
        }else {
            document.getElementById('lblExpDate').setAttribute('hidden', true);

        }



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

    function skipExt() {

        var title =""
        var msg = "";
        try {
            title = bundle.GetStringFromName('confirm_ext_lic_error_skip.title');
            msg = bundle.GetStringFromName('confirm_ext_lic_error_skip.message');
        }catch(e) {
            title = 'confirm skip';
            msg = 'Do you want to skip Extension License Error';
        }

        if (GREUtils.Dialog.confirm(window, title, msg)) {
                    window.close();
        }

    }

    function exportLF() {
        var mountPoint = checkMedia(true);

        if (!mountPoint) return;

        var sourceFile = "/etc/vivipos.lic";

        // remove mountpoint files
        GREUtils.File.remove(mountPoint + '/vivipos.lic' );

        // copy
        GREUtils.File.copy(sourceFile, mountPoint);

        // sync io
        GREUtils.File.run('/bin/sync', [], true);

        var message  = 'License File (vivipos.lic) exported successfully';

        try {
            message = bundle.GetStringFromName('exportLF_success.message');
        }catch(e) {}

        alert(message + ' ' + mountPoint );
        
    }

    function importELF() {

        var mountPoint = checkMedia(true);

        if (!mountPoint) return;

        var sourceFile = mountPoint + "/signed.lic";
        var targetFile = "/etc/vivipos_partners.lic";

        var prog = curProcD +"/partners_lic_manager";


        var keyId = result['KEY_ID'];

        var message = "" ;

        if(!GREUtils.File.exists(sourceFile)) {

            message  = 'Signed License File (signed.lic) not exists';

            try {
                message = bundle.GetStringFromName('importELF_notexists.message');
            }catch(e) {}

            alert(message);
            return false;
        }

        // sync io
        GREUtils.File.run(prog, ['-i', sourceFile, '-k', keyId], true);

        // try decode jsc with new license file
        var loader = null;
        var checkJsc = result['src'];
        try {
           var loader = Components.classes["@firich.com.tw/jssubscript_loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
            loader.loadSubScript(checkJsc);
            include();
        }catch(e) {

            if (e.name == 'NS_ERROR_FAILURE' && checkJsc.indexOf('jsc') != -1) {
                // decode error

                message  = 'Signed License File (signed.lic) verify check error';
                try {
                    message = bundle.GetStringFromName('importELF_verifyerror.message');
                }catch(e) {}
                alert(message);
                return false;
            }
        }

        message  = 'Signed License File (signed.lic) imported successfully';

        try {
            message = bundle.GetStringFromName('importELF_success.message');
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

        updateExtensionErrorInfo();

        document.getElementById('btnShutdown').addEventListener('click', shutdown, true);
        document.getElementById('btnRestart').addEventListener('click', restart, true);
        document.getElementById('btnSkip').addEventListener('click', skipExt, true);
        document.getElementById('btnExport').addEventListener('click', exportLF, true);
        document.getElementById('btnImport').addEventListener('click', importELF, true);
        

    }

    window.addEventListener('load', startup, true);

})();

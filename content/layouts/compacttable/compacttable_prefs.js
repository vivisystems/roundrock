
function prefs_overlay_startup() {
    alert('in prefs overlay startup');
    var prefwin = document.getElementById('prefwin');
    var displayPane = document.getElementById('displaySettingsPane');
    var logoPane = document.getElementById('logoSettingsPane');

    if (displayPane) prefwin.addPane(displayPane);
    if (logoPane) prefwin.addPane(logoPane);

    var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/') + '/';
    var sDstDir = datapath + "/images/pluimages/";

    // initialize default oridyct image
    var defaultImageObj = document.getElementById('defaultimage');
    if (defaultImageObj) {
        defaultImageObj.src = 'file://' + sDstDir + 'no-photo.png';
    }

    // initialize logo
    var logoImageObj = document.getElementById('logoimage');
    if (logoImageObj) {
        var logoHeight = GeckoJS.Configure.read('vivipos.fec.settings.layout.compacttable.logoHeight');
        var logoWidth = GeckoJS.Configure.read('vivipos.fec.settings.layout.compacttable.logoWidth');
        if (isNaN(logoHeight)) logoHeight = 50;
        if (isNaN(logoWidth)) logoWidth = 50;
        logoImageObj.src = 'file://' + sDstDir + 'logo.png';
        logoImageObj.setAttribute('style', 'max-height: ' + logoHeight + 'px;');
        logoImageObj.setAttribute('style', 'max-width: ' + logoWidth + 'px;');
    }
}


/**
 * Browse and select image
 */
function selectImage(targetId, targetFile) {

    var targetObj = document.getElementById(targetId);

    if (!targetObj) return;

    var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/') + '/';
    var sSrcDir = datapath + "/images/original/";
    if (!sSrcDir) sSrcDir = '/data/images/original/';
    sSrcDir = (sSrcDir + '/').replace(/\/+/g,'/');

    var sDstDir = datapath + "/images/pluimages/";
    if (!sDstDir) sDstDir = '/data/images/pluimages/';
    sDstDir = (sDstDir + '/').replace(/\/+/g,'/');

    var aURL = "chrome://viviecr/content/imageManager.xul";
    var aName = "imagePicker";

    var args = {
        pickerMode: true,
        directory: sSrcDir + "",
        result: false,
        file: ""
    };

    var width = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
    var height = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

    args.wrappedJSObject = args;
    GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,width=" + width + ",height=" + height, args);

    var aFile = "";
    if (args.result) {
        var aFile = args.file;
    }
    var aSrcFile = aFile.replace("file://", "");

    if (!GREUtils.File.exists(aSrcFile))
            return false;
    var aDstFile = sDstDir + targetFile;

    GREUtils.File.remove(aDstFile);
    var result = GREUtils.File.copy(aSrcFile, aDstFile);

    targetObj.setAttribute("src", "file://" + aDstFile + "?" + Math.random());

    return aDstFile;
}

/**
 * Remove image
 */
function removeImage(targetId, targetFile) {

    var targetObj = document.getElementById(targetId);

    if (!targetObj) return;

    var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
    var sDstDir = datapath + "/images/pluimages/";
    if (!sDstDir) sDstDir = '/data/images/pluimages/';
    sDstDir = (sDstDir + '/').replace(/\/+/g,'/');
    var aDstFile = sDstDir + targetFile;

    GREUtils.File.remove(aDstFile);
        targetObj.setAttribute("src", "");

    return aDstFile;
}

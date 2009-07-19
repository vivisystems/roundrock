
function prefs_overlay_startup() {
    var prefwin = document.getElementById('prefwin');
    var bannerPane = document.getElementById('bannerSettingsPane');
    var displayPane = document.getElementById('displaySettingsPane');

    if (displayPane) prefwin.addPane(displayPane);
    if (bannerPane) prefwin.addPane(bannerPane);
    
    var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/') + '/';
    var sDstDir = datapath + "/images/pluimages/";

    // initialize default oridyct image
    var defaultImageObj = document.getElementById('defaultimage');
    if (defaultImageObj) {
        defaultImageObj.src = 'file://' + sDstDir + 'no-photo.png';
    }

    // initialize banner
    var bannerImageObj = document.getElementById('bannerimage');
    if (bannerImageObj) {
        var bannerHeight = GeckoJS.Configure.read('vivipos.fec.settings.layout.simple_retail.BannerHeight');
        if (isNaN(bannerHeight)) bannerHeight = 50;
        bannerImageObj.src = 'file://' + sDstDir + 'banner.png';
        bannerImageObj.setAttribute('style', 'max-height: ' + bannerHeight + 'px;');
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

    args.wrappedJSObject = args;
    GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,width=800,height=600", args);

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

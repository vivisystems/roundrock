(function(){

    //include('chrome://viviecr/content/controllers/table_book_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        $do('load', null, 'TableMan');
        $do('initial', null, 'TableMan');

        $('#imageBrowseBtn')[0].addEventListener('command', selectImages, false);
        $('#imageRemoveBtn')[0].addEventListener('command', RemoveImage, false);


    }


/**
 * Browse and select PLU images
 */
function selectImages() {
	var no  = $('#product_no').val();

    var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/') + '/';
    var sDstDir = datapath + "/images/original/";
    if (!sDstDir) sDstDir = '/data/images/original/';
    sDstDir = (sDstDir + '/').replace(/\/+/g,'/');

    var sPluDir = datapath + "/images/table_map_images/";
    if (!sPluDir) sPluDir = '/data/images/table_map_images/';
    sPluDir = (sPluDir + '/').replace(/\/+/g,'/');

    var aURL = "chrome://viviecr/content/imageManager.xul";
    var aName = "imagePicker";

    var args = {
        pickerMode: true,
        directory: sDstDir + "",
        result: false,
        file: ""
    };

    args.wrappedJSObject = args;
    GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,width=800,height=600", args);

    if (args.result) {
        var aFile = args.file;
    }else {
        var aFile = "";
    }
	var aSrcFile = aFile.replace("file://", "");
	if (!GREUtils.File.exists(aSrcFile))
	        return false;

	// var aDstFile = sPluDir + no + ".png";
    var file_name = (GREUtils.File.getFile(aSrcFile)).leafName;
    var aDstFile = sPluDir + file_name;

    // GREUtils.File.remove(aDstFile);
//this.log(aSrcFile);
//this.log(aDstFile);
	var result = GREUtils.File.copy(aSrcFile, aDstFile);

    // document.getElementById('pluimage').setAttribute("src", "file://" + aDstFile + "?" + Math.random());
    document.getElementById('region_bgimage').value = file_name;

	return aDstFile;
};

/**
 * Remove PLU image
 */
function RemoveImage() {
	var no  = $('#product_no').val();

    var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
    var sPluDir = datapath + "/images/pluimages/";
    if (!sPluDir) sPluDir = '/data/images/pluimages/';
    sPluDir = (sPluDir + '/').replace(/\/+/g,'/');
    var aDstFile = sPluDir + no + ".png";

	GREUtils.File.remove(aDstFile);
        document.getElementById('pluimage').setAttribute("src", "");

	return aDstFile;
};


    window.addEventListener('load', startup, false);

})();

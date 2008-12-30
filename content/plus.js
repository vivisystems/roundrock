(function(){

GeckoJS.include('chrome://viviecr/content/models/plugroup.js');

/**
 * Controller Startup
 */
function startup() {

    $do('createGroupPanel', null, "Plus");
	$do('createPluPanel', null, "Plus");
    $do('initDefaultTax', null, 'Plus');

    $('#imageBrowseBtn')[0].addEventListener('command', selectImages, false);
	$('#imageRemoveBtn')[0].addEventListener('command', RemoveImage, false);

};


/**
 * Browse and select PLU images
 */
function selectImages() {
	var no  = $('#product_no').val();

    var sDstDir = GREUtils.File.chromeToPath("chrome://viviecr/content/skin/images/");
    var aURL = "chrome://viviecr/content/imageManager.xul";
    var aName = "imagePicker";

    var args = {
        pickerMode: true,
        directory: sDstDir + "/",
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
	var aDstFile = GREUtils.File.chromeToPath("chrome://viviecr/content/skin/pluimages/") + "/" + no + ".png";
        
    GREUtils.File.remove(aDstFile);
	var result = GREUtils.File.copy(aSrcFile, aDstFile);
        
    document.getElementById('pluimage').setAttribute("src", "chrome://viviecr/content/skin/pluimages/" + no + ".png?" + Math.random());

	return aDstFile;
};

/**
 * Remove PLU image
 */
function RemoveImage() {
	var no  = $('#product_no').val();

	var aDstFile = GREUtils.File.chromeToPath("chrome://viviecr/content/skin/pluimages/") + "/" + no + ".png";
	GREUtils.File.remove(aDstFile);
        document.getElementById('pluimage').setAttribute("src", "");

	return aDstFile;
};

window.addEventListener('load', startup, false);


})();



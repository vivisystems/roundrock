(function(){

/**
 * Controller Startup
 */
function startup() {

    $do('createGroupPanel', null, "Plus");
	$do('createPluPanel', null, "Plus");

    $do('initDefaultTax', null, 'Plus');

    $do('createFilterRows', null, 'PluSearch');

    $('#imageBrowseBtn')[0].addEventListener('command', selectImages, false);
	$('#imageRemoveBtn')[0].addEventListener('command', RemoveImage, false);

};


/**
 * Browse and select PLU images
 */
function selectImages() {
	var no  = $('#product_no').val();

    var sOrigDir = GeckoJS.Session.get('original_directory');
    var sPluDir = GeckoJS.Session.get('pluimage_directory');

    var aURL = "chrome://viviecr/content/imageManager.xul";
    var aName = "imagePicker";

    var args = {
        pickerMode: true,
        directory: sOrigDir + "",
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
	var aDstFile = sPluDir + no + ".png";
    
    GREUtils.File.remove(aDstFile);
	var result = GREUtils.File.copy(aSrcFile, aDstFile);
        
    document.getElementById('pluimage').setAttribute("src", "file://" + aDstFile + "?" + Math.random());

	return aDstFile;
};

/**
 * Remove PLU image
 */
function RemoveImage() {
	var no  = $('#product_no').val();

    var sPluDir = GeckoJS.Session.get('pluimage_directory');
    var aDstFile = sPluDir + no + ".png";

	GREUtils.File.remove(aDstFile);
        document.getElementById('pluimage').setAttribute("src", "");

	return aDstFile;
};

window.addEventListener('load', startup, false);


})();



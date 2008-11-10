(function(){
//GeckoJS.include('chrome://viviecr/content/models/user.js');
//GeckoJS.include('chrome://viviecr/content/models/category.js');
//GeckoJS.include('chrome://viviecr/content/models/product.js');
// GeckoJS.include('chrome://viviecr/content/models/tax.js');

// include controllers  and register itself

//GeckoJS.include('chrome://viviecr/content/controllers/categories_controller.js');
//GeckoJS.include('chrome://viviecr/content/controllers/products_controller.js');
//GeckoJS.include('chrome://viviecr/content/controllers/taxes_controller.js');

// 
// GeckoJS.include('chrome://viviecr/content/fecposutils.js');

/**
 * Controller Startup
 */
function startup() {

	$("#simpleListBoxCategory")[0].addEventListener('select', function(evt) {
		$do('select', evt, 'Categories');
	}, false);

	$("#simpleListBoxProduct")[0].addEventListener('select', function(evt) {
		$do('select', evt, 'Products');
	}, false);

	$("#simpleListBoxTax")[0].addEventListener('select', function(evt) {
		$do('select', evt, 'Taxes');
	}, false);


	$do('load', null, 'Categories');
	$do('load', null, 'Taxes');

	$("#simpleListBoxCategory")[0].selectedIndex = 0;
	$("#simpleListBoxProduct")[0].selectedIndex = 0;
	$("#simpleListBoxTax")[0].selectedIndex = 0;

	$('#imageBrowseBtn')[0].addEventListener('command', selectImages, false);
	$('#imageRemoveBtn')[0].addEventListener('command', RemoveImage, false);
	$('#reloadBtn')[0].addEventListener('command', reloadApp, false);

    // var tc = new GeckoJS.TaxComponent();
    // alert(GeckoJS.BaseObject.dump(tc.getTax("NORMAL TAX")));

};

/**
 * Reload Application
 */
function reloadApp() {
  // GREUtils.restartApplication();
//  $do('removeBtn', null, 'Main');
//  $do('createBtn', null, 'Main');
 opener.$do('createPluPanel',null,'Main');

  window.close();
}

/**
 * Browse and select PLU images
 */
function selectImages() {
	var no  = $('#product_no').val();

        var sDstDir = GREUtils.File.chromeToPath("chrome://viviecr/content/skin/icons/");
        // alert(sDstDir);
    var aURL = "chrome://viviecr/content/imageManager.xul";
    var aName = "imagePicker";

    var args = {
      pickerMode: false,
      directory: "/home/rack/workspace/sam4s/content/skin/icons/",
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
//    alert(aFile);
	//var aFile = GREUtils.Dialog.openFilePicker(sDstDir, "Choice Image...");
	var aSrcFile = aFile.replace("file://", "");


	if (!GREUtils.File.exists(aSrcFile))
	        return false;
	var aDstFile = GREUtils.File.chromeToPath("chrome://viviecr/content/skin/pluimages/") + "/" + no + ".png";
        
        GREUtils.File.remove(aDstFile);
	var result = GREUtils.File.copy(aSrcFile, aDstFile);
        // alert(result);
        
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



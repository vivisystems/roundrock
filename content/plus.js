(function(){

/**
 * Controller Startup
 */
function startup() {

    $do('createGroupPanel', null, 'Plus');
    $do('createPluPanel', null, 'Plus');

    $do('initDefaultTax', null, 'Plus');

    $do('createFilterRows', null, 'PluSearch');

    $do('initSearchCallback', null, 'Plus');

    $('#imageBrowseBtn')[0].addEventListener('command', selectImages, false);
    $('#imageRemoveBtn')[0].addEventListener('command', RemoveImage, false);

};

function nextImageCounter(pid, removecachedkey) {
    var productsById = GeckoJS.Session.get('productsById');
    var prod = productsById ? productsById[pid] : null;
    var suffix = '';

    if (prod) {
        var counter = parseInt(prod.imageCounter);
        if (isNaN(counter)) counter = 0;
        else counter++;

        prod.imageCounter = counter;

        suffix = '?' + counter;

        if (removecachedkey) {
            delete prod[removecachedkey];
        }
    }
    return suffix;
};

/**
 * Browse and select PLU images
 */
function selectImages() {
    var no  = $('#product_no').val();
    var pid = $('#product_id').val();

    var sOrigDir = GeckoJS.Session.get('original_directory');
    var sPluDir = GeckoJS.Session.get('pluimage_directory');

    var aURL = 'chrome://viviecr/content/imageManager.xul';
    var aName = 'imagePicker';

    var args = {
        pickerMode: true,
        directory: sOrigDir + '',
        result: false,
        file: ''
    };

    var width = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
    var height = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

    args.wrappedJSObject = args;
    GREUtils.Dialog.openWindow(window, aURL, aName, 'chrome,dialog,modal,dependent=yes,resize=no,width=' + width + ',height=' + height, args);

    var aFile;
    if (args.result) {
        aFile = args.file;
    }else {
        aFile = '';
    }
	var aSrcFile = aFile.replace('file://', '');

	if (!GREUtils.File.exists(aSrcFile))
	        return false;
	var aDstFile = sPluDir + encodeURIComponent(no) + '.png';

    if (GREUtils.File.exists(aDstFile)) GREUtils.File.remove(aDstFile);
	GREUtils.File.copy(aSrcFile, aDstFile);

    // get next image counter
    var suffix = nextImageCounter(pid, 'pluimages');

    // update image selection object
    document.getElementById('pluimage').setAttribute('src', 'file://' + aDstFile + suffix);

    // update product button
    $('#prodscrollablepanel')[0].refresh();

	return aDstFile;
};

/**
 * Remove PLU image
 */
function RemoveImage() {
	var no  = $('#product_no').val();
    var pid = $('#product_id').val();

    var sPluDir = GeckoJS.Session.get('pluimage_directory');
    var aDstFile = sPluDir + encodeURIComponent(no) + '.png';

	if (GREUtils.File.exists(aDstFile)) GREUtils.File.remove(aDstFile);
    document.getElementById('pluimage').setAttribute('src', '');

    // get next image counter
    nextImageCounter(pid, 'pluimages');

    // update product button
    $('#prodscrollablepanel')[0].refresh();

	return aDstFile;
};

window.addEventListener('load', startup, false);


})();



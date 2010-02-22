(function(){

/**
 * Controller Startup
 */
function startup() {

    $do('createDepartmentPanel', null, 'Tab');
    $do('createIndividualDepartmentPanel', null, 'Tab');
    $do('loadBarcodeTypes', null, 'Tab');
    $do('createFilterRows', null, 'PluSearch');
    $do('load', null, 'Tab');
 //   $('#imageBrowseBtn')[0].addEventListener('command', selectImages, false);
 //   $('#imageRemoveBtn')[0].addEventListener('command', RemoveImage, false);

 /* load tabList*/

};


window.addEventListener('load', startup, false);


})();
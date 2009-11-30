(function(){

/**
 * Controller Startup
 */
function startup() {

 //   $do('createGroupPanel', null, 'Tab');
    $do('createDepartmentPanel', null, 'Tab');
    $do('createIndividualDepartmentPanel', null, 'Tab');
    $do('loadCommitments', null, 'Tab');
 //   $do('initDefaultTax', null, 'Tab');

 //   $do('createFilterRows', null, 'PluSearch');

 //   $do('initSearchCallback', null, 'Tab');
    $do('load', null, 'Tab');

 //   $('#imageBrowseBtn')[0].addEventListener('command', selectImages, false);
 //   $('#imageRemoveBtn')[0].addEventListener('command', RemoveImage, false);

 /* load tabList*/

};


window.addEventListener('load', startup, false);


})();

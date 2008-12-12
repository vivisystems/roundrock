(function(){

/**
 * Controller Startup
 */
function startup() {

	$do('createDepartmentPanel', null, "Departments");

    // set default tax rate
    var taxes = GeckoJS.Session.get('taxes');
    if (taxes == null) taxes = this.Tax.getTaxList();

    if (taxes.length > 0) {
        document.getElementById('rate').setAttribute('default', taxes[0].no);
    }
};

window.addEventListener('load', startup, false);


})();



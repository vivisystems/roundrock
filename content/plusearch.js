(function(){

    // include controllers  and register itself
    GeckoJS.include('chrome://viviecr/content/controllers/plusearch_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        centerWindowOnScreen();

        $('#clearBtn')[0].addEventListener('command', clearTextBox, false);
        // $('#ekeyBtn')[0].addEventListener('command', searchPlu, true);
        $('#plu').focus();
    };

    /**
     * Clear  box
     */
    function clearTextBox() {

        $('#plu').val('');

    };

    function searchPlu () {
            var barcode = $('#plu').val();
            $('#plu').val('').focus();

            if (barcode == "") return;

            var productsById = GeckoJS.Session.get('productsById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var product;

            if (!barcodesIndexes[barcode]) {
                // barcode notfound
                // event.error = true;
                // alert("Plu Not Found!");
            }else {
                var id = barcodesIndexes[barcode];
                product = productsById[id];
                GeckoJS.FormHelper.unserializeFromObject('productForm', product);

            }
        };

    window.addEventListener('load', startup, false);

})();



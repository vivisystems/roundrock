(function(){

    include('chrome://viviecr/content/models/product.js');
    // include controllers  and register itself
    include('chrome://viviecr/content/controllers/plusearch_controller.js');

    /**
     * Controller Startup
     */
    function startup() {

        centerWindowOnScreen();

        $('#clearBtn')[0].addEventListener('command', clearTextBox, false);
        // $('#ekeyBtn')[0].addEventListener('command', searchPlu, true);
        $('#plu').focus();

        $do('createFilterRows', null, 'PluSearch');

        doSetOKCancel(
            function(){
                // inputObj.condiments = document.getElementById('condiments').value;
                //inputObj.index = document.getElementById('queueScrollablepanel').value;
                // inputObj.ok = true;

                return true;
            },
            function(){
                // inputObj.ok = false;

                return true;
            }
            );
    };

    /**
     * Clear  box
     */
    function clearTextBox() {

        // $('#plu').val('');
        var focusedElement = document.commandDispatcher.focusedElement;
        focusedElement.value = '';

    };

    function searchPlu2 () {
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



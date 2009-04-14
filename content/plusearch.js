(function(){

    /**
     * Controller Startup
     */
    function startup() {

        centerWindowOnScreen();

        $('#clearBtn')[0].addEventListener('command', clearTextBox, false);
        // $('#ekeyBtn')[0].addEventListener('command', searchPlu, true);

        $do('createFilterRows', null, 'PluSearch');

        doSetOKCancel(
            function(){
                // inputObj.condiments = document.getElementById('condiments').value;
                //inputObj.index = document.getElementById('queueScrollablepanel').value;
                inputObj.ok = true;
                
                return true;
            },
            function(){
                inputObj.ok = false;

                return true;
            }
            );

        // parse windows.arguments to get initial search parameters
        if (window.arguments.length > 0) {
            var inputObj = window.arguments[0];

            var buf = inputObj.buffer;
            var item = inputObj.item;
            var barcode;
            if (buf && buf.length > 0) {
                barcode = buf;
            }
            else if (item != null) {
                barcode = item.no;
            }
        }
        if (barcode != null && barcode.length > 0) {
            $do('searchPlu', barcode, 'PluSearch');
            document.getElementById('plu').value = barcode;
        }
        $('#plu')[0].select();
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



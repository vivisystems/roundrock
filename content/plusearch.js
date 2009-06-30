(function(){

    /**
     * Controller Startup
     */
    function startup() {

        $do('createFilterRows', null, 'PluSearch');

        doSetOKCancel(
            function(){
                // inputObj.condiments = document.getElementById('condiments').value;
                //inputObj.index = document.getElementById('queueScrollablepanel').value;

                $do('setSelections', null, 'PluSearch');
                inputObj.ok = true;
                
                return true;
            },
            function(){
                inputObj.ok = false;

                return true;
            }
            );

        // parse windows.arguments to get initial search parameters
        if (window.arguments && (window.arguments.length > 0)) {
            var inputObj = window.arguments[0];
            
            if ('seltype' in inputObj) {
                var tree = document.getElementById('plusearchscrollablepanel');
                if (tree) tree.setAttribute('seltype', inputObj.seltype);
            }
            
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
        $('#plu')[0].textbox.select();
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

            if (barcodesIndexes[barcode]) {
                var id = barcodesIndexes[barcode];
                product = productsById[id];
                GeckoJS.FormHelper.unserializeFromObject('productForm', product);

            }
        };

    window.addEventListener('load', startup, false);

})();



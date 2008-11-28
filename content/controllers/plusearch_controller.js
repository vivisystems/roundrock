(function(){


    /**
     * Class ViviPOS.SearchPluController
     */

    GeckoJS.Controller.extend( {
        name: 'PluSearch',

        searchPlu: function (barcode) {
            // alert(barcode);
            $('#plu').val('').focus();
            // $('#plu').focus();
            if (barcode == "") return;

            var productsById = GeckoJS.Session.get('productsById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var product;

            if (!barcodesIndexes[barcode]) {
                // barcode notfound
                alert("Plu (" + barcode + ") Not Found!");
            }else {
                var id = barcodesIndexes[barcode];
                product = productsById[id];
                GeckoJS.FormHelper.unserializeFromObject('productForm', product);
            }
        }
    });

})();

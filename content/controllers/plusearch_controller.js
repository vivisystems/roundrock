(function(){

    /**
     * Class ViviPOS.SearchPluController
     */

    GeckoJS.Controller.extend( {
        name: 'PluSearch',

        searchPlu: function (barcode) {
            $('#plu').val('').focus();
            if (barcode == "") return;

            var productsById = GeckoJS.Session.get('productsById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var product;

            if (!barcodesIndexes[barcode]) {
                // barcode notfound
                // @todo OSD?
                alert(_('Product [%S] Not Found!', [barcode]));
            }else {
                var id = barcodesIndexes[barcode];
                product = productsById[id];
                GeckoJS.FormHelper.unserializeFromObject('productForm', product);
                document.getElementById('pluimage').setAttribute('src', 'chrome://viviecr/content/skin/pluimages/' + product.no + '.png?' + Math.random());
            }
        }
    });

})();

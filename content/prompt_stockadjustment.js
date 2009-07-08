var options;

(function(){
    var inputObj = window.arguments[0];
    
    /**
     * Controller Startup
     */
    function startup() {

        // reset or commit
        if ('commit' in inputObj) {
            // hide quantity row
            document.getElementById('quantity-row').hidden = true;

            var suppliers = inputObj.suppliers;
            if (suppliers) {
                var supplierMenu = document.getElementById('supplier');
                suppliers.forEach(function(supplier) {
                    supplierMenu.appendItem(supplier.supplier, supplier.supplier);
                }, this);
            }
        }
        else {
            // hide type row
            document.getElementById('reason-row').hidden = true;

            // hide supplier row
            document.getElementById('supplier-row').hidden = true;
        }

        doSetOKCancel(
            function(){
                inputObj.quantity = document.getElementById('quantity').value;
                inputObj.reason = document.getElementById('reason').value;
                inputObj.memo = GeckoJS.String.trim(document.getElementById('memo').value);
                inputObj.supplier = GeckoJS.String.trim(document.getElementById('supplier').value);
                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return true;
            }
        );
    };
    
    window.addEventListener('load', startup, false);

})();

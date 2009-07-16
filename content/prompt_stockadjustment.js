var options;

(function(){
    var inputObj = window.arguments[0];
    
    if ( false ) {// for the translation job. The terms in this block are used in prompt_stockadjustment.js.
        _( "(inventory)inventory" );
        _( "(inventory)procure" );
        _( "(inventory)waste" );
        _( "(inventory)other" );
    }
    
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
            
            // hide memo row
            document.getElementById('memo-row').hidden = true;
        }

        doSetOKCancel(
            function(){
                if ('commit' in inputObj) {
                    inputObj.reason = document.getElementById('reason').value;
                    if (inputObj.reason == 'procure')
                        inputObj.supplier = GeckoJS.String.trim(document.getElementById('supplier').value);
                }
                else {
                    inputObj.quantity = document.getElementById('quantity').value;
                }
                inputObj.memo = GeckoJS.String.trim(document.getElementById('memo').value);
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

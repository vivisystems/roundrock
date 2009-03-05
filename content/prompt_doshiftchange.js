(function(){
    var inputObj = window.arguments[0];
    var topics = inputObj.topics;
    var data = inputObj.shiftchange;
    var detail = inputObj.shiftchange.detail;
    var amount = data.amount;

    /**
     * Controller Startup
     */
    function startup() {
        // set topic list
        window.viewHelper = new GeckoJS.NSITreeViewArray(topics);

        /*
        document.getElementById('topicscrollablepanel').datasource = window.viewHelper ;
        document.getElementById('topicscrollablepanel').selectedIndex = 0;
        document.getElementById('topicscrollablepanel').selectedItems = [0];
        */
        
        window.viewDetailHelper = new GeckoJS.NSITreeViewArray(detail);
        window.viewDetailHelper.getCellValue= function(row, col) {
            
            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;
            var text;
            if (col.id == "amount") {

                // text = this.data[row].amount;
                text = GeckoJS.NumberHelper.round(this.data[row].amount, precision_prices, rounding_prices) || 0;
                text = GeckoJS.NumberHelper.format(text, {places: precision_prices});

            } else {
                text = this.data[row][col.id];
            }
            return text;
        };

        document.getElementById('shiftscrollablepanel').datasource = window.viewDetailHelper ;
        document.getElementById('shiftscrollablepanel').selectedIndex = 0;
        document.getElementById('shiftscrollablepanel').selectedItems = [0];
        document.getElementById('total').value = amount;
        
        document.getElementById('cancel').setAttribute('disabled', false);

        document.getElementById('clearBtn').addEventListener('command', clearTextBox, false);
        document.getElementById('amount').select();

        doSetOKCancel(

            function(){

                // var index = document.getElementById('topicscrollablepanel').selectedIndex;

                inputObj.description = document.getElementById('description').value;
                // inputObj.type = document.getElementById('type').value;
                inputObj.type = 'IN';
                inputObj.amount = parseFloat(document.getElementById('amount').value);

                // if (!isNaN(inputObj.amount) && (index >= 0)) {
                if (!isNaN(inputObj.amount)) {
                    inputObj.ok = true;
                    return true;
                } else if (isNaN(inputObj.amount)) {
                    inputObj.amount = 0;
                    inputObj.ok = true;
                    return true;
                } else {
                    NotifyUtils.warn(_('data incomplete!'));
                }
            },

            function(){
                inputObj.ok = false;
                return true;
            }
            );

    };

    /**
     * Clear  box
     */
    function clearTextBox() {

        var focusedElement = document.commandDispatcher.focusedElement;
        focusedElement.value = '';

    };

    
    window.addEventListener('load', startup, false);

})();

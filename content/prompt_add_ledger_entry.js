(function(){

    var inputObj = window.arguments[0];
    var types = inputObj.entry_types;
    
    /**
     * Controller Startup
     */
    function startup() {
        // set topic list

        window.viewHelper = new GeckoJS.NSITreeViewArray(types);
        window.viewHelper.getCellValue= function(row, col) {

            var text = '';
            if (col.id == 'mode') {
                text = _(types[row][col.id]);
            }
            else {
                text = types[row][col.id];
            }
            return text;
        };

        document.getElementById('typescrollablepanel').datasource = window.viewHelper ;

        if (types.length == 1) {
            document.getElementById('typescrollablepanel').selection.select(0);
        }
       
        document.getElementById('cancel').setAttribute('disabled', false);

        document.getElementById('clearBtn').addEventListener('command', clearFocusedElement, false);
        validateInput();
        document.getElementById('amount').focus();
        
        doSetOKCancel(

            function(){

                var index = document.getElementById('typescrollablepanel').selectedIndex;

                inputObj.amount = parseFloat(document.getElementById('amount').value);
                if (!isNaN(inputObj.amount) && (index >= 0)) {

                    inputObj.description = GeckoJS.String.trim(document.getElementById('description').value);
                    inputObj.mode = types[index].mode;
                    inputObj.type = types[index].type;

                }
                inputObj.ok = true;
                return true;
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

    function clearFocusedElement() {
        var focused = document.commandDispatcher.focusedElement;
        if (focused.tagName == 'html:input') focused.value = '';
    }

    
    window.addEventListener('load', startup, false);

})();


function validateInput() {
    var okButton = document.getElementById('ok');
    var selectedItems = document.getElementById('typescrollablepanel').selectedItems || [];
    var amount = GeckoJS.String.trim(document.getElementById('amount').value);
    
    okButton.setAttribute('disabled', amount == '' || isNaN(amount) || selectedItems.length == 0);
}
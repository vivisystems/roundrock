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
        document.getElementById('typescrollablepanel').selectedIndex = 0;
        document.getElementById('typescrollablepanel').selectedItems = [0];
       
        document.getElementById('cancel').setAttribute('disabled', false);

        document.getElementById('clearBtn').addEventListener('command', clearFocusedElement, false);
        validateInput();
        document.getElementById('amount').focus();
        
        doSetOKCancel(

            function(){

                var index = document.getElementById('typescrollablepanel').selectedIndex;

                inputObj.amount = parseFloat(document.getElementById('amount').value);
                if (!isNaN(inputObj.amount) && (index >= 0)) {

                    inputObj.description = document.getElementById('description').value;
                    inputObj.type = document.getElementById('type').value;
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
    var amount = GeckoJS.String.trim(document.getElementById('amount').value);
    var index = document.getElementById('typescrollablepanel').selectedIndex;

    okButton.setAttribute('disabled', amount == '' || isNaN(amount) || index == -1);
}
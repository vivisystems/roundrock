var options;

(function(){
    var caption0   = window.arguments[0];
    var barcode    = window.arguments[1];
    var plu        = window.arguments[2];
    var prodname   = window.arguments[3];
    var price      = window.arguments[4];
    var tax        = window.arguments[5];
    var department = window.arguments[6];
    var inputObj   = window.arguments[7];
    
    /**
     * Controller Startup
     */
    function startup() {
        try {
        // To construct a menulist, please assign an array to inputObj.menuItems; the array is consisted of objects bearing fields value, label, and selected.
        // The first object whose 'selected' property is true will be considered the default selected menuitem.
        // hide menu?
        if (!('menu' in inputObj)) {
            document.getElementById('menurow').hidden = true;
            document.getElementById('menulabel').hidden = true;
            document.getElementById('menu').hidden = true;
        }
        else {
            var menu_menupopup = document.getElementById('menu_menupopup');
            var selectedIndex = 0;
            
            if ( inputObj.menuItems ) {
                var items = inputObj.menuItems;
                for ( var i = 0; i < items.length; i++ ) {
                    var item = items[ i ];
                    var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem");
                    menuitem.setAttribute('value', item.value);
                    menuitem.setAttribute('label', item.label);
                    menu_menupopup.appendChild(menuitem);
                    if ( item.selected ) selectedIndex = i;
                }
            }
            
            var menu = document.getElementById('menu');
            menu.selectedIndex = selectedIndex;
        }

        // hide numberpad
        if ('numpad' in inputObj) {
            document.getElementById('numpad').setAttribute('hidden', false);
            if (inputObj.numpad != null) {
                document.getElementById('multinumberpad').setTarget(inputObj.numpad);
                document.getElementById('bkeyBtn').setTarget(inputObj.numpad);
                document.getElementById('clearBtn').setTarget(inputObj.numpad);
            }
        }
        else {
            document.getElementById('numpad').setAttribute('hidden', true);
        }

        document.getElementById('dialog-caption').setAttribute("label", caption0);
        document.getElementById('barcode_label').value    = barcode;
        document.getElementById('plu_label').value        = plu;
        document.getElementById('name_label').value       = prodname;
        document.getElementById('price_label').value      = price;
        document.getElementById('tax_label').value        = tax;
        document.getElementById('department_label').value = department;


        // must use setAttribute; otherwise values would be wiped out by change made to 'multiline'
        document.getElementById('barcode_value').setAttribute('value', inputObj.barcode);
        document.getElementById('barcode_value').value = inputObj.barcode;
        document.getElementById('plu_value').setAttribute('value', inputObj.plu);
        document.getElementById('plu_value').value = inputObj.plu;
        document.getElementById('name_value').setAttribute('value', inputObj.name);
        document.getElementById('name_value').value = inputObj.name;
        document.getElementById('price_value').setAttribute('value', inputObj.price);
        document.getElementById('price_value').value = inputObj.price;
        document.getElementById('tax_value').setAttribute('value', inputObj.tax);
        document.getElementById('tax_value').value = inputObj.tax;
        document.getElementById('tax_rate').setAttribute('value', inputObj.tax_rate);
        document.getElementById('tax_rate').value = inputObj.tax_rate;

        var disablecancelbtn = ('disablecancelbtn' in inputObj);
        document.getElementById('cancel').setAttribute('hidden', disablecancelbtn);

        var depts = GeckoJS.Session.get('categories');
        document.getElementById('department_no').datasource = depts;
        document.getElementById('department_no').selectedItems = [0];

        doSetOKCancel(
            function(){
                inputObj.barcode       = GeckoJS.String.trim(document.getElementById('barcode_value').value);
                inputObj.plu           = GeckoJS.String.trim(document.getElementById('plu_value').value);
                inputObj.name          = GeckoJS.String.trim(document.getElementById('name_value').value);
                inputObj.price         = GeckoJS.String.trim(document.getElementById('price_value').value);
                inputObj.tax           = document.getElementById('tax_value').value;
                inputObj.tax_rate      = document.getElementById('tax_rate').value;
                inputObj.department_no = depts[document.getElementById('department_no').selectedItems].no;
                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return !disablecancelbtn;
            }
        );

        //validateInput();
        
        var textNodes = document.getElementsByTagName('textbox');
        if (textNodes != null && textNodes.length > 0) {
            for (var i = 0; i < textNodes.length; i++)
                textNodes[i].addEventListener('focus', gotFocus, false);
        }

        validateInput();
        
        //document.getElementById('input0').focus();
        }catch(e){GeckoJS.BaseObject.log(e);}
    };

    function gotFocus() {
        var focusedElement = document.commandDispatcher.focusedElement;
        if (focusedElement.tagName == 'html:input' || focusedElement.tagName == 'textbox') {
            focusedElement.select();
        }
        return true;
    };
    
    window.addEventListener('load', startup, false);

    // make inputObj globally available
    options = inputObj;
})();


function clearFocusedElement(target) {
    var focused;
    if (target) {
        focused = document.getElementById(target);
    }
    if (!focused) focused = document.commandDispatcher.focusedElement;
    if (focused.tagName == 'html:input' || focused.tagName == 'textbox') focused.value = '';
}

function updateName() {
    var selectedIndex = document.getElementById('department_no').selectedItems;
    var data = GeckoJS.Session.get('categories');
    var department = data[selectedIndex];
    document.getElementById('name_value').value = department.name;
}


function validateInput() {
    var validated = false;

    var barcode_value = document.getElementById('barcode_value').value || '';
    var plu_value     = document.getElementById('plu_value').value || '';
    var name_value    = document.getElementById('name_value').value || '';
    var price_value   = document.getElementById('price_value').value || '';
    var tax_rate      = document.getElementById('tax_rate') || '';
    var department_no = document.getElementById('department_no') || '';

    var trimmed_barcode_value = GeckoJS.String.trim(barcode_value);
    var trimmed_plu_value     = GeckoJS.String.trim(plu_value);
    var trimmed_name_value    = GeckoJS.String.trim(name_value);
    var trimmed_price_value   = GeckoJS.String.trim(price_value);
    
    if(trimmed_barcode_value.length > 0 &&
        trimmed_plu_value.length > 0 &&
        trimmed_name_value.length > 0 &&
        trimmed_price_value.length > 0 &&
        trimmed_price_value > 0) {
        validated = true;
    }

    validated = validated && !isNaN(trimmed_price_value);

    document.getElementById('ok').setAttribute('disabled', !validated);

}

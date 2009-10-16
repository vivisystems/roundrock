var options;

(function(){
    var caption0   = window.arguments[0];
    var barcode    = window.arguments[1];
    var plu        = window.arguments[2];
    var prodname   = window.arguments[3];
    var price      = window.arguments[4];
    var tax        = window.arguments[5];
    var department = window.arguments[6];
    var text0      = '';
    var inputObj   = window.arguments[7];
    
    /**
     * Controller Startup
     */
    function startup() {
        try {
        // open cashdrawer?
        if ('useraction' in inputObj) {
            var btn = document.getElementById('useraction-btn');
            btn.label = inputObj.useractionLabel;
            window.UserAction = inputObj.useraction;
        }
        else {
            document.getElementById('useraction-btn').setAttribute('hidden', true);
        }

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

        document.getElementById('text0').value = text0;

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
        document.getElementById('department_value').setAttribute('value', inputObj.department);
        document.getElementById('department_value').value = inputObj.department;
        document.getElementById('department_no').setAttribute('value', inputObj.department_no);
        document.getElementById('department_no').value = inputObj.department_no;

        // document.getElementById('cancel').setAttribute('disabled', false);
        var disablecancelbtn = ('disablecancelbtn' in inputObj);
        document.getElementById('cancel').setAttribute('hidden', disablecancelbtn);

        doSetOKCancel(
            function(){
                inputObj.barcode = GeckoJS.String.trim(document.getElementById('barcode_value').value);
                inputObj.plu = GeckoJS.String.trim(document.getElementById('plu_value').value);
                inputObj.name = GeckoJS.String.trim(document.getElementById('name_value').value);
                inputObj.price = GeckoJS.String.trim(document.getElementById('price_value').value);
                inputObj.tax = document.getElementById('tax_value').value;
                inputObj.tax_rate = document.getElementById('tax_rate').value;
                inputObj.department = document.getElementById('department_value').value;
                inputObj.department_no = document.getElementById('department_no').value;
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


function validateInput() {
    var input0Required = true;
    var input1Required = false;
    var validated = false;
    var alphaOnly0 = false;
    var numberOnly0 = false;
    var alphanumeric0 = false;
    var numberOnly1 = false;
    var numericOnly1 = false;
    var alphanumeric1 = false;
    var digitOnly0 = false;
    var digitOnly1 = false;
    var alphaRE = /[^-\w]/;
    var fixedLength0 = 0;
    var fixedLength1 = 0;

    if ('require0' in options) input0Required = options.require0;
    if ('require1' in options) input1Required = options.require1;
    if ('alphaOnly0' in options) alphaOnly0 = options.alphaOnly0;
    if ('numberOnly0' in options) numberOnly0 = options.numberOnly0;
    if ('numberOnly1' in options) numberOnly1 = options.numberOnly1;
    if ('numericOnly1' in options) numericOnly1 = options.numericOnly1;
    if ('digitOnly0' in options) digitOnly0 = options.digitOnly0;
    if ('digitOnly1' in options) digitOnly1 = options.digitOnly1;
    if ('fixedLength0' in options) fixedLength0 = options.fixedLength0;
    if ('fixedLength1' in options) fixedLength1 = options.fixedLength1;
    if ('alphanumeric0' in options) alphanumeric0 = options.alphanumeric0;
    if ('alphanumeric1' in options) alphanumeric1 = options.alphanumeric1;

    var input0 = document.getElementById('input0').value || '';
    var input1 = document.getElementById('input1').value || '';

    var trimmed0 = GeckoJS.String.trim(input0);
    var trimmed1 = GeckoJS.String.trim(input1);
    
    if ((!input0Required || trimmed0.length > 0) &&
        ((!input1Required) || trimmed1.length > 0)) {
        validated = true;
    }

    if (alphaOnly0) {
        validated = validated && !alphaRE.test(trimmed0);
    }
    if (numberOnly0) {
        validated = validated && !isNaN(trimmed0);
    }
    if (numberOnly1) {
        validated = validated && !isNaN(trimmed1);
    }
    if (numericOnly1) {
        validated = validated && trimmed1.replace(/[0-9.]*/, '').length == 0;
    }
    if (digitOnly0) {
        validated = validated && trimmed0.replace(/[0-9]*/, '').length == 0;
    }
    if (digitOnly1) {
        validated = validated && trimmed1.replace(/[0-9]*/, '').length == 0;
    }
    if (fixedLength0 > 0) {
        validated = validated && trimmed0.length == fixedLength0;
    }
    if (fixedLength1 > 1) {
        validated = validated && trimmed1.length == fixedLength1;
    }
    if (alphanumeric0) {
        validated = validated && input0.replace(/\w*/, '').length == 0;
    }
    if (alphanumeric1) {
        validated = validated && input1.replace(/\w*/, '').length == 0;
    }
    document.getElementById('ok').setAttribute('disabled', !validated);

}

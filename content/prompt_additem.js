    var options;

(function(){
    var caption0 = window.arguments[0];
    var text0 = window.arguments[1];
    var title0  = window.arguments[2];
    var title1  = window.arguments[3];
    var inputObj = window.arguments[4];
    var menuTitle = window.arguments[5];
    
    /**
     * Controller Startup
     */
    function startup() {

        var multiline = false;
        if ('multiline0' in inputObj) {
            document.getElementById('input0').setAttribute('multiline', true);
            document.getElementById('row0').setAttribute('flex', 1);
            multiline = true;
        }
        else {
            document.getElementById('input0').setAttribute('multiline', false);
            document.getElementById('row0').setAttribute('flex', 0);
        }

        // open cashdrawer?
        if ('useraction' in inputObj) {
            var btn = document.getElementById('useraction-btn');
            btn.label = inputObj.useractionLabel;
            window.UserAction = inputObj.useraction;
        }
        else {
            document.getElementById('useraction-btn').setAttribute('hidden', true);
        }

        // fixed length?
        if ('fixedLength0' in inputObj) {
            var fixedLength0 = parseInt(inputObj.fixedLength0);
            if (!isNaN(fixedLength0) && fixedLength0 > 0) {
                document.getElementById('input0').setAttribute('maxlength', fixedLength0);
            }
        }

        // fixed length?
        if ('fixedLength1' in inputObj) {
            var fixedLength1 = parseInt(inputObj.fixedLength1);
            if (!isNaN(fixedLength1) && fixedLength1 > 0) {
                document.getElementById('input1').setAttribute('maxlength', fixedLength1);
            }
        }

        // hide input1?
        if (!('input1' in inputObj)) {
            document.getElementById('row1').hidden = true;
            document.getElementById('title1').hidden = true;
            document.getElementById('input1').hidden = true;
            document.getElementById('input1').setAttribute('multiline', false);
        }
        else {
            if ('multiline1' in inputObj) {
                document.getElementById('input1').setAttribute('multiline', true);
                document.getElementById('row1').setAttribute('flex', 1);
                multiline = true;
            }
            else {
                document.getElementById('input1').setAttribute('multiline', false);
                document.getElementById('row1').setAttribute('flex', 0);
            }
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

        // To construct a radio group, please assign an array to inputObj.radioItems; the array is consisted of objects bearing fields value, label, and selected.
        // The last object whose 'selected' property is true will be considered the default selected radio item.
        if (!('radioItems' in inputObj)) {
            document.getElementById('radiorow').hidden = true;
        }
        else {
            var radiogroup = document.getElementById('radiogroup');

            if ( inputObj.radioItems ) {
                var items = inputObj.radioItems;
                for ( var i = 0; i < items.length; i++ ) {
                    var item = items[ i ];
                    var radio = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:radio");
                    radio.setAttribute('value', item.value);
                    radio.setAttribute('label', item.label);
                    radio.setAttribute('flex', 1);
                    radiogroup.appendChild(radio);
                    if ( item.selected ) {
                        radiogroup.selectedIndex = i;
                    }
                }
            }
        }

        if (multiline) {
            // set main-grid and main-rows to flex
            document.getElementById('main-grid').setAttribute('flex', 1);
            document.getElementById('main-rows').setAttribute('flex', 1);
            document.getElementById('single-line-spacer').setAttribute('flex', 0);
        }
        // set input type
        if ('type0' in inputObj) {
            document.getElementById('input0').setAttribute('type', inputObj.type0);
        }
        if ('type1' in inputObj) {
            document.getElementById('input1').setAttribute('type', inputObj.type1);
        }
        if ('readonly0' in inputObj && inputObj.readonly0) {
            document.getElementById('input0').setAttribute('readonly', true);
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

        //enable pricelevel menulist
        if('priceLevel' in inputObj){

           document.getElementById('input0').setAttribute('min', 1);

           var obj = document.getElementById('priceList');

           document.getElementById('priceLevelTitle').value = _('Price Level');

           inputObj.priceLevel.priceLevel.forEach( function(level){

               obj.appendItem(_('Price Level %S', [level]));
           })
           obj.selectedIndex = inputObj.priceLevel.priceLevel.indexOf(inputObj.priceLevel.selected);
        }
        else{
            document.getElementById('priceLevel').setAttribute('hidden', true);
        }

        document.getElementById('dialog-caption').setAttribute("label", caption0);
        document.getElementById('text0').value = text0;
        document.getElementById('title0').value = title0;
        document.getElementById('title1').value = title1;
        document.getElementById('menulabel').value = menuTitle;

        // must use setAttribute; otherwise values would be wiped out by change made to 'multiline'
        document.getElementById('input0').setAttribute('value', inputObj.input0);
        document.getElementById('input0').value = inputObj.input0;
        document.getElementById('input1').setAttribute('value', inputObj.input1);
        document.getElementById('input1').value = inputObj.input1;

        // document.getElementById('cancel').setAttribute('disabled', false);
        var disablecancelbtn = ('disablecancelbtn' in inputObj);
        document.getElementById('cancel').setAttribute('hidden', disablecancelbtn);

        doSetOKCancel(
            function(){
                inputObj.input0 = GeckoJS.String.trim(document.getElementById('input0').value);
                inputObj.input1 = GeckoJS.String.trim(document.getElementById('input1').value);
                inputObj.menu = document.getElementById('menu').value;
                inputObj.radio = document.getElementById('radiogroup').value;
                if('priceLevel' in inputObj)
                inputObj.priceLevel.selected = parseInt(document.getElementById('priceList').selectedIndex) + 1;
                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return !disablecancelbtn;
            }
        );

        validateInput();

        var textNodes = document.getElementsByTagName('textbox');
        if (textNodes != null && textNodes.length > 0) {
            for (var i = 0; i < textNodes.length; i++)
                textNodes[i].addEventListener('focus', gotFocus, false);
        }
        
        document.getElementById('input0').focus();
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

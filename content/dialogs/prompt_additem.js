var promptAdditem_options;

(function(){
   
    /**
     * prompt_additem panel register
     */
    function startup() {

        var $panel = $('#promptAdditemPanel');

        var screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
        var screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;
        
        $.installPanel($panel[0], {
            
            css: {
                left: 0,
                top: 0,

                width: screenwidth,
                'max-width': screenwidth,

                height: screenheight,
                'max-height': screenheight
            },

            init: function(evt) {
                
            /*
                var textNodes = document.getElementsByTagName('textbox');
                if (textNodes != null && textNodes.length > 0) {
                    for (var i = 0; i < textNodes.length; i++)
                        textNodes[i].addEventListener('focus', gotFocus, false);
                }
                */

            },

            load: function(evt) {

                var caption0 = evt.data[0];
                var text0 = evt.data[1];
                var title0  = evt.data[2];
                var title1  = evt.data[3];
                var inputObj = evt.data[4];

                // make inputObj globally available
                promptAdditem_options = inputObj;
                
                if ('multiline0' in inputObj) {
                    document.getElementById('promptAdditem-input0').setAttribute('multiline', true);
                    document.getElementById('promptAdditem-row0').setAttribute('flex', 1);
                    document.getElementById('promptAdditem-input0').setAttribute('rows', isNaN(inputObj.multiline0) ? 3 : inputObj.multiline0);
                }
                else {
                    document.getElementById('promptAdditem-input0').setAttribute('multiline', false);
                    document.getElementById('promptAdditem-row0').setAttribute('flex', 0);
                }

                // fixed length?
                if ('fixedLength0' in inputObj) {
                    var fixedLength0 = parseInt(inputObj.fixedLength0);
                    if (!isNaN(fixedLength0) && fixedLength0 > 0) {
                        document.getElementById('promptAdditem-input0').setAttribute('maxlength', fixedLength0);
                    }
                }

                // fixed length?
                if ('fixedLength1' in inputObj) {
                    var fixedLength1 = parseInt(inputObj.fixedLength1);
                    if (!isNaN(fixedLength1) && fixedLength1 > 0) {
                        document.getElementById('promptAdditem-input1').setAttribute('maxlength', fixedLength1);
                    }
                }

                // hide input1?
                if (!('input1' in inputObj)) {
                    document.getElementById('promptAdditem-row1').hidden = true;
                    document.getElementById('promptAdditem-title1').hidden = true;
                    document.getElementById('promptAdditem-input1').hidden = true;
                    document.getElementById('promptAdditem-input1').setAttribute('multiline', false);
                }
                else {
                    if ('multiline1' in inputObj) {
                        document.getElementById('promptAdditem-input1').setAttribute('multiline', true);
                        document.getElementById('promptAdditem-input1').setAttribute('rows', isNaN(inputObj.multiline1) ? 3 : inputObj.multiline1);
                        document.getElementById('promptAdditem-row1').setAttribute('flex', 1);
                    }
                    else {
                        document.getElementById('promptAdditem-input1').setAttribute('multiline', false);
                        document.getElementById('promptAdditem-row1').setAttribute('flex', 0);
                    }
                }

                // set input type
                if ('type0' in inputObj) {
                    document.getElementById('promptAdditem-input0').setAttribute('type', inputObj.type0);
                }
                if ('type1' in inputObj) {
                    document.getElementById('promptAdditem-input1').setAttribute('type', inputObj.type1);
                }

                if ('readonly0' in inputObj && inputObj.readonly0) {
                    document.getElementById('promptAdditem-input0').setAttribute('readonly', true);
                }

                try {
                    // hide numberpad
                    //document.getElementById('promptAdditem-numpad').setAttribute('hidden', !('numpad' in inputObj));
                    
                    document.getElementById('promptAdditem-dialog-caption').setAttribute("value", caption0);
                    document.getElementById('promptAdditem-text0').value = text0;
                    document.getElementById('promptAdditem-title0').value = title0;
                    document.getElementById('promptAdditem-title1').value = title1;

                    // must use setAttribute; otherwise values would be wiped out by change made to 'multiline'
                    document.getElementById('promptAdditem-input0').setAttribute('value', inputObj.input0);
                    document.getElementById('promptAdditem-input0').value = inputObj.input0;

                    document.getElementById('promptAdditem-input1').setAttribute('value', inputObj.input1);
                    document.getElementById('promptAdditem-input1').value = inputObj.input1;
                    
                    document.getElementById('promptAdditem-cancel').setAttribute('disabled', false);

                    // update listbox
                    var seltextObj = document.getElementById('promptAdditem-seltext');
                    if (inputObj.text) {

                        var seltextsArray = [];
                        var seltexts = inputObj.text.split('|');
                        seltexts.forEach(function(st) {
                            seltextsArray.push({
                                text: st
                            });
                        });
                        seltextObj.datasource = seltextsArray;
                    }else {
                        seltextObj.setAttribute('hidden', 'true');
                    }

                    promptAdditem_validateInput();
                    
                }catch(e) {

                }

            },

            shown: function(evt) {
                document.getElementById('promptAdditem-input0').focus();                
            },

            hide: function (evt) {

                // press escape
                var isOK = typeof evt.data == 'boolean' ? evt.data : false;
                var result = {};

                if(isOK) {
                    result.input0 = GeckoJS.String.trim(document.getElementById('promptAdditem-input0').value);
                    result.input1 = GeckoJS.String.trim(document.getElementById('promptAdditem-input1').value);
                    result.ok = true;

                }else {
                    result.ok = false;
                }
                
                evt.data = result;
            }

        });

    }


    function gotFocus() {
    /*
        var focusedElement = document.commandDispatcher.focusedElement;
        if (focusedElement.tagName == 'html:input' || focusedElement.tagName == 'textbox') {
            focusedElement.select();
        }
        return true;
        */
    }


    window.addEventListener('load', startup, false);

})();

function promptAdditem_clearFocusedElement() {
    var focused = document.commandDispatcher.focusedElement;
    if (focused.tagName == 'html:input' || focused.tagName == 'html:textarea') focused.value = '';
}

// global promptAdditem_validateInput function
function promptAdditem_validateInput() {

    var input0Required = true;
    var input1Required = false;
    var validated = false;
    var alphaOnly0 = false;
    var numberOnly1 = false;
    var numericOnly1 = false;
    var digitOnly0 = false;
    var digitOnly1 = false;
    var alphaRE = /[^-\w]/;
    var fixedLength0 = 0;
    var fixedLength1 = 0;

    if ('require0' in promptAdditem_options) input0Required = promptAdditem_options.require0;
    if ('require1' in promptAdditem_options) input1Required = promptAdditem_options.require1;
    if ('alphaOnly0' in promptAdditem_options) alphaOnly0 = promptAdditem_options.alphaOnly0;
    if ('numberOnly1' in promptAdditem_options) numberOnly1 = promptAdditem_options.numberOnly1;
    if ('numericOnly1' in promptAdditem_options) numericOnly1 = promptAdditem_options.numericOnly1;
    if ('digitOnly0' in promptAdditem_options) digitOnly0 = promptAdditem_options.digitOnly0;
    if ('digitOnly1' in promptAdditem_options) digitOnly1 = promptAdditem_options.digitOnly1;
    if ('fixedLength0' in promptAdditem_options) fixedLength0 = promptAdditem_options.fixedLength0;
    if ('fixedLength1' in promptAdditem_options) fixedLength1 = promptAdditem_options.fixedLength1;

    var input0 = document.getElementById('promptAdditem-input0').value;
    var input1 = document.getElementById('promptAdditem-input1').value;

    var trimmed0 = GeckoJS.String.trim(input0);
    var trimmed1 = GeckoJS.String.trim(input1);

    if ((!input0Required || trimmed0.length > 0) &&
        ((!input1Required) || trimmed1.length > 0)) {
        validated = true;
    }

    if (alphaOnly0) {
        validated = validated && !alphaRE.test(trimmed0);
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
    document.getElementById('promptAdditem-ok').setAttribute('disabled', !validated);

}

function promptAdditem_selectText(index) {

    var seltextObj = document.getElementById('promptAdditem-seltext');
    var textObj = document.getElementById('promptAdditem-input0');
    
    textObj.value = (seltextObj.datasource.data[seltextObj.selectedIndex]).text || '';

}

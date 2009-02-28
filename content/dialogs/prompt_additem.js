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

                // hide input1?
                if (!('input1' in inputObj)) {
                    document.getElementById('promptAdditem-title1').hidden = true;
                    document.getElementById('promptAdditem-input1').hidden = true;
                }

                // set input type
                if ('type0' in inputObj) {
                    document.getElementById('promptAdditem-input0').setAttribute('type', inputObj.type0);
                }
                if ('type1' in inputObj) {
                    document.getElementById('promptAdditem-input1').setAttribute('type', inputObj.type1);
                }

                try {
                    
                    document.getElementById('promptAdditem-dialog-caption').setAttribute("label", caption0);
                    document.getElementById('promptAdditem-text0').value = text0;
                    document.getElementById('promptAdditem-title0').value = title0;
                    document.getElementById('promptAdditem-title1').value = title1;
                    document.getElementById('promptAdditem-input0').value = inputObj.input0;
                    document.getElementById('promptAdditem-input1').value = inputObj.input1;
                    document.getElementById('promptAdditem-cancel').setAttribute('disabled', false);

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

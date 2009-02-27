var creditcardRemark_options;

(function(){

    /**
     * creditcard_remark panel register
     */
    function startup() {

        var $panel = $('#creditcardRemarkPanel');

        $.installPanel($panel[0], {

            css: {
                width: '640px',
                height: '560px'
            },

            init: function(evt) {

                document.getElementById('creditcardRemark-clearBtn').addEventListener('command', clearTextBox, false);

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
                creditcardRemark_options = inputObj;

                try {
                    document.getElementById('creditcardRemark-dialog-caption').setAttribute("label", caption0);
                    document.getElementById('creditcardRemark-text0').value = text0;
                    document.getElementById('creditcardRemark-title0').value = title0;
                    document.getElementById('creditcardRemark-title1').value = title1;
                    document.getElementById('creditcardRemark-input0').value = inputObj.input0;
                    document.getElementById('creditcardRemark-input1').value = inputObj.input1;
                    document.getElementById('creditcardRemark-cancel').setAttribute('disabled', false);

                    creditcardRemark_validateInput();
                
                }catch(e) {

                }

            },

            shown: function(evt) {
                
                var inputObj = evt.data[4];

                if (inputObj.input0 != '')
                    document.getElementById('creditcardRemark-input1').focus();
                else
                    document.getElementById('creditcardRemark-input0').focus();

            },


            hide: function (evt) {

                // press escape
                var isOK = typeof evt.data == 'boolean' ? evt.data : false;
                var result = {};

                if(isOK) {

                    result.input0 = GeckoJS.String.trim(document.getElementById('creditcardRemark-input0').value);
                    result.input1 = GeckoJS.String.trim(document.getElementById('creditcardRemark-input1').value);
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

    function clearTextBox() {

        var focusedElement = document.commandDispatcher.focusedElement;
        focusedElement.value = '';

    }


    window.addEventListener('load', startup, false);

})();


// global creditcardRemark_validateInput function
function creditcardRemark_validateInput() {

    var input0Required = true;
    var input1Required = false;
    var validated = false;

    if ('require0' in creditcardRemark_options) input0Required = creditcardRemark_options.require0;
    if ('require1' in creditcardRemark_options) input1Required = creditcardRemark_options.require1;

    var input0 = document.getElementById('creditcardRemark-input0').value;
    var input1 = document.getElementById('creditcardRemark-input1').value;
    var trimmed0 = GeckoJS.String.trim(input0);
    var trimmed1 = GeckoJS.String.trim(input1);

    if ((!input0Required || trimmed0.length > 0) &&
        ((!input1Required) || trimmed1.length > 0)) {
        validated = true;
    }
    document.getElementById('creditcardRemark-ok').setAttribute('disabled', !validated);

}

var couponRemark_options;

(function(){

    /**
     * creditcard_remark panel register
     */
    function startup() {

        var $panel = $('#couponRemarkPanel');

        $.installPanel($panel[0], {

            css: {
                width: '640px',
                height: '560px'
            },

            init: function(evt) {

               document.getElementById('couponRemark-clearBtn').addEventListener('command', clearTextBox, false);

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
                couponRemark_options = inputObj;

                try {
                    document.getElementById('couponRemark-dialog-caption').setAttribute("label", caption0);
                    document.getElementById('couponRemark-text0').value = text0;
                    document.getElementById('couponRemark-title0').value = title0;
                    document.getElementById('couponRemark-title1').value = title1;
                    document.getElementById('couponRemark-input0').value = inputObj.input0;
                    document.getElementById('couponRemark-input1').value = inputObj.input1;
                    document.getElementById('couponRemark-cancel').setAttribute('disabled', false);

                    couponRemark_validateInput();


                }catch(e) {

                }


            },

            shown: function(evt) {

                var inputObj = evt.data[4];

                if (inputObj.input0 != '')
                    document.getElementById('couponRemark-input1').focus();
                else
                    document.getElementById('couponRemark-input0').focus();

            },


            hide: function (evt) {

                // press escape
                var isOK = typeof evt.data == 'boolean' ? evt.data : false;
                var result = {};

                if(isOK) {

                    result.input0 = GeckoJS.String.trim(document.getElementById('couponRemark-input0').value);
                    result.input1 = GeckoJS.String.trim(document.getElementById('couponRemark-input1').value);
                    result.ok = true;

                }else {
                    result.ok = false;
                }

                evt.data = result;
            }

        });

    }


    function gotFocus() {
        var focusedElement = document.commandDispatcher.focusedElement;
        if (focusedElement.tagName == 'html:input' || focusedElement.tagName == 'textbox') {
            focusedElement.select();
        }
        return true;
    }

    function clearTextBox() {

        var focusedElement = document.commandDispatcher.focusedElement;
        focusedElement.value = '';

    }


    window.addEventListener('load', startup, false);

})();


// global couponRemark_validateInput function
function couponRemark_validateInput() {

    var input0Required = true;
    var input1Required = false;
    var validated = false;

    if ('require0' in couponRemark_options) input0Required = couponRemark_options.require0;
    if ('require1' in couponRemark_options) input1Required = couponRemark_options.require1;

    var input0 = document.getElementById('couponRemark-input0').value;
    var input1 = document.getElementById('couponRemark-input1').value;
    var trimmed0 = GeckoJS.String.trim(input0);
    var trimmed1 = GeckoJS.String.trim(input1);

    if ((!input0Required || trimmed0.length > 0) &&
        ((!input1Required) || trimmed1.length > 0)) {
        validated = true;
    }
    document.getElementById('couponRemark-ok').setAttribute('disabled', !validated);

}

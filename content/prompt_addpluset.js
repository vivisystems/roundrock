var options = {};

(function(){
    var caption0 = window.arguments[0];
    var text0 = window.arguments[1];
    var title0  = window.arguments[2];
    var title1  = window.arguments[3];
    var inputObj = window.arguments[4];
    
    /**
     * Controller Startup
     */
    function startup() {
        document.getElementById('caption0').setAttribute("label", caption0);
        document.getElementById('text0').value = text0;
        document.getElementById('title0').value = title0;
        document.getElementById('title1').value = title1;
        document.getElementById('input0').value = inputObj.input0;
        document.getElementById('input1').value = inputObj.input1;

        options = inputObj;

        doSetOKCancel(
            function(){
                inputObj.input0 = document.getElementById('input0').value.replace(/^\s*/g, '').replace(/\s*$/g, '');
                inputObj.input1 = document.getElementById('input1').value.replace(/^\s*/g, '').replace(/\s*$/g, '');
                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return true;
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

})();

function validateInput() {
    var input0Required = true;
    var input1Required = false;
    var validated = false;

    if ('require0' in options) input0Required = options.require0;
    if ('require1' in options) input1Required = options.require1;

    var input0 = document.getElementById('input0').value;
    var input1 = document.getElementById('input1').value;
    var trimmed0 = '';
    var trimmed1 = '';
    try {
        var trimmed0 = input0.replace(/^\s*/g, '').replace(/\s*$/g, '');
        var trimmed1 = input1.replace(/^\s*/g, '').replace(/\s*$/g, '');
    }
    catch (e) {}

    if ((!input0Required || trimmed0.length > 0) &&
        ((!input1Required) || trimmed1.length > 0)) {
        validated = !isNaN(trimmed1);
    }
    document.getElementById('ok').setAttribute('disabled', !validated);

}

var options;

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

        // hide input1?
        if (!('input1' in inputObj)) {
            document.getElementById('title1').hidden = true;
            document.getElementById('input1').hidden = true;
        }

        // set input type
        if ('type0' in inputObj) {
            document.getElementById('input0').setAttribute('type', inputObj.type0);
        }
        if ('type1' in inputObj) {
            document.getElementById('input1').setAttribute('type', inputObj.type1);
        }
        
        document.getElementById('dialog-caption').setAttribute("label", caption0);
        document.getElementById('text0').value = text0;
        document.getElementById('title0').value = title0;
        document.getElementById('title1').value = title1;
        document.getElementById('input0').value = inputObj.input0;
        document.getElementById('input1').value = inputObj.input1;
        document.getElementById('cancel').setAttribute('disabled', false);

        doSetOKCancel(
            function(){
                inputObj.input0 = document.getElementById('input0').value.replace(/^\s*/g, '').replace(/\s*$/g, '');
                inputObj.input1 = document.getElementById('input1').value.replace(/^\s*/g, '').replace(/\s*$/g, '');;
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

    // make inputObj globally available
    options = inputObj;
})();


function validateInput() {
    var input0Required = true;
    var input1Required = false;
    var validated = false;
    var alphaOnly0 = false;
    var numberOnly1 = false;
    var alphaRE = /[^\w]/;

    if ('require0' in options) input0Required = options.require0;
    if ('require1' in options) input1Required = options.require1;
    if ('alphaOnly0' in options) alphaOnly0 = options.alphaOnly0;
    if ('numberOnly1' in options) numberOnly1 = options.numberOnly1;

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
        validated = true;
    }
    if (alphaOnly0) {
        validated = validated && !alphaRE.test(trimmed0);
    }
    if (numberOnly1) {
        validated = validated && !isNaN(trimmed1);
    }
    document.getElementById('ok').setAttribute('disabled', !validated);

}
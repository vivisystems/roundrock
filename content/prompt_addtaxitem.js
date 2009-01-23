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
        document.getElementById('dialog-caption').setAttribute("label", caption0);
        document.getElementById('text0').value = text0;
        document.getElementById('title0').value = title0;
        document.getElementById('title1').value = title1;
        document.getElementById('input0').value = inputObj.input0;
        document.getElementById('input1').value = inputObj.input1;

        document.getElementById('type_included').label = inputObj.included;
        document.getElementById('type_addon').label = inputObj.addon;
        document.getElementById('type_combine').label = inputObj.combine;
        document.getElementById('type_vat_on_vat').label = inputObj.vat_on_vat;
        document.getElementById('cancel').setAttribute('disabled', false);
        
        document.getElementById('input0').focus();
        
        doSetOKCancel(
            function(){
                inputObj.input0 = GeckoJS.String.trim(document.getElementById('input0').value);
                inputObj.input1 = GeckoJS.String.trim(document.getElementById('input1').value);
                inputObj.rate_type = document.getElementById('rate_type').value.replace(/^\s*/g, '').replace(/\s*$/g, '');
                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return true;
            }
            );
        validateInput();

    };
    options = inputObj;

    
    window.addEventListener('load', startup, false);

})();

function validateInput() {
    var input0Required = true;
    var input1Required = false;
    var validated = false;
    var alphaOnly0 = false;
    var alphaRE = /[^\w]/;

    if ('require0' in options) input0Required = options.require0;
    if ('require1' in options) input1Required = options.require1;
    if ('alphaOnly0' in options) alphaOnly0 = options.alphaOnly0;

    var input0 = document.getElementById('input0').value;
    var input1 = document.getElementById('input1').value;
    var trimmed0 = GeckoJS.String.trim(input0);
    var trimmed1 = GeckoJS.String.trim(input1);
    
    if ((!input0Required || trimmed0.length > 0) &&
        ((!input1Required) || trimmed1.length > 0)) {
        validated = true;
    }
    if (alphaOnly0) {
        validated = validated && !alphaRE.test(trimmed0);
    }
    document.getElementById('ok').setAttribute('disabled', !validated);

}
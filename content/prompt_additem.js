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

        if (!('input1' in inputObj)) {
            document.getElementById('title1').hidden = true;
            document.getElementById('input1').hidden = true;
        }
        
        document.getElementById('caption0').setAttribute("label", caption0);
        document.getElementById('text0').value = text0;
        document.getElementById('title0').value = title0;
        document.getElementById('title1').value = title1;
        document.getElementById('input0').value = inputObj.input0;
        document.getElementById('input1').value = inputObj.input1;

        doSetOKCancel(
            function(){
                inputObj.input0 = document.getElementById('input0').value;
                inputObj.input1 = document.getElementById('input1').value;
                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return true;
            }
            );

        document.getElementById('input0').focus();
    };

    window.addEventListener('load', startup, false);

})();



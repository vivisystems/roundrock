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
        document.getElementById('combinetax').checked = inputObj.combinetax;

        doSetOKCancel(
            function(){
                inputObj.input0 = document.getElementById('input0').value;
                inputObj.input1 = document.getElementById('input1').value;
                inputObj.combinetax = document.getElementById('combinetax').checked;
                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return true;
            }
            );

    };

    window.addEventListener('load', startup, false);

})();



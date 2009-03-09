(function(){
    var inputObj = window.arguments[0];
    
    /**
     * Controller Startup
     */
    function startup() {

        document.getElementById('current_sale_period').value = inputObj.current_sale_period;
        document.getElementById('current_shift_number').value = inputObj.current_shift_number;
        document.getElementById('last_sale_period').value = inputObj.last_sale_period;
        document.getElementById('last_shift_number').value = inputObj.last_shift_number;

    };

    window.addEventListener('load', startup, false);

})();

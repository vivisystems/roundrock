(function(){

    // include controllers  and register itself

    GeckoJS.include('chrome://viviecr/content/controllers/datetime_controller.js');

    /**
     * Controller Startup
     */
    function startup() {
       

        doSetOKCancel(
            function(){

                var datetimepicker = $('#datetime')[0];
                var timezones = $('#timezones')[0];

                alert(datetimepicker.value + (new Date(datetimepicker.value).toUTCString()));
                alert(timezones.selectedTimezone + ' [' + timezones.currentTimezone + ']');
                alert('done');
                return true;
            },
            function(){
                return true;
            }
        );
    };
    
    window.addEventListener('load', startup, false);

})();

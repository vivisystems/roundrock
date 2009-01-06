(function(){

    /**
     * Controller Startup
     */
    function startup() {

        var dt = document.getElementById('datetime');
        dt.intervalId = setInterval(setTime, 1000);

        function setTime() {
            dt.value = dt.value + 1000;
        }

        doSetOKCancel(
            function(){

                var datetimepicker = $('#datetime')[0];
                var timezones = $('#timezones')[0];

                var dt = new Date(datetimepicker.value);
                var dtStr = dt.toLocaleFormat('%Y%m%d %H:%M:%S');

                var timezone = timezones.selectedTimezone;
                //var region = timezone[0];
                //var city = timezone[1];

                var scriptPath = GeckoJS.Configure.read('vivipos.fec.settings.script.path') || '/data/scripts/';
                var scriptDateTime = GeckoJS.Configure.read('vivipos.fec.settings.script.datetime') || 'setdatetime';

                clearInterval(setTime);

                var cmdLine = scriptPath + scriptDateTime + ' "' + dtStr + '" "' + timezone + '"';

                try {
                    var script = new GeckoJS.File(scriptPath + scriptDateTime);
                    script.run([dtStr, timezone]);

                    script.close();
                }
                catch (e) {
                    //@todo OSD

                    NotifyUtils.warn(_('Failed to setting date/time'));
                }
                return true;
            },
            function(){
                clearInterval(setTime);
                return true;
            }
        );
    };
    
    window.addEventListener('load', startup, false);

})();

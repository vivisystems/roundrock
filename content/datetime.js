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
                var timezonepicker = $('#timezones')[0];

                timezonepicker.changeOSTimezone();

                var dt = new Date(datetimepicker.value);
                var dtStr = dt.toLocaleFormat('%Y%m%d %H:%M:%S');

                var timezone = timezonepicker.selectedTimezone;
                
                // confirm date/time/timezone change
                if (GREUtils.Dialog.confirm(null, _('confirm date/time/timezone change'),
                                                  _('Date/Time/Timezone changes require system restart to take effect. If you save the changes now, the system will restart automatically after you return to the Main Screen. Do you want to save your changes?')
                                                  )) {
                    GeckoJS.Observer.notify(null, 'prepare-to-restart', this);
                }
                else {
                    return false;
                }

                var scriptPath = GeckoJS.Configure.read('vivipos.fec.settings.script.path') || '/data/scripts/';
                var scriptDateTime = GeckoJS.Configure.read('vivipos.fec.settings.script.datetime') || 'setdatetime';

                clearInterval(setTime);

                var cmdLine = scriptPath + scriptDateTime + ' "' + dtStr + '" "' + timezone + '"';

                try {
                    var script = new GeckoJS.File(scriptPath + scriptDateTime);
                    script.run([dtStr, timezone]);
                    script.close();
                    GeckoJS.Observer.notify(null, 'prepare-to-restart', this);
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

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

                var oldTimezone = timezonepicker.currentTimezone;
                var newTimezone = timezonepicker.selectedTimezone;
                var timezoneChanged = oldTimezone != newTimezone;

                var topwin = GREUtils.XPCOM.getUsefulService("window-mediator").getMostRecentWindow(null);

                if (timezoneChanged) {
                    // confirm date/time/timezone change
                    if (!GREUtils.Dialog.confirm(topwin, _('confirm timezone change'),
                                                         _('Timezone change requires system restart to take effect. If you save the changes now, the system will restart automatically after you return to the Main Screen. Do you want to save your changes?')
                                                         )) {
                        return false;
                    }

                    GeckoJS.Observer.notify(null, 'prepare-to-restart', this);
                    timezonepicker.changeOSTimezone();
                }

                var dt = new Date(datetimepicker.value);
                var dtStr = dt.toLocaleFormat('%Y%m%d %H:%M:%S');

                clearInterval(setTime);

                try {
                    var script = new GeckoJS.File('/bin/date');
                    script.run(['-s', dtStr]);
                    script.close();
                    GeckoJS.Observer.notify(null, 'restart-clock', this);
                }
                catch (e) {
                    //@todo OSD

                    NotifyUtils.warn(_('Failed to set date/time'));
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

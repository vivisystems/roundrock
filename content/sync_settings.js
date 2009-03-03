(function(){

    /**
     * Controller Startup
     */
    function startup() {

        $do('initial', false, 'SyncSettings');

        doSetOKCancel(
            function(){
                var data = {
                    cancel: false
                };

                var changed = true;

                if (changed) {
                    if (GREUtils.Dialog.confirm(null, _('confirm synchronize settings change'),
                        _('Synchronize settings changes require system restart to take effect. If you save the changes now, the system will restart automatically after you return to the Main Screen. Do you want to save your changes?')
                        )) {

                        $do('save', data, 'SyncSettings');

                        GeckoJS.Observer.notify(null, 'prepare-to-restart', this);

                    }
                    else {
                        return false;
                    }
                }

                return !data.cancel;
            },

            function(){
                return true;
            }
            );
    };
    

    window.addEventListener('load', startup, false);

})();

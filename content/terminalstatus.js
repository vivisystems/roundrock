(function(){

    /**
     * Controller Startup
     */
    function startup() {
        GeckoJS.Configure.loadPreferences('vivipos.fec.settings');
        var tID = GeckoJS.Configure.read('vivipos.fec.settings.TerminalID');
        var tIDNode = document.getElementById('terminal_id');

        //tIDNode.value = GREUtils.Charset.convertToUnicode(tID, 'UTF-8');
        tIDNode.value = tID;

        this.eventHandler = function(evt) {
            //GREUtils.log('[CHANGE]: entering <' + evt.getType() + '> + <' + GeckoJS.BaseObject.dump(evt.getData()) + '>');

            switch (evt.getType()) {

                case 'write':
                    var value = evt.getData().value;
                    var key = evt.getData().key;

                    if (key == 'vivipos.fec.settings.TerminalID') {
                        //tIDNode.value = GREUtils.Charset.convertToUnicode(value, 'UTF-8');
                        tIDNode.value = value;
                    }
                    break;

                case 'remove':
                    var key = evt.getData();
                    if (key == 'vivipos.fec.settings.TerminalID') {
                        tIDNode.value = '';
                    }
                    break;

                case 'clear':
                    tIDNode.value = '';
                    break;
            }
        };

        this.events = GeckoJS.Configure.getInstance().events;
        if (this.events) {
            this.events.addListener('write', this.eventHandler, this);
            this.events.addListener('remove', this.eventHandler, this);
            this.events.addListener('clear', this.eventHandler, this);
        }
        else {
        }
    };

    window.addEventListener('load', startup, false);

})();

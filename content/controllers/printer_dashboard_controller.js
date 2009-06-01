(function(){

    /**
     * Print Controller
     */

    var __controller__ = {

        name: 'PrinterDashboard',

        load: function(devices) {
            if (devices != null) {

                // set toggle mode
                var toggleMode = GeckoJS.Session.get('printer-dashboard-toggle-mode');
                if (!toggleMode) {
                    toggleMode = 'popup';
                    GeckoJS.Session.set('printer-dashboard-toggle-mode', toggleMode);
                }
                document.getElementById('toggle-mode').value = toggleMode;

                // create receipt printer icons
                var receiptRow = document.getElementById('receipt-row');
                if (receiptRow) {
                    for (var i = 1; true; i++) {
                        if ('receipt-' + i + '-enabled' in devices) {

                            // create icon button for this device
                            var btn = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:button");
                            btn.setAttribute('type', 'checkbox');
                            btn.setAttribute('label', i);
                            btn.setAttribute('class', 'printerStatus')

                            // is device enabled?
                            btn.setAttribute('disabled', !devices['receipt-' + i + '-enabled']);

                            // is device suspended?
                            if (!GeckoJS.Session.get('receipt-' + i + '-suspended')) {
                                btn.setAttribute('checked', true);
                            }

                            // add command to toggle suspended state
                            btn.setAttribute('oncommand', '$do("toggleReceipt", ' + i + ', "PrinterDashboard")');

                            receiptRow.appendChild(btn);
                        }
                        else {
                            break;
                        }
                    }
                }

                // create check printer icons
                var checkRow = document.getElementById('check-row');
                if (checkRow) {
                    for (var i = 1; true; i++) {
                        if ('check-' + i + '-enabled' in devices) {

                            // create icon button for this device
                            var btn = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:button");
                            btn.setAttribute('type', 'checkbox');
                            btn.setAttribute('label', i);
                            btn.setAttribute('class', 'printerStatus')

                            // is device enabled?
                            btn.setAttribute('disabled', !devices['check-' + i + '-enabled']);

                            // is device suspended?
                            if (!GeckoJS.Session.get('check-' + i + '-suspended')) {
                                btn.setAttribute('checked', true);
                            }

                            // add command to toggle suspended state
                            btn.setAttribute('oncommand', '$do("toggleCheck", ' + i + ', "PrinterDashboard")');

                            checkRow.appendChild(btn);
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        },

        setToggleMode: function(mode) {
            GeckoJS.Session.set('printer-dashboard-toggle-mode', mode);
        },

        toggle: function(type, index) {
            var key = type + '-' + index + '-suspended';
            var state = GeckoJS.Session.get(key) || false;
            GeckoJS.Session.set(key, !state);
        },

        toggleReceipt: function(index) {
            this.toggle('receipt', index);
        },

        toggleCheck: function(index) {
            this.toggle('check', index);
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();

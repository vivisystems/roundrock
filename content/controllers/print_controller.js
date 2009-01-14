(function(){

    /**
     * Print Controller
     */

    GeckoJS.Controller.extend( {
        name: 'Print',

        _templates: null,
        _ports: null,
        _portspeeds: null,
        _devicemodels: null,
        _deviceCommands: null,
        _selectedDevices: null,
        _sortedDevicemodels: null,
        _portControlService: null,

        // load device configuration and selections
        initial: function () {

            // load templates
            this.getTemplates();

            // load device ports
            this.getPorts();

            // load port speeds
            this.getPortSpeeds();

            // load device models
            this.getDeviceModels();

            // device selections and device commands are dynamic data and are loaded
            // from session during each print event

            // add event listener for beforeSubmit events
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if(cart) {
                cart.addEventListener('beforeSubmit', this.beforeSubmit, this);
            }
        },

        // get cache devices
        getSelectedDevices: function () {
            var selectedDevices = GeckoJS.Configure.read('vivipos.fec.settings.selectedDevices') || '';
            if (selectedDevices != null && selectedDevices.length > 0) {
                try {
                    selectedDevices = GeckoJS.BaseObject.unserialize(selectedDevices);
                }
                catch(e) {
                    selectedDevices = '';
                }
            }
            return selectedDevices;
        },

        // get cache device commands
        getDeviceCommands: function () {
            return GeckoJS.Session.get('deviceCommands') || {};
        },

        // open serial port for writing
        openSerialPort: function (path, speed) {
            var portControl = this.getSerialPortControlService();
            if (portControl != null) {
                try {
                    portControl.openPort(path, speed + ',n,8,1,h');
                    return true;
                }
                catch(e) {
                    return false;
                }
            }
            else {
                return false;
            }
        },

        // close serial port
        closeSerialPort: function (path) {
            var portControl = this.getSerialPortControlService();
            if (portControl != null) {
                try {
                    portControl.closePort(path);
                    return true;
                }
                catch(e) {
                    return false;
                }
            }
            else {
                return false;
            }
        },

        // return port control service object
        getSerialPortControlService: function() {
            if (this._portControlService == null) {
                this._portControlService = GREUtils.XPCOM.getService("@firich.com.tw/serial_port_control_unix;1", "nsISerialPortControlUnix");
            }
            return this._portControlService;
        },

        // return template registry objects
        getTemplates: function () {
            if (this._templates == null) {
                this._templates = GeckoJS.Configure.read('vivipos.fec.registry.templates');
            }
            return this._templates;
        },

        // return port registry objects
        getPorts: function () {
            if (this._ports == null) {
                this._ports = GeckoJS.Configure.read('vivipos.fec.registry.ports');
            }
            return this._ports;
        },

        // return list of port speeds
        getPortSpeeds: function () {
            if (this._portspeeds == null) {
                this._portspeeds = GeckoJS.Configure.read('vivipos.fec.registry.portspeeds');
                if (this._portspeeds != null) this._portspeeds = this._portspeeds.split(',');
            }
            return this._portspeeds;
        },

        // return device model registry objects
        getDeviceModels: function () {
            if (this._devicemodels == null) {
                this._devicemodels = GeckoJS.Configure.read('vivipos.fec.registry.devicemodels');
            }
            return this._devicemodels;
        },

        // handle order submit events
        beforeSubmit: function(evt) {
            this.log('B4 SUBMIT: ' + GeckoJS.BaseObject.dump(evt.data.data));

            // for each enabled printer device, check if autoprint is on
            var selectedDevices = this.getSelectedDevices();
            this.log('B4 SUBMIT: ' + GeckoJS.BaseObject.dump(selectedDevices));

            // check if receipt already printed
            if (evt.data.data['receipt_printed'] == null) {
                if (selectedDevices != null) {
                    if (selectedDevices['receipt-1-enabled'] && selectedDevices['receipt-1-autoprint']) {
                        var template = selectedDevices['receipt-1-template'];
                        var port = selectedDevices['receipt-1-port'];
                        var speed = selectedDevices['receipt-1-portspeed'];
                        var devicemodel = selectedDevices['receipt-1-devicemodel'];
                        this.printCheck(evt.data.data, template, port, speed, devicemodel);
                    }

                    if (selectedDevices['receipt-2-enabled'] && selectedDevices['receipt-2-autoprint']) {
                        var template = selectedDevices['receipt-2-template'];
                        var port = selectedDevices['receipt-2-port'];
                        var speed = selectedDevices['receipt-2-portspeed'];
                        var devicemodel = selectedDevices['receipt-2-devicemodel'];
                        this.printCheck(evt.data.data, template, port, speed, devicemodel);
                    }
                }
                var now = (new Date()).getTime();
                evt.data.data['receipt_printed'] = (new Date()).getTime();
                this.log('B4 SUBMIT [' + now + ']: ' + GeckoJS.BaseObject.dump(evt.data.data));
            }
        },

        // print check using the given parameters
        printCheck: function(order, template, port, speed, devicemodel) {
            alert('Printing check: \n\n' +
                  '   template [' + template + ']\n' +
                  '   port [' + port + ']\n' +
                  '   speed [' + speed + ']\n' +
                  '   model [' + devicemodel + ']');
        }

    });

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('onInitial', function() {
                                            main.requestCommand('initial', null, 'Print');
                                      });

    }, false);


})();

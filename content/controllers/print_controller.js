(function(){

    GeckoJS.include('chrome://viviecr/content/devices/deviceTemplate.js');

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
                    return (portControl.openPort(path, speed + ',n,8,1,h') != -1);
                }
                catch(e) {
                    return false;
                }
            }
            else {
                return false;
            }
        },

        writeSerialPort: function (path, buf) {
            var portControl = this.getSerialPortControlService();
            if (portControl != null) {
                try {
                    return (portControl.writePort(path, buf, buf.length) != -1);
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

            var printed = false;
            var order = evt.data.data;

            // check if receipt already printed
            if (order['receipt_printed'] == null) {
                printed = this.printChecks(evt.data);
                if (printed) evt.data.data['receipt_printed'] = (new Date()).getTime();
            }
        },

        printChecks: function(txn) {

            var selectedDevices = this.getSelectedDevices();
            var printed = false;
            /*
             *
             * add support attributes to order object:
             *
             * - create_date: Date object created from the created attribute
             * - print_date: Date object representing current time
             * - proceeds_clerk
             * - proceeds_clerk_displayname
             *
             * - store details:
             *   - store name
             *   - store contact
             *   - telephone1
             *   - telephone2
             *   - address1
             *   - address2
             *   - city
             *   - county
             *   - province
             *   - state
             *   - country
             *   - zip
             *   - fax
             *   - email
             *   - note
             */
            var now = new Date();
            var order = txn.data;
            order.create_date = new Date(order.created);
            order.print_date = new Date();

            // order.store = GeckoJS.Session.get('storeDetails');
            order.store = {
                name: 'VIVISHOP',
                contact: 'VIVIPOS Team',
                telephone1: '+886 2 2698-1446',
                telephone2: '+886 930 858 972',
                address1: '10F, No. 75, Sec 1',
                address2: 'Sin Tai Wu Road',
                city: 'Sijhih City',
                county: 'Taipei County',
                zip: '221',
                country: 'Taiwan, R.O.C.',
                fax: '+886 2 2698-3573',
                email: 'sales@vivipos.com',
                note: 'Vivid You POS!'
            }

            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null ) {
                order.proceeds_clerk = user.username;
                order.proceeds_clerk_displayname = user.description;
            }
            txn._MODIFIERS = this._MODIFIERS;

            //this.log(this.dump(selectedDevices));
            //this.log(this.dump(txn));

            // for each enabled printer device, check if autoprint is on
            if (selectedDevices != null) {
                if (selectedDevices['receipt-1-enabled'] && selectedDevices['receipt-1-autoprint']) {
                    var template = selectedDevices['receipt-1-template'];
                    var port = selectedDevices['receipt-1-port'];
                    var speed = selectedDevices['receipt-1-portspeed'];
                    var devicemodel = selectedDevices['receipt-1-devicemodel'];
                    var encoding = selectedDevices['receipt-1-encoding'];
                    printed = this.printCheck(txn, template, port, speed, devicemodel, encoding);
                }

                if (selectedDevices['receipt-2-enabled'] && selectedDevices['receipt-2-autoprint']) {
                    var template = selectedDevices['receipt-2-template'];
                    var port = selectedDevices['receipt-2-port'];
                    var speed = selectedDevices['receipt-2-portspeed'];
                    var devicemodel = selectedDevices['receipt-2-devicemodel'];
                    var encoding = selectedDevices['receipt-2-encoding'];
                    if (this.printCheck(txn, template, port, speed, devicemodel, encoding)) {
                        printed = true;
                    }
                }
            }
            return printed;
        },

        getTemplateData: function(template, path, useCache) {
            var tpl;

            if (useCache) {
                var cachedTemplates = GeckoJS.Session.get('deviceTemplates');
            
                if (cachedTemplates != null) {
                    tpl = cachedTemplates[template];
                }
            }

            if (tpl == null || tpl.length == 0) {
                try {
                    var file = GREUtils.File.getFile(path);
                    tpl = GREUtils.File.readAllBytes(file);
                }
                catch(e) {};
            }
            return tpl;
        },

        _MODIFIERS: {
            center: function(str, width) {
                if (width == null || isNaN(width) || width < 0) return str;

                width = Math.floor(Math.abs(width));
                var len = (str == null) ? 0 : str.length;

                if (width < len) {
                    str = str.substr(0, width);
                    len = width;
                }
                var leftPaddingWidth = Math.floor((width - len) / 2);
                return GeckoJS.String.padRight(GeckoJS.String.padLeft(str, leftPaddingWidth - (- len) , ' '), width, ' ');
            },

            left: function(str, width) {
                if (width == null || isNaN(width)) return str;

                width = Math.floor(Math.abs(width));
                var len = (str == null) ? 0 : str.length;

                if (width < len) {
                    return str.substr(0, width);
                }
                else {
                    return GeckoJS.String.padRight(str, width, ' ');
                }
            },

            right: function(str, width) {
                if (width == null || isNaN(width)) return str;

                width = Math.floor(Math.abs(width));
                var len = (str == null) ? 0 : str.length;

                if (width < len) {
                    return str.substr(0, width);
                }

                return GeckoJS.String.padLeft(str, width, ' ');
            },

            truncate: function(str, width) {
                if (width == null || isNaN(width)) return str;

                width = Math.floor(Math.abs(width));
                var len = (str == null) ? 0 : str.length;

                if (width >= len) return str;

                return str.substr(0, width);
            }
        },

        // print check using the given parameters
        printCheck: function(txn, template, port, speed, devicemodel, encoding) {

            var templates = this.getTemplates();
            var ports = this.getPorts();
            var order = txn.data;
            var templateChromePath;
            var templatePath;
            var portPath;

            // make sure required paths all exist
            try {
                templateChromePath = (template == null || templates == null) ? null : templates[template].path;
                templatePath = GREUtils.File.chromeToPath(templateChromePath);
            }
            catch(e) {
            }

            portPath = (port == null || ports == null) ? null : ports[port].path;
            if (portPath == null || portPath == '') {
                NotifyUtils.error(_('Specified device port [%S] does not exist!', [port]));
                return false;
            }

            var tpl = this.getTemplateData(template, templatePath, false);
            if (tpl == null || tpl == '') {
                NotifyUtils.error(_('Specified receipt/guest check template [%S] is empty or does not exist!', [template]));
                return false;
            }
/*
            alert('Printing check: \n\n' +
                  '   template [' + template + ' (' + templatePath + ')]\n' +
                  '   port [' + port + ' (' + portPath + ')]\n' +
                  '   speed [' + speed + ']\n' +
                  '   model [' + devicemodel + ']\n' +
                  '   encoding [' + encoding + ']\n' +
                  '   template content: ' + this.dump(tpl));
*/
            
            var result = tpl.process(txn);

            // get encoding
            var encodedResult = GREUtils.Charset.convertFromUnicode(result, encoding);
            //this.log('\n' + encodedResult);
            
            // translate printer commands into actual command codes

            // send to output device
            var printed = false;
            if (this.openSerialPort(portPath, speed)) {
                if (this.writeSerialPort(portPath, encodedResult)) {
                    printed = true;
                }
                this.closeSerialPort(portPath);
            }
            else {
                printed = false;
            }
            
            if (!printed) {
                var devicemodels = this.getDeviceModels();
                var devicemodelName = (devicemodels == null) ? 'unknown' : devicemodels[devicemodel].label;
                var portName = (ports == null) ? 'unknown' : ports[port].label;

                if (devicemodelName == null) devicemodelName = 'unknown';
                if (portName == null) portName = 'unknown';

                //@todo OSD
                NotifyUtils.error(_('Unable to print to device [%S] at port [%S]', [devicemodelName, portName]));
            }
            return printed;
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

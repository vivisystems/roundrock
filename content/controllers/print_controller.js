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
        openSerialPort: function (path, speed, handshakingDisabled) {
            var portControl = this.getSerialPortControlService();
            var handshake = (handshakingDisabled == true) ? 'n' : 'h';
            if (portControl != null) {
                try {
                    return (portControl.openPort(path, speed + ',n,8,1,' + handshake) != -1);
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
            var len = -1;
            if (portControl != null) {
                try {
                    return (portControl.writePort(path, buf, buf.length));
                }
                catch(e) {
                }
            }
            return len;
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

        getTemplateData: function(template, templates, useCache) {
            var tpl;
            var cachedTemplates = GeckoJS.Session.get('deviceTemplates');

            if (useCache) {

                if (cachedTemplates != null) {
                    tpl = cachedTemplates[template];
                }
            }

            if ((tpl == null || tpl.length == 0) && templates != null && templates[template] != null) {
                var deviceController = GeckoJS.Controller.getInstanceByName('Devices');
                tpl = deviceController.loadTemplateFile(templates[template].path);
                cachedTemplates[template] = tpl;
            }
            return tpl;
        },

        getDeviceCommandCodes: function(devicemodel, devicemodels, useCache) {
            var codes;
            var cachedCommands = GeckoJS.Session.get('deviceCommands');
            if (useCache) {
                if (cachedCommands != null) {
                    codes = cachedCommands[devicemodel];
                }
            }

            if (codes == null && devicemodels != null && devicemodels[devicemodel] != null) {
                var deviceController = GeckoJS.Controller.getInstanceByName('Devices');
                codes = deviceController.loadDeviceCommandFile(devicemodels[devicemodel].path);
                cachedCommands[devicemodel] = codes;
            }
            return codes;
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

        // check if receipts have already been printed
        isReceiptPrinted: function(txn) {
            var orderReceiptModel = new OrderReceiptModel();
            var receipts = orderReceiptModel.findByIndex('all', {
                index: 'order_id',
                value: txn.data.id
            });
            if (receipts == null || receipts.length == 0)
                return null
            else
                return receipts;
        },

        // add a receipt print timestamp
        receiptPrinted: function(txn) {
            var orderReceiptModel = new OrderReceiptModel();
            var orderReceipt = {
                order_id: txn.data.id,
                printed: new Date().getTime(),
                sequence: txn.data.seq
            };

            orderReceiptModel.save(orderReceipt);
        },

        // handle order submit events
        beforeSubmit: function(evt) {

            // @todo
            // check if receipt already printed
            var receipts = this.isReceiptPrinted(evt.data);
            if (receipts == null) {
                this.printReceipts(evt.data);
            }
            else {
                NotifyUtils.warn(_('A receipt has already been issued for this order at [%S]'));
            }

            this.printGuestChecks(evt.data);
        },

        // handles user initiated receipt requests
        issueReceipt: function(printer) {
            // check transaction status
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var txn = cart._getTransaction();
            if (txn == null) {
                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot issue receipt'));
                return; // fatal error ?
            }

            if (!txn.isSubmit()) {
                // @todo OSD
                NotifyUtils.warn(_('The order has not been finalized; cannot issue receipt'));
                return; // fatal error ?
            }

            var receipts = this.isReceiptPrinted(txn);
            if (receipts != null) {
                NotifyUtils.warn(_('A receipt has already been issued for this order'));
                return;
            }

            // check device settings
            if ((printer != null) && (printer != '') && (printer != 1) && (printer != 2)) {
                NotifyUtils.warn(_('The intended printer [%S] does not exist', [printer]));
                return;
            }

            var selectedDevices = this.getSelectedDevices();
            if (printer == 1) {
                if (!selectedDevices['receipt-1-enabled']) {
                    NotifyUtils.warn(_('The intended printer [%S] is not enabled', [printer]));
                    return;
                }
            }
            else if (printer == 2) {
                if (!selectedDevices['receipt-2-enabled']) {
                    NotifyUtils.warn(_('The intended printer [%S] is not enabled', [printer]));
                    return;
                }
            }
            else if (!selectedDevices['receipt-1-enabled'] && !selectedDevices['receipt-2-enabled']) {
                NotifyUtils.warn(_('All receipt printers are disabled'));
                return;
            }

            if (printer == null || printer == '') printer = 0;

            this.printReceipts(txn, printer);
        },

        // print on all enabled receipt printers
        printReceipts: function(txn, printer) {

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
             *   - branch
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

            order.store = GeckoJS.Session.get('storeContact');

            if (order.proceeds_clerk == null || order.proceeds_clerk == '') {
                var user = new GeckoJS.AclComponent().getUserPrincipal();
                if ( user != null ) {
                    order.proceeds_clerk = user.username;
                    order.proceeds_clerk_displayname = user.description;
                }
            }
            txn._MODIFIERS = this._MODIFIERS;

            //this.log(this.dump(selectedDevices));
            this.log(this.dump(txn));
            
            // for each enabled printer device, print if autoprint is on or if force is true
            if (selectedDevices != null) {
                if (selectedDevices['receipt-1-enabled'] &&
                    ((printer == 0) ||
                     (printer == 1) ||
                     (printer == null && selectedDevices['receipt-1-autoprint']))) {
                    var template = selectedDevices['receipt-1-template'];
                    var port = selectedDevices['receipt-1-port'];
                    var speed = selectedDevices['receipt-1-portspeed'];
                    var handshakeDisabled = selectedDevices['receipt-1-disable-handshake'];
                    var devicemodel = selectedDevices['receipt-1-devicemodel'];
                    var encoding = selectedDevices['receipt-1-encoding'];
                    printed = this.printCheck(txn, template, port, speed, handshakeDisabled, devicemodel, encoding);

                    if (printed) {
                        this.receiptPrinted(txn);
                    }

                }

                if (selectedDevices['receipt-2-enabled'] &&
                    ((printer == 0) ||
                     (printer == 2) ||
                     (printer == null && selectedDevices['receipt-2-autoprint']))) {
                    var template = selectedDevices['receipt-2-template'];
                    var port = selectedDevices['receipt-2-port'];
                    var speed = selectedDevices['receipt-2-portspeed'];
                    var handshakeDisabled = selectedDevices['receipt-2-disable-handshake'];
                    var devicemodel = selectedDevices['receipt-2-devicemodel'];
                    var encoding = selectedDevices['receipt-2-encoding'];
                    if (this.printCheck(txn, template, port, speed, handshakeDisabled, devicemodel, encoding)) {
                        this.receiptPrinted(txn);
                        printed = true;
                    }
                }
            }
            return printed;
        },

        // handles user initiated guest check requests
        issueGuestCheck: function(printer) {
            // check transaction status
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var txn = cart._getTransaction();
            if (txn == null) {
                // @todo OSD
                NotifyUtils.warn(_('Cannot issue guest check on an empty order'));
                return; // fatal error ?
            }

            if (txn.isCancel()) {
                // @todo OSD
                NotifyUtils.warn(_('Cannot issue guest check on a canceled order'));
                return; // fatal error ?
            }

            // check device settings
            if ((printer != null) && (printer != '') && (printer != 1) && (printer != 2)) {
                NotifyUtils.warn(_('The intended printer [%S] does not exist', [printer]));
                return;
            }

            var selectedDevices = this.getSelectedDevices();
            if (printer == 1) {
                if (!selectedDevices['guestcheck-1-enabled']) {
                    NotifyUtils.warn(_('The intended printer [%S] is not enabled', [printer]));
                    return;
                }
            }
            else if (printer == 2) {
                if (!selectedDevices['guestcheck-2-enabled']) {
                    NotifyUtils.warn(_('The intended printer [%S] is not enabled', [printer]));
                    return;
                }
            }
            else if (!selectedDevices['guestcheck-1-enabled'] && !selectedDevices['guestcheck-2-enabled']) {
                NotifyUtils.warn(_('All guest check printers are disabled'));
                return;
            }

            if (printer == null || printer == '') printer = 0;

            this.printGuestChecks(txn, printer);
        },

        // print on all enabled receipt printers
        printGuestChecks: function(txn, printer) {

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

            order.store = GeckoJS.Session.get('storeContact');
            
            if (order.proceeds_clerk == null || order.proceeds_clerk == '') {
                var user = new GeckoJS.AclComponent().getUserPrincipal();
                if ( user != null ) {
                    order.proceeds_clerk = user.username;
                    order.proceeds_clerk_displayname = user.description;
                }
            }
            txn._MODIFIERS = this._MODIFIERS;
/*
            this.log(this.dump(selectedDevices));
            this.log(this.dump(txn));
*/
            // for each enabled printer device, print if autoprint is on or if force is true
            if (selectedDevices != null) {
                if (selectedDevices['guestcheck-1-enabled'] &&
                    ((printer == 0) ||
                     (printer == 1) ||
                     (printer == null && selectedDevices['guestcheck-1-autoprint']))) {
                    var template = selectedDevices['guestcheck-1-template'];
                    var port = selectedDevices['guestcheck-1-port'];
                    var speed = selectedDevices['guestcheck-1-portspeed'];
                    var handshakeDisabled = selectedDevices['guestcheck-1-disable-handshake'];
                    var devicemodel = selectedDevices['guestcheck-1-devicemodel'];
                    var encoding = selectedDevices['guestcheck-1-encoding'];
                    printed = this.printCheck(txn, template, port, speed, handshakeDisabled, devicemodel, encoding);
                }

                if (selectedDevices['guestcheck-2-enabled'] &&
                    ((printer == 0) ||
                     (printer == 2) ||
                     (printer == null && selectedDevices['guestcheck-2-autoprint']))) {
                    var template = selectedDevices['guestcheck-2-template'];
                    var port = selectedDevices['guestcheck-2-port'];
                    var speed = selectedDevices['guestcheck-2-portspeed'];
                    var handshakeDisabled = selectedDevices['guestcheck-2-disable-handshake'];
                    var devicemodel = selectedDevices['guestcheck-2-devicemodel'];
                    var encoding = selectedDevices['guestcheck-2-encoding'];
                    if (this.printCheck(txn, template, port, speed, handshakeDisabled, devicemodel, encoding)) {
                        printed = true;
                    }
                }
            }
            return printed;
        },


        // print check using the given parameters
        printCheck: function(txn, template, port, speed, handshakeDisabled, devicemodel, encoding) {
            var templates = this.getTemplates();
            var devicemodels = this.getDeviceModels();
            var ports = this.getPorts();
            var portPath;
            var commands = {};
            
            portPath = (port == null || ports == null || ports[port] == null) ? null : ports[port].path;
            if (portPath == null || portPath == '') {
                NotifyUtils.error(_('Specified device port [%S] does not exist!', [port]));
                return false;
            }
            var tpl = this.getTemplateData(template, templates, false);
            if (tpl == null || tpl == '') {
                NotifyUtils.error(_('Specified receipt/guest check template [%S] is empty or does not exist!', [template]));
                return false;
            }

            commands = this.getDeviceCommandCodes(devicemodel, devicemodels, false);
/*
            alert('Printing check: \n\n' +
                  '   template [' + template + ']\n' +
                  '   port [' + port + ' (' + portPath + ')]\n' +
                  '   speed [' + speed + ']\n' +
                  '   model [' + devicemodel + ']\n' +
                  '   encoding [' + encoding + ']\n' +
                  '   template content: ' + this.dump(tpl));
            alert('Device commands: \n\n' +
                  '   commands: ' + this.dump(commands));
*/
            var result = tpl.process(txn);

            // map each command code into corresponding
            if (commands) {
                for (var key in commands) {
                    var value = commands[key];

                    // replace all occurrences of key with value in tpl
                    var re = new RegExp('\\[\\&' + key + '\\]', 'g');
                    result = result.replace(re, value);
                }
            }
            //alert(this.dump(result));
            //
            // translate embedded hex codes into actual hex values
            var replacer = function(str, p1, offset, s) {
                return String.fromCharCode(new Number(p1));
            }
            result = result.replace(/\[(0x[0-9,A-F][0-9,A-F])\]/g, function(str, p1, offset, s) {return String.fromCharCode(new Number(p1));});
            //alert(this.dump(result));
            
            // get encoding
            var encodedResult = GREUtils.Charset.convertFromUnicode(result, encoding);
            this.log('\n' + encodedResult);
            
            // send to output device
            var printed = false;
            if (this.openSerialPort(portPath, speed, handshakeDisabled)) {
                var len = this.writeSerialPort(portPath, encodedResult);
                if (len == encodedResult.length) {
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
                NotifyUtils.error(_('Error detected when printing to device [%S] at port [%S]', [devicemodelName, portName]));
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

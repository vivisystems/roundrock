(function(){

    GeckoJS.include('chrome://viviecr/content/devices/deviceTemplate.js');
    GeckoJS.include('chrome://viviecr/content/devices/deviceTemplateUtils.js');

    /**
     * Print Controller
     */

    GeckoJS.Controller.extend( {
        name: 'Print',

        _device: null,

        // load device configuration and selections
        initial: function () {

            // get handle to Devices controller
            this._device = GeckoJS.Controller.getInstanceByName('Devices');

            // add event listener for onSubmit events
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if(cart) {
                cart.addEventListener('onSubmit', this.submitOrder, this);
            }
        },

        getDeviceController: function () {
            if (this._device != null) {
                this._device = GeckoJS.Controller.getInstanceByName('Devices');
            }
            return this._device;
        },

        // get cache devices from device controller
        getSelectedDevices: function () {
            var device = this.getDeviceController();
            if (device != null) {
                return device.getSelectedDevices();
            }
            else {
                return null;
            }
        },

        // invoke openSerialPort on device controller
        openSerialPort: function (path, portspeed, handshakingDisabled) {
            var device = this.getDeviceController();
            if (device != null) {
                return device.openSerialPort(path, portspeed, handshakingDisabled);
            }
            else {
                return false;
            }
        },

        // invoke writeSerialPort on device controller
        writeSerialPort: function (path, buf) {
            var device = this.getDeviceController();
            if (device != null) {
                return device.writeSerialPort(path, buf);
            }
            else {
                return -1;
            }
        },

        // invoke closeSerialPort on device controller
        closeSerialPort: function (path) {
            var device = this.getDeviceController();
            if (device != null) {
                return device.closeSerialPort(path);
            }
            else {
                return false;
            }
        },

        // invoke getTemplates on device controller to retrieve registered templates
        getTemplates: function () {
            var device = this.getDeviceController();
            if (device != null) {
                return device.getTemplates();
            }
            else {
                return null;
            }
        },

        // invoke getPorts on device controller to retrieve registered ports
        getPorts: function () {
            var device = this.getDeviceController();
            if (device != null) {
                return device.getPorts();
            }
            else {
                return null;
            }
        },

        // invoke getDeviceModels on device controller to retrieve registered device models
        getDeviceModels: function () {
            var device = this.getDeviceController();
            if (device != null) {
                return device.getDeviceModels();
            }
            else {
                return null;
            }
        },

        // invoke getTemplateData on device controller to retrieve the content of a specific template
        getTemplateData: function(template, useCache) {
            var device = this.getDeviceController();
            if (device != null) {
                return device.getTemplateData(template, useCache);
            }
            else {
                return null;
            }
        },

        // invoke getDeviceCommandCodes on device controller to retrieve the command code mapping for a specific device model
        getDeviceCommandCodes: function(devicemodel, useCache) {
            var device = this.getDeviceController();
            if (device != null) {
                return device.getDeviceCommandCodes(devicemodel, useCache);
            }
            else {
                return null;
            }
        },

        // return the actual file system path of a port
        getPortPath: function (port) {
            var ports = this.getPorts();
            if (ports == null || ports[port] == null) return null;

            return ports[port].path;
        },

        // return the name of a port
        getPortName: function (port) {
            var ports = this.getPorts();
            if (ports == null || ports[port] == null) return null;

            return ports[port].label;
        },

        // invoke getDeviceModels on device controller to retrieve registered device models
        getDeviceModelName: function (devicemodel) {
            var deviceModels = this.getDeviceModels();
            if (deviceModels == null || deviceModels[devicemodel] == null)  return null;

            return deviceModels[devicemodel].label;
        },

        // check if receipts have already been printed on any printer
        isReceiptPrinted: function(txn) {
            var orderReceiptModel = new OrderReceiptModel();
            var receipts = orderReceiptModel.findByIndex('all', {
                index: 'order_id',
                value: txn.data.id
            });
            if (receipts == null || receipts.length == 0)
                return null;
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
        submitOrder: function(evt) {

            // @todo
            // check if receipt already printed
            var receipts = this.isReceiptPrinted(evt.data);
            if (receipts == null) {

                //@hack sleep to allow UI events to catch up
                this.sleep(100);
                // autoprint receipts
                this.printReceipts(evt.data);
            }
            else {
                NotifyUtils.warn(_('A receipt has already been issued for this order at [%S]'));
            }

            // auto print guest checks
            this.printGuestChecks(evt.data);
        },

        // handles user initiated receipt requests
        issueReceipt: function(printer) {
            var device = this.getDeviceController();
            var cart = GeckoJS.Controller.getInstanceByName('Cart');

            // check transaction status
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

            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            // check device settings
            printer = GeckoJS.String.trim(printer);
            if (printer == null || printer == '') {
                switch (device.isDeviceEnabled('receipt', null)) {
                    case -2:
                        NotifyUtils.warn(_('You have not configured any receipt printers'));
                        return;

                    case -1: // invalid device
                    case 0: // device not enabled
                        NotifyUtils.warn(_('All receipt printers are disabled'));
                        return;
                }
            }
            else {
                switch (device.isDeviceEnabled('receipt', printer)) {
                    case -2:
                        NotifyUtils.warn(_('The specified receipt printer [%S] is not configured', [printer]));
                        return;

                    case -1:
                        NotifyUtils.warn(_('Invalid receipt printer [%S]', [printer]));
                        return;

                    case 0:
                        NotifyUtils.warn(_('The specified receipt printer [%S] is not enabled', [printer]));
                        return;
                }
            }
            if (printer == null) printer = 0;
            this.printReceipts(txn, printer);
        },

        // print on all enabled receipt printers
        printReceipts: function(txn, printer) {

            var device = this.getDeviceController();
            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            var enabledDevices = device.getEnabledDevices('receipt');
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

            var order = txn.data;
            
            order.create_date = new Date(order.created);
            order.print_date = new Date();

            var data = {
                txn: txn,
                store: GeckoJS.Session.get('storeContact'),
                order: order,
            };

            if (order.proceeds_clerk == null || order.proceeds_clerk == '') {
                var user = new GeckoJS.AclComponent().getUserPrincipal();
                if ( user != null ) {
                    order.proceeds_clerk = user.username;
                    order.proceeds_clerk_displayname = user.description;
                }
            }

            //this.log('Enabled Devices:\n' + GeckoJS.BaseObject.dump(enabledDevices));
            //this.log('Data:\n' + GeckoJS.BaseObject.dump(data));
            
            // for each enabled printer device, print if autoprint is on or if force is true
            var printed;
            var self = this;
            if (enabledDevices != null) {
                enabledDevices.forEach(function(device) {
                    if ((printer == null && device.autoprint) || printer == device.number || printer == 0) {
                        var template = device.template;
                        var port = device.port;
                        var portspeed = device.portspeed;
                        var handshakeDisabled = device.handshakeDisabled;
                        var devicemodel = device.devicemodel;
                        var encoding = device.encoding;
                        data._MODIFIERS = _templateModifiers(encoding);
                        printed = self.printCheck(data, template, port, portspeed, handshakeDisabled, devicemodel, encoding);

                        if (printed) {
                            self.receiptPrinted(txn);
                        }

                    }
                });
            }
        },

        // handles user initiated guest check requests
        issueGuestCheck: function(printer) {
            var device = this.getDeviceController();
            var cart = GeckoJS.Controller.getInstanceByName('Cart');

            // check transaction status
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

            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            // check device settings
            printer = GeckoJS.String.trim(printer);
            if (printer == null || printer == '') {
                switch (device.isDeviceEnabled('guestcheck', null)) {
                    case -2:
                        NotifyUtils.warn(_('You have not configured any guest check printers'));
                        return;

                    case -1: // invalid device
                    case 0: // device not enabled
                        NotifyUtils.warn(_('All guest check printers are disabled'));
                        return;
                }
            }
            else {
                switch (device.isDeviceEnabled('guestcheck', printer)) {
                    case -2:
                        NotifyUtils.warn(_('You have not configured any guest check printers'));
                        return;

                    case -1:
                        NotifyUtils.warn(_('Invalid guest check printer [%S]', [printer]));
                        return;

                    case 0:
                        NotifyUtils.warn(_('The specified guest check printer [%S] is not enabled', [printer]));
                        return;
                }
            }
            if (printer == null) printer = 0;
            this.printGuestChecks(txn, printer);
        },


        // print on all enabled receipt printers
        printGuestChecks: function(txn, printer) {

            var device = this.getDeviceController();
            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            var enabledDevices = device.getEnabledDevices('guestcheck');

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

            var data = {
                txn: txn,
                store: GeckoJS.Session.get('storeContact'),
                order: order
            };

            if (order.proceeds_clerk == null || order.proceeds_clerk == '') {
                var user = new GeckoJS.AclComponent().getUserPrincipal();
                if ( user != null ) {
                    order.proceeds_clerk = user.username;
                    order.proceeds_clerk_displayname = user.description;
                }
            }
/*
            this.log(this.dump(selectedDevices));
            this.log(this.dump(txn));
*/
            // for each enabled printer device, print if autoprint is on or if force is true
            var self = this;
            if (enabledDevices != null) {
                enabledDevices.forEach(function(device) {
                    if ((printer == null && device.autoprint) || printer == device.number || printer == 0) {
                        var template = device.template;
                        var port = device.port;
                        var portspeed = device.portspeed;
                        var handshakeDisabled = device.handshakeDisabled;
                        var devicemodel = device.devicemodel;
                        var encoding = device.encoding;
                        data._MODIFIERS = _templateModifiers(encoding);
                        self.printCheck(data, template, port, portspeed, handshakeDisabled, devicemodel, encoding);
                    }
                });
            }
        },

        // print check using the given parameters
        printCheck: function(data, template, port, portspeed, handshakeDisabled, devicemodel, encoding) {
            var portPath = this.getPortPath(port);
            var commands = {};
            
            if (portPath == null || portPath == '') {
                NotifyUtils.error(_('Specified device port [%S] does not exist!', [port]));
                return false;
            }
            var tpl = this.getTemplateData(template, false);
            if (tpl == null || tpl == '') {
                NotifyUtils.error(_('Specified receipt/guest check template [%S] is empty or does not exist!', [template]));
                return false;
            }

            commands = this.getDeviceCommandCodes(devicemodel, false);

/*
            alert('Printing check: \n\n' +
                  '   template [' + template + ']\n' +
                  '   port [' + port + ' (' + portPath + ')]\n' +
                  '   portspeed [' + portspeed + ']\n' +
                  '   model [' + devicemodel + ']\n' +
                  '   encoding [' + encoding + ']\n' +
                  '   template content: ' + this.dump(tpl));
            alert('Device commands: \n\n' +
                  '   commands: ' + this.dump(commands));
*/
            var result = tpl.process(data);

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
            this.log('RECEIPT/GUEST CHECK\n' + encodedResult);

            // send to output device
            var printed = false;
            if (this.openSerialPort(portPath, portspeed, handshakeDisabled)) {
                var len = this.writeSerialPort(portPath, encodedResult);
                if (len == encodedResult.length) {
                    printed = true;
                }
                else {
                    this.log('Check length: [' + encodedResult.length + '], printed length: [' + len + ']');
                }
                this.closeSerialPort(portPath);
            }
            else {
                printed = false;
            }

            if (!printed) {
                var devicemodelName = this.getDeviceModelName(devicemodel);
                var portName = this.getPortName(port);

                if (devicemodelName == null) devicemodelName = 'unknown';
                if (portName == null) portName = 'unknown';

                //@todo OSD
                NotifyUtils.error(_('Error detected when outputing to device [%S] at port [%S]', [devicemodelName, portName]));
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

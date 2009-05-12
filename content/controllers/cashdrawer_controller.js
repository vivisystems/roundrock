(function(){

    include('chrome://viviecr/content/models/cashdrawer_record.js');
    
    /**
     * Cash Drawer Controller
     */

    var __controller__ = {
        name: 'CashDrawer',

        _device: null,

        _gpio: null,

        // load device configuration and selections
        initial: function () {

            this._device = GeckoJS.Controller.getInstanceByName('Devices');
            
            // add event listener for beforeSubmit events
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if(cart) {
                cart.addEventListener('afterAddPayment', this.handleOpenDrawerEvent, this);
            }
            // get handle to Main controller
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('afterClearOrderData', this.expireData, this);
            }
            // add event listener for ledger events
            var ledger = GeckoJS.Controller.getInstanceByName('LedgerRecords');
            if(ledger) {
                ledger.addEventListener('afterLedgerEntry', this.handleLedgerEntryEvent, this);
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
        openSerialPort: function (path, portspeed, handshaking) {
            var device = this.getDeviceController();
            if (device != null) {
                return device.openSerialPort(path, portspeed, handshaking);
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

        triggerGPIO: function (pulses) {
            var device = this.getDeviceController();
            if (device != null) {
                return device.triggerGPIO(pulses);
            }
            else {
                return null;
            }
        },

        // handles payment events
        handleOpenDrawerEvent: function(evt) {

            var eventType = 'payment';

            // on payment events, check if a submit event is coming
            var cart= GeckoJS.Controller.getInstanceByName('Cart');
            if (cart == null) return;

            var txn = cart._getTransaction();
            if (txn == null) return;

            if (txn.getRemainTotal() <= 0) {
                // don't open drawer; wait for afterSubmit event
                eventType = 'finalization';
            }

            // 1. get user's assigned drawer (or null)
            // 2. pass drawer number to openDrawer()

            var drawerNo = null;
            var user = GeckoJS.Session.get('user');
            if (user) {
                if (user.drawer != null) {
                    drawerNo = GeckoJS.String.trim(user.drawer);
                    if (drawerNo == '') drawerNo = null;
                }
            }
            
            this.openDrawer(drawerNo, eventType, evt.data.name, evt.data.seq, evt.data.amount);
        },

        // handles ledger entry events
        handleLedgerEntryEvent: function(evt) {

            var eventType = 'ledger';

            // 1. get user's assigned drawer (or null)
            // 2. pass drawer number to openDrawer()

            var drawerNo = null;
            var user = GeckoJS.Session.get('user');
            if (user) {
                if (user.drawer != null) {
                    drawerNo = GeckoJS.String.trim(user.drawer);
                    if (drawerNo == '') drawerNo = null;
                }
            }

            this.openDrawer(drawerNo, eventType, evt.data.type, '', evt.data.amount);
        },

        openDrawer1: function() {
            this.openDrawer(1, 'nosale');
        },

        openDrawer2: function() {
            this.openDrawer(2, 'nosale');
        },

        openDrawerForShiftChange: function() {
            var device = this.getDeviceController();
            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            // get list of enabled drawers
            var enabledDevices = device.getEnabledDevices('cashdrawer');
            if (enabledDevices == null || enabledDevices.length == 0) {
                // no cashdrawer enabled, simply return
                return;
            }

            if (device.isDeviceEnabled('cashdrawer', 1)) {
                this.openDrawer(1, 'shift change');
            }

            if (device.isDeviceEnabled('cashdrawer', 2)) {
                this.openDrawer(2, 'shift change');
            }
        },
        
        openDrawer: function(drawerNo, eventType, paymentType, sequence, amount) {

            // 1. get list of enabled drawers; if no drawer is enabled, simply exit
            // 2. if drawer == null, use first enabled drawer
            // 3. if drawer != null, use specified drawer; if the specified drawer does not exist, warn and exit
            // 4. if the specified drawer is not enabled, warn and exit
            // 5. check drawer type; invoke appropriate driver to trigger the drawer
            var device = this.getDeviceController();
            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            // get list of enabled drawers
            var enabledDevices = device.getEnabledDevices('cashdrawer');
            if (enabledDevices == null || enabledDevices.length == 0) {
                // warn only if a specific drawer has been requested
                if (drawerNo != null)
                    NotifyUtils.error(_('Cash drawer [%S] is not enabled! Please check your device configuration', [drawerNo]));
                return;
            }

            var drawer;
            if (drawerNo == null) {
                drawer = enabledDevices[0];
                drawerNo = drawer.number;
            }
            else {
                if (!device.isDeviceEnabled('cashdrawer', drawerNo)) {
                    NotifyUtils.error(_('Cash drawer [%S] is not enabled! Please check your device configuration', [drawerNo]));
                    return;
                }
                for (var i = 0; i < enabledDevices.length; i++) {
                    if (enabledDevices[i].number == drawerNo) {
                        drawer = enabledDevices[i];
                        break;
                    }
                }
            }

            if (drawer == null) {
                if (drawerNo != null)
                    NotifyUtils.error(_('Cash drawer [%S] is not enabled! Please check your device configuration', [drawerNo]));
                return;
            }

            // check if drawer action is needed
            switch(eventType) {
                case 'payment':
                    if (drawer[paymentType + 'action'] != 'always') return;
                    break;

                case 'finalization':
                    if ((drawer[paymentType + 'action'] != 'always') && (drawer[paymentType + 'action'] != 'finalization')) return;
                    break;

                case 'ledger':
                    if (drawer['ledgeraction'] != 'always') return;
                    break;
                    
                case 'nosale':
                    break;
            }

            // allow UI to catch up before triggering drawer
            this.sleep(100);

            var status = 0;
            switch (drawer.type) {
                
                case 'gpio':
                    if (!drawer.supportsstatus || !device.isGPIODrawerOpen()) {
                        if (device.triggerGPIO(drawer.gpiopulses) == 0) {
                            NotifyUtils.error(_('Error detected while opening cash drawer [%S]; please check if cash drawer is connected and powered up', [drawerNo]));
                        }
                        else {
                            status = 1;
                        }
                    }
                    break;

                case 'printer':
                    var port = drawer.port;
                    var portspeed = drawer.portspeed;
                    var handshaking = drawer.handshaking;
                    var devicemodel = drawer.devicemodel;
                    if (this.sendToPrinter(port, portspeed, handshaking, devicemodel)) {
                        status = 1;
                    }

                    break;
            }

            // save cashdrawer access
            var drawerRecordModel = new CashdrawerRecordModel();
            var accessRecord = {
                terminal_no: GeckoJS.Session.get('terminal_no'),
                drawer_no: drawer.number,
                event_type: eventType,
                payment_type: paymentType,
                sequence: sequence,
                amount: amount,
                status: status
            };
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null ) {
                accessRecord.clerk = user.username;
                accessRecord.clerk_displayname = user.description;
            }
            drawerRecordModel.save(accessRecord);
        },

        expireData: function(evt) {
            var model = new CashdrawerRecordModel();
            var expireDate = parseInt(evt.data);
            if (!isNaN(expireDate)) {
                model.execute('delete from cashdrawer_records where created <= ' + expireDate);
            }
        },

        // send open drawer commands to printer using the given parameters
        sendToPrinter: function(port, speed, handshaking, devicemodel) {

            var portPath = this.getPortPath(port);
            var commands = {};

            if (portPath == null || portPath == '') {
                NotifyUtils.error(_('Specified device port [%S] does not exist!', [port]));
                return false;
            }
            var result = '[&OPENDRAWER]';

            commands = this.getDeviceCommandCodes(devicemodel, false);

/*
            alert('Open cashdrawer via printer: \n\n' +
                  '   port [' + port + ' (' + portPath + ')]\n' +
                  '   portspeed [' + portspeed + ']\n' +
                  '   model [' + devicemodel + ']\n' +
                  '   template content: ' + this.dump(tpl));
            alert('Device commands: \n\n' +
                  '   commands: ' + this.dump(commands));
*/
            // map each command code into corresponding hex code
            if (commands) {
                for (var key in commands) {
                    var value = commands[key];

                    // replace all occurrences of key with value in tpl
                    var re = new RegExp('\\[\\&' + key + '\\]', 'g');
                    result = result.replace(re, value);
                }
            }
            //
            // translate embedded hex codes into actual hex values
            var replacer = function(str, p1, offset, s) {
                return String.fromCharCode(new Number(p1));
            }
            result = result.replace(/\[(0x[0-9,A-F][0-9,A-F])\]/g, function(str, p1, offset, s) {return String.fromCharCode(new Number(p1));});
            //GREUtils.log(this.dump(result));
            
            // get encoding
            var encodedResult = GREUtils.Charset.convertFromUnicode(result, 'US-ASCII');
            //this.log('CASHDRAWER:\n' + encodedResult);
            //alert('CASHDRAWER:\n' + encodedResult);
            
            // send to output device
            var printed = false;
            if (this.openSerialPort(portPath, speed, handshaking)) {
                var len = this.writeSerialPort(portPath, encodedResult);
                if (len == encodedResult.length) {
                    printed = true;
                }
                else {
                    this.log('CASHDRAWER command length: [' + encodedResult.length + '], printed length: [' + len + ']');
                }
                this.closeSerialPort(portPath);
            }
            else {
                printed = false;
            }
            
            if (!printed) {
                var devicemodels = this.getDeviceModels();
                var devicemodelName = (devicemodels == null) ? 'unknown' : devicemodels[devicemodel].label;
                var portName = this.getPortName(port);

                if (devicemodelName == null) devicemodelName = 'unknown';
                if (portName == null) portName = 'unknown';

                //@todo OSD
                NotifyUtils.error(_('Error detected when outputing to device [%S] at port [%S]', [devicemodelName, portName]));
            }
            return printed;
        }

    };

    GeckoJS.Controller.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'CashDrawer');
                                      });

    }, false);


})();

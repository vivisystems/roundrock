(function(){

    /**
     * Cash Drawer Controller
     */

    GeckoJS.Controller.extend( {
        name: 'CashDrawer',

        _device: null,

        _gpio: null,

        // load device configuration and selections
        initial: function () {

            this._device = GeckoJS.Controller.getInstanceByName('Devices');
            
            // add event listener for beforeSubmit events
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if(cart) {
                cart.addEventListener('afterSubmit', this.handleOpenDrawerEvent, this);
                cart.addEventListener('afterAddPayment', this.handleOpenDrawerEvent, this);
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

        triggerGPIO: function () {
            var device = this.getDeviceController();
            if (device != null) {
                return device.triggerGPIO();
            }
            else {
                return null;
            }
        },

        // handles payment events
        handleOpenDrawerEvent: function(evt) {
            // 1. get user's assigned drawer (or null)
            // 2. pass drawer number to openDrawer()

            var drawerNo = null;
            var user = this.Acl.getUserPrincipal();
            if (user) {
                var userModel = new UserModel();
                var userRecord = userModel.findByIndex('first', {
                    index: 'username',
                    value: user.username
                });
                if (userRecord) {
                    drawerNo = GeckoJS.String.trim(userRecord.drawer);
                    if (drawerNo == '') drawerNo = null;
                }
            }

            this.openDrawer(drawerNo);
        },

        openDrawer1: function() {
            this.openDrawer(1);
        },

        openDrawer2: function() {
            this.openDrawer(2);
        },

        openDrawer: function(drawerNo) {

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
            }
            else {
                if (!device.isDeviceEnabled('cashdrawer', drawerNo)) {
                    NotifyUtils.error(_('Cash drawer [%S] is not enabled! Please check your device configuration', [drawerNo]));
                    return;
                }
                enabledDevices.forEach(function(d) {
                   if (d.number == drawerNo) drawer = d; 
                });
            }

            switch (drawer.type) {
                
                case 'gpio':
                    if (device.triggerGPIO() == 0) {
                        // try again
                        if (device.triggerGPIO() == 0) {
                            NotifyUtils.error(_('Error detected while opening cash drawer [%S]; please check if cash drawer is connected and powered up', [drawerNo]));
                        }
                    }
                    break;

                case 'printer':
                    var port = drawer.port;
                    var portspeed = drawer.portspeed;
                    var handshaking = drawer.handshaking;
                    var devicemodel = drawer.devicemodel;
                    this.sendToPrinter(port, portspeed, handshaking, devicemodel);

                    break;
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
            this.log('CASHDRAWER:\n' + encodedResult);
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

    });

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('onInitial', function() {
                                            main.requestCommand('initial', null, 'CashDrawer');
                                      });

    }, false);


})();

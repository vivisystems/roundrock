(function(){

    GeckoJS.include('chrome://viviecr/content/devices/deviceTemplateUtils.js');

    var __controller__ = {

        name: 'VFD',

        _device: null,
        _worker: null,
        _useMainThread: false,
        _timers: {},

        // load device configuration and selections
        initial: function () {

            this._device = this.getDeviceController();

            // initialize worker thread
            this._worker = GREUtils.Thread.getWorkerThread();
            //this._worker = GREUtils.Thread.getMainThread();

            this._useMainThread = (this._worker === GREUtils.Thread.getMainThread());

            // add event listener for beforeSubmit events
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if(cart) {
                cart.addEventListener('afterAddItem', this.displayOnVFD, this);
                cart.addEventListener('afterVoidItem', this.displayOnVFD, this);
                cart.addEventListener('afterModifyItem', this.displayOnVFD, this);
                cart.addEventListener('afterSubmit', this.displayOnVFD, this);
                cart.addEventListener('afterAddPayment', this.displayOnVFD, this);
                cart.addEventListener('afterAddDiscount', this.displayOnVFD, this);
                cart.addEventListener('afterAddSurcharge', this.displayOnVFD, this);
                cart.addEventListener('afterAddCondiment', this.displayOnVFD, this);
                cart.addEventListener('afterCancel', this.displayOnVFD, this);
                cart.addEventListener('onRecovery', this.displayOnVFD, this);
                cart.addEventListener('onVoidSaleSuccess', this.displayOnVFD, this);
            }

            var cartQueue = GeckoJS.Controller.getInstanceByName('CartQueue');
            if(cartQueue) {
                cartQueue.addEventListener('onQueue', this.displayOnVFD, this);
                cartQueue.addEventListener('afterPullQueue', this.displayOnVFD, this);
            }

            var guestCheck = GeckoJS.Controller.getInstanceByName('GuestCheck');
            if(guestCheck) {
                guestCheck.addEventListener('afterRecallOrder', this.displayOnVFD, this);
            }

            // add eventListener on VFD
            this.addEventListener('onMessage', this.displayOnVFD, this);

            var self = this;
            this.observer = GeckoJS.Observer.newInstance({
                topics: [ 'acl-session-change', 'TrainingMode', 'device-refreshed' ],
                observe: function(aSubject, aTopic, aData) {
                    switch(aTopic) {
                        case 'acl-session-change':
                            var user = new GeckoJS.AclComponent().getUserPrincipal();
                            if (user == null) {
                                // signed out
                                self.displayOnVFD();
                            }
                            break;

                        case 'device-refreshed':
                            self.restartIdleTimer();
                            break;
                    }
                }
            }).register();

            // initialize display
            this.displayOnVFD();

            // create idle timer
            this.restartIdleTimer();
        },

        getDeviceController: function () {
            if (this._device == null) {
                this._device = GeckoJS.Controller.getInstanceByName('Devices');
            }
            return this._device;
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

        // handles VFD events
        displayOnVFD: function(evt) {

            // cancel timer
            this.cancelIdleTimer();
            
            //alert(GeckoJS.BaseObject.dump(evt.data));
            var device = this.getDeviceController();
            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            if (this._worker == null) {
                NotifyUtils.error(_('Error in VFD controller; no worker thread available!'));
                return;
            }

            var enabledDevices = device.getEnabledDevices('vfd');
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var txn = cart._getTransaction();
            var item;
            var itemDisplay;
            var self = this;
            var type = evt ? evt.getType() : 'initial';
            
            switch (type) {
                
                case 'afterVoidItem':
                case 'afterModifyItem':
                    item = evt.data[0];
                    itemDisplay = evt.data[1];
                    break;

                case 'afterCancel':
                    txn = evt.data;
                    break;

                case 'afterRecallOrder':
                    txn = evt.data;
                    break;

                case 'onQueue':
                    txn = evt.data;
                    break;

                case 'onVoidSaleSuccess':
                    txn = evt.data;
                    break;

                case 'initial':
                    break;

                case 'afterAddCondiment':
                    var condiments = '';
                    var current_price = 0;
                    evt.data.forEach(function(cond) {
                        condiments += (condiments == '') ? cond.name : (', ' + cond.name);
                        current_price += cond.price;
                    }, this);
                    itemDisplay = {name: condiments, current_price: current_price};
                    break;

                case 'onMessage':
                    item = {line1: evt.data[0] ||'', line2: evt.data[1] || ''};
                    break;
                    
                default:
                    item = evt.data;
            }

            var data = {
                type: type,
                txn: txn,
                store: GeckoJS.Session.get('storeContact'),
                order: (txn == null) ? null : txn.data,
                item: item,
                itemDisplay: itemDisplay
            };

            //this.log(this.dump(selectedDevices));
            //this.log(this.dump(data));
            
            // send output to each enabled VFD device
            if (enabledDevices != null) {
                enabledDevices.forEach(function(device) {
                    var template = device.template;
                    var port = device.port;
                    var portspeed = device.portspeed;
                    var handshaking = device.handshaking;
                    var devicemodel = device.devicemodel;
                    var encoding = device.encoding;
                    _templateModifiers(TrimPath, encoding);
                    self.sendToVFD(data, template, port, portspeed, handshaking, devicemodel, encoding);
                });
            }

            this.restartIdleTimer();
        },

        // generate VFD template using the given parameters
        sendToVFD: function(data, template, port, speed, handshaking, devicemodel, encoding) {

            var portPath = this.getPortPath(port);
            var commands = {};

            if (portPath == null || portPath == '') {
                NotifyUtils.error(_('Specified device port [%S] does not exist!', [port]));
                return false;
            }
            var tpl = this.getTemplateData(template, true);
            if (tpl == null || tpl == '') {
                NotifyUtils.error(_('Specified VFD template [%S] is empty or does not exist!', [template]));
                return false;
            }

            commands = this.getDeviceCommandCodes(devicemodel, true);

/*
            // @debug
            alert('Displaying to VFD: \n\n' +
                  '   template [' + template + ']\n' +
                  '   port [' + port + ' (' + portPath + ')]\n' +
                  '   portspeed [' + portspeed + ']\n' +
                  '   model [' + devicemodel + ']\n' +
                  '   encoding [' + encoding + ']\n' +
                  '   template content: ' + this.dump(tpl));
            alert('Device commands: \n\n' +
                  '   commands: ' + this.dump(commands));
*/
            var result = '';
            try {
                result = tpl.process(data);
            }
            catch(e) {
                NotifyUtils.error(_('Failed to generate VFD output from template [%S]!', [template]));
                return false;
            }

            // map each command code into corresponding
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
            result = result.replace(/\[(0x[0-9,A-F][0-9,A-F])\]/g, function(str, p1, offset, s) {return String.fromCharCode(new Number(p1));});
            if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', GeckoJS.BaseObject.dump(result));
            
            // get encoding
            var encodedResult = GREUtils.Charset.convertFromUnicode(result, encoding);
            // @debug
            //this.log('VFD:\n' + encodedResult);
            //alert('VFD:\n' + encodedResult);
            
            // send to output device using worker thread
            var self = this;
            var runnable = {
                run: function() {
                    try {

                        var printed = false;
                        if (self.openSerialPort(portPath, speed, handshaking)) {

                            var len = self.writeSerialPort(portPath, encodedResult);
                            if (len == encodedResult.length) {
                                printed = true;
                            }
                            else {
                                //self.log('VFD display length: [' + encodedResult.length + '], printed length: [' + len + ']');
                            }
                            // use dump in worker thread
                            // self.log('DEBUG', 'In Worker thread: VFD display length: [' + encodedResult.length + '], displayed length: [' + len + ']');
                            // dump('In Worker thread: VFD display length: [' + encodedResult.length + '], displayed length: [' + len + ']');
                            self.closeSerialPort(portPath);

                        }
                        else {
                            printed = false;
                        }

                        if (!printed) {
                            var devicemodels = self.getDeviceModels();
                            var devicemodelName = (devicemodels == null) ? 'unknown' : devicemodels[devicemodel].label;
                            var portName = self.getPortName(port);

                            if (devicemodelName == null) devicemodelName = 'unknown';
                            if (portName == null) portName = 'unknown';

                            NotifyUtils.error(_('Error detected when outputing to device [%S] at port [%S]', [devicemodelName, portName]));
                        }
                        return printed;
                    }catch(e) {
                        return false;
                    }
                },

                QueryInterface: function(iid) {
                    if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
                        return this;
                    }
                    throw Components.results.NS_ERROR_NO_INTERFACE;
                }
            };

            // if main thread , run directly
            if (this._useMainThread) {
                runnable.run();
            }else {
                this._worker.dispatch(runnable, this._worker.DISPATCH_NORMAL);
            }

        },

        restartIdleTimer: function() {
            let device = this.getDeviceController();
            let enabledDevices = device.getEnabledDevices('vfd') || [];
            let cart = GeckoJS.Controller.getInstanceByName('Cart');
            let self = this;

            if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', 'restarting timer');
            enabledDevices.forEach(function(device) {
                // extract delay setting in seconds
                let delay = parseInt(device.idle);
                if (isNaN(delay)) delay = 0;

                if (GeckoJS.Log.defaultClassLevel.value <= 1) self.log('DEBUG', 'delay setting for VFD [' + device.number + ']: idle delay [' + delay + ']');
                if (delay > 0) {
                    if (!self._timers[device.number]) {
                        self._timers[device.number] = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
                    }

                    if (self._timers[device.number]) {

                        self._timers[device.number].cancel();
                        if (GeckoJS.Log.defaultClassLevel.value <= 1) self.log('DEBUG', 'restarting timer for VFD [' + device.number + ']');

                        var cb = {
                            notify: function() {
                                if (GeckoJS.Log.defaultClassLevel.value <= 1) self.log('DEBUG', 'in notify [' + cart + '], [' + (cart ? !cart.ifHavingOpenedOrder() : 'true') + '] for VFD [' + device.number + ']');
                                if (!cart || !cart.ifHavingOpenedOrder()) {
                                    let data = {
                                        type: 'idle',
                                        store: GeckoJS.Session.get('storeContact')
                                    };

                                    _templateModifiers(TrimPath, device.encoding);
                                    self.sendToVFD(data, device.template, device.port, device.portspeed, device.handshaking, device.devicemodel, device.encoding);
                                }
                            }
                        }
                        self._timers[device.number].initWithCallback(cb, delay * 1000, 0);
                        if (GeckoJS.Log.defaultClassLevel.value <= 1) self.log('DEBUG', 'timer restarted for VFD [' + device.number + ']');
                    }
                }
            });
        },

        cancelIdleTimer: function() {
            let device = this.getDeviceController();
            let enabledDevices = device.getEnabledDevices('vfd') || [];
            let self = this;
            if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', 'cancelling timer');

            enabledDevices.forEach(function(device) {
                if (device._timer) {
                    if (GeckoJS.Log.defaultClassLevel.value <= 1) self.log('DEBUG', 'cancelling timer for VFD [' + device.number + ']');
                    self._timers[device.number].cancel();
                    if (GeckoJS.Log.defaultClassLevel.value <= 1) self.log('DEBUG', 'timer cancelled for VFD [' + device.number + ']');
                }
            });
        },

        destroy: function() {
            if (this.observer) this.observer.unregister();
    	}
    };

    GeckoJS.Controller.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'VFD');
                                      });
    }, false);
})();

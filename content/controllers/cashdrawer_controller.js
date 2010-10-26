(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'CashDrawer',

        _device: null,
        _gpio: null,

        // load device configuration and selections
        initial: function () {

            this._device = GeckoJS.Controller.getInstanceByName('Devices');
            
            // add event listener for afterAddPayment and onStore events
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if(cart) {
                cart.addEventListener('afterAddPayment', this.handleOpenDrawerEvent, this);
                cart.addEventListener('onStore', this.handleStoreOrderEvent, this);
            }

            // get handle to Main controller
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('afterClearOrderData', this.expireData, this);
                main.addEventListener('afterTruncateTxnRecords', this.truncateData, this);
            }
            // add event listener for ledger events
            var ledger = GeckoJS.Controller.getInstanceByName('LedgerRecords');
            if(ledger) {
                ledger.addEventListener('afterLedgerEntry', this.handleLedgerEntryEvent, this);
            }
        },

        _getDeviceController: function () {
            if (this._device != null) {
                this._device = GeckoJS.Controller.getInstanceByName('Devices');
            }
            return this._device;
        },

        // get cache devices from device controller
        _getSelectedDevices: function () {
            var device = this._getDeviceController();
            if (device != null) {
                return device.getSelectedDevices();
            }
            else {
                return null;
            }
        },

        // invoke openSerialPort on device controller
        _openSerialPort: function (path, portspeed, handshaking) {
            var device = this._getDeviceController();
            if (device != null) {
                return device.openSerialPort(path, portspeed, handshaking);
            }
            else {
                return false;
            }
        },

        // invoke writeSerialPort on device controller
        _writeSerialPort: function (path, buf) {
            var device = this._getDeviceController();
            if (device != null) {
                return device.writeSerialPort(path, buf);
            }
            else {
                return -1;
            }
        },

        // invoke closeSerialPort on device controller
        _closeSerialPort: function (path) {
            var device = this._getDeviceController();
            if (device != null) {
                return device.closeSerialPort(path);
            }
            else {
                return false;
            }
        },

        // invoke getPorts on device controller to retrieve registered ports
        _getPorts: function () {
            var device = this._getDeviceController();
            if (device != null) {
                return device.getPorts();
            }
            else {
                return null;
            }
        },

        // invoke getDeviceModels on device controller to retrieve registered device models
        _getDeviceModels: function () {
            var device = this._getDeviceController();
            if (device != null) {
                return device.getDeviceModels();
            }
            else {
                return null;
            }
        },

        // invoke getDeviceCommandCodes on device controller to retrieve the command code mapping for a specific device model
        _getDeviceCommandCodes: function(devicemodel, useCache) {
            var device = this._getDeviceController();
            if (device != null) {
                return device.getDeviceCommandCodes(devicemodel, useCache);
            }
            else {
                return null;
            }
        },

        // return the actual file system path of a port
        _getPortPath: function (port) {
            var ports = this._getPorts();
            if (ports == null || ports[port] == null) return null;

            return ports[port].path;
        },

        // return the name of a port
        _getPortName: function (port) {
            var ports = this._getPorts();
            if (ports == null || ports[port] == null) return null;

            return ports[port].label;
        },

        // invoke getDeviceModels on device controller to retrieve registered device models
        _getDeviceModelName: function (devicemodel) {
            var deviceModels = this._getDeviceModels();
            if (deviceModels == null || deviceModels[devicemodel] == null)  return null;

            return deviceModels[devicemodel].label;
        },

        _openDrawer: function(drawerNo, eventType, paymentType, sequence, amount, order_id) {

            // 1. get list of enabled drawers; if no drawer is enabled, simply exit
            // 2. if drawer == null, use first enabled drawer
            // 3. if drawer != null, use specified drawer; if the specified drawer does not exist, warn and exit
            // 4. if the specified drawer is not enabled, warn and exit
            // 5. check drawer type; invoke appropriate driver to trigger the drawer
            var device = this._getDeviceController();
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

                case 'store':
                    // for store events, paymentType is actually a list of payments in the current batch
                    let drawerActionNeeded = false;
                    let sum = 0;

                    for (let i = 0; i < paymentType.length; i++) {
                        let payment = paymentType[i];
                        if (drawer[payment.name + 'action'] == 'finalization') {
                            drawerActionNeeded = true;
                            sum += parseFloat(payment.amount);
                        }
                    }
                    if (!drawerActionNeeded) return;

                    amount = sum;
                    paymentType = '';
                    break;

                case 'ledger':
                    if (drawer['ledgeraction'] != 'always') return;
                    break;
                    
                case 'nosale':
                    break;
            }

            var status = 0;

            if (!this.dispatchEvent('beforeOpenDrawer', drawer)) return ;

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
                    if (this._sendToPrinter(port, portspeed, handshaking, devicemodel)) {
                        status = 1;
                    }

                    break;
            }

            // save cashdrawer access
            var model = new CashdrawerRecordModel();
            var accessRecord = {
                terminal_no: GeckoJS.Session.get('terminal_no'),
                drawer_no: drawer.number,
                event_type: eventType,
                payment_type: paymentType,
                sequence: sequence,
                amount: amount,
                status: status,
                order_id: order_id
            };
            var user = this.Acl.getUserPrincipal();
            if ( user != null ) {
                accessRecord.clerk = user.username;
                accessRecord.clerk_displayname = user.description;
            }
            
            if (!model.saveAccessRecord(accessRecord)) {
                // failed to save record to db/backup
                this._dbError(model.lastError, model.lastErrorString,
                              _('An error was encountered while saving cashdrawer access record (error code %S) [message #205].', [model.lastError]));
            }

            this.dispatchEvent('afterOpenDrawer', accessRecord);
            this.dispatchEvent('onOpenDrawer', accessRecord);
            
        },

        // send open drawer commands to printer using the given parameters
        _sendToPrinter: function(port, speed, handshaking, devicemodel) {

            var portPath = this._getPortPath(port);
            var commands = {};

            if (portPath == null || portPath == '') {
                NotifyUtils.error(_('Specified device port [%S] does not exist!', [port]));
                return false;
            }
            var result = '[&OPENDRAWER]';

            commands = this._getDeviceCommandCodes(devicemodel, false);

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
            if (this._openSerialPort(portPath, speed, handshaking)) {
                var len = this._writeSerialPort(portPath, encodedResult);
                if (len == encodedResult.length) {
                    printed = true;
                }
                else {
                    this.log('ERROR', 'CASHDRAWER command length: [' + encodedResult.length + '], printed length: [' + len + ']');
                }
                this._closeSerialPort(portPath);
            }
            else {
                printed = false;
            }
            
            if (!printed) {
                var devicemodels = this._getDeviceModels();
                var devicemodelName = (devicemodels == null) ? 'unknown' : devicemodels[devicemodel].label;
                var portName = this._getPortName(port);

                if (devicemodelName == null) devicemodelName = 'unknown';
                if (portName == null) portName = 'unknown';

                NotifyUtils.error(_('Error detected when outputing to device [%S] at port [%S]', [devicemodelName, portName]));
            }
            return printed;
        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', 'Database error: ' + errstr + ' [' + errno + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                                  _('Data Operation Error'),
                                  errmsg + '\n\n' + _('Please restart the terminal, and if the problem persists, contact technical support immediately.'));
        },

        // handles regular payment and finaization events
        handleOpenDrawerEvent: function(evt) {

            // if preventDefault at beforePayment, but called afterPayment.
            if (!evt || !evt.data) return ;

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

            this._openDrawer(drawerNo, eventType, evt.data.name, evt.data.seq, evt.data.amount, evt.data.order_id);
        },

        // handles regular payment and finaization events
        handleStoreOrderEvent: function(evt) {

            if (!evt || !evt.data) return ;

            var eventType = 'store';

            var txn = evt.data;

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

            // check if the current batch contains payments that require cash drawer action
            let paymentList = txn.getPaymentsInBatch();

            if (paymentList.length > 0) {
                this._openDrawer(drawerNo, eventType, paymentList, txn.data.seq, '', txn.data.id);
            }
        },

        // handles ledger entry events
        handleLedgerEntryEvent: function(evt) {

            if (!evt || !evt.data || evt.data.nodraweraction) return;
            
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

            this._openDrawer(drawerNo, eventType, evt.data.type, '', evt.data.amount, '');
        },

        expireData: function(evt) {
            var model = new CashdrawerRecordModel();
            var expireDate = parseInt(evt.data);
            if (!isNaN(expireDate)) {
                try {
                    var r = model.restoreFromBackup();
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring backup cashdrawer activity logs (error code %S) [message #201].', [model.lastError])};
                    }

                    r = model.clearExpireData(expireDate);
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring cashdrawer activity logs (error code %S) [message #202].', [model.lastError])};
                    }
                }
                catch(e) {
                    this._dbError(e.errno, e.errstr, e.errmsg);
                }
            }
        },

        truncateData: function(evt) {
            var model = new CashdrawerRecordModel();
            try {
                var r = model.restoreFromBackup();
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing all backup cashdrawer activity logs (error code %S) [message #203].', [model.lastError])};
                }

                r = model.execute('delete from cashdrawer_records');
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing all cashdrawer activity logs (error code %S) [message #204].', [model.lastError])};
                }
            }
            catch(e) {
                this._dbError(e.errno, e.errstr, e.errmsg);
            }
        },

        openDrawer1: function() {
            this._openDrawer(1, 'nosale');
        },

        openDrawer2: function() {
            this._openDrawer(2, 'nosale');
        },

        openAllDrawers: function() {
            this._openDrawer(1, 'nosale');
            this._openDrawer(2, 'nosale');
        },

        openDrawerForLedgerEntry: function() {
            var device = this._getDeviceController();
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

            // get user assigned drawer
            var drawer;
            var user = this.Acl.getUserPrincipal();
            if (user && user.drawer) {
                drawer = parseInt(user.drawer);
            }

            this._openDrawer(drawer, 'ledger');
        },

        openDrawerForShiftChange: function() {
            var device = this._getDeviceController();
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

            // get user assigned drawer
            var drawer;
            var user = this.Acl.getUserPrincipal();
            if (user && user.drawer) {
                drawer = parseInt(user.drawer);
            }

            this._openDrawer(drawer, 'shift change');
        }

    };

    AppController.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'CashDrawer');
                                      });

    }, false);


})();

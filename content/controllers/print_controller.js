(function(){

    /**
     * Print Controller
     */

    GeckoJS.Controller.extend( {
        name: 'Print',

        _device: null,

        _worker: null,

        // load device configuration and selections
        initial: function () {

            // get handle to Devices controller
            this._device = this.getDeviceController();

            // initialize worker thread
            this._worker = GREUtils.Thread.getWorkerThread();
            //this._worker = GREUtils.Thread.getMainThread();

            // initialize main thread
            this._main = GREUtils.Thread.getMainThread();

            // add event listener for onSubmit & onStore events
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if(cart) {
                cart.addEventListener('onSubmit', this.submitOrder, this);
                cart.addEventListener('onStore', this.storeOrder, this);
            }
        },

        getDeviceController: function () {
            if (this._device == null) {
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
            //@todo DEBUG
            useCache = false;
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
        isReceiptPrinted: function(orderid, device) {
            var orderReceiptModel = new OrderReceiptModel();
            var receipts = orderReceiptModel.find('all', {
                conditions: 'order_id = "' + orderid + '" AND device = "' + device + '"'
            });
            if (receipts == null || receipts.length == 0)
                return null;
            else
                return receipts;
        },

        // add a receipt print timestamp
        receiptPrinted: function(orderid, orderseq, device) {
            var orderReceiptModel = new OrderReceiptModel();
            var orderReceipt = {
                order_id: orderid,
                printed: new Date().getTime(),
                sequence: orderseq,
                device: device
            };

            orderReceiptModel.save(orderReceipt);
        },

        // handle order submit events
        submitOrder: function(evt) {

            this.printChecks(evt.data, null, 'submit');
            this.printReceipts(evt.data, null, 'submit');

            // @todo delay saving order to database til after print jobs have all been scheduled
            this.scheduleOrderCommit(evt.data);

            // @hack
            // sleep to allow UI to catch up
            this.sleep(50);
        },

        // handle store order events
        storeOrder: function(evt) {

            var txn = evt.data;
            this.log(GeckoJS.BaseObject.dump(txn.data));

            // check if checks need to be printed
            this.printChecks(evt.data, null, 'store');

            // check if receipts need to be printed
            this.printReceipts(evt.data, null, 'store');
        },

        // handles user initiated receipt requests
        issueReceipt: function(printer, duplicate) {
            var device = this.getDeviceController();
            var cart = GeckoJS.Controller.getInstanceByName('Cart');

            // check transaction status
            var txn = cart._getTransaction();
            if (txn == null) {
                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot issue receipt'));
                return; // fatal error ?
            }

            if (!txn.isSubmit() || txn.isStored()) {
                // @todo OSD
                NotifyUtils.warn(_('The order has not been finalized; cannot issue receipt'));
                return; // fatal error ?
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
            this.printReceipts(txn, printer, null, duplicate);
        },

        issueReceiptCopy: function(printer) {
            this.issueReceipt(printer, true);
        },

        // print on all enabled receipt printers
        // printer = 0: print on all enabled printers
        // printer = 1: first printer
        // printer = 2: second printer
        // printer = null: print on all auto-print enabled printers

        printReceipts: function(txn, printer, autoPrint, duplicate) {

            var device = this.getDeviceController();
            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            var enabledDevices = device.getEnabledDevices('receipt');
            var order = txn.data;
            
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

            //this.log('Enabled Devices:\n' + GeckoJS.BaseObject.dump(enabledDevices));
            //this.log('Data:\n' + GeckoJS.BaseObject.dump(data));
            //this.log('Order:\n' + GeckoJS.BaseObject.dump(data.order));
            //this.log('Store:\n' + GeckoJS.BaseObject.dump(data.store));
            
            // for each enabled printer device, print if autoprint is on or if force is true
            var self = this;
            if (enabledDevices != null) {
                enabledDevices.forEach(function(device) {
                    if ((printer == null && device.autoprint > 0) || printer == device.number || printer == 0) {
                        var template = device.template;
                        var port = device.port;
                        var portspeed = device.portspeed;
                        var handshaking = device.handshaking;
                        var devicemodel = device.devicemodel;
                        var encoding = device.encoding;
                        var copies = 1;

                        _templateModifiers(TrimPath, encoding);

                        data.linkgroups = null;
                        data.printNoRouting = 1;
                        data.routingGroups = null;
                        data.autoPrint = autoPrint;
                        data.duplicate = duplicate;

                        self.printCheck(data, template, port, portspeed, handshaking, devicemodel, encoding, device.number, copies);
                    }
                });
            }
        },

        // handles user initiated check requests
        issueCheck: function(printers, duplicate) {
            var device = this.getDeviceController();
            var cart = GeckoJS.Controller.getInstanceByName('Cart');

            // check transaction status
            var txn = cart._getTransaction();
            if (txn == null) {
                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot issue check'));
                return; // fatal error ?
            }

            if (txn.isCancel()) {
                // @todo OSD
                NotifyUtils.warn(_('Cannot issue check on a canceled order'));
                return; // fatal error ?
            }

            if (txn.getItemsCount() < 1) {
                NotifyUtils.warn(_('Nothing has been registered yet; cannot issue check'));
                return;
            }

            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            // check device settings
            if (printers == null || printers == '' ) {
                switch (device.isDeviceEnabled('check', null)) {
                    case -2:
                        NotifyUtils.warn(_('You have not configured any check printers'));
                        return;

                    case -1: // invalid device
                    case 0: // device not enabled
                        NotifyUtils.warn(_('All check printers are disabled'));
                        return;
                }
                this.printChecks(txn, 0, null, duplicate);
            }
            else {
                var printerArray = GeckoJS.String.trim(printers).split(',');
                var self = this;
                printerArray.forEach(function(printer) {
                    switch (device.isDeviceEnabled('check', printer)) {
                        case -2:
                            NotifyUtils.warn(_('You have not configured any check printers'));
                            return;

                        case -1:
                            NotifyUtils.warn(_('Invalid check printer [%S]', [printer]));
                            return;

                        case 0:
                            NotifyUtils.warn(_('The specified check printer [%S] is not enabled', [printer]));
                            return;
                    }
                    self.printChecks(txn, printer, null, duplicate);
                });
            }
        },

        issueCheckCopy: function(printers) {
            this.issueCheck(printers, true);
        },

        // print on all enabled check printers
        //
        // printer = 0: print on all enabled printers
        // printer = 1: first printer
        // printer = 2: second printer
        // printer = null: print on all auto-print enabled printers

        printChecks: function(txn, printer, autoPrint, duplicate) {

            var device = this.getDeviceController();
            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            var enabledDevices = device.getEnabledDevices('check');
            var order = txn.data;

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
            //this.log('Enabled Devices:\n' + GeckoJS.BaseObject.dump(enabledDevices));
            //this.log('Data:\n' + GeckoJS.BaseObject.dump(data));
            //this.log('Order:\n' + GeckoJS.BaseObject.dump(data.order));
            //this.log('Store:\n' + GeckoJS.BaseObject.dump(data.store));
*/
            // construct routing groups
            var pluGroupModel = new PlugroupModel();
            var groups = pluGroupModel.findByIndex('all', {
                index: 'routing',
                value: 1
            });

            var routingGroups;
            if (groups.length > 0) {
                routingGroups = {};
                groups.forEach(function(g) {
                    routingGroups[g.id] = 1;
                });
            }

            // for each enabled printer device, print if autoprint is on or if force is true
            var self = this;
            if (enabledDevices != null) {
                enabledDevices.forEach(function(device) {
                    if ((printer == null && device.autoprint > 0) || printer == device.number || printer == 0) {
                        var template = device.template;
                        var port = device.port;
                        var portspeed = device.portspeed;
                        var handshaking = device.handshaking;
                        var devicemodel = device.devicemodel;
                        var encoding = device.encoding;
                        var copies = (printer == null) ? device.autoprint : 1;
                        
                        _templateModifiers(TrimPath, encoding);
                        data.linkgroup = device.linkgroup;
                        
                        data.printNoRouting = device.printNoRouting;
                        data.routingGroups = routingGroups;
                        data.autoPrint = autoPrint;
                        data.duplicate = duplicate;
                        
                        self.printCheck(data, template, port, portspeed, handshaking, devicemodel, encoding, 0, copies);
                    }
                });
            }
        },

        // handles user initiated receipt requests
        printReport: function(type, tpl, data) {
            var device = this.getDeviceController();

            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            // check device settings
            var printer = (type == 'report' ? 1 : 2);

            switch (device.isDeviceEnabled('report', printer)) {
                case -2:
                    NotifyUtils.warn(_('The specified report/label printer [%S] is not configured', [printer]));
                    return;

                case -1:
                    NotifyUtils.warn(_('Invalid report/label printer [%S]', [printer]));
                    return;

                case 0:
                    NotifyUtils.warn(_('The specified report/label printer [%S] is not enabled', [printer]));
                    return;
            }

            var enabledDevices = device.getEnabledDevices('report', printer);
            var port = enabledDevices[0].port;
            var portspeed = enabledDevices[0].portspeed;
            var handshaking = enabledDevices[0].handshaking;
            var devicemodel = enabledDevices[0].devicemodel;
            var encoding = enabledDevices[0].encoding;

            _templateModifiers(TrimPath, encoding);

            var template = tpl.process(data);

            this.printCheck(null, template, port, portspeed, handshaking, devicemodel, encoding, 0, 1);
        },

        // print check using the given parameters
        printCheck: function(data, template, port, portspeed, handshaking, devicemodel, encoding, device, copies) {
            if (this._worker == null) {
                NotifyUtils.error(_('Error in Print controller: no worker thread available!'));
                return;
            }
            var portPath = this.getPortPath(port);
            var commands = {};
            
            if (portPath == null || portPath == '') {
                NotifyUtils.error(_('Specified device port [%S] does not exist!', [port]));
                return false;
            }

            // dispatch beforePrintCheck event to allow extensions to add to the template data object or
            // to prevent check from printed
            if (!this.dispatchEvent('beforePrintCheck', {data: data,
                                                         template: template,
                                                         port: port,
                                                         portspeed: portspeed,
                                                         handshaking: handshaking,
                                                         devicemodel: devicemodel,
                                                         encoding: encoding,
                                                         device: device})) {
                return;
            }
            // check if item is linked to this printer and set 'linked' accordingly
            if (data != null) {
                var empty = true;
                var routingGroups = data.routingGroups;

                //this.log('printNoRouting: ' + data.printNoRouting);
                //this.log('device group: ' + data.linkgroup);
                //this.log('routingGroups: ' + GeckoJS.BaseObject.dump(data.routingGroups));
                for (var i in data.order.items) {
                    var item = data.order.items[i];
                    item.linked = false;

                    // rules:
                    //
                    // 1. item.link_group does not contain any link groups and device.printNoRouting is true
                    // 2. device.linkgroup intersects item.link_group
                    // 3. item.link_group does not contain any routing groups and device.printNoRouting is true
                    //
                    //this.log('item link groups: ' + GeckoJS.BaseObject.dump(item.link_group));
                    if (device.printNoRouting) {
                        if (item.link_group == null || item.link_group == '') {
                            item.linked = true;
                            empty = false;
                        }
                    }

                    if (!item.linked && data.linkgroup != null && data.linkgroup != '' && item.link_group.indexOf(data.linkgroup) > -1) {
                        item.linked = true;
                        empty = false;
                    }

                    if (!item.linked && data.printNoRouting) {
                        var noRoutingGroups;
                        if (routingGroups == null) {
                            noRoutingGroups = true;
                        }
                        else {
                            var groups = item.link_group.split(',');
                            var noRoutingGroups = true;
                            for (var i = 0; i < groups.length; i++) {
                                if (groups[i] in routingGroups) {
                                    noRoutingGroups = false;
                                    break;
                                }
                            }
                        }

                        if (noRoutingGroups) {
                            item.linked = true;
                            empty = false;
                        }
                    }
                    this.log('item linked: ' + item.linked);
                }

                data.hasLinkedItems = !empty;
                if (empty) {
                    this.log('no items linked to this printer; printing terminated');
                }
            }

            var tpl;
            var result;

            // if data is null, then the document has already been generated and passed in through the template parameter
            if (data != null) {

                this.log('type [' + typeof data.duplicate + '] [' + data.duplicate + '] ' + GeckoJS.BaseObject.dump(data.order));
                
                tpl = this.getTemplateData(template, false);
                if (tpl == null || tpl == '') {
                    NotifyUtils.error(_('Specified template [%S] is empty or does not exist!', [template]));
                    return false;
                }
                result = tpl.process(data);
            }
            else {
                result = template;
            }

            /*
            alert('Printing check: \n\n' +
                  '   template [' + template + ']\n' +
                  '   port [' + port + ' (' + portPath + ')]\n' +
                  '   speed [' + portspeed + ']\n' +
                  '   model [' + devicemodel + ']\n' +
                  '   encoding [' + encoding + ']\n' +
                  '   template content: ' + this.dump(tpl));
            */

            commands = this.getDeviceCommandCodes(devicemodel, false);

            //alert('Device commands: \n\n' +  '   commands: ' + this.dump(commands));

            // map each command code into corresponding
            if (commands) {
                for (var key in commands) {
                    var value = commands[key];

                    // replace all occurrences of key with value in tpl
                    var re = new RegExp('\\[\\&' + key + '\\]', 'g');
                    result = result.replace(re, value);
                }
            }
            alert(GeckoJS.BaseObject.dump(result));
            //return;
            //alert(data.order.receiptPages);
            //
            // translate embedded hex codes into actual hex values
            var replacer = function(str, p1, offset, s) {
                return String.fromCharCode(new Number(p1));
            }
            result = result.replace(/\[(0x[0-9,A-F][0-9,A-F])\]/g, function(str, p1, offset, s) {return String.fromCharCode(new Number(p1));});
            //alert(this.dump(result));

            // get encoding
            var encodedResult = GREUtils.Charset.convertFromUnicode(result, encoding);
            //this.log('RECEIPT/CHECK\n' + encodedResult);

            // set up main thread callback to dispatch event
            var sendEvent = function(device, data, result, encodedResult, printed) {
                this.eventData = {printed: printed,
                                  device: device,
                                  data: data,
                                  receipt: result,
                                  encodedReceipt: encodedResult
                                 };
            }

            // send to output device using worker thread
            var self = this;

            sendEvent.prototype = {
                run: function() {
                    try {
                        self.dispatchEvent('onReceiptPrinted', this.eventData);
                    }
                    catch (e) {
                        this.log('WARN', 'failed to dispatch onReceiptPrinted event');
                    }
                },

                QueryInterface: function(iid) {
                    if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
                        return this;
                    }
                    throw Components.results.NS_ERROR_NO_INTERFACE;
                }
            }
            
            var runnable = {
                run: function() {
                    try {
                        // check if record already exists if device > 0 (device is set to 0 for check and report/label printers
                        if (device > 0 && ((typeof data.duplicate) == 'undefined' || data.duplicate == null)) {
                            var receipts = self.isReceiptPrinted(data.order.id, device);
                            if (receipts != null) {
                                NotifyUtils.warn(_('A receipt has already been issued for this order on printer [%S]', [device]));
                                return;
                            }
                        }

                        var printed = 0;
                        if (self._device.checkSerialPort(portPath, handshaking, true)) {
                            if (self.openSerialPort(portPath, portspeed, handshaking)) {
                                for (var i = 0; i < copies; i++) {
                                    var len = self.writeSerialPort(portPath, encodedResult);
                                    if (len == encodedResult.length) {
                                        printed++;
                                    }
                                }
                                self.closeSerialPort(portPath);
                            }
                        }
                        if (printed == 0) {
                            var devicemodelName = self.getDeviceModelName(devicemodel);
                            var portName = self.getPortName(port);

                            if (devicemodelName == null) devicemodelName = 'unknown';
                            if (portName == null) portName = 'unknown';

                            //@todo OSD
                            NotifyUtils.error(_('Error detected when outputing to device [%S] at port [%S]', [devicemodelName, portName]));
                        }
                        if (device > 0 && (typeof data.duplicate == 'undefined' || data.duplicate == null)) {
                            self.receiptPrinted(data.order.id, data.order.seq, device);
                        }

                        // dispatch receiptPrinted event indirectly through the main thread
                        
                        if (self._main) {
                            self._main.dispatch(new sendEvent(device, data, result,encodedResult, printed), self._worker.DISPATCH_NORMAL);
                        }

                        
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

            this._worker.dispatch(runnable, this._worker.DISPATCH_NORMAL);
        },

        scheduleOrderCommit: function(txn) {

            // set up main thread callback to dispatch event
            var orderCommit = function(txn) {
                this._commitTxn = txn;
            }

            // send to output device using worker thread
            var self = this;

            orderCommit.prototype = {
                run: function() {
                    try {
                        this._commitTxn.submit();
                    }
                    catch (e) {
                        this.log('WARN', 'failed to commit order');
                    }
                },

                QueryInterface: function(iid) {
                    if (iid.equals(Components.Interfaces.nsIRunnable) || iid.equals(Components.Interfaces.nsISupports)) {
                        return this;
                    }
                    throw Components.results.NS_ERROR_NO_INTERFACE;
                }
            }

            var runnable = {
                run: function() {
                    try {
                        // dispatch commitOrder event indirectly through the main thread

                        if (self._main) {
                            self._main.dispatch(new orderCommit(txn), self._worker.DISPATCH_NORMAL);
                        }


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

            this._worker.dispatch(runnable, this._worker.DISPATCH_NORMAL);

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

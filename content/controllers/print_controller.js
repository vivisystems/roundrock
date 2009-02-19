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

            // add event listener for onSubmit events
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if(cart) {
                cart.addEventListener('onSubmit', this.submitOrder, this);
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

            this.printGuestChecks(evt.data);
            this.printReceipts(evt.data);

            // @todo delay saving order to database til after print jobs have all been scheduled
            this.scheduleOrderCommit(evt.data);

            // @hack
            // sleep to allow UI to catch up
            this.sleep(50);
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
        // printer = 0: print on all enabled printers
        // printer = 1: first printer
        // printer = 2: second printer
        // printer = null: print on all auto-print enabled printers

        printReceipts: function(txn, printer) {

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
                        var copies = (printer == null) ? device.autoprint : 1;

                        _templateModifiers(TrimPath, encoding);

                        data.linkgroups = null;
                        data.printunlinked = 1;
                        data.routingGroups = null;

                        self.printCheck(data, template, port, portspeed, handshaking, devicemodel, encoding, device.number, copies);
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
                NotifyUtils.warn(_('Not an open order; cannot issue guest check'));
                return; // fatal error ?
            }

            if (txn.isCancel()) {
                // @todo OSD
                NotifyUtils.warn(_('Cannot issue guest check on a canceled order'));
                return; // fatal error ?
            }

            if (txn.getItemsCount() < 1) {
                NotifyUtils.warn(_('Nothing has been registered yet; cannot issue guest check'));
                return;
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


        // print on all enabled guestcheck printers
        //
        // printer = 0: print on all enabled printers
        // printer = 1: first printer
        // printer = 2: second printer
        // printer = null: print on all auto-print enabled printers

        printGuestChecks: function(txn, printer) {

            var device = this.getDeviceController();
            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            var enabledDevices = device.getEnabledDevices('guestcheck');
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
                value: 1,
                order: 'display_order, name'
            });
            var routingGroups = {};
            groups.forEach(function(g) {
                routingGroups[g.id] = 1;
            });

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

                        data.linkgroups = {};
                        if (device.linkgroups.length > 0) {
                            var linkgroups = device.linkgroups.split(',');
                            if (linkgroups.length > 0) {
                                linkgroups.forEach(function(g) {
                                    data.linkgroups[g] = 1;
                                });
                            }
                        }

                        data.printunlinked = device.printunlinked;
                        data.routingGroups = routingGroups;

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
                for (var i in data.order.items) {
                    var item = data.order.items[i];
                    item.linked = false;

                    // we first filter item.link_group by routing groups
                    var linkgroups = null;
                    if (routingGroups != null && item.link_group != null && item.link_group.length > 0) {
                        var groups = item.link_group.split(',');
                        if (groups.length > 0) {
                            groups.forEach(function(g) {
                                if (g in routingGroups) {
                                    if (linkgroups == null) linkgroups = {};
                                    linkgroups[g] = 1;
                                }
                            });
                        }
                    }

                    // then we print item if:
                    // 1. item's filtered linkgroups is empty and data.printunlinked, or
                    // 2. item's filtered linkgroups intersects data.linkgroups
                    if (linkgroups == null) {
                        if (data.printunlinked) {
                            empty = false;
                            item.linked = true;
                        }
                    }
                    else {
                        for (var j in data.linkgroups) {
                            if (j in linkgroups) {
                                empty = false;
                                item.linked = true;
                                break;
                            }
                        }
                    }
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
                var tpl = this.getTemplateData(template, false);
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
            //alert(this.dump(result));
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
            //this.log('RECEIPT/GUEST CHECK\n' + encodedResult);

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
                        // if recordReceipt is true, check if record already exists
                        if (device > 0) {
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
                        if (printed && device > 0) {
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

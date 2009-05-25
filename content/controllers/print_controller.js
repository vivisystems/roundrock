(function(){

     include('chrome://viviecr/content/devices/deviceTemplate.js');
     include('chrome://viviecr/content/devices/deviceTemplateUtils.js');
     include('chrome://viviecr/content/reports/template_ext.js');


    /**
     * Print Controller
     */

    var __controller__ = {

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

        checkSerialPort: function (path, handshaking, noHandshakingValue) {

            // if CUPS try just check null device not exists?
            if (path.indexOf("/CUPS/") != -1) {

                // use pure XPCOM code in worker thread ...
                try {

                    var pathFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                    var isExists = false;
                    pathFile.initWithPath(path);
                    isExists = pathFile.exists();
                    pathFile = null;

                    return isExists;

                }catch (e) {
                    return false;
                }


            }else {

                var device = this.getDeviceController();
                if (device != null) {
                    return device.checkSerialPort(path, handshaking, noHandshakingValue);
                }
                else {
                    return false;
                }

            }
        },

        // invoke openSerialPort on device controller
        openSerialPort: function (path, portspeed, handshaking) {

            // if CUPS try just check null device not exists?
            if (path.indexOf("/CUPS/") != -1) {

                // use pure XPCOM code in worker thread ...
                try {

                    var pathFile = Components.classes["@mozilla.org/file/local;1"].createInstance(Components.interfaces.nsILocalFile);
                    var isExists = false;
                    pathFile.initWithPath(path);
                    isExists = pathFile.exists();
                    pathFile = null;

                    return isExists;
                    
                }catch (e) {
                    return false;
                }

            }else {

                var device = this.getDeviceController();
                if (device != null) {
                    return device.openSerialPort(path, portspeed, handshaking);
                }
                else {
                    return false;
                }
            }
        },

        // invoke writeSerialPort on device controller
        writeSerialPort: function (path, buf) {

            // if CUPS try just create jobfile
            if (path.indexOf("/CUPS/") != -1) {

                var printerName = path.replace("/tmp/CUPS/", "");

                try {
                    
                    // vivipos has shell script to clean job spool
                    // use pure XPCOM in worker thread.
                    var jobFile = Components.classes["@mozilla.org/file/directory_service;1"].getService(Components.interfaces.nsIProperties).get("TmpD", Components.interfaces.nsIFile);
                    jobFile.append(printerName + "_job");
                    jobFile.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);

                    var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"].createInstance(Components.interfaces.nsIFileOutputStream);
                    stream.init(jobFile, 0x04 | 0x08 | 0x20, 0666, 0); // write, create, truncate

                    var bytesWritten = stream.write(buf, buf.length);
                    if (stream instanceof Components.interfaces.nsISafeOutputStream) {
                        stream.finish();
                    } else {
                        stream.close();
                    }

                    jobFile = null;
                    stream = null;
                    
                    return bytesWritten;

                }catch(e) {
                    // length 0 for wanning message to popup
                    return 0;
                }
                return buf.length;

            }else {

                var device = this.getDeviceController();
                if (device != null) {

                    return device.writeSerialPort(path, buf);
                }
                else {
                    return -1;
                }

            }

        },

        // invoke closeSerialPort on device controller
        closeSerialPort: function (path) {

            // if CUPS try just return true
            if (path.indexOf("/CUPS/") != -1) {
                
                return true;

            }else {

                var device = this.getDeviceController();
                if (device != null) {
                    return device.closeSerialPort(path);
                }
                else {
                    return false;
                }

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
        isReceiptPrinted: function(orderid, batch, device) {
            var orderReceiptModel = new OrderReceiptModel();
            var receipts = orderReceiptModel.find('all', {
                conditions: 'order_id = "' + orderid + '" AND device = "' + device + '" AND batch = "' + batch + '"'
            });
            if (receipts == null || receipts.length == 0)
                return null;
            else
                return receipts;
        },

        // add a receipt print timestamp
        receiptPrinted: function(orderid, orderseq, batch, device) {

            var orderReceiptModel = new OrderReceiptModel();
            var orderReceipt = {
                order_id: orderid,
                batch: batch,
                sequence: orderseq,
                device: device
            };

            orderReceiptModel.save(orderReceipt);
        },

        // handle order submit events
        submitOrder: function(evt) {
            var txn = evt.data;

            //this.log('SUBMIT: ' + GeckoJS.BaseObject.dump(txn.data));
            if (txn.data.status < 0) return;
            
            // don't print if order has been pre-finalized and the order is being submitted for completion
            // since receipts and checks would have already been printed
            if (txn.data.status != 1 || !txn.isClosed()) {
                // check if receipts need to be printed
                if (txn.data.batchPaymentCount > 0 || txn.isClosed()) {
                    this.printReceipts(evt.data, null, 'submit');
                }
                // allow UI to catch up
                this.sleep(100);

                // check if checks need to be printed
                if (txn.data.batchItemCount > 0) {
                    this.printChecks(evt.data, null, 'submit');
                }
            }
            
            // @todo delay saving order to database til after print jobs have all been scheduled
            if (txn.data.status == 1) this.scheduleOrderCommit(txn);

            // clear dashboard settings
            this.resetDashboardSettings();

            // @hack
            // sleep to allow UI to catch up
            this.sleep(100);
        },

        // handle store order events
        storeOrder: function(evt) {
            var txn = evt.data;
            //this.log('STORE: ' + GeckoJS.BaseObject.dump(txn.data));

            // check if receipts need to be printed
            if (txn.data.batchPaymentCount > 0 || txn.data.closed)
                this.printReceipts(evt.data, null, 'store');

            // @hack
            // sleep to allow UI to catch up
            this.sleep(100);
            
            // check if checks need to be printed
            if (txn.data.batchItemCount > 0)
                this.printChecks(evt.data, null, 'store');

            // clear dashboard settings
            this.resetDashboardSettings();

            // @hack
            // sleep to allow UI to catch up
            this.sleep(100);
        },

        resetDashboardSettings: function() {
            var toggleMode = GeckoJS.Session.get('printer-dashboard-toggle-mode');
            if (toggleMode == 'popup') {
                var devices = this.getDeviceController().getSelectedDevices();
                for (var i = 1; 'receipt-' + i + '-enabled' in devices; i++) {
                    GeckoJS.Session.remove('receipt-' + i + '-suspended');
                }

                for (var i = 1; 'check-' + i + '-enabled' in devices; i++) {
                    GeckoJS.Session.remove('check-' + i + '-suspended');
                }
            }
        },

        // handles user initiated receipt requests
        issueReceipt: function(printer, duplicate) {
            var deviceController = this.getDeviceController();
            var cart = GeckoJS.Controller.getInstanceByName('Cart');

            if (deviceController == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            // check transaction status
            var txn = cart._getTransaction();
            if (txn == null) {
                // @todo OSD
                NotifyUtils.warn(_('Not an open order; cannot issue receipt'));
                return;
            }

            if (!duplicate && !txn.isSubmit() && !txn.isStored()) {
                // @todo OSD
                NotifyUtils.warn(_('The order has not been finalized; cannot issue receipt'));
                return;
            }

            // if this is a stored order, check if the current batch contains any payment information or if this is a receipt copy
            if (txn.data.status != 1 && !txn.hasPaymentsInBatch() && !txn.isClosed() && !duplicate) {
                NotifyUtils.warn(_('No new payment made; cannot issue receipt'));
                return;
            }

            // @todo IRVING
            // what about the case where order has been stored and receipt may have been printed?
            // we need to keep track of receipt by terminal no, sequence, and batchCount

            // check device settings
            printer = GeckoJS.String.trim(printer);
            if (printer == null || printer == '') {
                switch (deviceController.isDeviceEnabled('receipt', null)) {
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
                switch (deviceController.isDeviceEnabled('receipt', printer)) {
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
            this.printReceipts(txn, printer, 0, duplicate);
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

            var deviceController = this.getDeviceController();
            if (deviceController == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            var enabledDevices = deviceController.getEnabledDevices('receipt');
            var order = txn.data;
            
            var data = {
                txn: txn,
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
                for (var i = 0; i < enabledDevices.length; i++) {
                    var device = enabledDevices[i];

                    // check if receipt printer is suspended
                    if (!autoPrint || !GeckoJS.Session.get('receipt-' + device.number + '-suspended')) {

                        // check if we are the target device
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

                            // check if record already exists on this device if not printing a duplicate
                            if (data.duplicate == null) {
                                var receipts = self.isReceiptPrinted(data.order.id, data.order.batchCount, device.number);
                                if (receipts != null) {
                                    // if auto-print, then we don't issue warning
                                    if (!autoPrint) NotifyUtils.warn(_('A receipt has already been issued for this order on printer [%S]', [device.number]));
                                    return;
                                }
                            }
                            self.printSlip(data, template, port, portspeed, handshaking, devicemodel, encoding, device.number, copies);
                        }
                    }
                };
            }
        },

        // handles user initiated check requests
        issueCheck: function(printers, duplicate) {
            var deviceController = this.getDeviceController();
            var cart = GeckoJS.Controller.getInstanceByName('Cart');

            if (deviceController == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

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

            if (!duplicate && !txn.isStored() && !txn.isSubmit()) {
                NotifyUtils.warn(_('Order has not been stored yet; cannot issue check'));
                return;
            }

            if (!txn.hasItemsInBatch() && !duplicate || duplicate && txn.getItemsCount() == 0) {
                NotifyUtils.warn(_('Nothing has been registered yet; cannot issue check'));
                return;
            }

            // check device settings
            if (printers == null || printers == '' ) {
                switch (deviceController.isDeviceEnabled('check', null)) {
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
                    switch (deviceController.isDeviceEnabled('check', printer)) {
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
                    self.printChecks(txn, printer, 0, duplicate);
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
                    // check if receipt printer is suspended
                    if (!autoPrint || !GeckoJS.Session.get('check-' + device.number + '-suspended')) {

                        // check if we are the target device
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
                            data.printAllRouting = device.printAllRouting;
                            data.routingGroups = routingGroups;
                            data.autoPrint = autoPrint;
                            data.duplicate = duplicate;
                            self.printSlip(data, template, port, portspeed, handshaking, devicemodel, encoding, 0, copies);
                        }
                    }
                });
            }
        },

        // return report printer paperwidth

        getReportPaperWidth: function(type) {
            var device = this.getDeviceController();

            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            // check device settings
            var printer = (type == 'report' ? 1 : 2);

			// to test with the 'alert' below, just comment the following switch statement and setup a dummy printer.
            switch (device.isDeviceEnabled('report', printer)) {
                case -2:
                case -1:
                case 0:
                    return;

                default:
                    var enabledDevices = device.getEnabledDevices('report', printer);
                    return enabledDevices[0].paperwidth;
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

			// to test with the 'alert' below, just comment the following switch statement and setup a dummy printer.
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
            
            //alert( template );

            this.printSlip(null, template, port, portspeed, handshaking, devicemodel, encoding, 0, 1);
        },

        // print slip using the given parameters
        printSlip: function(data, template, port, portspeed, handshaking, devicemodel, encoding, device, copies) {
        	var isTraining = GeckoJS.Session.get( "isTraining" );
        	if (isTraining) return;
        	
            if (this._worker == null) {
                NotifyUtils.error(_('Error in Print controller; no worker thread available!'));
                return;
            }
            var portPath = this.getPortPath(port);
            var commands = {};
            if (portPath == null || portPath == '') {
                NotifyUtils.error(_('Specified device port [%S] does not exist!', [port]));
                return;
            }

            // expand data with storeContact and terminal_no
	        if (data) {
                data.customer = GeckoJS.Session.get('current_customer');
                data.store = GeckoJS.Session.get('storeContact');
                if (data.store) data.store.terminal_no = GeckoJS.Session.get('terminal_no');
                
                // expand data with annotations
                var annotationModel = new OrderAnnotationModel();
                data.annotations = annotationModel.findByIndex('all', {index: 'order_id', value: data.order.id, order: 'type', recursive: 0});
	        }

            // dispatch beforePrintCheck event to allow extensions to add to the template data object or
            // to prevent check from printed
            if (!this.dispatchEvent('beforePrintSlip', {data: data,
                                                        template: template,
                                                        port: port,
                                                        portspeed: portspeed,
                                                        handshaking: handshaking,
                                                        devicemodel: devicemodel,
                                                        encoding: encoding,
                                                        device: device})) {
                return;
            }

            //@debug
            //if (data && data.order) this.log('duplicate: ' + data.duplicate + ': ' + this.dump(data.order));
            // if (data.customer) this.log(this.dump(data.customer));
            // if (data.store) this.log(this.dump(data.store));
            // if (data.annotations) this.log(this.dump(data.annotations));

            // check if item is linked to this printer and set 'linked' accordingly
            if (data != null) {
                var empty = true;
                var routingGroups = data.routingGroups;

                //this.log('printNoRouting: ' + data.printNoRouting);
                //this.log('device group: ' + data.linkgroup);
                //this.log('routingGroups: ' + GeckoJS.BaseObject.dump(data.routingGroups));
                for (var i in data.order.items) {
                    var item = data.order.items[i];
                    if (data.printAllRouting && (data.duplicate || item.batch == data.order.batchCount)) {
                        item.linked = true;
                        empty = false;
                    }
                    else {
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
                            }
                        }

                        if (!item.linked && data.linkgroup != null && data.linkgroup != '' && item.link_group && item.link_group.indexOf(data.linkgroup) > -1) {
                            item.linked = true;
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
                            }
                        }

                        item.linked = item.linked && (data.duplicate || item.batch == data.order.batchCount);
                        if (item.linked) empty = false;
                    }
                    //this.log('item linked: ' + item.linked);
                }

                data.hasLinkedItems = !empty;
                if (empty) {
                    //this.log('no items linked to this printer; printing terminated');
                }
            }

            var tpl;
            var result;

            // if data is null, then the document has already been generated and passed in through the template parameter
            if (data != null) {

                //this.log('type [' + typeof data.duplicate + '] [' + data.duplicate + '] ' + GeckoJS.BaseObject.dump(data.order));
                
                tpl = this.getTemplateData(template, false);
                if (tpl == null || tpl == '') {
                    NotifyUtils.error(_('Specified template [%S] is empty or does not exist!', [template]));
                    return;
                }
                result = tpl.process(data);
            }
            else {
                result = template;
            }

            if (!result || result.length == 0) {
                return;
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
            //@debug
            //alert(GeckoJS.BaseObject.dump(result));
            //this.log(GeckoJS.BaseObject.dump(result));
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
                        data = this.eventData.data;
                        if (this.eventData.device > 0 && this.eventData.printed) {
                            self.receiptPrinted(data.order.id, data.order.seq, data.order.batchCount, this.eventData.device);
                            self.dispatchEvent('onReceiptPrinted', this.eventData);
                        }
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
                            // since we can't access DB to see if receipt is already printed, we'll store the last
                            // receipt information to prevent duplicate receipts from printed
                            if (this.lastReceipt != null) {
                                if (data.order.id == this.lastReceipt.id &&
                                    data.order.batchCount == this.lastReceipt.batchCount &&
                                    device == this.lastReceipt.device) {
                                    NotifyUtils.warn(_('A receipt has already been issued for this order on printer [%S]', [device]));
                                    return;
                                }
                            }
                        }

                        var printed = 0;
                        if (self.checkSerialPort(portPath, handshaking, true)) {
                            if (self.openSerialPort(portPath, portspeed, handshaking)) {
                                for (var i = 0; i < copies; i++) {
                                    var len = self.writeSerialPort(portPath, encodedResult);
                                    if (len == encodedResult.length) {
                                        printed++;
                                    }
                                }
                                self.closeSerialPort(portPath);
                                if (data && data.order) {
                                }
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
                            this.lastReceipt = {id: data.order.id,
                                                batchCount: data.order.batchCount,
                                                device: device};

                        }

                        // dispatch receiptPrinted event indirectly through the main thread
                        
                        if (self._main) {

                            var curThread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;

                            if (curThread === self._main) {
                                // invoke directly
                                (new sendEvent(device, data, result,encodedResult, printed)).run();
                            }else {
                                self._main.dispatch(new sendEvent(device, data, result,encodedResult, printed), self._main.DISPATCH_NORMAL);
                            }
                            
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

            // if CUPS , use main Thread
            if (portPath.indexOf("/CUPS/") != -1) {
                // direct invoke run function and set runnable to this context
                runnable.run.apply(runnable);
            }else {
                this._worker.dispatch(runnable, this._worker.DISPATCH_NORMAL);
            }
            
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

                        // dispatch afterSubmit event...
                        self.dispatchEvent('afterSubmit', this._commitTxn);
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

        },

        dashboard: function () {
            var aURL = 'chrome://viviecr/content/printer_dashboard.xul';
            var width = this.screenwidth/2;
            var height = this.screenheight/2;
            GREUtils.Dialog.openWindow(window, aURL, _('Printer Dashboard'), 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height, '');
        },

        loadDashboard: function() {
            var devices = this.getSelectedDevices();
            if (devices != null) {
                this.log(this.dump(devices));

                // create receipt printer icons
                var receiptRow = document.getElementById('receipt-row');
                if (receiptRow) {
                    for (var i = 0; true; i++) {
                        var attr = 'receipt-' + i + '-enabled';
                        alert('is ' + attr + ' in devices: ' + (attr in devices));
                        if ('receipt-' + i + '-enabled' in devices) {

                            // create icon button for this device
                            var btn = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:button");
                            receiptRow.appendChild(btn);
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }

    };

    GeckoJS.Controller.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'Print');
                                      });

    }, false);


})();

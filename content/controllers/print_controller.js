(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    include('chrome://viviecr/content/devices/deviceTemplate.js');
    include('chrome://viviecr/content/devices/deviceTemplateUtils.js');
    include('chrome://viviecr/content/reports/template_ext.js');

    var __controller__ = {

        name: 'Print',

        _device: null,
        _worker: null,

        // load device configuration and selections
        initial: function () {

            // get handle to Devices controller
            this._device = this.getDeviceController();

            // initialize worker thread
            //this._worker = GREUtils.Thread.getWorkerThread();
            this._worker = GREUtils.Thread.getMainThread();

            // initialize main thread
            this._main = GREUtils.Thread.getMainThread();

            // add event listener for onSubmit / afterSubmit events
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if(cart) {
                cart.addEventListener('afterSubmit', this.handleSubmitEvent, this);
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
            var receipt = orderReceiptModel.find('first', {
                conditions: 'order_id = "' + orderid + '" AND device = "' + device + '" AND batch = "' + batch + '"'
            });
            
            if (parseInt(orderReceiptModel.lastError) != 0) {
                this._dbError(orderReceiptModel.lastError, orderReceiptModel.lastErrorString,
                              _('An error was encountered while checking if receipt has been printed (error code %S) [message #1201].', [orderReceiptModel.lastError]));
            }
            return receipt;
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

            var r = orderReceiptModel.saveReceipt(orderReceipt);
            if (!r) {
                // failed to save record to db/backup
                this._dbError(orderReceiptModel.lastError, orderReceiptModel.lastErrorString,
                              _('An error was encountered while saving order receipt log (error code %S) [message #1202].', [orderReceiptModel.lastError]));
            }
        },

        // add a receipt print timestamp
        ledgerReceiptPrinted: function(ledger_id, printer) {

            var ledgerReceiptModel = new LedgerReceiptModel();
            var ledgerReceipt = {
                ledger_id: ledger_id,
                printer: printer
            };
            var r = ledgerReceiptModel.saveReceipt(ledgerReceipt);
            if (!r) {
                // failed to save record to db/backup
                this._dbError(ledgerReceiptModel.lastError, ledgerReceiptModel.lastErrorString,
                              _('An error was encountered while saving ledger receipt log (error code %S) [message #1203].', [ledgerReceiptModel.lastError]));
            }
        },

        handleSubmitEvent: function(evt) {
            var txn = evt.data;

            if (txn.data.status == 1) {
                this.submitOrder(evt);
            }
            else if (txn.data.status == 2) {
                this.storeOrder(evt);
            }
        },

        // handle order submit events
        submitOrder: function(evt) {
            var txn = evt.data;

            //this.log('DEBUG', 'SUBMIT: ' + GeckoJS.BaseObject.dump(txn.data));
            if (txn.data.status < 0) return;
            
            // don't print if order has been pre-finalized and the order is being submitted for completion
            // since receipts and checks would have already been printed
            if (txn.data.status != 1 || !txn.isClosed()) {

                try {
                    // check if receipts need to be printed
                    if ((txn.data.batchPaymentCount > 0) ||
                        (txn.data.status == 1 && !txn.isClosed()) ||
                        (txn.data.status != 1 && txn.isClosed())) {
                        this.printReceipts(evt.data, null, 'submit');
                    }

                    // check if checks need to be printed
                    if (txn.data.batchItemCount > 0) {
                        this.printChecks(evt.data, null, 'submit');
                    }
                }
                catch(e) {
                    this.log('ERROR', 'error in generating receipts/checks on submitting order');
                }
            }
            
            // clear dashboard settings
            this.resetDashboardSettings();
        },

        // handle store order events
        storeOrder: function(evt) {
            var txn = evt.data;

            try {
                // check if receipts need to be printed
                if (txn.data.batchPaymentCount > 0 || txn.data.closed)
                    this.printReceipts(evt.data, null, 'store');

                // check if checks need to be printed
                if (txn.data.batchItemCount > 0)
                    this.printChecks(evt.data, null, 'store');
            }
            catch(e) {
                this.log('ERROR', 'error in generating receipts/checks on submitting order');
            }
            // clear dashboard settings
            this.resetDashboardSettings();
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
        issueReceipt: function(printer, duplicate, txn) {
            var deviceController = this.getDeviceController();

            if (deviceController == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            // check transaction status

            if (!txn) {
                let cart = GeckoJS.Controller.getInstanceByName('Cart');
                txn = cart._getTransaction();
            }
            if (txn == null) {

                NotifyUtils.warn(_('Not an open order; cannot issue receipt'));
                return;
            }

            if (!duplicate && !txn.isSubmit() && !txn.isStored()) {

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
            if (printer != null) printer = GeckoJS.String.trim(printer);
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

        issueReceiptCopy: function(printer, txn) {
            this.issueReceipt(printer, true, txn);
        },

        // print on all enabled receipt printers
        // printer = 0: print on all enabled printers
        // printer = 1: first printer
        // printer = 2: second printer
        // printer = null: print on all auto-print enabled printers

        printReceipts: function(txn, printer, autoPrint, duplicate, fallbackToDuplicate) {
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
                            if (!data.duplicate) {
                                var receipt = self.isReceiptPrinted(data.order.id, data.order.batchCount, device.number);
                                if (receipt) {
                                    if (fallbackToDuplicate) {
                                        data.duplicate = true;
                                    }
                                    else {
                                        // if auto-print, then we don't issue warning
                                        if (!autoPrint) NotifyUtils.warn(_('A receipt has already been issued for this order on printer [%S]', [device.number]));
                                        return;
                                    }
                                }
                            }
                            self.printSlip('receipt', data, template, port, portspeed, handshaking, devicemodel, encoding, device.number, copies);
                        }
                    }
                };
            }
        },

        // handles user initiated check requests
        issueCheck: function(printers, duplicate, finalize) {
            var deviceController = this.getDeviceController();
            var cart = GeckoJS.Controller.getInstanceByName('Cart');

            if (deviceController == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            // check transaction status
            var txn = cart._getTransaction();
            if (txn == null) {

                NotifyUtils.warn(_('Not an open order; cannot issue check'));
                return; // fatal error ?
            }

            if (txn.isCancel()) {

                NotifyUtils.warn(_('Cannot issue check on a cancelled order'));
                return; // fatal error ?
            }

            if (!duplicate && !finalize && !txn.isStored() && !txn.isSubmit()) {

                NotifyUtils.warn(_('Order has not been stored yet; cannot issue check'));
                return;
            }

            if (txn.getItemsCount() == 0) {

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

        prepareGuestCheck: function(printers) {
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var txn = cart._getTransaction();

            cart.dispatchEvent('PrepareFinalization', txn);

            // print guest check if printers is not empty
            if (printers != null && printers != '') {
                this.issueCheck(printers, false, true);
            }
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
                            data.order = GREUtils.extend({}, txn.data);
                            self.printSlip('check', data, template, port, portspeed, handshaking, devicemodel, encoding, device.number, copies);
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

        // handles
        printLedgerReceipt: function(ledgerEntry, printer) {
            var device = this.getDeviceController();

            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

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

            var enabledDevices = device.getEnabledDevices('receipt', printer);
            if (enabledDevices != null) {
                var template = enabledDevices[0].template;
                var port = enabledDevices[0].port;
                var portspeed = enabledDevices[0].portspeed;
                var handshaking = enabledDevices[0].handshaking;
                var devicemodel = enabledDevices[0].devicemodel;
                var encoding = enabledDevices[0].encoding;

                _templateModifiers(TrimPath, encoding);

                var data = {ledger: ledgerEntry};

                this.printSlip('ledger', data, template, port, portspeed, handshaking, devicemodel, encoding, printer, 1);
            }
        },

        // handle user initiated non-transaction document printing requests
        printDocument: function(printer) {
            var device = this.getDeviceController();

            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return;
            }

            if (printer == null) {
                NotifyUtils.warn(_('Target check printer not specified'));
                return;
            }
            
            // check device settings
            switch (device.isDeviceEnabled('check', printer)) {
                case -2:
                    NotifyUtils.warn(_('The specified check printer [%S] is not configured', [printer]));
                    return;

                case -1:
                    NotifyUtils.warn(_('Invalid check printer [%S]', [printer]));
                    return;

                case 0:
                    NotifyUtils.warn(_('The specified check printer [%S] is not enabled', [printer]));
                    return;
            }

            var enabledDevices = device.getEnabledDevices('check', printer);
            if (enabledDevices != null) {
                var template = enabledDevices[0].template;
                var port = enabledDevices[0].port;
                var portspeed = enabledDevices[0].portspeed;
                var handshaking = enabledDevices[0].handshaking;
                var devicemodel = enabledDevices[0].devicemodel;
                var encoding = enabledDevices[0].encoding;

                _templateModifiers(TrimPath, encoding);

                this.printSlip('check', {}, template, port, portspeed, handshaking, devicemodel, encoding, printer, 1);
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
            
            //alert( template );

            this.printSlip('report', null, template, port, portspeed, handshaking, devicemodel, encoding, printer, 1);
        },

         printLabel: function(list, barcodeType, template){
              
            //1.getDeviceController
            var device = this.getDeviceController();

            //2.dectct Enable
              // check device settings
            var printer = 2;

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

            //3.get set up
            var enabledDevices = device.getEnabledDevices('report', printer);
         //   var template = enabledDevices[0].template;
            var port = enabledDevices[0].port;
            var portspeed = enabledDevices[0].portspeed;
            var handshaking = enabledDevices[0].handshaking;
            var devicemodel = enabledDevices[0].devicemodel;
            var encoding = enabledDevices[0].encoding;

            var data = { product: list, barcodeType: barcodeType };

            _templateModifiers(TrimPath, encoding);
            //4.call printSlip
            this.printSlip('label', data, template, port, portspeed, handshaking, devicemodel, encoding, printer, 1);
        },

        // print slip using the given parameters
        printSlip: function(deviceType, data, template, port, portspeed, handshaking, devicemodel, encoding, printer, copies) {
        	var isTraining = GeckoJS.Session.get( "isTraining" );
        	var ifPrintWhileTraining = GeckoJS.Configure.read( "vivipos.fec.settings.ifprintwhiletraining" );
        	if ( isTraining && !ifPrintWhileTraining ) return;

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
                if (!data.user) {
                    let user = this.Acl.getUserPrincipal();
                    if (user) {
                        data.user = user.username;
                        data.display_name = user.description;
                    }
                }
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
                                                        printer: printer,
                                                        devicetype: deviceType})) {
                return;
            }

            //@debug
            //if (data && data.order) this.log('DEBUG', 'duplicate: ' + data.duplicate + ': ' + this.dump(data.order));
            //if (data && data.customer) this.log('DEBUG', this.dump(data.customer));
            //if (data && data.store) this.log('DEBUG', this.dump(data.store));
            //if (data && data.ledger) this.log('DEBUG', this.dump(data.ledger));

            // check if item is linked to this printer and set 'linked' accordingly
            if (data && data.order && deviceType == 'check') {
                var empty = true;
                var routingGroups = data.routingGroups;

                //this.log('DEBUG', 'printNoRouting: ' + data.printNoRouting);
                //this.log('DEBUG', 'device group: ' + data.linkgroup);
                //this.log('DEBUG', 'routingGroups: ' + GeckoJS.BaseObject.dump(data.routingGroups));
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
                        // 2. data.linkgroup intersects item.link_group
                        // 3. item.link_group does not contain any routing groups and device.printNoRouting is true
                        //
                        //this.log('DEBUG', 'item link groups: ' + GeckoJS.BaseObject.dump(item.link_group));
                        if (data.printNoRouting) {
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
                                noRoutingGroups = true;
                                for (i = 0; i < groups.length; i++) {
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
                    //this.log('DEBUG', 'item linked: ' + item.linked);
                }

                data.hasLinkedItems = !empty;
                if (empty) {
                    //this.log('DEBUG', 'no items linked to this printer; printing terminated');
                }
            }

            var tpl;
            var result;

            // if data is null, then the document has already been generated and passed in through the template parameter
            if (data != null) {

                // make extensions has chance to modify template or update data before parse template
                let eventData =  {  data: data,
                                    template: template,
                                    port: port,
                                    portspeed: portspeed,
                                    handshaking: handshaking,
                                    devicemodel: devicemodel,
                                    encoding: encoding,
                                    printer: printer,
                                    devicetype: deviceType };

                if (!this.dispatchEvent('beforePrintSlipGetTemplate', eventData)) {
                    return;
                }
                // reassign from eventData to local variables. data is passed by reference , don't need to reassigned.
                template = eventData.template;
                port = eventData.port;
                portspeed = eventData.portspeed;
                handshaking = eventData.handshaking;
                devicemodel = eventData.devicemodel;
                encoding = eventData.encoding;
                printer = eventData.printer;
                deviceType = eventData.devicetype;

                //this.log('DEBUG', 'type [' + typeof data.duplicate + '] [' + data.duplicate + '] ' + GeckoJS.BaseObject.dump(data.order));
                tpl = this.getTemplateData(template, false);
                if (tpl == null || tpl == '') {
                    NotifyUtils.error(_('Specified template [%S] is empty or does not exist!', [template]));
                    return;
                }
                try{
                    result = tpl.process(data);
                }
                catch(e) {
                    // NotifyUtils.error(_('Error in parsing template [%S]!', [template]));
                    this.log('ERROR', 'Error in parsing template [' + template + ']: ' + e);
                    throw e;
                }
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
                  '   device type [' + deviceType + ']\n' +
                  '   printer [' + printer + ']\n' +
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
            if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', GeckoJS.BaseObject.dump(result));
            //alert(data.order.receiptPages);
            //
            // translate embedded hex codes into actual hex values
            result = result.replace(/\[(0x[0-9,A-F][0-9,A-F])\]/g, function(str, p1, offset, s) {return String.fromCharCode(new Number(p1));});

            // get encoding
            var encodedResult = GREUtils.Charset.convertFromUnicode(result, encoding);
            //this.log('DEBUG', 'RECEIPT/CHECK\n' + encodedResult);

            // set up main thread callback to dispatch event
            var sendEvent = function(deviceType, printer, data, result, encodedResult, printed) {
                this.eventData = {printed: printed,
                                  deviceType: deviceType,
                                  printer: printer,
                                  data: data,
                                  receipt: result,
                                  encodedReceipt: encodedResult
                                 };
            }

            // send to output device using worker thread
            var self = this;

            sendEvent.prototype = {
                run: function() {
                    data = this.eventData.data;
                    if (this.eventData.printed) {
                        if (this.eventData.deviceType == 'receipt') {
                            try {
                                self.receiptPrinted(data.order.id, data.order.seq, data.order.batchCount, this.eventData.printer);
                                self.dispatchEvent('onReceiptPrinted', this.eventData);
                            }
                            catch (e) {
                                this.log('WARN', 'failed to update receipt printed event');
                            }
                        }
                        else if (this.eventData.deviceType == 'ledger') {
                            try {
                                self.ledgerReceiptPrinted(data.ledger.id, this.eventData.printer);
                                self.dispatchEvent('onLedgerReceiptPrinted', this.eventData);
                            }
                            catch (e) {
                                this.log('WARN', 'failed to update ledger receipt printed event');
                            }
                        }
                    }
                    else {
                        if (this.eventData.deviceType == 'receipt') {
                            self.dispatchEvent('onReceiptPrintingFailed', this.eventData);
                            this.log('WARN', 'receipt printing failed');
                        }
                        else if (this.eventData.deviceType == 'ledger') {
                            self.dispatchEvent('onLedgerPrintingFailed', this.eventData);
                            this.log('WARN', 'ledger printing failed');
                        }
                        else if (this.eventData.deviceType == 'check') {
                            self.dispatchEvent('onCheckPrintingFailed', this.eventData);
                            this.log('WARN', 'ledger printing failed');
                        }
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
                        // check if record already exists if deviceType is 'receipt'
                        if (deviceType == 'receipt' && ((typeof data.duplicate) == 'undefined' || data.duplicate == null)) {
                            // since we can't access DB to see if receipt is already printed, we'll store the last
                            // receipt information to prevent duplicate receipts from printed
                            if (this.lastReceipt != null) {
                                if (data.order.id == this.lastReceipt.id &&
                                    data.order.batchCount == this.lastReceipt.batchCount &&
                                    printer == this.lastReceipt.printer) {
                                    NotifyUtils.warn(_('A receipt has already been issued for this order on printer [%S]', [printer]));
                                    return;
                                }
                            }
                        }

                        var printed = 0;
                        if ( isTraining && !ifPrintWhileTraining ) {
                            printed = copies;
                        } else if (self.checkSerialPort(portPath, handshaking, true)) {
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

                            NotifyUtils.error(_('Error detected when outputing to device [%S] at port [%S]', [devicemodelName, portName]));
                        }
                        if (deviceType == 'receipt' && printed && (typeof data.duplicate == 'undefined' || data.duplicate == null)) {
                            this.lastReceipt = {id: data.order.id,
                                                batchCount: data.order.batchCount,
                                                printer: printer};
                        }

                        // dispatch receiptPrinted event indirectly through the main thread
                        if (self._main) {
                            var curThread = Components.classes["@mozilla.org/thread-manager;1"].getService().currentThread;

                            if (curThread === self._main) {
                                // invoke directly
                                (new sendEvent(deviceType, printer, data, result, encodedResult, printed)).run();
                            }else {
                                self._main.dispatch(new sendEvent(deviceType, printer, data, result,encodedResult, printed), self._main.DISPATCH_NORMAL);
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
                //this._worker.dispatch(runnable, this._worker.DISPATCH_NORMAL);
                runnable.run.apply(runnable);
            }
            
        },

        dashboard: function () {
            var aURL = 'chrome://viviecr/content/printer_dashboard.xul';
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + width + ',height=' + height;
            var width = this.screenwidth/2;
            var height = this.screenheight/2;
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Printer Dashboard'), aFeatures, '');
        },

        loadDashboard: function() {
            var devices = this.getSelectedDevices();
            if (devices != null) {

                // create receipt printer icons
                var receiptRow = document.getElementById('receipt-row');
                if (receiptRow) {
                    for (var i = 0; true; i++) {
                        if ('receipt-' + i + '-enabled' in devices) {

                            // create icon button for this device
                            var btn = document.createElementNS('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul','xul:button');
                            receiptRow.appendChild(btn);
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', 'Database error: ' + errstr + ' [' + errno + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                                  _('Data Operation Error'),
                                  errmsg + '\n\n' + _('Please restart the terminal, and if the problem persists, contact technical support immediately.'));
        }

    };

    AppController.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'Print');
                                      });

    }, false);


})();

(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'Devices',

        _templates: null,
        _ports: null,
        _portspeeds: null,
        _devicemodels: null,
        _selectedDevices: null,
        _sortedDevicemodels: {},
        _portControlService: null,
        _sortedPorts: [],
        _deviceLimitPrefix: 'vivipos.fec.settings.devices.limit',
        _maxChecks: null,
        _maxReceipts: 2,
        _maxVFDs: 2,
        _maxDrawers: 2,
        _maxScales: 2,
        _maxReports: 2,

        // load device configuration and selections
        initial: function (warn) {
            if (warn == null) warn = true;

            // load templates
            this._templates = GeckoJS.Configure.read('vivipos.fec.registry.templates');

            // load device ports
            this.getPorts();

            // load port speeds
            var portspeeds = GeckoJS.Configure.read('vivipos.fec.registry.portspeeds');
            if (portspeeds != null) portspeeds = portspeeds.split(',');
            this._portspeeds = portspeeds;

            // load device models
            this._devicemodels = GeckoJS.Configure.read('vivipos.fec.registry.devicemodels');

            // load device selections
            this._selectedDevices = GeckoJS.Configure.read('vivipos.fec.settings.selectedDevices');
            if (this._selectedDevices != null)
                this._selectedDevices = GeckoJS.BaseObject.unserialize(this._selectedDevices);

            // load templates and command files
            this.loadEnabledDevices(this._selectedDevices);

            // warn if one or more enabled devices are off-line
            if (warn) {
                var win = this.topmostWindow;

                if (win.document.documentElement.id == 'viviposMainWindow'
                    && win.document.documentElement.boxObject.screenX < 0) {
                    win = null;
                }

                var statusResult = this.checkStatusAll();

                if (!statusResult.printerEnabled) {
                    if (GeckoJS.Session.get('firstrun')) {
                        GREUtils.Dialog.alert(win,
                                              _('Device Status'),
                                              _('Please remember to configure devices to enable receipt and check printing'));
                    }
                    else {
                        GREUtils.Dialog.alert(win,
                                              _('Device Status'),
                                              _('No device has been enabled for receipt and/or check printing!'));
                    }
                }

                var statusStr = '';

                // generate list of devices that may not be ready
                var statuses = statusResult.statuses || [];
                var offline = false;
                statuses.forEach(function(status) {
                    if (status[2] == 0) {
                        statusStr += '\n   ' + _('Device') + ' [' + status[0] + ']: ' + _('Port') + ' [' + status[1] + ']';
                        offline = true;
                    }
                });

                if (offline) {
                    GREUtils.Dialog.alert(win,
                                          _('Device Status'),
                                          _('The following enabled devices appear to be offline, please ensure that they are functioning correctly') + '\n  ' + statusStr);
                }
            }
            // observer device-refresh topic
            var self = this;
            this.observer = GeckoJS.Observer.newInstance({
                topics: ['device-refresh'],

                observe: function(aSubject, aTopic, aData) {
                    if (aTopic == 'device-refresh') {
                        self._selectedDevices = GeckoJS.Configure.read('vivipos.fec.settings.selectedDevices');
                        if (self._selectedDevices != null)
                            self._selectedDevices = GeckoJS.BaseObject.unserialize(self._selectedDevices);
                        self.loadEnabledDevices(self._selectedDevices);
                    }
                }
            }).register();


            // log enabled devices and cached data
            /*
            this.log('Devices [settings]: ' + GeckoJS.BaseObject.dump(this._selectedDevices));
            this.log('Devices [commands]: ' + GeckoJS.BaseObject.dump(GeckoJS.Session.get('deviceCommands')));
            this.log('Devices [templates]: ' + GeckoJS.BaseObject.dump(GeckoJS.Session.get('deviceTemplates')));
            */
        },

        getMaxChecks: function() {
            if (this._maxChecks == null) {
                // get maximum number of check devices
                this._maxChecks = GeckoJS.Configure.read(this._deviceLimitPrefix + '.check') || 4;
            }
            return this._maxChecks;
        },

        // load and cache device templates and commands
        loadEnabledDevices: function (enabledDevices) {

            var deviceCommands = {};
            var deviceTemplates = {};
            var devicemodels = this.getDeviceModels();
            var templates = this.getTemplates();

            if (enabledDevices != null) {
                // receipts
                for (let i = 1; i <= this._maxReceipts; i++) {
                    let id = 'receipt-' + i;
                    if (enabledDevices[id + '-enabled']) {
                        // check if template already loaded
                        let template = enabledDevices[id + '-template'];
                        if (template != null && !(template in deviceTemplates) && templates[template] != null) {
                                deviceTemplates[template] = this.loadTemplateFile(templates[template].path);
                        }

                        // check if device already loaded
                        let device = enabledDevices[id + '-devicemodel'];
                        if (device != null && device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                            deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                        }
                    }
                }

                // checks
                let maxChecks = this.getMaxChecks();
                for (let i = 1; i <= maxChecks; i++) {
                    let id = 'check-' + i;
                    if (enabledDevices[id + '-enabled']) {
                        // check if template already loaded
                        let template = templates[id + '-template'];
                        if (template != null && !(template in deviceTemplates) && templates[template] != null) {
                            deviceTemplates[template] = this.loadTemplateFile(templates[template].path);
                        }

                        // check if device already loaded
                        let device = enabledDevices[id + '-devicemodel'];
                        if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                            deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                        }
                    }
                }

                // reports
                for (let i = 1; i <= this._maxReports; i++) {
                    let id = 'report-' + i;
                    if (enabledDevices[id + '-enabled']) {
                        // check if device already loaded
                        let device = enabledDevices[id + '-devicemodel'];
                        if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                            deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                        }
                    }
                }

                // vfds
                for (let i = 1; i <= this._maxVFDs; i++) {
                    let id = 'vfd-' + i;
                    if (enabledDevices[id + '-enabled']) {
                        let template = templates[id + '-template'];
                        if (template != null && !(template in deviceTemplates) && templates[template] != null) {
                            deviceTemplates[template] = this.loadTemplateFile(templates[template].path);
                        }

                        // check if device already loaded
                        let device = enabledDevices[id + '-devicemodel'];
                        if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                            deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                        }
                    }
                }

                // cashdrawers
                for (let i = 1; i <= this._maxDrawers; i++) {
                    let id = 'cashdrawer-' + i;
                    if (enabledDevices[id + '-enabled'] && (enabledDevices[id + '-type'] == 'printer')) {
                        // check if device already loaded
                        let device = enabledDevices['cashdrawer-1-devicemodel'];
                        if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                            deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                        }
                    }
                }
            }
            GeckoJS.Session.set('deviceCommands', deviceCommands);
            GeckoJS.Session.set('deviceTemplates', deviceTemplates);

        },

        loadDeviceCommandFile: function(path) {
            var commands = new Object;
            try {
                var file = new GeckoJS.File(GREUtils.File.chromeToPath(path));
                file.open('r');
                var lines = file.readAllLine();
                file.close();
                
                lines.forEach(function(line) {
                    var entry = line.split('=');
                    var name = entry[0];
                    var code = entry[1];

                    commands[name] = code;
                });
            }
            catch (e) {
                this.log('Error reading from device command file [' + path + ']');
            }
            return commands;
        },

        loadTemplateFile: function(path) {
            var bytes = {};
            try {
                var file = new GeckoJS.File(GREUtils.File.chromeToPath(path));
                file.open('r');
                bytes = file.readAllLine();
                if (bytes.length > 0) bytes = bytes.join('\n');
                file.close();
            }
            catch (e) {
                this.log('WARN', 'Error reading from template file [' + path + ',' + GREUtils.File.chromeToPath(path) + ']');
                bytes = '';
            }
            return bytes;
        },

        // open serial port for writing
        openSerialPort: function (path, speed, handshaking) {

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

                var portControl = this.getSerialPortControlService();
                if (portControl != null) {
                    try {
                        return (portControl.openPort(path, speed + ',n,8,1,' + handshaking) == 0);
                    }
                    catch(e) {
                        return false;
                    }
                }
                else {
                    return false;
                }
                
            }
        },

        readSerialPort: function (path, buf, len) {
            var r = -1;
            var portControl = this.getSerialPortControlService();
            if (portControl != null) {
                try {
                    var o = {};
                    r = portControl.readPort(path, o, len);

                    buf.value = o.value;
                }
                catch(e) {
                }
            }
            return r;
        },

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

                var portControl = this.getSerialPortControlService();
                var len = -1;
                if (portControl != null) {
                    try {

                        len = portControl.writePort(path, buf, buf.length);

                    }
                    catch(e) {
                    }
                }
                return len;
                
            }
        },

        // close serial port
        closeSerialPort: function (path) {

            // if CUPS try just return true
            if (path.indexOf("/CUPS/") != -1) {

                return true;

            }else {

                var portControl = this.getSerialPortControlService();
                if (portControl != null) {
                    try {
                        return (portControl.closePort(path) == 0);
                    }
                    catch(e) {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
        },

        // check status of enabled devices
        // returns
        //  0: offline
        //  1: online
        //  2: no enabled devices
        checkStatusAll: function () {
            // for each enabled device, check its status and return a list of devices not in ready status
            var statuses = [];
            var selectedDevices = this.getSelectedDevices();
            var ports = this.getPorts();
            var status;
            var printerEnabled = false;

            if (selectedDevices != null) {

                // receipts
                for (let i = 1; i <= this._maxReceipts; i++) {
                    let id = 'receipt-' + i;
                    if (selectedDevices[id + '-enabled']) {
                        let port = selectedDevices[id + '-port'];
                        status = 0;
                        if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                            switch(ports[port].type) {
                                case 'serial':
                                case 'usb':
                                    status = this.checkSerialPort(ports[port].path, selectedDevices[id + '-handshaking'], 1);
                                    break;
                            }
                            statuses.push([_('Receipt Printer %S', [i]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        }
                        else {
                            if (ports != null && port!= null && ports[port] != null)
                                statuses.push([_('Receipt Printer %S', [i]), ports[port].label + ' (' + ports[port].path + ')', status]);
                            else
                                statuses.push([_('Receipt Printer %S', [i]), 'unknown', status]);
                        }
                        printerEnabled = true;
                    }
                }

                // checks
                let maxChecks = this.getMaxChecks();
                for (let i = 1; i <= maxChecks; i++) {
                    let id = 'check-' + i;
                    if (selectedDevices[id + '-enabled']) {
                        let port = selectedDevices[id + '-port'];
                        status = 0;
                        if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                            switch(ports[port].type) {
                                case 'serial':
                                case 'usb':
                                    status = this.checkSerialPort(ports[port].path, selectedDevices[id + '-handshaking'], 1);
                                    break;
                            }
                            statuses.push([_('Check Printer %S', [i]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        }
                        else {
                            if (ports != null && port!= null && ports[port] != null)
                                statuses.push([_('Check Printer %S', [i]), ports[port].label + ' (' + ports[port].path + ')', status]);
                            else
                                statuses.push([_('Check Printer %S', [i]), 'unknown', status]);
                        }
                        printerEnabled = true;
                    }
                }

                // reports
                for (let i = 1; i <= this._maxReports; i++) {
                    let id = 'report-' + i;
                    if (selectedDevices[id + '-enabled']) {
                        let port = selectedDevices[id + '-port'];
                        status = 0;
                        if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                            switch(ports[port].type) {
                                case 'serial':
                                case 'usb':
                                    status = this.checkSerialPort(ports[port].path, selectedDevices[id + '-handshaking'], 1);
                                    break;
                            }
                            statuses.push([_('Report Printer %S', [i]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        }
                        else {
                            if (ports != null && port!= null && ports[port] != null)
                                statuses.push([_('Report Printer %S', [i]), ports[port].label + ' (' + ports[port].path + ')', status]);
                            else
                                statuses.push([_('Report Printer %S', [i]), 'unknown', status]);
                        }
                        printerEnabled = true;
                    }
                }

                // vfds
                for (let i = 1; i <= this._maxVFDs; i++) {
                    let id = 'vfd-' + i;
                    if (selectedDevices[id + '-enabled']) {
                        let port = selectedDevices[id + '-port'];
                        status = 0;
                        if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                            switch(ports[port].type) {
                                case 'serial':
                                case 'usb':
                                    status = this.checkSerialPort(ports[port].path, selectedDevices[id + '-handshaking'], 1);
                                    break;
                            }
                            statuses.push([_('VFD %S', [i]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        }
                        else {
                            if (ports != null && port!= null && ports[port] != null)
                                statuses.push([_('VFD %S', [i]), ports[port].label + ' (' + ports[port].path + ')', status]);
                            else
                                statuses.push([_('VFD %S', [i]), 'unknown', status]);
                        }
                    }
                }

                // vfds
                for (let i = 1; i <= this._maxDrawers; i++) {
                    let id = 'cashdrawer-' + i;
                    if (selectedDevices[id + '-enabled']) {
                        let type = selectedDevices[id + '-type'];
                        status = 0;
                        if (type == 'gpio') {
                                status = this.checkGPIOPort();
                        }
                        else {
                            var port = selectedDevices[id + '-port'];
                            if (ports != null &&  port != null && ports[port] != null && ports[port].path != null) {
                                switch(ports[port].type) {
                                    case 'serial':
                                    case 'usb':
                                        status = this.checkSerialPort(ports[port].path, selectedDevices[id + '-handshaking'], 1);
                                        break;
                                }
                                statuses.push([_('Cash Drawer %S', [i]), ports[port].label + ' (' + ports[port].path + ')', status]);
                            }
                            else {
                                if (ports != null && port!= null && ports[port] != null)
                                    statuses.push([_('Cash Drawer %S', [i]), ports[port].label + ' (' + ports[port].path + ')', status]);
                                else
                                    statuses.push([_('Cash Drawer %S', [i]), 'unknown', status]);
                            }
                        }
                    }
                }

                // scales
                for (let i = 1; i <= this._maxScales; i++) {
                    let id = 'scale-' + i;
                    if (selectedDevices[id + '-enabled']) {
                        let port = selectedDevices[id + '-port'];
                        if (ports != null &&  port != null && ports[port] != null && ports[port].path != null) {
                            switch(ports[port].type) {
                                case 'serial':
                                case 'usb':
                                    status = this.checkSerialPort(ports[port].path, selectedDevices[id + '-handshaking'], 1);
                                    break;
                            }
                            statuses.push([_('Scale %S', [i]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        }
                        else {
                            if (ports != null && port!= null && ports[port] != null)
                                statuses.push([_('Scale %S', [i]), ports[port].label + ' (' + ports[port].path + ')', status]);
                            else
                                statuses.push([_('Scale %S', [i]), 'unknown', status]);
                        }
                    }
                }
            }
            return {printerEnabled: printerEnabled, statuses: statuses};
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
            }

            var portControl = this.getSerialPortControlService();
            var status = 0;
            if (handshaking == null) handshaking = 'n';
            if (noHandshakingValue == null) noHandshakingValue = false;

            // if handshaking is 'n' or 'x', return value depending value of checkOnly
            if (handshaking == 'x' || handshaking == 'n') {
                return noHandshakingValue;
            }
            
            if (portControl != null) {
                portControl.openPort(path, '9600,n,8,1,' + handshaking);
                status = portControl.statusPort(path);
                portControl.closePort(path);
                //this.log(path + ':' + status);

                if (status == -1) {
                    status = 0;
                }
                // handshaking == 'h' is provided as a legacy from VIVIPOS OS 1.2.0
                else if (handshaking == 'h' || handshaking == 'rtscts') {
                    status = status & 0x20 ? 1 : 0;
                }
                else if (handshaking == 'dtrdsr') {
                    status = status & 0x0100 ? 1 : 0;
                }
                else {
                    return 0;
                }
            }
            return status;
        },

        deviceExists: function(type, number) {
            var selectedDevices = this.getSelectedDevices();

            if (selectedDevices == null) return false;

            return (type + '-' + number + '-enabled' in selectedDevices);
        },

        checkGPIOPort: function() {
            var gpio = GeckoJS.Controller.getInstanceByName('GPIO');

            if (gpio) return gpio.checkPortStatus();
            else return 0;
        },

        isGPIODrawerOpen: function() {
            var gpio = GeckoJS.Controller.getInstanceByName('GPIO');

            if (gpio) return gpio.isDrawerOpen();
            else return false;
        },

        triggerGPIO: function(pulses) {
            var gpio = GeckoJS.Controller.getInstanceByName('GPIO');

            if (gpio) return gpio.trigger(pulses);
            else return 0;
        },


        // return port control service object
        getSerialPortControlService: function() {
            if (this._portControlService == null) {
                this._portControlService = GREUtils.XPCOM.getService("@firich.com.tw/serial_port_control_unix;1", "nsISerialPortControlUnix");
																													
            }
            return this._portControlService;
        },

        // return template registry objects
        getTemplates: function (type) {
            if (this._templates == null) {
                this._templates = GeckoJS.Configure.read('vivipos.fec.registry.templates');
            }
            if (!type) {
                return this._templates;
            }
            else {
                var templates = {};
                for (var tmpl in this._templates) {
                    var tpl = this._templates[tmpl];
                    if (tpl.type && (tpl.type.split(',').indexOf(type) > -1) ) {
                        templates[tmpl] = tpl;
                    }
                }
                return templates;
            }
        },

        // get System Printers from xprint / cups system
        getSystemPrinters: function () {

            var printers = [];

            try {

                  var PE = Components.classes["@mozilla.org/gfx/printerenumerator;1"]
                                  .getService(Components.interfaces.nsIPrinterEnumerator);

                  var printerList = PE.printerNameList;

                  do {
                    var printer = printerList.getNext();
                    printers.push(printer);
                  } while( printerList.hasMore()) ;


            }catch(e) {
            }

            return printers;
        },

        // return port registry objects
        getPorts: function () {
            if (this._ports == null) {
                this._ports = GeckoJS.Configure.read('vivipos.fec.registry.ports');

		//merge CUPS 's virtual pty 
		var systemPrinters = this.getSystemPrinters();
		systemPrinters.forEach(function(printer) {

			if (printer.indexOf('CUPS') == -1) return; // ignore not cups printer

			var setting = {label: printer, type: 'serial', path: '/tmp/'+printer, support: 'receipt,check,cashdrawer,report'};
			
			// add to ports
			this._ports[printer] = setting;

		}, this); 
		

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

        getDeviceModelEncodings: function(devicemodel) {
            var encodings = [];
            if (devicemodel != null && devicemodel.encodings != null) {
                var entries = devicemodel.encodings.split(',');
                entries.forEach(function(entry) {
                   if (entry != null && entry.length > 0) {
                       var encoding = entry.split('=');
                       encodings.push({label: encoding[0], charset: encoding[1]});
                   }
                });
            }
            return encodings;
        },

        getTemplateData: function(template, useCache) {
            var tpl;
            var templates = this.getTemplates();
            var cachedTemplates = GeckoJS.Session.get('deviceTemplates');

            if (useCache) {

                if (cachedTemplates != null) {
                    tpl = cachedTemplates[template];
                }
            }

            if ((tpl == null || tpl.length == 0) && templates != null && templates[template] != null) {
                tpl = this.loadTemplateFile(templates[template].path);
                cachedTemplates[template] = tpl;
            }
            return tpl;
        },

        getDeviceCommandCodes: function(devicemodel, useCache) {
            var codes;
            var devicemodels = this.getDeviceModels();
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

        getSelectedDevices: function () {
            if (this._selectedDevices == null) {
                var selectedDevices = GeckoJS.Configure.read('vivipos.fec.settings.selectedDevices');
                if (selectedDevices != null && selectedDevices.length > 0) {
                    try {
                        this._selectedDevices = GeckoJS.BaseObject.unserialize(selectedDevices);
                    }
                    catch(e) {}
                }
            }
            return this._selectedDevices;
        },

        // returns true if the specified link_group is associated with any of the check devices
        isGroupLinked: function(link_group_id) {
            var selectedDevices = this.getSelectedDevices();

            let maxChecks = this.getMaxChecks();
            for (let i = 1; i < maxChecks; i++) {
                if (selectedDevices['check-' + i + '-link-group'].indexOf(link_group_id) > -1)
                    return true;
            }
            return false;
        },

        // check if the device of the given type [receipt, check, report, vfd, cashdrawer] and number is enabled
        // returns:
        // -2: no devices have been configured
        // -1: printer number is invalid
        // 0: indicated printer is not enabled
        // 1: indicated printer is enabled
        isDeviceEnabled: function (type, number) {
            var selectedDevices = this.getSelectedDevices();
            if (selectedDevices != null) {
                if (number != null) {
                    if (typeof selectedDevices[type + '-' + number + '-enabled'] != 'undefined') {
                        return selectedDevices[type + '-' + number + '-enabled'] ? 1 : 0;
                    }
                    else {
                        return -1;
                    }
                }
                else {
                    let numDevices = 0;
                    let maxChecks = this.getMaxChecks();
                    switch(type) {
                        case 'receipt':
                            numDevices = this._maxReceipts;
                            break;

                        case 'check':
                            numDevices = maxChecks;
                            break;

                        case 'report':
                            numDevices = this._maxReports;
                            break;

                        case 'vfd':
                            numDevices = this._maxVFDs;
                            break;

                        case 'cashdrawer':
                            numDevices = this._maxDrawers;
                            break;

                        case 'scale':
                            numDevices = this._maxScales;
                            break;

                    }
                    for (let i = 1; i <= numDevices; i++) {
                        if (selectedDevices[type + '-' + i + '-enabled']) return 1;
                    }
                    return 0;
                }
            }
            else {
                return -2;
            }
        },

        getEnabledDevices: function(type, number) {
            var enabledDevices = [];
            var selectedDevices = this.getSelectedDevices();
            if (selectedDevices != null) {
                if (number == null) {
                    let numDevices = 0;
                    let maxChecks = this.getMaxChecks();
                    switch(type) {
                        case 'receipt':
                            numDevices = this._maxReceipts;
                            break;

                        case 'check':
                            numDevices = maxChecks;
                            break;

                        case 'report':
                            numDevices = this._maxReports;
                            break;

                        case 'vfd':
                            numDevices = this._maxVFDs;
                            break;

                        case 'cashdrawer':
                            numDevices = this._maxDrawers;
                            break;

                        case 'scale':
                            numDevices = this._maxScales;
                            break;
                    }
                    for (let i = 1; i <= numDevices; i++) {
                        let id = type + '-' + i;
                        if (selectedDevices[id + '-enabled']) {
                            enabledDevices.push({
                                type: selectedDevices[id + '-type'],
                                template: selectedDevices[id + '-template'],
                                port: selectedDevices[id + '-port'],
                                portspeed: selectedDevices[id + '-portspeed'],
                                handshaking: selectedDevices[id + '-handshaking'],
                                devicemodel: selectedDevices[id + '-devicemodel'],
                                encoding: selectedDevices[id + '-encoding'],
                                autoprint: selectedDevices[id + '-autoprint'],
                                supportsstatus: selectedDevices[id + '-supports-status'],
                                gpiopulses: selectedDevices[id + '-gpio-pulses'],
                                linkgroup: selectedDevices[id + '-link-group'],
                                printNoRouting: selectedDevices[id + '-print-no-routing'],
                                printAllRouting: selectedDevices[id + '-print-all-routing'],
                                cashaction: selectedDevices[id + '-cash-action'],
                                creditcardaction: selectedDevices[id + '-creditcard-action'],
                                checkaction: selectedDevices[id + '-check-action'],
                                couponaction: selectedDevices[id + '-coupon-action'],
                                giftcardaction: selectedDevices[id + '-giftcard-action'],
                                ledgeraction: selectedDevices[id + '-ledger-action'],
                                paperwidth: selectedDevices[id + '-paperwidth'],
                                tare: selectedDevices[id + '-tare'],
                                multiplier: selectedDevices[id + '-multiplier'],
                                idle: selectedDevices[id + '-idle'],
                                number: i
                            });
                        }
                    }
                }
                else {
                    let id = type + '-' + parseInt(number);
                    if (selectedDevices[id + '-enabled']) {
                        enabledDevices.push({
                            type: selectedDevices[id + '-type'],
                            template: selectedDevices[id + '-template'],
                            port: selectedDevices[id + '-port'],
                            portspeed: selectedDevices[id + '-portspeed'],
                            handshaking: selectedDevices[id + '-handshaking'],
                            devicemodel: selectedDevices[id + '-devicemodel'],
                            encoding: selectedDevices[id + '-encoding'],
                            autoprint: selectedDevices[id + '-autoprint'],
                            supportsstatus: selectedDevices[id + '-supports-status'],
                            gpiopulses: selectedDevices[id + '-gpio-pulses'],
                            linkgroup: selectedDevices[id + '-link-group'],
                            printNoRouting: selectedDevices[id + '-print-no-routing'],
                            printAllRouting: selectedDevices[id + '-print-all-routing'],
                            cashaction: selectedDevices[id + '-cash-action'],
                            creditcardaction: selectedDevices[id + '-creditcard-action'],
                            checkaction: selectedDevices[id + '-check-action'],
                            couponaction: selectedDevices[id + '-coupon-action'],
                            giftcardaction: selectedDevices[id + '-giftcard-action'],
                            ledgeraction: selectedDevices[id + '-ledger-action'],
                            paperwidth: selectedDevices[id + '-paperwidth'],
                            tare: selectedDevices[id + '-tare'],
                            multiplier: selectedDevices[id + '-multiplier'],
                            idle: selectedDevices[id + '-idle'],
                            number: number
                        });
                    }
                }
            }
            return enabledDevices;
        },

        
        updateEncodings: function(data) {
            var devicemenu = data[0];
            var encodingmenu = data[1];
            var type = data[2];

            if (!encodingmenu) {
                let encodingmenu_id = devicemenu.id.replace(/devicemodel$/, 'encoding') ;
                encodingmenu = document.getElementById(encodingmenu_id);
            }

            if (devicemenu == null || encodingmenu == null) return;

            var selectedDeviceIndex = devicemenu.selectedIndex;
            if (selectedDeviceIndex == -1 || this._sortedDevicemodels[type] == null || selectedDeviceIndex >= this._sortedDevicemodels[type].length) {
                encodingmenu.selectedIndex = 0;
            }
            else {
                var selectedDevice = this._sortedDevicemodels[type][selectedDeviceIndex];
                this.populateEncodings(encodingmenu, selectedDevice);
                encodingmenu.selectedIndex = 0;
            }
        },

        updateCashdrawerType: function(data) {
            var typemenu = data[0];
            var drawer_no = data[1];

            var portmenu = document.getElementById('cashdrawer-' + drawer_no + '-port')
            var speedmenu = document.getElementById('cashdrawer-' + drawer_no + '-portspeed')
            var handshakebox = document.getElementById('cashdrawer-' + drawer_no + '-handshaking')
            var devicemenu = document.getElementById('cashdrawer-' + drawer_no + '-devicemodel')
            var pulsemenu = document.getElementById('cashdrawer-' + drawer_no + '-gpio-pulses')
            var statusbox = document.getElementById('cashdrawer-' + drawer_no + '-supports-status')
            var sortedPorts = this._sortedPorts;
            var selectedType = typemenu.selectedItem;

            if (typemenu == null || devicemenu == null) return;

            var currentValue = portmenu.value;

            // update list of ports that support cashdrawer
            portmenu.removeAllItems();
            if (selectedType.value == 'gpio') {
                for (var i in sortedPorts) {
                    if (sortedPorts[i].type == 'gpio' && sortedPorts[i].support.indexOf('cashdrawer') > -1) {
                        var portName = sortedPorts[i].name;
                        portmenu.appendItem(_(sortedPorts[i].label), portName, '');
                    }
                }
            }
            else {
                for (var i in sortedPorts) {
                    if (sortedPorts[i].type != 'gpio' && sortedPorts[i].support.indexOf('cashdrawer') > -1) {
                        var portName = sortedPorts[i].name;
                        portmenu.appendItem(_(sortedPorts[i].label), portName, '');
                    }
                }
            }
            portmenu.value = currentValue;

            if (selectedType == null) {
                speedmenu.setAttribute('disabled', true);
                handshakebox.setAttribute('disabled', true);
                pulsemenu.setAttribute('disabled', true);
                statusbox.setAttribute('disabled', true);
                devicemenu.selectedIndex = 0;
            }
            else {
                speedmenu.setAttribute('disabled', selectedType.value == 'gpio');
                handshakebox.setAttribute('disabled', selectedType.value == 'gpio');
                devicemenu.setAttribute('disabled', selectedType.value == 'gpio');
                pulsemenu.setAttribute('disabled', selectedType.value != 'gpio');
                statusbox.setAttribute('disabled', selectedType.value != 'gpio');
            }
        },

        buildCheckDevices: function(numDevices) {

            /* create check device configuration tabs */
            let parentTabNode = document.getElementById('device-tabs');
            let beforeTabNode = document.getElementById('report-tab');

            let parentNode = document.getElementById('device-tabpanels');
            let beforeNode = document.getElementById('report-panel');

            let srcTabNode = document.getElementById('check-%d-tab');
            let srcTabPanelNode = document.getElementById('check-%d-panel');

            let lastTabNode = beforeTabNode, lastTabPanelNode = beforeNode;

            for (let j = numDevices; j > 0; j--) {
                // clone tab panel
                let cloneTabPanelNode = srcTabPanelNode.cloneNode(true);
                $(cloneTabPanelNode).attr('id', $(srcTabPanelNode).attr('id').replace('%d', j));

                let childNodes = $(cloneTabPanelNode).find('[cloneTarget]');

                let id, name, oncommand;
                for (let i = 0; i < childNodes.length; i++) {
                    let node = childNodes[i];
                    if (id = $(node).attr('id')) {
                        $(node).attr('id', id.replace('%d', j));
                    }
                    if (name = $(node).attr('name')) {
                        $(node).attr('name', name.replace('%d', j));
                    }
                    if (label = $(node).attr('label')) {
                        $(node).attr('label', label.replace('%d', j));
                    }
                    if (oncommand = $(node).attr('oncommand')) {
                        $(node).attr('oncommand', oncommand.replace('%d', j));
                    }
                }
                parentNode.insertBefore(cloneTabPanelNode, lastTabPanelNode);
                lastTabPanelNode = cloneTabPanelNode;

                // clone tab
                let cloneTabNode = srcTabNode.cloneNode(true);
                $(cloneTabNode).attr('id', $(srcTabNode).attr('id').replace('%d', j));
                $(cloneTabNode).attr('label', $(srcTabNode).attr('label') + ' ' + j);
                parentTabNode.insertBefore(cloneTabNode, lastTabNode);
                lastTabNode = cloneTabNode;
            }

            parentTabNode.removeChild(srcTabNode);
            parentNode.removeChild(srcTabPanelNode);

        },

        // initialize UI forms
        load: function() {

            // prepare device ports
            var ports = this.getPorts();
            var sortedPorts = [];

            for (var port in ports) {
                var newPort = GREUtils.extend({}, ports[port]);
                newPort.name = port;
                sortedPorts.push(newPort);
            }
            this._sortedPorts = sortedPorts = new GeckoJS.ArrayQuery(sortedPorts).orderBy('label asc');

            // prepare portspeeds
            var portspeeds = this.getPortSpeeds();

            var devicemodels = this.getDeviceModels();

            let sortedReceiptDeviceModels = [];
            let sortedCheckDeviceModels = [];
            let sortedReportDeviceModels = [];
            let sortedLabelDeviceModels = [];
            let sortedVFDDeviceModels = [];
            let sortedDrawerDeviceModels = [];
            let sortedScaleDeviceModels = [];
            for (var devicemodel in devicemodels) {

                // extract receipt device models
                if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('receipt') > -1) {
                    let newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                    newDevicemodel.name = devicemodel;
                    sortedReceiptDeviceModels.push(newDevicemodel);
                }

                if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('check') > -1) {
                    let newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                    newDevicemodel.name = devicemodel;
                    sortedCheckDeviceModels.push(newDevicemodel);
                }

                if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('report') > -1) {
                    let newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                    newDevicemodel.name = devicemodel;
                    sortedReportDeviceModels.push(newDevicemodel);
                }

                if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('label') > -1) {
                    let newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                    newDevicemodel.name = devicemodel;
                    sortedLabelDeviceModels.push(newDevicemodel);
                }

                if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('vfd') > -1) {
                    let newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                    newDevicemodel.name = devicemodel;
                    sortedVFDDeviceModels.push(newDevicemodel);
                }

                if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('cashdrawer') > -1) {
                    let newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                    newDevicemodel.name = devicemodel;
                    sortedDrawerDeviceModels.push(newDevicemodel);
                }

                if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('scale') > -1) {
                    let newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                    newDevicemodel.name = devicemodel;
                    sortedScaleDeviceModels.push(newDevicemodel);
                }
            }
            this._sortedDevicemodels['receipt'] = sortedReceiptDeviceModels = new GeckoJS.ArrayQuery(sortedReceiptDeviceModels).orderBy('label asc');
            this._sortedDevicemodels['check'] = sortedCheckDeviceModels = new GeckoJS.ArrayQuery(sortedCheckDeviceModels).orderBy('label asc');
            this._sortedDevicemodels['report'] = sortedReportDeviceModels = new GeckoJS.ArrayQuery(sortedReportDeviceModels).orderBy('label asc');
            this._sortedDevicemodels['label'] = sortedLabelDeviceModels = new GeckoJS.ArrayQuery(sortedLabelDeviceModels).orderBy('label asc');
            this._sortedDevicemodels['vfd'] = sortedVFDDeviceModels = new GeckoJS.ArrayQuery(sortedVFDDeviceModels).orderBy('label asc');
            this._sortedDevicemodels['cashdrawer'] = sortedDrawerDeviceModels = new GeckoJS.ArrayQuery(sortedDrawerDeviceModels).orderBy('label asc');
            this._sortedDevicemodels['scale'] = sortedScaleDeviceModels = new GeckoJS.ArrayQuery(sortedScaleDeviceModels).orderBy('label asc');


            /*
             * populate receipt panel(s)
             *
             */

            var selectedDevices = this.getSelectedDevices() || {};

            //this.log(GeckoJS.BaseObject.dump(selectedDevices));

            if (this._maxReceipts > 0) {

                /* sort receipt templates */
                let templates = this.getTemplates('receipt');
                let sortedTemplates = [];
                for (let tmpl in templates) {
                    let newTemplate = GREUtils.extend({}, templates[tmpl]);
                    newTemplate.name = tmpl;

                    var label = newTemplate.label;
                    if (label.indexOf('chrome://') == 0) {
                        var keystr = 'vivipos.fec.registry.templates.' + tmpl + '.label';
                        label = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
                    }
                    else {
                        label = _(label);
                    }
                    newTemplate.label = label;
                    sortedTemplates.push(newTemplate);
                }
                sortedTemplates = new GeckoJS.ArrayQuery(sortedTemplates).orderBy('label asc');

                for (let j = 1; j <= this._maxReceipts; j++) {

                    /* templates */
                    let tmplmenu = document.getElementById('receipt-' + j + '-template');
                    for (let i in sortedTemplates) {
                        let tmplName = sortedTemplates[i].name;
                        tmplmenu.appendItem(sortedTemplates[i].label, tmplName, '');
                    }
                    tmplmenu.selectedIndex = 0;

                    /* ports */
                    let portmenu = document.getElementById('receipt-' + j + '-port');
                    for (let i in sortedPorts) {
                        if (sortedPorts[i].support.indexOf('receipt') > -1) {
                            let portName = sortedPorts[i].name;
                            portmenu.appendItem(sortedPorts[i].label, portName, '');
                        }
                    }
                    portmenu.selectedIndex = 0;

                    /* port speeds */
                    let portspeedmenu = document.getElementById('receipt-' + j + '-portspeed');
                    for (let i in portspeeds) {
                        let portspeed = portspeeds[i];
                        portspeedmenu.appendItem(portspeed, portspeed, '');
                    }
                    portspeedmenu.selectedIndex = 0;

                    /* device models */
                    let devicemodelmenu = document.getElementById('receipt-' + j + '-devicemodel');
                    devicemodelmenu.selectedIndex = 0;
                    for (let i in sortedReceiptDeviceModels) {
                        var devicemodelName = sortedReceiptDeviceModels[i].name;
                        devicemodelmenu.appendItem(sortedReceiptDeviceModels[i].label, devicemodelName, '');

                        if (devicemodelName == selectedDevices['receipt-' + j + '-devicemodel']) {
                            devicemodelmenu.selectedIndex = i;
                        }
                    }

                    /* encodings */
                    let encodingmenu = document.getElementById('receipt-' + j + '-encoding');
                    this.populateEncodings(encodingmenu, sortedReceiptDeviceModels[devicemodelmenu.selectedIndex]);
                }
            }

            /*
             * populate check panel(s)
             *
             */

            let maxChecks = this.getMaxChecks();
            if (maxChecks > 0) {

                this.buildCheckDevices(maxChecks);

                /* sort check templates */
                let templates = this.getTemplates('check');
                let sortedTemplates = [];
                for (let tmpl in templates) {
                    var newTemplate = GREUtils.extend({}, templates[tmpl]);

                    newTemplate.name = tmpl;

                    let label = newTemplate.label;
                    if (label.indexOf('chrome://') == 0) {
                        let keystr = 'vivipos.fec.registry.templates.' + tmpl + '.label';
                        label = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
                    }
                    else {
                        label = _(label);
                    }
                    newTemplate.label = label;
                    sortedTemplates.push(newTemplate);
                }
                sortedTemplates = new GeckoJS.ArrayQuery(sortedTemplates).orderBy('label asc');

                // collect routing groups
                let pluGroupModel = new PlugroupModel();
                let groups = pluGroupModel.findByIndex('all', {
                    index: 'routing',
                    value: 1,
                    order: 'display_order, name'
                });

                for (let j = 1; j <= maxChecks; j++) {

                    /* templates */
                    let tmplmenu = document.getElementById('check-' + j + '-template');
                    for (let i in sortedTemplates) {
                        let tmplName = sortedTemplates[i].name;
                        tmplmenu.appendItem(sortedTemplates[i].label, tmplName, '');
                    }
                    tmplmenu.selectedIndex = 0;

                    /* device ports */
                    let portmenu = document.getElementById('check-' + j + '-port');
                    for (let i in sortedPorts) {
                        if (sortedPorts[i].support.indexOf('check') > -1) {
                            let portName = sortedPorts[i].name;
                            portmenu.appendItem(sortedPorts[i].label, portName, '');
                        }
                    }
                    portmenu.selectedIndex = 0;

                    /* device portspeeds */
                    let portspeedmenu = document.getElementById('check-' + j + '-portspeed');
                    for (let i in portspeeds) {
                        let portspeed = portspeeds[i];
                        portspeedmenu.appendItem(portspeed, portspeed, '');
                    }
                    portspeedmenu.selectedIndex = 0;

                    /* device models */
                    let devicemodelmenu = document.getElementById('check-' + j + '-devicemodel');
                    devicemodelmenu.selectedIndex = 0;
                    for (let i in sortedCheckDeviceModels) {
                        let devicemodelName = sortedCheckDeviceModels[i].name;
                        devicemodelmenu.appendItem(sortedCheckDeviceModels[i].label, devicemodelName, '');

                        if (devicemodelName == selectedDevices['check-' + j + '-devicemodel']) {
                            devicemodelmenu.selectedIndex = i;
                        }
                    }

                    /* encodings */
                    let encodingmenu = document.getElementById('check-' + j + '-encoding');
                    this.populateEncodings(encodingmenu, sortedCheckDeviceModels[devicemodelmenu.selectedIndex]);

                    let check_group_listscrollablepanel = document.getElementById('check-' + j + '-group_listscrollablepanel');
                    let plugroupPanelView = new NSIPluGroupsView(groups);
                    check_group_listscrollablepanel.datasource = plugroupPanelView;
                }
            }

            /*
             * populate report/label panel(s)
             *
             */

            if (this._maxReports > 0) {

                for (let j = 1; j <= this._maxReports; j++) {
                    let portmenu = document.getElementById('report-' + j + '-port');

                    /* device ports */
                    for (let i in sortedPorts) {
                        if (sortedPorts[i].support.indexOf('report') > -1) {
                            let portName = sortedPorts[i].name;
                            portmenu.appendItem(sortedPorts[i].label, portName, '');
                        }
                    }
                    portmenu.selectedIndex = 0;

                    /* device portspeeds */
                    let portspeedmenu = document.getElementById('report-' + j + '-portspeed');

                    for (let i in portspeeds) {
                        let portspeed = portspeeds[i];
                        portspeedmenu.appendItem(portspeed, portspeed, '');
                    }
                    portspeedmenu.selectedIndex = 0;

                    /* device models */
                    let devicemodelmenu = document.getElementById('report-' + j + '-devicemodel');
                    devicemodelmenu.selectedIndex = 0;

                    if (j == 1)
                        for (let i in sortedReportDeviceModels) {
                            let devicemodelName = sortedReportDeviceModels[i].name;
                            devicemodelmenu.appendItem(sortedReportDeviceModels[i].label, devicemodelName, '');

                            if (devicemodelName == selectedDevices['report-' + j + '-devicemodel']) {
                                devicemodelmenu.selectedIndex = i;
                            }
                        }
                    else
                        for (let i in sortedLabelDeviceModels) {
                            let devicemodelName = sortedLabelDeviceModels[i].name;
                            devicemodelmenu.appendItem(sortedLabelDeviceModels[i].label, devicemodelName, '');

                            if (devicemodelName == selectedDevices['report-' + j + '-devicemodel']) {
                                devicemodelmenu.selectedIndex = i;
                            }
                        }

                    /* encodings */
                    let encodingmenu = document.getElementById('report-' + j + '-encoding');

                    this.populateEncodings(encodingmenu, sortedReportDeviceModels[devicemodelmenu.selectedIndex]);
                }
            }

            /*
             * populate VFD panel
             *
             */

            if (this._maxVFDs > 0) {

                /* sort vfd templates */
                let templates = this.getTemplates('vfd');
                let sortedTemplates = [];
                for (let tmpl in templates) {
                    let newTemplate = GREUtils.extend({}, templates[tmpl]);

                    newTemplate.name = tmpl;

                    let label = newTemplate.label;
                    if (label.indexOf('chrome://') == 0) {
                        let keystr = 'vivipos.fec.registry.templates.' + tmpl + '.label';
                        label = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
                    }
                    else {
                        label = _(label);
                    }
                    newTemplate.label = label;
                    sortedTemplates.push(newTemplate);
                }
                sortedTemplates = new GeckoJS.ArrayQuery(sortedTemplates).orderBy('label asc');

                for (let j = 1; j <= this._maxVFDs; j++) {

                    /* templates */
                    let tmplmenu = document.getElementById('vfd-' + j + '-template');
                    for (let i in sortedTemplates) {
                        let tmplName = sortedTemplates[i].name;
                        tmplmenu.appendItem(sortedTemplates[i].label, tmplName, '');
                    }
                    tmplmenu.selectedIndex = 0;

                    /* device ports */
                    let portmenu = document.getElementById('vfd-' + j + '-port');
                    for (let i in sortedPorts) {
                        if (sortedPorts[i].support.indexOf('vfd') > -1) {
                            let portName = sortedPorts[i].name;
                            portmenu.appendItem(sortedPorts[i].label, portName, '');
                        }
                    }
                    portmenu.selectedIndex = 0;

                    /* device portspeeds */
                    let portspeedmenu = document.getElementById('vfd-' + j + '-portspeed');
                    for (let i in portspeeds) {
                        let portspeed = portspeeds[i];
                        portspeedmenu.appendItem(portspeed, portspeed, '');
                    }
                    portspeedmenu.selectedIndex = 0;

                    /* device models */
                    let devicemodelmenu = document.getElementById('vfd-' + j + '-devicemodel');
                    devicemodelmenu.selectedIndex = 0;
                    for (let i in sortedVFDDeviceModels) {
                        let devicemodelName = sortedVFDDeviceModels[i].name;
                        devicemodelmenu.appendItem(sortedVFDDeviceModels[i].label, devicemodelName, '');

                        if (devicemodelName == selectedDevices['vfd-' + j + '-devicemodel']) {
                            devicemodelmenu.selectedIndex = i;
                        }
                    }

                    /* encodings */
                    let encodingmenu = document.getElementById('vfd-' + j + '-encoding');

                    this.populateEncodings(encodingmenu, sortedVFDDeviceModels[devicemodelmenu.selectedIndex]);
                }
            }

            /*
             * populate Cash drawer panel
             *
             */

             if (this._maxDrawers > 0) {

                for (let j = 1; j <= this._maxDrawers; j++) {

                    /* device ports */
                    let portmenu = document.getElementById('cashdrawer-' + j + '-port');
                    for (let i in sortedPorts) {
                        if (sortedPorts[i].support.indexOf('cashdrawer') > -1) {
                            let portName = sortedPorts[i].name;
                            portmenu.appendItem(sortedPorts[i].label, portName, '');
                        }
                    }
                    portmenu.selectedIndex = 0;

                    /* device portspeeds */
                    let portspeedmenu = document.getElementById('cashdrawer-' + j + '-portspeed');
                    for (let i in portspeeds) {
                        let portspeed = portspeeds[i];
                        portspeedmenu.appendItem(portspeed, portspeed, '');
                    }
                    portspeedmenu.selectedIndex = 0;

                    /* device models */
                    let devicemodelmenu = document.getElementById('cashdrawer-' + j + '-devicemodel');
                    for (let i in sortedDrawerDeviceModels) {
                        let devicemodelName = sortedDrawerDeviceModels[i].name;
                        devicemodelmenu.appendItem(sortedDrawerDeviceModels[i].label, devicemodelName, '');
                    }
                    devicemodelmenu.selectedIndex = 0;
                }
            }

            if (document.getElementById('journal-panel') != null) {

                let tmplmenu = document.getElementById('journal-preview-template');
                let templates = this.getTemplates('preview');

                let sortedTemplates = [];
                for (let tmpl in templates) {
                    let newTemplate = GREUtils.extend({}, templates[tmpl]);

                    newTemplate.name = tmpl;

                    let label = newTemplate.label;
                    if (label.indexOf('chrome://') == 0) {
                        let keystr = 'vivipos.fec.registry.templates.' + tmpl + '.label';
                        label = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
                    }
                    else {
                        label = _(label);
                    }
                    newTemplate.label = label;
                    sortedTemplates.push(newTemplate);
                }
                sortedTemplates = new GeckoJS.ArrayQuery(sortedTemplates).orderBy('label asc');

                for (let i in sortedTemplates) {
                    let tmplName = sortedTemplates[i].name;
                    tmplmenu.appendItem(sortedTemplates[i].label, tmplName, '');
                }
                tmplmenu.selectedIndex = 0;
            }

            /*
             * populate Scale panel
             *
             */

             if (this._maxScales > 0) {

                for (let j = 1; j <= this._maxScales; j++) {

                    /* device ports */
                    let portmenu = document.getElementById('scale-' + j + '-port');
                    for (let i in sortedPorts) {
                        if (sortedPorts[i].support.indexOf('scale') > -1) {
                            let portName = sortedPorts[i].name;
                            portmenu.appendItem(sortedPorts[i].label, portName, '');
                        }
                    }
                    portmenu.selectedIndex = 0;

                    /* device portspeeds */
                    let portspeedmenu = document.getElementById('scale-' + j + '-portspeed');
                    for (let i in portspeeds) {
                        let portspeed = portspeeds[i];
                        portspeedmenu.appendItem(portspeed, portspeed, '');
                    }
                    portspeedmenu.selectedIndex = 0;

                    /* device models */
                    let devicemodelmenu = document.getElementById('scale-' + j + '-devicemodel');
                    for (let i in sortedScaleDeviceModels) {
                        let devicemodelName = sortedScaleDeviceModels[i].name;
                        devicemodelmenu.appendItem(sortedScaleDeviceModels[i].label, devicemodelName, '');
                    }
                    devicemodelmenu.selectedIndex = 0;
                }
            }

            /* apply device selections */
            GeckoJS.FormHelper.unserializeFromObject('deviceForm', selectedDevices);

            for (let j = 1; j <= this._maxDrawers; j++) {
                if (document.getElementById('cashdrawer-' + j + '-panel') != null) {
                    this.updateCashdrawerType([document.getElementById('cashdrawer-' + j + '-type'), j]);
                }
            }
        },

        populateEncodings: function (menulist, devicemodel) {
            var encodings = this.getDeviceModelEncodings(devicemodel);
            var sortedEncodings = new GeckoJS.ArrayQuery(encodings).orderBy('label asc');

            menulist.removeAllItems();
            for (var i in sortedEncodings) {
                menulist.appendItem(_(sortedEncodings[i].label) + ' (' + sortedEncodings[i].charset + ')', sortedEncodings[i].charset, '');
            }
            menulist.selectedIndex = 0;
        },

        // save configurations
        save: function () {
            // get form data
            var formObj = GeckoJS.FormHelper.serializeToObject('deviceForm');

            // check status of selected devices
            this._selectedDevices = formObj;
            var statusResult = this.checkStatusAll();

            if (!statusResult.printerEnabled) {
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Device Status'),
                                      _('No device has been enabled for receipt and/or check printing!'));
            }
            
            var statusStr = '';

            // generate list of devices that may not be ready
            var statuses = statusResult.statuses
            var offline = false;
            statuses.forEach(function(status) {
                if (status[2] == 0) {
                    statusStr += '\n   ' + _('Device') + ' [' + status[0] + ']: ' + _('Port') + ' [' + status[1] + ']';
                    offline = true;
                }
            });

            if (offline) {
                if (GREUtils.Dialog.confirm(this.topmostWindow,
                                            _('Device Status'),
                                            _('The following enabled devices appear to be offline, do you still want to save the new configuration?') + '\n' + statusStr) == false) {
                        return false;
                }
            }

            // update form
            GeckoJS.FormHelper.unserializeFromObject('deviceForm', formObj);
            
            // update device session data
            GeckoJS.Configure.write('vivipos.fec.settings.selectedDevices', GeckoJS.BaseObject.serialize(formObj));

            GeckoJS.Observer.notify(null, 'device-refresh', this);

            GeckoJS.Observer.notify(null, 'device-refreshed', this);

            OsdUtils.info(_('Device configuration saved'));
            
            return true;
        },

        exit: function() {
            if (GeckoJS.FormHelper.isFormModified('deviceForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to device configuration. Save changes before exiting?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    if (!this.save()) return;
                }
            }
            window.close();
        }
    };

    AppController.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'Devices');
                                      });

    }, false);

})();

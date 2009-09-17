(function(){

    var __controller__ = {

        name: 'Devices',

        _templates: null,
        _ports: null,
        _portspeeds: null,
        _devicemodels: null,
        _selectedDcevices: null,
        _sortedDevicemodels: {},
        _portControlService: null,
        _sortedPorts: [],

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

                if (win.document.documentElement.id == 'viviposMainWindow' && (typeof win.width) == 'undefined')
                    win = null;

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

        // load and cache device templates and commands
        loadEnabledDevices: function (enabledDevices) {

            var deviceCommands = {};
            var deviceTemplates = {};
            var devicemodels = this.getDeviceModels();
            var templates = this.getTemplates();
            // collect all enabled templates device models
            if (enabledDevices != null) {
                if (enabledDevices['receipt-1-enabled']) {
                    // check if template already loaded
                    var template = enabledDevices['receipt-1-template'];
                    if (template != null && !(template in deviceTemplates) && templates[template] != null) {
                            deviceTemplates[template] = this.loadTemplateFile(templates[template].path);
                    }

                    // check if device already loaded
                    var device = enabledDevices['receipt-1-devicemodel'];
                    if (device != null && device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (enabledDevices['receipt-2-enabled']) {
                    // check if template already loaded
                    var template = enabledDevices['receipt-2-template'];
                    if (template != null && !(template in deviceTemplates) && templates[template] != null) {
                        deviceTemplates[template] = this.loadTemplateFile(templates[template].path);
                    }

                    // check if device already loaded
                    var device = enabledDevices['receipt-2-devicemodel'];
                    if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (enabledDevices['check-1-enabled']) {
                    // check if template already loaded
                    var template = templates['check-1-template'];
                    if (template != null && !(template in deviceTemplates) && templates[template] != null) {
                        deviceTemplates[template] = this.loadTemplateFile(templates[template].path);
                    }

                    // check if device already loaded
                    var device = enabledDevices['check-1-devicemodel'];
                    if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (enabledDevices['check-2-enabled']) {
                    var template = templates['check-2-template'];
                    if (template != null && !(template in deviceTemplates) && templates[template] != null) {
                        deviceTemplates[template] = this.loadTemplateFile(templates[template].path);
                    }

                    // check if device already loaded
                    var device = enabledDevices['check-2-devicemodel'];
                    if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (enabledDevices['check-3-enabled']) {
                    // check if template already loaded
                    var template = templates['check-3-template'];
                    if (template != null && !(template in deviceTemplates) && templates[template] != null) {
                        deviceTemplates[template] = this.loadTemplateFile(templates[template].path);
                    }

                    // check if device already loaded
                    var device = enabledDevices['check-3-devicemodel'];
                    if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (enabledDevices['check-4-enabled']) {
                    var template = templates['check-4-template'];
                    if (template != null && !(template in deviceTemplates) && templates[template] != null) {
                        deviceTemplates[template] = this.loadTemplateFile(templates[template].path);
                    }

                    // check if device already loaded
                    var device = enabledDevices['check-4-devicemodel'];
                    if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (enabledDevices['report-1-enabled']) {
                    // check if device already loaded
                    var device = enabledDevices['report-1-devicemodel'];
                    if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (enabledDevices['report-2-enabled']) {
                    // check if device already loaded
                    var device = enabledDevices['report-2-devicemodel'];
                    if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (enabledDevices['vfd-1-enabled']) {
                    var template = templates['vfd-1-template'];
                    if (template != null && !(template in deviceTemplates) && templates[template] != null) {
                        deviceTemplates[template] = this.loadTemplateFile(templates[template].path);
                    }

                    // check if device already loaded
                    var device = enabledDevices['vfd-1-devicemodel'];
                    if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (enabledDevices['vfd-2-enabled']) {
                    var template = templates['vfd-2-template'];
                    if (template != null && !(template in deviceTemplates) && templates[template] != null) {
                        deviceTemplates[template] = this.loadTemplateFile(templates[template].path);
                    }

                    // check if device already loaded
                    var device = enabledDevices['vfd-2-devicemodel'];
                    if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (enabledDevices['cashdrawer-1-enabled'] && (enabledDevices['cashdrawer-1-type'] == 'printer')) {
                    // check if device already loaded
                    var device = enabledDevices['cashdrawer-1-devicemodel'];
                    if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (enabledDevices['cashdrawer-2-enabled'] && (enabledDevices['cashdrawer-2-type'] == 'printer')) {
                    // check if device already loaded
                    var device = enabledDevices['cashdrawer-2-devicemodel'];
                    if (device != null && !(device in deviceCommands) && devicemodels[device] != null) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
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

            // receipt printer 1
            if (selectedDevices != null) {
                if (selectedDevices['receipt-1-enabled']) {
                    var port = selectedDevices['receipt-1-port'];
                    status = 0;
                    if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path, selectedDevices['receipt-1-handshaking'], 1);
                                break;
                        }
                        statuses.push([_('Receipt Printer %S', [1]), ports[port].label + ' (' + ports[port].path + ')', status]);
                    }
                    else {
                        if (ports != null && port!= null && ports[port] != null)
                            statuses.push([_('Receipt Printer %S', [1]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        else
                            statuses.push([_('Receipt Printer %S', [1]), 'unknown', status]);
                    }
                    printerEnabled = true;
                }

                // receipt printer 2
                if (selectedDevices['receipt-2-enabled']) {
                    var port = selectedDevices['receipt-2-port'];
                    status = 0;
                    if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path, selectedDevices['receipt-2-handshaking'], 1);
                                break;
                        }
                        statuses.push([_('Receipt Printer %S', [2]), ports[port].label + ' (' + ports[port].path + ')', status]);
                    }
                    else {
                        if (ports != null && port!= null && ports[port] != null)
                            statuses.push([_('Receipt Printer %S', [2]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        else
                            statuses.push([_('Receipt Printer %S', [2]), 'unknown', status]);
                    }
                    printerEnabled = true;
                }

                // check printer 1
                if (selectedDevices['check-1-enabled']) {
                    var port = selectedDevices['check-1-port'];
                    status = 0;
                    if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path, selectedDevices['check-1-handshaking'], 1);
                                break;
                        }
                        statuses.push([_('Check Printer %S', [1]), ports[port].label + ' (' + ports[port].path + ')', status]);
                    }
                    else {
                        if (ports != null && port!= null && ports[port] != null)
                            statuses.push([_('Check Printer %S', [1]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        else
                            statuses.push([_('Check Printer %S', [1]), 'unknown', status]);
                    }
                    printerEnabled = true;
                }

                // check printer 2
                if (selectedDevices['check-2-enabled']) {
                    var port = selectedDevices['check-2-port'];
                    status = 0;
                    if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path, selectedDevices['check-2-handshaking'], 1);
                                break;
                        }
                        statuses.push([_('Check Printer %S', [2]), ports[port].label + ' (' + ports[port].path + ')', status]);
                    }
                    else {
                        if (ports != null && port!= null && ports[port] != null)
                            statuses.push([_('Check Printer %S', [2]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        else
                            statuses.push([_('Check Printer %S', [2]), 'unknown', status]);
                    }
                    printerEnabled = true;
                }

                // check printer 3
                if (selectedDevices['check-3-enabled']) {
                    var port = selectedDevices['check-3-port'];
                    status = 0;
                    if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path, selectedDevices['check-3-handshaking'], 1);
                                break;
                        }
                        statuses.push([_('Check Printer %S', [3]), ports[port].label + ' (' + ports[port].path + ')', status]);
                    }
                    else {
                        if (ports != null && port!= null && ports[port] != null)
                            statuses.push([_('Check Printer %S', [3]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        else
                            statuses.push([_('Check Printer %S', [3]), 'unknown', status]);
                    }
                    printerEnabled = true;
                }

                // check printer 4
                if (selectedDevices['check-4-enabled']) {
                    var port = selectedDevices['check-4-port'];
                    status = 0;
                    if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path, selectedDevices['check-4-handshaking'], 1);
                                break;
                        }
                        statuses.push([_('Check Printer %S', [4]), ports[port].label + ' (' + ports[port].path + ')', status]);
                    }
                    else {
                        if (ports != null && port!= null && ports[port] != null)
                            statuses.push([_('Check Printer %S', [4]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        else
                            statuses.push([_('Check Printer %S', [4]), 'unknown', status]);
                    }
                    printerEnabled = true;
                }

                // report printer 1
                if (selectedDevices['report-1-enabled']) {
                    var port = selectedDevices['report-1-port'];
                    status = 0;
                    if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path, selectedDevices['report-1-handshaking'], 1);
                                break;
                        }
                        statuses.push([_('Report Printer %S', [1]), ports[port].label + ' (' + ports[port].path + ')', status]);
                    }
                    else {
                        if (ports != null && port!= null && ports[port] != null)
                            statuses.push([_('Report Printer %S', [1]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        else
                            statuses.push([_('Report Printer %S', [1]), 'unknown', status]);
                    }
                    printerEnabled = true;
                }

                // report printer 2
                if (selectedDevices['report-2-enabled']) {
                    var port = selectedDevices['report-2-port'];
                    status = 0;
                    if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path, selectedDevices['report-2-handshaking'], 1);
                                break;
                        }
                        statuses.push([_('Report Printer %S', [2]), ports[port].label + ' (' + ports[port].path + ')', status]);
                    }
                    else {
                        if (ports != null && port!= null && ports[port] != null)
                            statuses.push([_('Report Printer %S', [2]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        else
                            statuses.push([_('Report Printer %S', [2]), 'unknown', status]);
                    }
                    printerEnabled = true;
                }

                // VFD 1
                if (selectedDevices['vfd-1-enabled']) {
                    var port = selectedDevices['vfd-1-port'];
                    status = 0;
                    if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path, selectedDevices['vfd-1-handshaking'], 1);
                                break;
                        }
                        statuses.push([_('VFD %S', [1]), ports[port].label + ' (' + ports[port].path + ')', status]);
                    }
                    else {
                        if (ports != null && port!= null && ports[port] != null)
                            statuses.push([_('VFD %S', [1]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        else
                            statuses.push([_('VFD %S', [1]), 'unknown', status]);
                    }
                }

                // VFD 2
                if (selectedDevices['vfd-2-enabled']) {
                    var port = selectedDevices['vfd-2-port'];
                    status = 0;
                    if (ports != null && port != null && ports[port] != null && ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path, selectedDevices['vfd-2-handshaking'], 1);
                                break;
                        }
                        statuses.push([_('VFD %S', [2]), ports[port].label + ' (' + ports[port].path + ')', status]);
                    }
                    else {
                        if (ports != null && port!= null && ports[port] != null)
                            statuses.push([_('VFD %S', [2]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        else
                            statuses.push([_('VFD %S', [2]), 'unknown', status]);
                    }
                }

                // Cashdrawer 1
                if (selectedDevices['cashdrawer-1-enabled']) {
                    var type = selectedDevices['cashdrawer-1-type'];
                    status = 0;
                    if (type == 'gpio') {
                            status = this.checkGPIOPort();
                    }
                    else {
                        var port = selectedDevices['cashdrawer-1-port'];
                        if (ports != null &&  port != null && ports[port] != null && ports[port].path != null) {
                            switch(ports[port].type) {
                                case 'serial':
                                case 'usb':
                                    status = this.checkSerialPort(ports[port].path, selectedDevices['cashdrawer-1-handshaking'], 1);
                                    break;
                            }
                            statuses.push([_('Cash Drawer %S', [1]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        }
                        else {
                            if (ports != null && port!= null && ports[port] != null)
                                statuses.push([_('Cash Drawer %S', [1]), ports[port].label + ' (' + ports[port].path + ')', status]);
                            else
                                statuses.push([_('Cash Drawer %S', [1]), 'unknown', status]);
                        }
                    }
                }

                // Cashdrawer 2
                if (selectedDevices['cashdrawer-2-enabled']) {
                    var type = selectedDevices['cashdrawer-2-type'];
                    status = 0;
                    if (type == 'gpio') {
                            status = this.checkGPIOPort();
                    }
                    else {
                        var port = selectedDevices['cashdrawer-2-port'];
                        if (ports != null &&  port != null && ports[port] != null && ports[port].path != null) {
                            switch(ports[port].type) {
                                case 'serial':
                                case 'usb':
                                    status = this.checkSerialPort(ports[port].path, selectedDevices['cashdrawer-2-handshaking'], 1);
                                    break;
                            }
                            statuses.push([_('Cash Drawer %S', [2]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        }
                        else {
                            if (ports != null && port!= null && ports[port] != null)
                                statuses.push([_('Cash Drawer %S', [2]), ports[port].label + ' (' + ports[port].path + ')', status]);
                            else
                                statuses.push([_('Cash Drawer %S', [2]), 'unknown', status]);
                        }
                    }
                }

                // Scale 1
                if (selectedDevices['scale-1-enabled']) {
                    var port = selectedDevices['scale-1-port'];
                    if (ports != null &&  port != null && ports[port] != null && ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path, selectedDevices['scale-1-handshaking'], 1);
                                break;
                        }
                        statuses.push([_('Scale %S', [1]), ports[port].label + ' (' + ports[port].path + ')', status]);
                    }
                    else {
                        if (ports != null && port!= null && ports[port] != null)
                            statuses.push([_('Scale %S', [1]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        else
                            statuses.push([_('Scale %S', [1]), 'unknown', status]);
                    }
                }

                // Scale 2
                if (selectedDevices['scale-2-enabled']) {
                    var type = selectedDevices['scale-2-type'];
                    status = 0;
                    if (type == 'gpio') {
                            status = this.checkGPIOPort();
                    }
                    else {
                        var port = selectedDevices['scale-2-port'];
                        if (ports != null &&  port != null && ports[port] != null && ports[port].path != null) {
                            switch(ports[port].type) {
                                case 'serial':
                                case 'usb':
                                    status = this.checkSerialPort(ports[port].path, selectedDevices['scale-2-handshaking'], 1);
                                    break;
                            }
                            statuses.push([_('Scale %S', [2]), ports[port].label + ' (' + ports[port].path + ')', status]);
                        }
                        else {
                            if (ports != null && port!= null && ports[port] != null)
                                statuses.push([_('Scale %S', [2]), ports[port].label + ' (' + ports[port].path + ')', status]);
                            else
                                statuses.push([_('Scale %S', [2]), 'unknown', status]);
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
                else {
                    var CTS = status & 0x20 ? 1 : 0;
                    var DSR = status & 0x0100 ? 1 : 0;

                    // RTS/CTS or DTR/DSR hardware handshaking.
                    status = CTS || DSR;
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
//				this._portControlService = GREUtils.XPCOM.getService("@firich.com.tw/file_port_control_unix;1", "nsIFilePortControlUnix");
																													
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
                    if (tpl.type && tpl.type.indexOf(type) > -1) {
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

        // returns true if the specified link_group is associated with check1/2/3/4
        isGroupLinked: function(link_group_id) {
            var selectedDevices = this.getSelectedDevices();

            return (selectedDevices['check-1-link-group'].indexOf(link_group_id) > -1 ||
                    selectedDevices['check-2-link-group'].indexOf(link_group_id) > -1 ||
                    selectedDevices['check-3-link-group'].indexOf(link_group_id) > -1||
                    selectedDevices['check-4-link-group'].indexOf(link_group_id) > -1);
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
                    if (selectedDevices[type + '-1-enabled'] || selectedDevices[type + '-2-enabled'] || selectedDevices[type + '-3-enabled'] || selectedDevices[type + '-4-enabled']) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
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
                if (selectedDevices[type + '-1-enabled'] && (number == null || number == 1)) {
                    enabledDevices.push({
                        type: selectedDevices[type + '-1-type'],
                        template: selectedDevices[type + '-1-template'],
                        port: selectedDevices[type + '-1-port'],
                        portspeed: selectedDevices[type + '-1-portspeed'],
                        handshaking: selectedDevices[type + '-1-handshaking'],
                        devicemodel: selectedDevices[type + '-1-devicemodel'],
                        encoding: selectedDevices[type + '-1-encoding'],
                        autoprint: selectedDevices[type + '-1-autoprint'],
                        supportsstatus: selectedDevices[type + '-1-supports-status'],
                        gpiopulses: selectedDevices[type + '-1-gpio-pulses'],
                        linkgroup: selectedDevices[type + '-1-link-group'],
                        printNoRouting: selectedDevices[type + '-1-print-no-routing'],
                        printAllRouting: selectedDevices[type + '-1-print-all-routing'],
                        cashaction: selectedDevices[type + '-1-cash-action'],
                        creditcardaction: selectedDevices[type + '-1-creditcard-action'],
                        checkaction: selectedDevices[type + '-1-check-action'],
                        couponaction: selectedDevices[type + '-1-coupon-action'],
                        giftcardaction: selectedDevices[type + '-1-giftcard-action'],
                        ledgeraction: selectedDevices[type + '-1-ledger-action'],
                        paperwidth: selectedDevices[type + '-1-paperwidth'],
                        tare: selectedDevices[type + '-1-tare'],
                        multiplier: selectedDevices[type + '-1-multiplier'],
                        number: 1
                    });
                }
                if (selectedDevices[type + '-2-enabled'] && (number == null || number == 2)) {
                    enabledDevices.push({
                        type: selectedDevices[type + '-2-type'],
                        template: selectedDevices[type + '-2-template'],
                        port: selectedDevices[type + '-2-port'],
                        portspeed: selectedDevices[type + '-2-portspeed'],
                        handshaking: selectedDevices[type + '-2-handshaking'],
                        devicemodel: selectedDevices[type + '-2-devicemodel'],
                        encoding: selectedDevices[type + '-2-encoding'],
                        autoprint: selectedDevices[type + '-2-autoprint'],
                        supportsstatus: selectedDevices[type + '-2-supports-status'],
                        gpiopulses: selectedDevices[type + '-2-gpio-pulses'],
                        linkgroup: selectedDevices[type + '-2-link-group'],
                        printNoRouting: selectedDevices[type + '-2-print-no-routing'],
                        printAllRouting: selectedDevices[type + '-2-print-all-routing'],
                        cashaction: selectedDevices[type + '-2-cash-action'],
                        creditcardaction: selectedDevices[type + '-2-creditcard-action'],
                        checkaction: selectedDevices[type + '-2-check-action'],
                        couponaction: selectedDevices[type + '-2-coupon-action'],
                        giftcardaction: selectedDevices[type + '-2-giftcard-action'],
                        ledgeraction: selectedDevices[type + '-2-ledger-action'],
                        tare: selectedDevices[type + '-1-tare'],
                        multiplier: selectedDevices[type + '-1-multiplier'],
                        number: 2
                    });
                }

                if (type == 'check') {
                    if (selectedDevices[type + '-3-enabled'] && (number == null || number == 3)) {
                        enabledDevices.push({
                            type: selectedDevices[type + '-3-type'],
                            template: selectedDevices[type + '-3-template'],
                            port: selectedDevices[type + '-3-port'],
                            portspeed: selectedDevices[type + '-3-portspeed'],
                            handshaking: selectedDevices[type + '-3-handshaking'],
                            devicemodel: selectedDevices[type + '-3-devicemodel'],
                            encoding: selectedDevices[type + '-3-encoding'],
                            autoprint: selectedDevices[type + '-3-autoprint'],
                            supportsstatus: selectedDevices[type + '-3-supports-status'],
                            gpiopulses: selectedDevices[type + '-3-gpio-pulses'],
                            linkgroup: selectedDevices[type + '-3-link-group'],
                            printNoRouting: selectedDevices[type + '-3-print-no-routing'],
                            printAllRouting: selectedDevices[type + '-3-print-all-routing'],
                            number: 3
                        });
                    }
                    if (selectedDevices[type + '-4-enabled'] && (number == null || number == 4)) {
                        enabledDevices.push({
                            type: selectedDevices[type + '-4-type'],
                            template: selectedDevices[type + '-4-template'],
                            port: selectedDevices[type + '-4-port'],
                            portspeed: selectedDevices[type + '-4-portspeed'],
                            handshaking: selectedDevices[type + '-4-handshaking'],
                            devicemodel: selectedDevices[type + '-4-devicemodel'],
                            encoding: selectedDevices[type + '-4-encoding'],
                            autoprint: selectedDevices[type + '-4-autoprint'],
                            supportsstatus: selectedDevices[type + '-4-supports-status'],
                            gpiopulses: selectedDevices[type + '-4-gpio-pulses'],
                            linkgroup: selectedDevices[type + '-4-link-group'],
                            printNoRouting: selectedDevices[type + '-4-print-no-routing'],
                            printAllRouting: selectedDevices[type + '-4-print-all-routing'],
                            number: 4
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

            /*
             * populate receipt panel
             *
             */

            var selectedDevices = this.getSelectedDevices() || {};

            //this.log(GeckoJS.BaseObject.dump(selectedDevices));

            if (document.getElementById('receipt-panel') != null) {

                /* populate templates */

                var tmplmenu1 = document.getElementById('receipt-1-template');
                var tmplmenu2 = document.getElementById('receipt-2-template');
                var templates = this.getTemplates('receipt');

                var sortedTemplates = [];
                for (var tmpl in templates) {
                    var newTemplate = GREUtils.extend({}, templates[tmpl]);
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

                for (var i in sortedTemplates) {
                    var tmplName = sortedTemplates[i].name;
                    tmplmenu1.appendItem(_(sortedTemplates[i].label), tmplName, '');
                    tmplmenu2.appendItem(_(sortedTemplates[i].label), tmplName, '');
                }
                tmplmenu1.selectedIndex = tmplmenu2.selectedIndex = 0;

                /* populate device ports */

                var portmenu1 = document.getElementById('receipt-1-port');
                var portmenu2 = document.getElementById('receipt-2-port');
                for (var i in sortedPorts) {
                    if (sortedPorts[i].support.indexOf('receipt') > -1) {
                        var portName = sortedPorts[i].name;
                        portmenu1.appendItem(_(sortedPorts[i].label), portName, '');
                        portmenu2.appendItem(_(sortedPorts[i].label), portName, '');
                    }
                }
                portmenu1.selectedIndex = portmenu2.selectedIndex = 0;

                /* populate device portspeeds */

                var portspeedmenu1 = document.getElementById('receipt-1-portspeed');
                var portspeedmenu2 = document.getElementById('receipt-2-portspeed');
                
                for (var i in portspeeds) {
                    var portspeed = portspeeds[i];
                    portspeedmenu1.appendItem(portspeed, portspeed, '');
                    portspeedmenu2.appendItem(portspeed, portspeed, '');
                }
                portspeedmenu1.selectedIndex = portspeedmenu2.selectedIndex = 0;

                /* populate device models */

                var devicemodelmenu1 = document.getElementById('receipt-1-devicemodel');
                var devicemodelmenu2 = document.getElementById('receipt-2-devicemodel');
                var devicemodels = this.getDeviceModels();

                var sortedDevicemodels = [];
                for (var devicemodel in devicemodels) {
                    if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('receipt') > -1) {
                        var newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                        newDevicemodel.name = devicemodel;
                        sortedDevicemodels.push(newDevicemodel);
                    }
                }
                this._sortedDevicemodels['receipt'] = sortedDevicemodels = new GeckoJS.ArrayQuery(sortedDevicemodels).orderBy('label asc');

                for (var i in sortedDevicemodels) {
                    var devicemodelName = sortedDevicemodels[i].name;
                    devicemodelmenu1.appendItem(_(sortedDevicemodels[i].label), devicemodelName, '');
                    devicemodelmenu2.appendItem(_(sortedDevicemodels[i].label), devicemodelName, '');
                }
                devicemodelmenu1.selectedIndex = devicemodelmenu2.selectedIndex = 0;

                /* populate encodings */

                var encodingmenu1 = document.getElementById('receipt-1-encoding');
                var encodingmenu2 = document.getElementById('receipt-2-encoding');

                this.populateEncodings(encodingmenu1, sortedDevicemodels[devicemodelmenu1.selectedIndex]);
                this.populateEncodings(encodingmenu2, sortedDevicemodels[devicemodelmenu2.selectedIndex]);
            }

            /*
             * populate check panel
             *
             */

            //if (document.getElementById('check-panel') != null) {

                /* populate templates */

                var tmplmenu1 = document.getElementById('check-1-template');
                var tmplmenu2 = document.getElementById('check-2-template');
                var tmplmenu3 = document.getElementById('check-3-template');
                var tmplmenu4 = document.getElementById('check-4-template');
                var templates = this.getTemplates('check');

                var sortedTemplates = [];
                for (var tmpl in templates) {
                    var newTemplate = GREUtils.extend({}, templates[tmpl]);

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

                for (var i in sortedTemplates) {
                    var tmplName = sortedTemplates[i].name;
                    tmplmenu1.appendItem(_(sortedTemplates[i].label), tmplName, '');
                    tmplmenu2.appendItem(_(sortedTemplates[i].label), tmplName, '');
                    tmplmenu3.appendItem(_(sortedTemplates[i].label), tmplName, '');
                    tmplmenu4.appendItem(_(sortedTemplates[i].label), tmplName, '');
                }
                tmplmenu1.selectedIndex = tmplmenu2.selectedIndex = tmplmenu3.selectedIndex = tmplmenu4.selectedIndex = 0;

                /* populate device ports */

                var portmenu1 = document.getElementById('check-1-port');
                var portmenu2 = document.getElementById('check-2-port');
                var portmenu3 = document.getElementById('check-3-port');
                var portmenu4 = document.getElementById('check-4-port');

                for (var i in sortedPorts) {
                    if (sortedPorts[i].support.indexOf('check') > -1) {
                        var portName = sortedPorts[i].name;
                        portmenu1.appendItem(_(sortedPorts[i].label), portName, '');
                        portmenu2.appendItem(_(sortedPorts[i].label), portName, '');
                        portmenu3.appendItem(_(sortedPorts[i].label), portName, '');
                        portmenu4.appendItem(_(sortedPorts[i].label), portName, '');
                    }
                }
                portmenu1.selectedIndex = portmenu2.selectedIndex = portmenu3.selectedIndex = portmenu4.selectedIndex = 0;

                /* populate device portspeeds */

                var portspeedmenu1 = document.getElementById('check-1-portspeed');
                var portspeedmenu2 = document.getElementById('check-2-portspeed');
                var portspeedmenu3 = document.getElementById('check-3-portspeed');
                var portspeedmenu4 = document.getElementById('check-4-portspeed');

                for (var i in portspeeds) {
                    var portspeed = portspeeds[i];
                    portspeedmenu1.appendItem(portspeed, portspeed, '');
                    portspeedmenu2.appendItem(portspeed, portspeed, '');
                    portspeedmenu3.appendItem(portspeed, portspeed, '');
                    portspeedmenu4.appendItem(portspeed, portspeed, '');
                }
                portspeedmenu1.selectedIndex = portspeedmenu2.selectedIndex = portspeedmenu3.selectedIndex = portspeedmenu4.selectedIndex = 0;

                /* populate device models */

                var devicemodelmenu1 = document.getElementById('check-1-devicemodel');
                var devicemodelmenu2 = document.getElementById('check-2-devicemodel');
                var devicemodelmenu3 = document.getElementById('check-3-devicemodel');
                var devicemodelmenu4 = document.getElementById('check-4-devicemodel');
                var devicemodels = this.getDeviceModels();

                var sortedDevicemodels = [];
                for (var devicemodel in devicemodels) {
                    if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('check') > -1) {
                        var newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                        newDevicemodel.name = devicemodel;
                        sortedDevicemodels.push(newDevicemodel);
                    }
                }
                this._sortedDevicemodels['check'] = sortedDevicemodels = new GeckoJS.ArrayQuery(sortedDevicemodels).orderBy('label asc');

                for (var i in sortedDevicemodels) {
                    var devicemodelName = sortedDevicemodels[i].name;
                    devicemodelmenu1.appendItem(_(sortedDevicemodels[i].label), devicemodelName, '');
                    devicemodelmenu2.appendItem(_(sortedDevicemodels[i].label), devicemodelName, '');
                    devicemodelmenu3.appendItem(_(sortedDevicemodels[i].label), devicemodelName, '');
                    devicemodelmenu4.appendItem(_(sortedDevicemodels[i].label), devicemodelName, '');
                }
                devicemodelmenu1.selectedIndex = devicemodelmenu2.selectedIndex = devicemodelmenu3.selectedIndex = devicemodelmenu4.selectedIndex = 0;

                /* populate encodings */

                var encodingmenu1 = document.getElementById('check-1-encoding');
                var encodingmenu2 = document.getElementById('check-2-encoding');
                var encodingmenu3 = document.getElementById('check-3-encoding');
                var encodingmenu4 = document.getElementById('check-4-encoding');

                this.populateEncodings(encodingmenu1, sortedDevicemodels[devicemodelmenu1.selectedIndex]);
                this.populateEncodings(encodingmenu2, sortedDevicemodels[devicemodelmenu2.selectedIndex]);
                this.populateEncodings(encodingmenu3, sortedDevicemodels[devicemodelmenu3.selectedIndex]);
                this.populateEncodings(encodingmenu4, sortedDevicemodels[devicemodelmenu4.selectedIndex]);

                var pluGroupModel = new PlugroupModel();
                var groups = pluGroupModel.findByIndex('all', {
                    index: 'routing',
                    value: 1,
                    order: 'display_order, name'
                });
                var check1_group_listscrollablepanel = document.getElementById('check-1-group_listscrollablepanel');
                var check2_group_listscrollablepanel = document.getElementById('check-2-group_listscrollablepanel');
                var check3_group_listscrollablepanel = document.getElementById('check-3-group_listscrollablepanel');
                var check4_group_listscrollablepanel = document.getElementById('check-4-group_listscrollablepanel');
                var plugroupPanelView1 = new NSIPluGroupsView(groups);
                var plugroupPanelView2 = new NSIPluGroupsView(groups);
                var plugroupPanelView3 = new NSIPluGroupsView(groups);
                var plugroupPanelView4 = new NSIPluGroupsView(groups);
                check1_group_listscrollablepanel.datasource = plugroupPanelView1;
                check2_group_listscrollablepanel.datasource = plugroupPanelView2;
                check3_group_listscrollablepanel.datasource = plugroupPanelView3;
                check4_group_listscrollablepanel.datasource = plugroupPanelView4;
            //}


            /*
             * populate report panel
             *
             */

            if (document.getElementById('report-panel') != null) {

                /* populate device ports */

                var portmenu1 = document.getElementById('report-1-port');
                var portmenu2 = document.getElementById('report-2-port');

                for (var i in sortedPorts) {
                    if (sortedPorts[i].support.indexOf('report') > -1) {
                        var portName = sortedPorts[i].name;
                        portmenu1.appendItem(_(sortedPorts[i].label), portName, '');
                        portmenu2.appendItem(_(sortedPorts[i].label), portName, '');
                    }
                }
                portmenu1.selectedIndex = portmenu2.selectedIndex = 0;

                /* populate device portspeeds */

                var portspeedmenu1 = document.getElementById('report-1-portspeed');
                var portspeedmenu2 = document.getElementById('report-2-portspeed');

                for (var i in portspeeds) {
                    var portspeed = portspeeds[i];
                    portspeedmenu1.appendItem(portspeed, portspeed, '');
                    portspeedmenu2.appendItem(portspeed, portspeed, '');
                }
                portspeedmenu1.selectedIndex = portspeedmenu2.selectedIndex = 0;

                /* populate device models */

                var devicemodelmenu1 = document.getElementById('report-1-devicemodel');
                var devicemodelmenu2 = document.getElementById('report-2-devicemodel');
                var devicemodels = this.getDeviceModels();

                var sortedDevicemodels = [];
                for (var devicemodel in devicemodels) {
                    if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('report') > -1) {
                        var newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                        newDevicemodel.name = devicemodel;
                        sortedDevicemodels.push(newDevicemodel);
                    }
                }
                this._sortedDevicemodels['report'] = sortedDevicemodels = new GeckoJS.ArrayQuery(sortedDevicemodels).orderBy('label asc');

                for (var i in sortedDevicemodels) {
                    var devicemodelName = sortedDevicemodels[i].name;
                    devicemodelmenu1.appendItem(_(sortedDevicemodels[i].label), devicemodelName, '');
                    devicemodelmenu2.appendItem(_(sortedDevicemodels[i].label), devicemodelName, '');
                }
                devicemodelmenu1.selectedIndex = devicemodelmenu2.selectedIndex = 0;

                /* populate encodings */

                var encodingmenu1 = document.getElementById('report-1-encoding');
                var encodingmenu2 = document.getElementById('report-2-encoding');

                this.populateEncodings(encodingmenu1, sortedDevicemodels[devicemodelmenu1.selectedIndex]);
                this.populateEncodings(encodingmenu2, sortedDevicemodels[devicemodelmenu2.selectedIndex]);
            }

            /*
             * populate VFD panel
             *
             */

            if (document.getElementById('vfd-panel') != null) {

                /* populate templates */

                var tmplmenu1 = document.getElementById('vfd-1-template');
                var tmplmenu2 = document.getElementById('vfd-2-template');
                var templates = this.getTemplates('vfd');

                var sortedTemplates = [];
                for (var tmpl in templates) {
                    var newTemplate = GREUtils.extend({}, templates[tmpl]);

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

                for (var i in sortedTemplates) {
                    var tmplName = sortedTemplates[i].name;
                    tmplmenu1.appendItem(_(sortedTemplates[i].label), tmplName, '');
                    tmplmenu2.appendItem(_(sortedTemplates[i].label), tmplName, '');
                }
                tmplmenu1.selectedIndex = tmplmenu2.selectedIndex = 0;

                /* populate device ports */

                var portmenu1 = document.getElementById('vfd-1-port');
                var portmenu2 = document.getElementById('vfd-2-port');

                for (var i in sortedPorts) {
                    if (sortedPorts[i].support.indexOf('vfd') > -1) {
                        var portName = sortedPorts[i].name;
                        portmenu1.appendItem(_(sortedPorts[i].label), portName, '');
                        portmenu2.appendItem(_(sortedPorts[i].label), portName, '');
                    }
                }
                portmenu1.selectedIndex = portmenu2.selectedIndex = 0;

                /* populate device portspeeds */

                var portspeedmenu1 = document.getElementById('vfd-1-portspeed');
                var portspeedmenu2 = document.getElementById('vfd-2-portspeed');

                for (var i in portspeeds) {
                    var portspeed = portspeeds[i];
                    portspeedmenu1.appendItem(portspeed, portspeed, '');
                    portspeedmenu2.appendItem(portspeed, portspeed, '');
                }
                portspeedmenu1.selectedIndex = portspeedmenu2.selectedIndex = 0;

                /* populate device models */

                var devicemodelmenu1 = document.getElementById('vfd-1-devicemodel');
                var devicemodelmenu2 = document.getElementById('vfd-2-devicemodel');
                var devicemodels = this.getDeviceModels();

                var sortedDevicemodels = [];
                for (var devicemodel in devicemodels) {
                    if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('vfd') > -1) {
                        var newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                        newDevicemodel.name = devicemodel;
                        sortedDevicemodels.push(newDevicemodel);
                    }
                }
                this._sortedDevicemodels['vfd'] = sortedDevicemodels = new GeckoJS.ArrayQuery(sortedDevicemodels).orderBy('label asc');

                for (var i in sortedDevicemodels) {
                    var devicemodelName = sortedDevicemodels[i].name;
                    devicemodelmenu1.appendItem(_(sortedDevicemodels[i].label), devicemodelName, '');
                    devicemodelmenu2.appendItem(_(sortedDevicemodels[i].label), devicemodelName, '');
                }
                devicemodelmenu1.selectedIndex = devicemodelmenu2.selectedIndex = 0;

                /* populate encodings */

                var encodingmenu1 = document.getElementById('vfd-1-encoding');
                var encodingmenu2 = document.getElementById('vfd-2-encoding');

                this.populateEncodings(encodingmenu1, sortedDevicemodels[devicemodelmenu1.selectedIndex]);
                this.populateEncodings(encodingmenu2, sortedDevicemodels[devicemodelmenu2.selectedIndex]);
            }

            /*
             * populate Cash drawer panel
             *
             */

            if (document.getElementById('cashdrawer-1-panel') != null && document.getElementById('cashdrawer-2-panel') != null) {

                /* populate device ports */

                var portmenu1 = document.getElementById('cashdrawer-1-port');
                var portmenu2 = document.getElementById('cashdrawer-2-port');

                for (var i in sortedPorts) {
                    if (sortedPorts[i].support.indexOf('cashdrawer') > -1) {
                        var portName = sortedPorts[i].name;
                        portmenu1.appendItem(_(sortedPorts[i].label), portName, '');
                        portmenu2.appendItem(_(sortedPorts[i].label), portName, '');
                    }
                }
                portmenu1.selectedIndex = portmenu2.selectedIndex = 0;

                /* populate device portspeeds */

                var portspeedmenu1 = document.getElementById('cashdrawer-1-portspeed');
                var portspeedmenu2 = document.getElementById('cashdrawer-2-portspeed');

                for (var i in portspeeds) {
                    var portspeed = portspeeds[i];
                    portspeedmenu1.appendItem(portspeed, portspeed, '');
                    portspeedmenu2.appendItem(portspeed, portspeed, '');
                }
                portspeedmenu1.selectedIndex = portspeedmenu2.selectedIndex = 0;

                /* populate device models */

                var devicemodelmenu1 = document.getElementById('cashdrawer-1-devicemodel');
                var devicemodelmenu2 = document.getElementById('cashdrawer-2-devicemodel');
                var devicemodels = this.getDeviceModels();

                var sortedDevicemodels = [];
                for (var devicemodel in devicemodels) {
                    if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('cashdrawer') > -1) {
                        var newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                        newDevicemodel.name = devicemodel;
                        sortedDevicemodels.push(newDevicemodel);
                    }
                }
                sortedDevicemodels = new GeckoJS.ArrayQuery(sortedDevicemodels).orderBy('label asc');

                for (var i in sortedDevicemodels) {
                    var devicemodelName = sortedDevicemodels[i].name;
                    devicemodelmenu1.appendItem(_(sortedDevicemodels[i].label), devicemodelName, '');
                    devicemodelmenu2.appendItem(_(sortedDevicemodels[i].label), devicemodelName, '');
                }
                devicemodelmenu1.selectedIndex = devicemodelmenu2.selectedIndex = 0;
            }

            if (document.getElementById('journal-panel') != null) {

                /* populate templates */

                var tmplmenu1 = document.getElementById('journal-preview-template');
                var templates = this.getTemplates('preview');

                var sortedTemplates = [];
                for (var tmpl in templates) {
                    var newTemplate = GREUtils.extend({}, templates[tmpl]);

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

                for (var i in sortedTemplates) {
                    var tmplName = sortedTemplates[i].name;
                    tmplmenu1.appendItem(_(sortedTemplates[i].label), tmplName, '');
                }
                tmplmenu1.selectedIndex = tmplmenu2.selectedIndex = 0;
            }

            /* apply device selections */
            GeckoJS.FormHelper.unserializeFromObject('deviceForm', selectedDevices);

            if (document.getElementById('cashdrawer-1-panel') != null) {
                this.updateCashdrawerType([document.getElementById('cashdrawer-1-type'), '1']);
            }
            if (document.getElementById('cashdrawer-2-panel') != null) {
                this.updateCashdrawerType([document.getElementById('cashdrawer-2-type'), '2']);
            }

            /*
             * populate Scale panel
             *
             */

            if (document.getElementById('scale-panel') != null) {

                /* populate device ports */

                var portmenu1 = document.getElementById('scale-1-port');
                var portmenu2 = document.getElementById('scale-2-port');

                for (var i in sortedPorts) {
                    if (sortedPorts[i].support.indexOf('scale') > -1) {
                        var portName = sortedPorts[i].name;
                        portmenu1.appendItem(_(sortedPorts[i].label), portName, '');
                        portmenu2.appendItem(_(sortedPorts[i].label), portName, '');
                    }
                }
                portmenu1.selectedIndex = portmenu2.selectedIndex = 0;

                /* populate device portspeeds */

                var portspeedmenu1 = document.getElementById('scale-1-portspeed');
                var portspeedmenu2 = document.getElementById('scale-2-portspeed');

                for (var i in portspeeds) {
                    var portspeed = portspeeds[i];
                    portspeedmenu1.appendItem(portspeed, portspeed, '');
                    portspeedmenu2.appendItem(portspeed, portspeed, '');
                }
                portspeedmenu1.selectedIndex = portspeedmenu2.selectedIndex = 0;

                /* populate device models */

                var devicemodelmenu1 = document.getElementById('scale-1-devicemodel');
                var devicemodelmenu2 = document.getElementById('scale-2-devicemodel');
                var devicemodels = this.getDeviceModels();

                var sortedDevicemodels = [];
                for (var devicemodel in devicemodels) {
                    if (devicemodels[devicemodel].type != null && devicemodels[devicemodel].type.indexOf('scale') > -1) {
                        var newDevicemodel = GREUtils.extend({}, devicemodels[devicemodel]);
                        newDevicemodel.name = devicemodel;
                        sortedDevicemodels.push(newDevicemodel);
                    }
                }
                sortedDevicemodels = new GeckoJS.ArrayQuery(sortedDevicemodels).orderBy('label asc');

                for (var i in sortedDevicemodels) {
                    var devicemodelName = sortedDevicemodels[i].name;
                    devicemodelmenu1.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
                    devicemodelmenu2.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
                }
                devicemodelmenu1.selectedIndex = devicemodelmenu2.selectedIndex = 0;
            }

            /* apply device selections */
            GeckoJS.FormHelper.unserializeFromObject('deviceForm', selectedDevices);

            if (document.getElementById('cashdrawer-1-panel') != null) {
                this.updateCashdrawerType([document.getElementById('cashdrawer-1-type'), '1']);
            }
            if (document.getElementById('cashdrawer-2-panel') != null) {
                this.updateCashdrawerType([document.getElementById('cashdrawer-2-type'), '2']);
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
                                               flags, _('Save'), '', _('Discard'), null, check);
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

    GeckoJS.Controller.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'Devices');
                                      });

    }, false);

})();

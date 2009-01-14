(function(){

    /**
     * Devices Controller
     */

    GeckoJS.Controller.extend( {
        name: 'Devices',

        _templates: null,
        _ports: null,
        _portspeeds: null,
        _devicemodels: null,
        _selectedDevices: null,
        _sortedDevicemodels: null,
        _portControlService: null,

        // load device configuration and selections
        initial: function () {

            // load templates
            this._templates = GeckoJS.Configure.read('vivipos.fec.registry.templates');

            // load device ports
            this._ports = GeckoJS.Configure.read('vivipos.fec.registry.ports');

            // load port speeds
            var portspeeds = GeckoJS.Configure.read('vivipos.fec.registry.portspeeds');
            if (portspeeds != null) portspeeds = portspeeds.split(',');
            this._portspeeds = portspeeds;

            // load device models
            this._devicemodels = GeckoJS.Configure.read('vivipos.fec.registry.devicemodels');

            // load device selections
            this._selectedDevices = GeckoJS.Configure.read('vivipos.fec.settings.selectedDevices');
            if (this._selectedDevices != null)
                this._selectedDevices = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(this._selectedDevices));

            // load command files
            this.loadDeviceCommands(this._selectedDevices);
            alert(GeckoJS.BaseObject.dump(GeckoJS.Session.get('deviceCommands')));
        },

        // load and cache device commands
        loadDeviceCommands: function (devices) {

            var deviceCommands = {};
            var devicemodels = this.getDeviceModels();

            // collect all enabled device models
            if (devices != null) {

                if (devices['receipt-1-enabled']) {
                    // check if device already loaded
                    var device = devices['receipt-1-devicemodel'];
                    if (!(device in deviceCommands)) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (devices['receipt-2-enabled']) {
                    // check if device already loaded
                    var device = devices['receipt-2-devicemodel'];
                    if (!(device in deviceCommands)) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (devices['guestcheck-1-enabled']) {
                    // check if device already loaded
                    var device = devices['guestcheck-1-devicemodel'];
                    if (!(device in deviceCommands)) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (devices['guestcheck-2-enabled']) {
                    // check if device already loaded
                    var device = devices['guestcheck-2-devicemodel'];
                    if (!(device in deviceCommands)) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (devices['vfd-1-enabled']) {
                    // check if device already loaded
                    var device = devices['vfd-1-devicemodel'];
                    if (!(device in deviceCommands)) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (devices['vfd-2-enabled']) {
                    // check if device already loaded
                    var device = devices['vfd-2-devicemodel'];
                    if (!(device in deviceCommands)) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (devices['cashdrawer-1-enabled'] && (devices['cashdrawer-1-type'] == 'printer')) {
                    // check if device already loaded
                    var device = devices['cashdrawer-1-devicemodel'];
                    if (!(device in deviceCommands)) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }

                if (devices['cashdrawer-2-enabled'] && (devices['cashdrawer-2-type'] == 'printer')) {
                    // check if device already loaded
                    var device = devices['cashdrawer-2-devicemodel'];
                    if (!(device in deviceCommands)) {
                        deviceCommands[device] = this.loadDeviceCommandFile(devicemodels[device].path)
                    }
                }
            }
            GeckoJS.Session.set('deviceCommands', deviceCommands);
        },

        loadDeviceCommandFile: function(path) {
            var commands = new Object();
            try {
                var lines = GREUtils.File.readAllLine(GREUtils.File.chromeToPath(path)) || [];
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

        // check status of enabled devices
        checkStatusAll: function () {
            // for each enabled device, check its status and return a list of devices not in ready status
            var statuses = [];
            var selectedDevices = this.getSelectedDevices();
            var ports = this.getPorts();
            var status;
            var overallStatus = 1;

            // receipt printer 1
            if (selectedDevices['receipt-1-enabled']) {
                var port = selectedDevices['receipt-1-port'];
                status = 0;
                if (port != null && ports[port] != null && ports[port].path != null) {
                    switch(ports[port].type) {
                        case 'serial':
                        case 'usb':
                            status = this.checkSerialPort(ports[port].path);
                            break;
                    }
                    statuses.push([_('Receipt Printer %S', [1]), ports[port].label, status]);
                }
                overallStatus &= status;
            }

            // receipt printer 2
            if (selectedDevices['receipt-2-enabled']) {
                var port = selectedDevices['receipt-2-port'];
                status = 0;
                if (port != null && ports[port] != null && ports[port].path != null) {
                    switch(ports[port].type) {
                        case 'serial':
                        case 'usb':
                            status = this.checkSerialPort(ports[port].path);
                            break;
                    }
                    statuses.push([_('Receipt Printer %S', [2]), ports[port].label, status]);
                }
                overallStatus &= status;
            }

            // guest check printer 1
            if (selectedDevices['guestcheck-1-enabled']) {
                var port = selectedDevices['guestcheck-1-port'];
                status = 0;
                if (port != null && ports[port] != null && ports[port].path != null) {
                    switch(ports[port].type) {
                        case 'serial':
                        case 'usb':
                            status = this.checkSerialPort(ports[port].path);
                            break;
                    }
                    statuses.push([_('Guest Check Printer %S', [1]), ports[port].label, status]);
                }
                overallStatus &= status;
            }

            // guest check printer 2
            if (selectedDevices['guestcheck-2-enabled']) {
                var port = selectedDevices['guestcheck-2-port'];
                status = 0;
                if (port != null && ports[port] != null && ports[port].path != null) {
                    switch(ports[port].type) {
                        case 'serial':
                        case 'usb':
                            status = this.checkSerialPort(ports[port].path);
                            break;
                    }
                    statuses.push([_('Guest Check Printer %S', [2]), ports[port].label, status]);
                }
                overallStatus &= status;
            }

            // VFD 1
            if (selectedDevices['vfd-1-enabled']) {
                var port = selectedDevices['vfd-1-port'];
                status = 0;
                if (port != null && ports[port] != null && ports[port].path != null) {
                    switch(ports[port].type) {
                        case 'serial':
                        case 'usb':
                            status = this.checkSerialPort(ports[port].path);
                            break;
                    }
                    statuses.push([_('VFD %S', [1]), ports[port].label, status]);
                }
                overallStatus &= status;
            }

            // VFD 2
            if (selectedDevices['vfd-2-enabled']) {
                var port = selectedDevices['vfd-2-port'];
                status = 0;
                if (port != null && ports[port] != null && ports[port].path != null) {
                    switch(ports[port].type) {
                        case 'serial':
                        case 'usb':
                            status = this.checkSerialPort(ports[port].path);
                            break;
                    }
                    statuses.push([_('VFD %S', [2]), ports[port].label, status]);
                }
                overallStatus &= status;
            }

            // Cashdrawer 1
            if (selectedDevices['cashdrawer-1-enabled']) {
                var port = selectedDevices['cashdrawer-1-port'];
                status = 0;
                if (port != null && ports[port] != null) {
                    if (ports[port].type == 'gpio') {
                        status = this.checkGPIOPort();
                    }
                    else if (ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path);
                                break;
                        }
                        statuses.push([_('Cash Drawer %S', [1]), ports[port].label, status]);
                    }
                }
                overallStatus &= status;
            }

            // Cashdrawer 2
            if (selectedDevices['cashdrawer-2-enabled']) {
                var port = selectedDevices['cashdrawer-2-port'];
                status = 0;
                if (port != null && ports[port] != null) {
                    if (ports[port].type == 'gpio') {
                        status = this.checkGPIOPort();
                    }
                    else if (ports[port].path != null) {
                        switch(ports[port].type) {
                            case 'serial':
                            case 'usb':
                                status = this.checkSerialPort(ports[port].path);
                                break;
                        }
                        statuses.push([_('Cash Drawer %S', [2]), ports[port].label, status]);
                    }
                }
                overallStatus &= status;
            }
            return {status: overallStatus, statuses: statuses};
        },

        checkSerialPort: function (path) {
            var portControl = this.getSerialPortControlService();
            var status = 0;
            if (portControl != null) {
                portControl.openPort(path, '9600,n,8,1,h');
                status = portControl.statusPort(path);
                portControl.closePort(path);
                this.log(path + ':' + status);

                if (status == -1) {
                    status = 0;
                }
                else {
                    var CTS = status & 0x20 ? 1 : 0;
                    var DSR = status & 0x0100 ? 1 : 0;
                    status = CTS & DSR;
                }
            }
            return status;
        },

        checkVFDPort: function (path) {
            return this.checkSerialPort(path);
        },

        checkGPIOPort: function() {
            return 0;
        },


        // return port control service object
        getSerialPortControlService: function() {
            if (this._portControlService == null) {
                this._portControlService = GREUtils.XPCOM.getService("@firich.com.tw/serial_port_control_unix;1", "nsISerialPortControlUnix");
            }
            return this._portControlService;
        },

        // return template registry objects
        getTemplates: function () {
            if (this._templates == null) {
                this._templates = GeckoJS.Configure.read('vivipos.fec.registry.templates');
            }
            return this._templates;
        },

        // return port registry objects
        getPorts: function () {
            if (this._ports == null) {
                this._ports = GeckoJS.Configure.read('vivipos.fec.registry.ports');
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

        getSelectedDevices: function () {
            if (this._selectedDevices == null) {
                var selectedDevices = GeckoJS.Configure.read('vivipos.fec.settings.selectedDevices');
                if (selectedDevices != null && selectedDevices.length > 0) {
                    try {
                        this._selectedDevices = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(selectedDevices));
                    }
                    catch(e) {}
                }
            }
            return this._selectedDevices;
        },

        updateEncodings: function(data) {
            var devicemenu = data[0];
            var encodingmenu = data[1];

            if (devicemenu == null || encodingmenu == null) return;

            var selectedDeviceIndex = devicemenu.selectedIndex;
            if (selectedDeviceIndex == -1 || this._sortedDevicemodels == null || selectedDeviceIndex >= this._sortedDevicemodels.length) {
                encodingmenu.selectedIndex = 0;
            }
            else {
                var selectedDevice = this._sortedDevicemodels[selectedDeviceIndex];
                this.populateEncodings(encodingmenu, selectedDevice);
                encodingmenu.selectedIndex = 0;
            }
        },

        updateCashdrawerType: function(data) {
            var typemenu = data[0];
            var devicemenu = data[1];

            if (typemenu == null || devicemenu == null) return;

            var selectedType = typemenu.selectedItem;
            if (selectedType == null) {
                devicemenu.setAttribute('disabled', true);
                devicemenu.selectedIndex = 0;
            }
            else {
                devicemenu.setAttribute('disabled', selectedType.value == 'gpio');
            }
        },
        
        // initialize UI forms
        load: function() {

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
                var templates = this.getTemplates();

                var sortedTemplates = [];
                for (var tmpl in templates) {
                    if (templates[tmpl].type.indexOf('receipt') > -1) {
                        templates[tmpl].name = tmpl;
                        sortedTemplates.push(templates[tmpl]);
                    }
                }
                sortedTemplates = new GeckoJS.ArrayQuery(sortedTemplates).orderBy('label asc');

                for (var i in sortedTemplates) {
                    var tmplName = sortedTemplates[i].name;
                    tmplmenu1.appendItem(sortedTemplates[i].label, tmplName, '');
                    tmplmenu2.appendItem(sortedTemplates[i].label, tmplName, '');
                }
                tmplmenu1.selectedIndex = tmplmenu2.selectedIndex = 0;

                /* populate device ports */

                var portmenu1 = document.getElementById('receipt-1-port');
                var portmenu2 = document.getElementById('receipt-2-port');
                var ports = this.getPorts();

                var sortedPorts = [];
                for (var port in ports) {
                    ports[port].name = port;
                    sortedPorts.push(ports[port]);
                }
                sortedPorts = new GeckoJS.ArrayQuery(sortedPorts).orderBy('label asc');

                for (var i in sortedPorts) {
                    var portName = sortedPorts[i].name;
                    portmenu1.appendItem(sortedPorts[i].label, portName, '');
                    portmenu2.appendItem(sortedPorts[i].label, portName, '');
                }
                portmenu1.selectedIndex = portmenu2.selectedIndex = 0;

                /* populate device portspeeds */

                var portspeedmenu1 = document.getElementById('receipt-1-portspeed');
                var portspeedmenu2 = document.getElementById('receipt-2-portspeed');
                var portspeeds = this.getPortSpeeds();
                
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
                    if (devicemodels[devicemodel].type.indexOf('receipt') > -1) {
                        devicemodels[devicemodel].name = devicemodel;
                        sortedDevicemodels.push(devicemodels[devicemodel]);
                    }
                }
                this._sortedDevicemodels = sortedDevicemodels = new GeckoJS.ArrayQuery(sortedDevicemodels).orderBy('label asc');

                for (var i in sortedDevicemodels) {
                    var devicemodelName = sortedDevicemodels[i].name;
                    devicemodelmenu1.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
                    devicemodelmenu2.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
                }
                devicemodelmenu1.selectedIndex = devicemodelmenu2.selectedIndex = 0;

                /* populate encodings */

                var encodingmenu1 = document.getElementById('receipt-1-encoding');
                var encodingmenu2 = document.getElementById('receipt-2-encoding');

                this.populateEncodings(encodingmenu1, sortedDevicemodels[devicemodelmenu1.selectedIndex]);
                this.populateEncodings(encodingmenu2, sortedDevicemodels[devicemodelmenu2.selectedIndex]);
            }

            /*
             * populate guest check panel
             *
             */

            if (document.getElementById('guestcheck-panel') != null) {

                /* populate templates */

                var tmplmenu1 = document.getElementById('guestcheck-1-template');
                var tmplmenu2 = document.getElementById('guestcheck-2-template');
                var templates = this.getTemplates();

                var sortedTemplates = [];
                for (var tmpl in templates) {
                    if (templates[tmpl].type.indexOf('guestcheck') > -1) {
                        templates[tmpl].name = tmpl;
                        sortedTemplates.push(templates[tmpl]);
                    }
                }
                sortedTemplates = new GeckoJS.ArrayQuery(sortedTemplates).orderBy('label asc');

                for (var i in sortedTemplates) {
                    var tmplName = sortedTemplates[i].name;
                    tmplmenu1.appendItem(sortedTemplates[i].label, tmplName, '');
                    tmplmenu2.appendItem(sortedTemplates[i].label, tmplName, '');
                }
                tmplmenu1.selectedIndex = tmplmenu2.selectedIndex = 0;

                /* populate device ports */

                var portmenu1 = document.getElementById('guestcheck-1-port');
                var portmenu2 = document.getElementById('guestcheck-2-port');
                var ports = this.getPorts();

                var sortedPorts = [];
                for (var port in ports) {
                    ports[port].name = port;
                    sortedPorts.push(ports[port]);
                }
                sortedPorts = new GeckoJS.ArrayQuery(sortedPorts).orderBy('label asc');

                for (var i in sortedPorts) {
                    var portName = sortedPorts[i].name;
                    portmenu1.appendItem(sortedPorts[i].label, portName, '');
                    portmenu2.appendItem(sortedPorts[i].label, portName, '');
                }
                portmenu1.selectedIndex = portmenu2.selectedIndex = 0;

                /* populate device portspeeds */

                var portspeedmenu1 = document.getElementById('guestcheck-1-portspeed');
                var portspeedmenu2 = document.getElementById('guestcheck-2-portspeed');
                var portspeeds = this.getPortSpeeds();

                for (var i in portspeeds) {
                    var portspeed = portspeeds[i];
                    portspeedmenu1.appendItem(portspeed, portspeed, '');
                    portspeedmenu2.appendItem(portspeed, portspeed, '');
                }
                portspeedmenu1.selectedIndex = portspeedmenu2.selectedIndex = 0;

                /* populate device models */

                var devicemodelmenu1 = document.getElementById('guestcheck-1-devicemodel');
                var devicemodelmenu2 = document.getElementById('guestcheck-2-devicemodel');
                var devicemodels = this.getDeviceModels();

                var sortedDevicemodels = [];
                for (var devicemodel in devicemodels) {
                    if (devicemodels[devicemodel].type.indexOf('guestcheck') > -1) {
                        devicemodels[devicemodel].name = devicemodel;
                        sortedDevicemodels.push(devicemodels[devicemodel]);
                    }
                }
                this._sortedDevicemodels = sortedDevicemodels = new GeckoJS.ArrayQuery(sortedDevicemodels).orderBy('label asc');

                for (var i in sortedDevicemodels) {
                    var devicemodelName = sortedDevicemodels[i].name;
                    devicemodelmenu1.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
                    devicemodelmenu2.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
                }
                devicemodelmenu1.selectedIndex = devicemodelmenu2.selectedIndex = 0;

                /* populate encodings */

                var encodingmenu1 = document.getElementById('guestcheck-1-encoding');
                var encodingmenu2 = document.getElementById('guestcheck-2-encoding');

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
                var templates = this.getTemplates();

                var sortedTemplates = [];
                for (var tmpl in templates) {
                    if (templates[tmpl].type.indexOf('vfd') > -1) {
                        templates[tmpl].name = tmpl;
                        sortedTemplates.push(templates[tmpl]);
                    }
                }
                sortedTemplates = new GeckoJS.ArrayQuery(sortedTemplates).orderBy('label asc');

                for (var i in sortedTemplates) {
                    var tmplName = sortedTemplates[i].name;
                    tmplmenu1.appendItem(sortedTemplates[i].label, tmplName, '');
                    tmplmenu2.appendItem(sortedTemplates[i].label, tmplName, '');
                }
                tmplmenu1.selectedIndex = tmplmenu2.selectedIndex = 0;

                /* populate device ports */

                var portmenu1 = document.getElementById('vfd-1-port');
                var portmenu2 = document.getElementById('vfd-2-port');
                var ports = this.getPorts();

                var sortedPorts = [];
                for (var port in ports) {
                    ports[port].name = port;
                    sortedPorts.push(ports[port]);
                }
                sortedPorts = new GeckoJS.ArrayQuery(sortedPorts).orderBy('label asc');

                for (var i in sortedPorts) {
                    var portName = sortedPorts[i].name;
                    portmenu1.appendItem(sortedPorts[i].label, portName, '');
                    portmenu2.appendItem(sortedPorts[i].label, portName, '');
                }
                portmenu1.selectedIndex = portmenu2.selectedIndex = 0;

                /* populate device portspeeds */

                var portspeedmenu1 = document.getElementById('vfd-1-portspeed');
                var portspeedmenu2 = document.getElementById('vfd-2-portspeed');
                var portspeeds = this.getPortSpeeds();

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
                    if (devicemodels[devicemodel].type.indexOf('vfd') > -1) {
                        devicemodels[devicemodel].name = devicemodel;
                        sortedDevicemodels.push(devicemodels[devicemodel]);
                    }
                }
                this._sortedDevicemodels = sortedDevicemodels = new GeckoJS.ArrayQuery(sortedDevicemodels).orderBy('label asc');

                for (var i in sortedDevicemodels) {
                    var devicemodelName = sortedDevicemodels[i].name;
                    devicemodelmenu1.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
                    devicemodelmenu2.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
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

            if (document.getElementById('cashdrawer-panel') != null) {

                /* populate device ports */

                var portmenu1 = document.getElementById('cashdrawer-1-port');
                var portmenu2 = document.getElementById('cashdrawer-2-port');
                //var portmenu3 = document.getElementById('cashdrawer-3-port');
                var ports = this.getPorts();

                var sortedPorts = [];
                for (var port in ports) {
                    ports[port].name = port;
                    sortedPorts.push(ports[port]);
                }
                sortedPorts = new GeckoJS.ArrayQuery(sortedPorts).orderBy('label asc');

                for (var i in sortedPorts) {
                    var portName = sortedPorts[i].name;
                    portmenu1.appendItem(sortedPorts[i].label, portName, '');
                    portmenu2.appendItem(sortedPorts[i].label, portName, '');
                    //portmenu3.appendItem(sortedPorts[i].label, portName, '');
                }
                portmenu1.selectedIndex = portmenu2.selectedIndex = 0;
                //portmenu3.selectedIndex = 0;

                /* populate device portspeeds */

                var portspeedmenu1 = document.getElementById('cashdrawer-1-portspeed');
                var portspeedmenu2 = document.getElementById('cashdrawer-2-portspeed');
                //var portspeedmenu3 = document.getElementById('cashdrawer-3-portspeed');
                var portspeeds = this.getPortSpeeds();

                for (var i in portspeeds) {
                    var portspeed = portspeeds[i];
                    portspeedmenu1.appendItem(portspeed, portspeed, '');
                    portspeedmenu2.appendItem(portspeed, portspeed, '');
                    //portspeedmenu3.appendItem(portspeed, portspeed, '');
                }
                portspeedmenu1.selectedIndex = portspeedmenu2.selectedIndex = 0;
                //portspeedmenu3.selectedIndex = 0;

                /* populate device models */

                var devicemodelmenu1 = document.getElementById('cashdrawer-1-devicemodel');
                var devicemodelmenu2 = document.getElementById('cashdrawer-2-devicemodel');
                //var devicemodelmenu3 = document.getElementById('cashdrawer-3-devicemodel');
                var devicemodels = this.getDeviceModels();

                var sortedDevicemodels = [];
                for (var devicemodel in devicemodels) {
                    if (devicemodels[devicemodel].type.indexOf('cashdrawer') > -1) {
                        devicemodels[devicemodel].name = devicemodel;
                        sortedDevicemodels.push(devicemodels[devicemodel]);
                    }
                }
                this._sortedDevicemodels = sortedDevicemodels = new GeckoJS.ArrayQuery(sortedDevicemodels).orderBy('label asc');

                for (var i in sortedDevicemodels) {
                    var devicemodelName = sortedDevicemodels[i].name;
                    devicemodelmenu1.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
                    devicemodelmenu2.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
                    //devicemodelmenu3.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
                }
                devicemodelmenu1.selectedIndex = devicemodelmenu2.selectedIndex = 0;
                //devicemodelmenu3.selectedIndex = 0;

                this.updateCashdrawerType([document.getElementById('cashdrawer-1-type'), devicemodelmenu1]);
                this.updateCashdrawerType([document.getElementById('cashdrawer-2-type'), devicemodelmenu2]);
            }

            /* apply device selections */
            GeckoJS.FormHelper.unserializeFromObject('deviceForm', selectedDevices);

        },

        populateEncodings: function (menulist, devicemodel) {
            var encodings = this.getDeviceModelEncodings(devicemodel);
            var sortedEncodings = new GeckoJS.ArrayQuery(encodings).orderBy('label asc');

            menulist.removeAllItems();
            for (var i in sortedEncodings) {
                menulist.appendItem(sortedEncodings[i].label + ' (' + sortedEncodings[i].charset + ')', sortedEncodings[i].charset, '');
            }
            menulist.selectedIndex = 0;
        },

        // save configurations
        save: function (data) {
            var formObj = GeckoJS.FormHelper.serializeToObject('deviceForm');

            // check status of selected devices
            this._selectedDevices = formObj;
            var statusResult = this.checkStatusAll();
            
            if (statusResult.status == 0) {
                var statusStr = '';

                // generate list of devices that may not be ready
                var statuses = statusResult.statuses
                //GREUtils.log(GeckoJS.BaseObject.dump(statuses));
                statuses.forEach(function(status) {
                    if (status[2] == 0)
                        statusStr += '\n   ' + _('Device') + ' [' + status[0] + ']: ' + _('Port') + ' [' + status[1] + ']';
                });
                
                if (GREUtils.Dialog.confirm(null, _('Device Status'),
                                            _('The following devices may not be ready, do you want to save the new configuration?\n%S', [statusStr])) == false) {
                    if (data != null) data.cancel = true;
                    return;
                }
            }

            GeckoJS.Configure.write('vivipos.fec.settings.selectedDevices', GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(formObj)));
            return;
        }

    });

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('onInitial', function() {
                                            main.requestCommand('initial', null, 'Devices');
                                      });

    }, false);

})();

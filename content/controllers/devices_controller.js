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

        // initialize and load device configurations into session

        initial: function () {

            // load templates
            this._templates = GeckoJS.Configure.read('vivipos.fec.registry.templates');
            GeckoJS.Session.set('DeviceTemplates', this._templates);

            // load device ports
            this._ports = GeckoJS.Configure.read('vivipos.fec.registry.ports');
            GeckoJS.Session.set('DevicePorts', this._ports);

            // load port speeds
            var portspeeds = GeckoJS.Configure.read('vivipos.fec.registry.portspeeds');
            if (portspeeds != null) portspeeds = portspeeds.split(',');
            GeckoJS.Session.set('DevicePortSpeeds', portspeeds);
            this._portspeeds = portspeeds;

            // load device models
            this._devicemodels = GeckoJS.Configure.read('vivipos.fec.registry.devicemodels');
            GeckoJS.Session.set('DeviceModels', this._devicemodels);
        },

        // return template registry objects
        getTemplates: function () {
            if (this._templates == null) {
                var templates = GeckoJS.Configure.read('vivipos.fec.registry.templates');
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

        // initialize UI forms
        load: function() {
            // populate receipt panels

            var selections = GeckoJS.Configure.read('vivipos.fec.settings.devices');
            if (selections != null) selections = GeckoJS.Object.Unserialize(selections);
            else selections = {};
            
            var panel = document.getElementById('receipt-panel');
            if (panel) {

                // populate receipt-1-template menulist
                var tmplmenu1 = document.getElementById('receipt-1-template');
                var tmplmenu2 = document.getElementById('receipt-2-template');
                var index1 = 0;
                var index2 = 0;
                var templates = this.getTemplates();

                var sortedTemplates = [];
                for (var tmpl in templates) {
                    templates[tmpl].name = tmpl;
                    sortedTemplates.push(templates[tmpl]);
                }
                sortedTemplates = new GeckoJS.ArrayQuery(sortedTemplates).orderBy('label asc');

                for (var i in sortedTemplates) {
                    var tmplName = sortedTemplates[i].name;
                    tmplmenu1.appendItem(sortedTemplates[i].label, tmplName, '');
                    tmplmenu2.appendItem(sortedTemplates[i].label, tmplName, '');

                    if (selections['receipt-1-template'] == tmplName) index1 = i;
                    if (selections['receipt-2-template'] == tmplName) index2 = i;
                }

                tmplmenu1.selectedIndex = index1;
                tmplmenu2.selectedIndex = index2;

                // populate device ports
                var portmenu1 = document.getElementById('receipt-1-port');
                var portmenu2 = document.getElementById('receipt-2-port');
                var index1 = 0;
                var index2 = 0;
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

                    if (selections['receipt-1-port'] == portName) index1 = i;
                    if (selections['receipt-2-port'] == portName) index2 = i;
                }
                portmenu1.selectedIndex = index1;
                portmenu2.selectedIndex = index2;

                // populate device portspeeds
                var portspeedmenu1 = document.getElementById('receipt-1-portspeed');
                var portspeedmenu2 = document.getElementById('receipt-2-portspeed');
                var index1 = 0;
                var index2 = 0;
                var portspeeds = this.getPortSpeeds();
                
                for (var i in portspeeds) {
                    var portspeed = portspeeds[i];
                    portspeedmenu1.appendItem(portspeed, portspeed, '');
                    portspeedmenu2.appendItem(portspeed, portspeed, '');

                    if (selections['receipt-1-portspeed'] == portspeed) index1 = i;
                    if (selections['receipt-2-portspeed'] == portspeed) index2 = i;
                }
                portspeedmenu1.selectedIndex = index1;
                portspeedmenu2.selectedIndex = index2;

                // populate device models
                var devicemodelmenu1 = document.getElementById('receipt-1-devicemodel');
                var devicemodelmenu2 = document.getElementById('receipt-2-devicemodel');
                var index1 = 0;
                var index2 = 0;
                var devicemodels = this.getDeviceModels();

                var sortedDevicemodels = [];
                for (var devicemodel in devicemodels) {
                    devicemodels[devicemodel].name = devicemodel;
                    sortedDevicemodels.push(devicemodels[devicemodel]);
                }
                sortedDevicemodels = new GeckoJS.ArrayQuery(sortedDevicemodels).orderBy('label asc');

                for (var i in sortedDevicemodels) {
                    var devicemodelName = sortedDevicemodels[i].name;
                    devicemodelmenu1.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
                    devicemodelmenu2.appendItem(sortedDevicemodels[i].label, devicemodelName, '');

                    if (selections['receipt-1-devicemodel'] == devicemodelName) index1 = i;
                    if (selections['receipt-2-devicemodel'] == devicemodelName) index2 = i;
                }
                devicemodelmenu1.selectedIndex = index1;
                devicemodelmenu2.selectedIndex = index2;

                // populate encodings
                var encodingmenu1 = document.getElementById('receipt-1-encoding');
                var encodingmenu2 = document.getElementById('receipt-2-encoding');
                var encodings1 = this.getDeviceModelEncoding(sortedDevicemodels[index1]);
                var encodings1 = this.getDeviceModelEncoding(sortedDevicemodels[index2]);

                var index1 = 0;
                var index2 = 0;

                var sortedDevicemodels = [];
                for (var devicemodel in devicemodels) {
                    devicemodels[devicemodel].name = devicemodel;
                    sortedDevicemodels.push(devicemodels[devicemodel]);
                }
                sortedDevicemodels = new GeckoJS.ArrayQuery(sortedDevicemodels).orderBy('label asc');

                for (var i in sortedDevicemodels) {
                    var devicemodelName = sortedDevicemodels[i].name;
                    devicemodelmenu1.appendItem(sortedDevicemodels[i].label, devicemodelName, '');
                    devicemodelmenu2.appendItem(sortedDevicemodels[i].label, devicemodelName, '');

                    if (selections['receipt-1-devicemodel'] == devicemodelName) index1 = i;
                    if (selections['receipt-2-devicemodel'] == devicemodelName) index2 = i;
                }
                devicemodelmenu1.selectedIndex = index1;
                devicemodelmenu2.selectedIndex = index2;

            }
        },

        // save configurations
        save: function () {
        }

    });

})();

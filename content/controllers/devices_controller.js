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

            //@todo turn off logging
            this.log('Device Settings: ' + GeckoJS.BaseObject.dump(this._selectedDevices));
        },

        // check status of enabled devices
        checkStatus: function () {
            // for each enabled device, check its status and return a list of devices not in ready status
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

            this.log(GeckoJS.BaseObject.dump(selectedDevices));

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
        save: function () {
            var formObj = GeckoJS.FormHelper.serializeToObject('deviceForm');
            GeckoJS.Configure.write('vivipos.fec.settings.selectedDevices', GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(formObj)));
        }

    });

})();

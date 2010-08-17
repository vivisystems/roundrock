(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'Scale',

        _device: null,

        // load device configuration and selections
        initial: function () {
            this._device = this.getDeviceController();
        },

        getDeviceController: function () {
            if (this._device == null) {
                this._device = GeckoJS.Controller.getInstanceByName('Devices');
            }
            return this._device;
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

        // return the actual file system path of a port
        getPortPath: function (port) {
            var ports = this.getPorts();
            if (ports == null || ports[port] == null) return null;

            return ports[port].path;
        },

        readScale: function(number, productTare) {

            var device = this.getDeviceController();
            if (device == null) {
                NotifyUtils.error(_('Error in device manager! Please check your device configuration'));
                return -1;
            }

            var number = parseInt(number);
            if (isNaN(number)) number = null;

            var enabledDevices = device.getEnabledDevices('scale', number);
            var selectedDevice;

            if (enabledDevices.length == 0) {
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Device Status'),
                                      _('There are no active scales!'));
                return -1;
            }

            // notify user which scale is in use if multiple scales are enabled
            selectedDevice = enabledDevices[0];
            if (enabledDevices.length > 1) {
                NotifyUtils.info(_('Multiple scales have been enabled; scale [%S] is selected', [selectedDevice.number]));
            }

            // retrieve device model
            var devicemodel;
            var devicelist = device.getDeviceModels();
            if (devicelist) {
                devicemodel = devicelist[selectedDevice.devicemodel];
            }

            // device model configuration exists?
            if (!devicemodel) {
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Device Status'),
                                      _('The configured scale model [%S] is not supported', [selectedDevice.devicemodel]));
                return -1;
            }

            // device model controller exists?
            var controller = GeckoJS.Controller.getInstanceByName(devicemodel.controller);

            if (!controller) {
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Device Status'),
                                      _('The configured scale model [%S] is not supported', [devicemodel.label]));
                return -1;
            }

            var port = this.getPortPath(selectedDevice.port);
            var portspeed = selectedDevice.portspeed;
            var handshaking = selectedDevice.handshaking;

            var mainController = GeckoJS.Controller.getInstanceByName('Main');
            var waitPanel = mainController._showWaitPanel('blockui_panel', 'common_wait',
                                                          _('Reading from Scale [%S]', [selectedDevice.number]), 1);

            var weight;

            if (controller.openSerialPort(port, portspeed, handshaking)) {
                weight = controller.readScale(port, devicemodel.iterations, devicemodel.stables, devicemodel.tries);
                controller.closeSerialPort(port);
            }

            if (waitPanel) waitPanel.hidePopup();
            if (weight != null) {
                if (weight.value != null) {
                    var deviceTare = parseFloat(selectedDevice.tare);
                    if (isNaN(deviceTare)) deviceTare = 0;

                    productTare = parseFloat(productTare);
                    if (isNaN(productTare)) productTare = 0;

                    var multiplier = parseFloat(selectedDevice.multiplier);
                    if (isNaN(multiplier) || multiplier == 0) multiplier = 1;

                    weight.value = (weight.value - deviceTare - productTare) * multiplier;
                }
                return weight;
            }
            else {
                return;
            }
        }
    };

    AppController.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'Scale');
                                      });
    }, false);
})();

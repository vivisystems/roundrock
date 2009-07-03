(function(){

    var __controller__ = {

        name: 'ScaleMTTigerIIController',

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

        // invoke readSerialPort on device controller
        readSerialPort: function (path, buf, len) {
            var device = this.getDeviceController();
            if (device != null) {
                return device.readSerialPort(path, buf, len);
            }
            else {
                return -1;
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

        readScale: function(port, iterations) {

            var weight;
            var weightStr = '';
            var count = 0;
            var buf = {};
this.log('DEBUG', 'port: ' + port + ', iterations: ' + iterations);
            while (weightStr.length < 29 && count < iterations) {
                var len = this.readSerialPort(port, buf, 29);
                if (len > 0) {
                    var str = buf.value;
                    this.log('DEBUG', 'read from port (' + len + '): [' + str + ']');
                    // look for STX
                    if (weightStr) {
                        this.log('DEBUG', 'appending to buffer');
                        weightStr += str;
                    }
                    else {
                        var index = str.indexOf('\u0002');
                        if (index > -1) {
                            this.log('DEBUG', 'STX found: ' + index);

                            weightStr = str.substr(index);
                        }
                    }
                }
                this.sleep(100);
                count++;
                this.log('DEBUG', 'weightStr length: ' + weightStr.length + ', iterations: ' + count);
            }

            if (weightStr.length >= 29) {
                weight = weightStr.substr(1, 7);
                this.log('DEBUG', 'scale value: ' + weight);
                if (isNaN(weight)) {
                    weight = null;
                }
                this.log('DEBUG', 'scale value: ' + weight);
            }
            this.log('DEBUG', 'readScale: [' + weight + ']');
            return weight;
        }
    };

    GeckoJS.Controller.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'Scale');
                                      });
    }, false);
})();

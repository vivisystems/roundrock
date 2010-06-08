(function(){

    var __controller__ = {

        name: 'ScaleExcellAW30Controller',

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

        // return:
        //
        // null:            if failed to read from scale
        // {value: null}:  if failed to obtain a stable reading
        // {value: weight}: if stable reading is successfully obtained

        readScale: function(port, iterations, stables, tries) {

            //this.log('DEBUG', 'args: ' + port + ', ' + iterations + ', ' + stables + ', ' + tries);
            var weight;
            var tryCount = 0;

            // return weight only if the same weight has been read 3 times in a row
            weight = this.readScaleOnce(port, iterations);

            //this.log('DEBUG', 'weight from readOnce: ' + this.dump(weight));
            while (weight != null) {
                if (weight.value) {
                    return {value: weight.value, unit: weight.unit, original: weight.original, display: null}; // not support preformated display 
                }
                else {
                    if (++tryCount == tries) {
                        return {value: null, unit: null, original: null, display: null};
                    }
                }
                weight = this.readScaleOnce(port, iterations);
                //this.log('DEBUG', 'weight from readOnce: ' + this.dump(weight));
            }
            // fail to read from scale, return immediately

            return;
        },

        readScaleOnce: function(port, iterations) {

            var weight;
            var weightStr = '';
            var count = 0;
            var buf = {};

            //this.log('DEBUG', 'port: ' + port + ', iterations: ' + iterations);
            while (weightStr.length < 18 && count++ < iterations) {
                var len = this.readSerialPort(port, buf, 19);
                if (len > 0) {
                    var str = buf.value;
                    //this.log('DEBUG', 'read from port (' + len + '): [' + str + ']');
                    if (weightStr) {
                        //this.log('DEBUG', 'appending to buffer');
                        weightStr += str;
                    }
                    else {
                        // look for LF
                        var index = str.indexOf('\u000A');
                        if (index > -1) {
                            //this.log('DEBUG', 'LF found: ' + index);

                            weightStr = str.substr(index);
                        }
                    }
                }
                //this.log('DEBUG', 'weightStr length: ' + weightStr.length + ', iterations: ' + count);
            }

            if (weightStr.length >= 19) {
                var head1 = weightStr.substr(1, 2);
                var value = weightStr.substr(7, 1);
                var value = weightStr.substr(8, 7);
                var unit = weightStr.substr(15, 2);
                //this.log('DEBUG', 'scale value: ' + value + ', unit: ' + unit);
                if (head1 != 'ST' || isNaN(value)) {
                    weight = null;
                }
                else {
                    weight = {value: value, unit: unit, original: weightStr, display: null}; // not support preformated display 
                }
                //this.log('DEBUG', 'scale value: ' + value + ', unit: ' + unit);
                return weight;
            }
            //this.log('DEBUG', 'readScale: ' + this.dump(weight));
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

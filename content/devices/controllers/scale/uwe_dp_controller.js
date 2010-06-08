(function(){

    var __controller__ = {

        name: 'Scale_UWE_DP_Controller',

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

            this.log('DEBUG', 'args: ' + port + ', ' + iterations + ', ' + stables + ', ' + tries);
            var weight;
            var lastWeight;
            var stableCount = 0;
            var tryCount = 0;

            // return weight only if the same weight has been read #stables times in a row
            weight = this.readScaleOnce(port, iterations);
            //this.log('DEBUG', '[readScale] initial weight from readOnce: ' + GeckoJS.BaseObject.dump(weight));
            while (weight != null) {
                if (lastWeight == null) {
                    lastWeight = weight.value;
                }
                else {
                    if (weight.value == lastWeight) {
                        if (++stableCount >= stables) {
                            return {value: weight.value, unit: weight.unit, original: weight.original, display: weight.display};
                        }
                    }
                    else {
                        // weight has changed
                        lastWeight = weight.value;
                        if (++tryCount == tries) {
                            return {value: null, unit: null, original: null, display: null};
                        }
                        else {
                            stableCount = 0;
                        }
                    }
                }
                weight = this.readScaleOnce(port, iterations);
                this.log('DEBUG', '[readScale] weight (' + stableCount + ') from readOnce: ' + weight);
            }
            // fail to read from scale, return immediately

            return;
        },

        readScaleOnce: function(port, iterations) {

            var weight;
            var pLine = '';
            var tries = 0;
            var buf = {};
            var re1 = /@1\s+(\d+\.\d+)\s+(\w*)/;
            var re2 = /@1\s+(\d+)'\s*(\d+.\d+)\s+(\w*)/;

            //this.log('DEBUG', '[readScaleOnce] port: ' + port + ', iterations: ' + iterations);
            while (tries < iterations) {
                let len = this.readSerialPort(port, buf, 20);
                if (len > 0) {
                    let str = buf.value;
                    //this.log('DEBUG', '[readScaleOnce] read from port (' + len + '): [' + str + ']');

                    pLine += str;
                    let lines = pLine.split('\n');

                    // look for line break
                    if (lines.length > 1) {
                        let line = lines[0].trim();
                        //this.log('DEBUG', '[readScaleOnce] line found: [' + line + ']');

                        // check if pLine starts with @1
                        if (line.length > 0) {
                            if (line.substr(0,2) == '@1') {
                                //this.log('DEBUG', '[readScaleOnce] net weight line found: [' + line + ']');

                                // parse pLine into header weight unit
                                let m = re1.exec(line);
                                if (m && m[1] && m[2]) {
                                    let value = parseFloat(m[1]);
                                    if (!isNaN(value)) {
                                        weight = {value: value, unit: m[2], original: line, display: (value+'')};
                                        //this.log('DEBUG', '[readScaleOnce] valid net weight: ' + this.dump(weight));

                                        // exit from while loop
                                        break;
                                    }
                                }
                                else {
                                    m = re2.exec(line);
                                    if (m && m[1] && m[2] && m[3]) {
                                        let part1 = parseFloat(m[1]);
                                        let part2 = parseFloat(m[2]);
                                        if (!isNaN(part1) && !isNaN(part2)) {
                                            weight = {value: (part1 + (part2/16)), unit: m[3], original: line, display: (part1+'. '+part2)};
                                            //this.log('DEBUG', '[readScaleOnce] valid net weight: ' + this.dump(weight));

                                            // exit from while loop
                                            break;
                                        }
                                    }
                                }
                                this.log('WARN', '[readScaleOnce] invalid net weight line: [' + line + ']');
                            }
                            else {
                                //this.log('DEBUG', '[readScaleOnce] not net weight line: [' + line.substr(0,2) + ']');
                            }
                        }
                        else {
                            //this.log('DEBUG', '[readScaleOnce] empty line');
                        }

                        // pLine does not start with @1
                        lines.splice(0, 1);
                        pLine = lines.join('\n');
                        //this.log('DEBUG', '[readScaleOnce] current line reset to [' + pLine + ']');
                    }
                    else {
                        //this.log('DEBUG', '[readScaleOnce] appended to current line [' + pLine + ']');
                    }
                }
                else {
                    //this.log('DEBUG', 'no data read from serial port');
                }
                tries++;
            }
            this.log('DEBUG', '[readScaleOnce] weight found: ' + weight);
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

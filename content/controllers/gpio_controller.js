(function(){

    /**
     * Print Controller
     */

    var __controller__ = {
        name: 'GPIO',

        _ioService: null,

        initial: function () {
            this._ioService = GREUtils.XPCOM.getService("@firich.com.tw/io_port_control_unix;1", "nsIIOPortControlUnix");
        },

        // return GPIO port status
        checkPortStatus: function () {
            return (this._ioService != null);
        },

        // returns 1 if drawer is open, 0 otherwise
        isDrawerOpen: function () {
            var ioService = this._ioService;
            if (ioService == null) return false;
            return (((ioService.inb(0x2f) & 0x10) >> 4) > 0);
        },

        trigger: function (pulses) {
            var ioService = this._ioService;
            if (ioService == null) return 0;

            if (isNaN(pulses) || pulses < 1) pulses = 1;
            pulses = Math.floor(pulses);

            ioService.iopl(3);
            ioService.outb(0x2e,0x87);
            ioService.outb(0x2e,0x87);
            ioService.outb(0x2e,0x07);
            ioService.outb(0x2f,0x07);
            ioService.outb(0x2e,0xf1);

            for (var i = 0; i < pulses; i++) {
                ioService.outb(0x2f,0x01);
                ioService.usleep(200000);
                ioService.outb(0x2f,0x00);
                ioService.usleep(200000);
            }

            var status = ((ioService.inb(0x2f) & 0x10) >> 4);

            //this.log('DEBUG', 'GPIO controller: triggered GPIO port [' + pulses + ']');
            return status;
        }


    };

    GeckoJS.Controller.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'GPIO');
                                      });

    }, false);


})();

(function(){

    GeckoJS.include('chrome://viviecr/content/devices/deviceTemplate.js');
    GeckoJS.include('chrome://viviecr/content/devices/deviceTemplateUtils.js');

    /**
     * Print Controller
     */

    GeckoJS.Controller.extend( {
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
            if (ioService == null) return 0;
            return ((ioService.inb(0x2f) & 0x10) >> 4);
        },

        trigger: function () {
            var ioService = this._ioService;
            if (ioService == null) return 0;

            ioService.iopl(3);
            ioService.outb(0x2e,0x87);
            ioService.outb(0x2e,0x87);
            ioService.outb(0x2e,0x07);
            ioService.outb(0x2f,0x07);
            ioService.outb(0x2e,0xf1);
            ioService.outb(0x2f,0x01);
            ioService.usleep(200000);
            ioService.outb(0x2f,0x00);
            ioService.usleep(200000);
            ioService.outb(0x2f,0x01);
            ioService.usleep(200000);
            ioService.outb(0x2f,0x00);

            var status = ((ioService.inb(0x2f) & 0x10) >> 4);
            return status;
        }


    });

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('onInitial', function() {
                                            main.requestCommand('initial', null, 'GPIO');
                                      });

    }, false);


})();

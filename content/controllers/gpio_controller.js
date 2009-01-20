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

            this.log('GPIO driver initialized [' + this._ioService + ']');
        },

        // return GPIO port status
        checkPortStatus: function () {
            this.log('checking GPIO status');
            return (this._ioService != null);
        },

        trigger: function () {
            this.log('triggering GPIO');
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

            return ((ioService.inb(0x2f) & 0x10) >> 4);
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

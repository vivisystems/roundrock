(function(){

    /**
     * Controller UIReceipts
     *
     */

    GeckoJS.Controller.extend( {

        name: 'UIReceipts',
        
        _print: null,

        _device: -1,

        // attach listener for Print event onReceiptPrinted

        initial: function () {
            // get handle to Print controller
            var print = this.getPrintController();

            // add event listener for onReceiptPrinted events
            if (print) {
                print.addEventListener('onReceiptPrinted', this.updateUIRecord, this);
            }

            this._device = GeckoJS.Configure.read('vivipos.fec.extension.uireceipts.device') || -1;

            // add event listener for session change
            var self = this;
            GeckoJS.Session.addEventListener('change', function(evt){
                // just refresh view , dont prepare categories array to session.
                if (evt.data.key == 'uidevice') {
                    self._device = evt.data.value;
                }
            });
        },

        getPrintController: function () {
            if (this._print == null) {
                this._print = GeckoJS.Controller.getInstanceByName('Print');
            }
            return this._print;
        },

        getPageCount: function (receipt) {
            return 2;
        },

        updateUIRecord: function (evt) {
            var data = evt.data
            if (data.device == this._device) {
                alert('Recording UI');

                var pageCount = this.getPageCount(data.receipt);
            }
        }
  });

})()

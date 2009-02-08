(function(){

    /**
     * Controller UIReceipts
     *
     */

    GeckoJS.Controller.extend( {

        name: 'UIReceipts',
        
        _print: null,

        _keypad: null,

        _model: null,

        // attach listener for Print event onReceiptPrinted

        initial: function () {
            // get handle to Print controller
            var print = this.getPrintController();

            // get current UI marker and store it in Session
            this.updateSession();

            // add event listener for onReceiptPrinted events
            if (print) {
                print.addEventListener('onReceiptPrinted', this.updateUIRecord, this);
                print.addEventListener('beforePrintCheck', this.beforePrint, this);
            }
        },

        getPrintController: function () {
            if (this._print == null) {
                this._print = GeckoJS.Controller.getInstanceByName('Print');
            }
            return this._print;
        },

        getMarkerModel: function () {
            if (this._model == null) {
                this._model = new UnifiedInvoiceMarkerModel();
            }
            return this._model;
        },

        getInvoiceMarker: function () {

            var marker;
            var model = this.getMarkerModel();
            var terminal_no = GeckoJS.Session.get('terminal_no');

            if (model) {
                marker = model.findByIndex('first', {
                    index: 'terminal_no',
                    value: terminal_no
                });
            }

            return marker;

        },

        getPageCount: function (receipt) {
            alert('Getting page count for receipt data: ' + receipt);

            return 2;
        },

        getResetUIDialog: function () {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=300';
            var inputObj = {
                input0:null, require0: true, alphaOnly0: true, fixedLength0: 2,
                input1:null, require1: true, digitOnly1: true, fixedLength1: 8
            };
            window.openDialog(aURL, _('Reset Unified Invoice'), features, _('Reset Unified Invoice'), '',
                _('Code'), _('Sequence'), inputObj);

            if (inputObj.ok) {
                return inputObj;
            }else {
                return null;
            }
        },

        getVoidUIDialog: function () {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=300';
            var inputObj = {
                input0:null, require0: true, alphaOnly0: true, fixedLength0: 2,
                input1:null, require1: true, digitOnly1: true, fixedLength1: 8
            };
            window.openDialog(aURL, _('Void Unified Invoice'), features, _('Void Unified Invoice'), '',
                _('Code'), _('Sequence'), inputObj);

            if (inputObj.ok) {
                return inputObj;
            }else {
                return null;
            }
        },

        updateSession: function () {
            // get current unified invoice number and store it in session
            var marker = this.getInvoiceMarker();
            GeckoJS.Session.set('vivipos_fec_console_message', marker.code + marker.seq);
        },

        reset: function () {
            var inputObj = this.getResetUIDialog();
            if (inputObj) {
                var markerModel = this.getMarkerModel();
                var terminal_no = GeckoJS.Session.get('terminal_no');

                if (markerModel) {
                    var uiRecord = markerModel.findByIndex('first', {
                        index: 'terminal_no',
                        value: terminal_no
                    });

                    var newMarker = {
                        code: inputObj.input0,
                        seq: inputObj.input1,
                        terminal_no: terminal_no
                    }
                    markerModel.save(newMarker);

                    this.updateSession();
                }
                else {
                    //@todo TEXT
                    GREUtils.Dialog.alert(window,
                                          'Unified Invoice Error',
                                          'Failed to retrieve model; please contact your dealer for technical assistance');
                }
            }
        },

        void: function () {
            var inputObj = this.getVoidUIDialog();
            if (inputObj) {
                var code = inputObj.input0;
                var seq = inputObj.input1
                var model = new UnifiedInvoiceModel();
                var terminal_no = GeckoJS.Session.get('terminal_no');

                if (model) {
                    var uirecords = model.find('all', {
                        conditions: 'code = "' + code + '" AND start_seq <= "' + seq + '" AND end_seq >= "' + seq + '"'
                    });

                    alert(GeckoJS.BaseObject.dump(uirecords));
                }
                else {
                    //@todo TEXT
                    GREUtils.Dialog.alert(window,
                                          'Unified Invoice Error',
                                          'Failed to retrieve model; please contact your dealer for technical assistance');
                }
            }
        },

        beforePrint: function (evt) {
            // stub for handling beforePrint event
        },

        updateUIRecord: function (evt) {
            var data = evt.data
            var device = GeckoJS.Configure.read('vivipos.fec.settings.unified.invoice.Device');
            if (data.printed && data.device == device) {

                // first, we get current invoice number
                var marker = this.getInvoiceMarker();
                if (marker) {
                    
                    var pageCount = this.getPageCount(data.receipt);

                    var endSequence = GeckoJS.String.padLeft(parseInt(marker.seq) - (1 - pageCount), 8, '0');
                    var newSequence = GeckoJS.String.padLeft(parseInt(marker.seq) - (0 - pageCount), 8, '0');

                    var terminal_no = GeckoJS.Session.get('terminal_no');

                    // insert unified invoices
                    var model = new UnifiedInvoiceModel();
                    var newInvoice = {
                        order_id: data.data.order.id,
                        code: marker.code,
                        start_seq: marker.seq,
                        end_seq: endSequence,
                        status: 0,
                        terminal_no: terminal_no
                    }
                    model.save(newInvoice);
                    
                    // update unified invoice marker
                    marker.seq = newSequence;
                    marker.terminal_no = terminal_no;

                    var markerModel = this.getMarkerModel();
                    markerModel.id = marker.id;
                    markerModel.save(marker);

                    this.updateSession();
                }
                else {
                    //@todo TEXT
                    GREUtils.Dialog.alert(window,
                                          'Unified Invoice Error',
                                          'No Unified Invoice configuration found; please reset UI code and sequence first');
                    return;
                }
            }
        }
  });

})()

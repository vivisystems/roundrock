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
                print.addEventListener('beforePrintCheck', this.beforePrintCheck, this);
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

            // @todo TEXT
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

            // @todo TEXT
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
            if (marker)
                GeckoJS.Session.set('vivipos_fec_console_message', marker.code + marker.seq);
            else
                GeckoJS.Session.set('vivipos_fec_console_message', null);
        },

        resetMarker: function () {
            var inputObj = this.getResetUIDialog();
            if (inputObj) {
                var markerModel = this.getMarkerModel();
                var terminal_no = GeckoJS.Session.get('terminal_no');

                if (markerModel) {
                    var uirecord = markerModel.findByIndex('first', {
                        index: 'terminal_no',
                        value: terminal_no
                    });

                    var newMarker = {
                        code: inputObj.input0,
                        seq: inputObj.input1,
                        terminal_no: terminal_no
                    }
                    if (uirecord) markerModel.id = uirecord.id;
                    markerModel.save(newMarker);

                    this.updateSession();
                }
                else {
                    //@todo TEXT
                    GREUtils.Dialog.alert(window,
                                          _('Unified Invoice Error'),
                                          _('Failed to retrieve model; please contact your dealer for technical assistance'));
                }
            }
        },

        voidReceipt: function () {
            var inputObj = this.getVoidUIDialog();
            if (inputObj) {
                var code = inputObj.input0;
                var seq = inputObj.input1
                var model = new UnifiedInvoiceModel();
                var terminal_no = GeckoJS.Session.get('terminal_no');

                if (model) {
                    var voidedTime = new Date().getTime();

                    var uirecord = model.find('first', {
                        conditions: 'code = "' + code + '" AND start_seq <= "' + seq + '" AND end_seq >= "' + seq + '"'
                    });

                    if (uirecord == null) {
                        // no associated order, marker this receipt as voided
                        if (GREUtils.Dialog.confirm(null, _('Void Unified Invoice'), _('Do you really want to void unified invoice [%S]?', [code + seq])) == false) {
                            return;
                        }
                        var voidedInvoice = {
                            order_id: null,
                            code: code,
                            start_seq: seq,
                            end_seq: seq,
                            status: 1,
                            terminal_no: terminal_no,
                            void_time: voidedTime
                        }
                        model.id = null;
                        model.save(voidedInvoice);
                    }
                    else {
                        // void all receipts associated with the order
                        var orderStr = '   ' + _('starting sequence') + ': ' + uirecord.code + uirecord.start_seq + '\n' +
                                       '   ' + _('ending sequence') + ': ' + uirecord.code + uirecord.end_seq + '\n' +
                                       '   ' + _('order submitted') + ': ' + new Date(uirecord.submit_time).toLocaleString() + '\n' +
                                       '   ' + _('taxable amount') + ': ' + uirecord.taxable_amount + '\n' +
                                       '   ' + _('nontaxable amount') + ': ' + uirecord.taxable_amount;

                        if (uirecord.status == 1) {
                            GREUtils.Dialog.alert(window,
                                                  _('Unified Invoice Void Error'),
                                                  _('The following unified invoice has already been voided\n\n%S', [orderStr]));
                            return;
                        }
                        if (GREUtils.Dialog.confirm(null, _('Void Unified Invoice'),
                                                          _('Do you really want to void the following unified invoice?\n\n%S', [orderStr])) == false) {
                            return;
                        }
                        uirecord.status = 1;
                        uirecord.voided_time = voidedTime;
                        model.id = uirecord.id;
                        model.save(uirecord);
                    }
                }
                else {
                    //@todo TEXT
                    GREUtils.Dialog.alert(window,
                                          _('Unified Invoice Error'),
                                          _('Failed to retrieve model; please contact your dealer for technical assistance'));
                }
            }
        },

        beforePrintCheck: function (evt) {
            // check if unified invoice marker has been set before we allow printing to
            // proceed
            // first check if the target device is for us
            var data = evt.data
            var device = GeckoJS.Configure.read('vivipos.fec.settings.unified.invoice.Device');
            if (data.device == device) {

                // next get current unified invoice configuration
                var marker = this.getInvoiceMarker();
                if (marker == null) {
                    GREUtils.Dialog.alert(window,
                                          'Unified Invoice Error',
                                          'No Unified Invoice configuration found; please reset UI code and sequence first');
                    evt.preventDefault();
                    return;
                }
            }
        },

        updateUIRecord: function (evt) {
            var data = evt.data
            var device = GeckoJS.Configure.read('vivipos.fec.settings.unified.invoice.Device');

            this.log(GeckoJS.BaseObject.dump(data.data.order));
            
            if (data.printed && data.device == device) {

                // first, we get current invoice number
                var marker = this.getInvoiceMarker();
                if (marker) {
                    
                    var pageCount = data.data.order.receiptPages;
                    if (isNaN(pageCount)) pageCount = 1;

                    var endSequence = Number(marker.seq) - (-pageCount) - 1;
                    var newSequence = Number(marker.seq) - (-pageCount);
                    this.log(marker.seq + ':' + pageCount + ':' + endSequence + ':' + newSequence);

                    var terminal_no = GeckoJS.Session.get('terminal_no');

                    // insert unified invoices
                    var model = new UnifiedInvoiceModel();
                    var newInvoice = {
                        order_id: data.data.order.id,
                        code: marker.code,
                        start_seq: marker.seq,
                        end_seq: GeckoJS.String.padLeft(endSequence, 8, '0'),
                        status: 0,
                        taxable_amount: '',
                        nontaxable_amount: '',
                        terminal_no: terminal_no,
                        submit_time: data.data.order.modified
                    }
                    model.save(newInvoice);
                    
                    // update unified invoice marker
                    marker.seq = GeckoJS.String.padLeft(newSequence, 8, '0');
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

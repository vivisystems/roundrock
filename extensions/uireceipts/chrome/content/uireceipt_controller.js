(function(){

    /**
     * Controller UIReceipts
     *
     */

    GeckoJS.Controller.extend( {

        name: 'UIReceipts',
        
        _print: null,

        _model: null,

        _ubn: null,

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

            // get handle to Cart controller
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if (cart) {
                cart.addEventListener('newTransaction', this.resetUBN, this);
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
                this._model = new UniformInvoiceMarkerModel();
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

        getUBNDialog: function (data) {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=300';
            var inputObj = {
                input0:data, require0: true, digitOnly0: true, fixedLength0: 8
            };

            // @todo TEXT
            window.openDialog(aURL, _('Reset Uniform Invoice'), features, _('Reset Uniform Invoice'), '',
                                    _('Code'), _('Sequence'), inputObj);

            if (inputObj.ok) {
                return inputObj.input0;
            }else {
                return null;
            }
        },

        getResetUIDialog: function () {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=500,height=300';
            var inputObj = {
                input0:null, require0: true, alphaOnly0: true, fixedLength0: 2,
                input1:null, require1: true, digitOnly1: true, fixedLength1: 8
            };

            // @todo TEXT
            window.openDialog(aURL, _('Reset Uniform Invoice'), features, _('Reset Uniform Invoice'), '',
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
            window.openDialog(aURL, _('Void Uniform Invoice'), features, _('Void Uniform Invoice'), '',
                                    _('Code'), _('Sequence'), inputObj);

            if (inputObj.ok) {
                return inputObj;
            }else {
                return null;
            }
        },

        updateSession: function () {
            // get current uniform invoice number and store it in session
            var marker = this.getInvoiceMarker();
            if (marker)
                GeckoJS.Session.set('uniform_invoice_marker', marker.code + marker.seq);
            else
                GeckoJS.Session.set('uniform_invoice_marker', null);
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
                                          _('Uniform Invoice Error'),
                                          _('Failed to retrieve model; please contact your dealer for technical assistance'));
                }
            }
        },

        voidReceipt: function () {
            var inputObj = this.getVoidUIDialog();
            if (inputObj) {
                var code = inputObj.input0;
                var seq = inputObj.input1
                var model = new UniformInvoiceModel();
                var terminal_no = GeckoJS.Session.get('terminal_no');

                if (model) {
                    var voidedTime = new Date().getTime();

                    var uirecord = model.find('first', {
                        conditions: 'code = "' + code + '" AND start_seq <= "' + seq + '" AND end_seq >= "' + seq + '"'
                    });

                    if (uirecord == null) {
                        // no associated order, marker this receipt as voided
                        if (GREUtils.Dialog.confirm(null, _('Void Uniform Invoice'), _('Do you really want to void uniform invoice [%S]?', [code + seq])) == false) {
                            return;
                        }
                        var voidedInvoice = {
                            order_seq: '',
                            code: code,
                            start_seq: seq,
                            end_seq: seq,
                            status: 1,
                            taxable_amount: '',
                            nontaxable_amount: '',
                            terminal_no: terminal_no,
                            submit_time: '',
                            void_time: voidedTime
                        }
                        model.id = null;
                        model.save(voidedInvoice);

                        //@todo OSD
                        NotifyUtils.info(_('Uniform invoice [%S] voided', [code + seq]));
                    }
                    else {
                        // void all invoices associated with the order
                        var orderStr = '   ' + _('starting sequence') + ': ' + uirecord.code + uirecord.start_seq + '\n' +
                                       '   ' + _('ending sequence') + ': ' + uirecord.code + uirecord.end_seq + '\n' +
                                       '   ' + _('terminal') + ': ' + uirecord.terminal_no + '\n' +
                                       '   ' + _('order sequence') + ': ' + ((uirecord.order_seq.length > 0) ? new Number(uirecord.order_seq).toFixed(0) : '') + '\n' +
                                       '   ' + _('order submitted') + ': ' + ((uirecord.submit_time > 0) ? new Date(uirecord.submit_time).toLocaleString() : '') + '\n' +
                                       '   ' + _('taxable amount') + ': ' + uirecord.taxable_amount + '\n' +
                                       '   ' + _('nontaxable amount') + ': ' + uirecord.taxable_amount;

                        if (uirecord.status == 1) {
                            orderStr += '\n' + '   ' + _('invoice voided') + ': ' + new Date(uirecord.void_time).toLocaleString();
                            GREUtils.Dialog.alert(window,
                                                  _('Uniform Invoice Void Error'),
                                                  _('The following uniform invoice(s) have already been voided\n\n%S', [orderStr]));
                            return;
                        }
                        if (GREUtils.Dialog.confirm(null, _('Void Uniform Invoice'),
                                                          _('Do you really want to void the following uniform invoice(s)?\n\n%S', [orderStr])) == false) {
                            return;
                        }
                        uirecord.status = 1;
                        uirecord.voided_time = voidedTime;
                        model.id = uirecord.id;
                        model.save(uirecord);

                        if (uirecord.start_seq == uirecord.end_seq) {
                            NotifyUtils.info(_('Uniform invoice [%S] voided', [uirecord.code + uirecord.start_seq, uirecord.code + uirecord.end_seq]));
                        }
                        else {
                            NotifyUtils.info(_('Uniform Invoices [%S] through [%S] voided', [uirecord.code + uirecord.start_seq, uirecord.code + uirecord.end_seq]));
                        }
                    }
                }
                else {
                    //@todo TEXT
                    GREUtils.Dialog.alert(window,
                                          _('Uniform Invoice Error'),
                                          _('Failed to retrieve model; please contact your dealer for technical assistance'));
                }
            }
        },

        beforePrintCheck: function (evt) {
            // check if uniform invoice marker has been set before we allow printing to
            // proceed
            // first check if the target device is for us
            var data = evt.data
            var device = GeckoJS.Configure.read('vivipos.fec.settings.uniform.invoice.Device');
            if (data.device == device) {

                // next get current uniform invoice configuration
                var marker = this.getInvoiceMarker();
                if (marker == null) {
                    GREUtils.Dialog.alert(window,
                                          'Uniform Invoice Error',
                                          'No Uniform Invoice configuration found; please reset UI code and sequence first');
                    evt.preventDefault();
                    return;
                }

                // make UBN available to template
                if (data.data != null) {
                    if ('customer' in data.data) {
                        data.data.customer.uniform_business_number = this._ubn;
                    }
                    else
                        data.data.customer = {'uniform_business_number': this._ubn};
                }
            }
        },

        setUBN: function () {
            var keypad = GeckoJS.Controller.getInstanceByName('Keypad');
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            var buf = '';
            var ubn = '';
            if (keypad) {
                buf = keypad.getBuffer();
                keypad.clearBuffer();
            }
            if (buf.length == 8 && !(/[^0-9]/.test(buf))) {
                ubn = buf;
            }
            else {
                ubn = this.getUBNDialog(buf);
            }

            if (ubn != null && ubn.length == 8) {
                this._ubn = ubn;
            }
            if (cart) cart.subtotal();
            GeckoJS.Session.set('uniform_business_number', this._ubn);
        },

        clearUBN: function () {
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            this._ubn = null;
            if (cart) cart.subtotal();

            GeckoJS.Session.set('uniform_business_number', this._ubn);
        },

        resetUBN: function () {
            this._ubn = null;
            GeckoJS.Session.set('uniform_business_number', this._ubn);
        },

        updateUIRecord: function (evt) {
            var data = evt.data
            var device = GeckoJS.Configure.read('vivipos.fec.settings.uniform.invoice.Device');

            if (data.printed && data.device == device) {

                this._ubn = null;
                
                // first, we get current invoice number
                var marker = this.getInvoiceMarker();
                if (marker) {
                    
                    var pageCount = data.data.order.receiptPages;
                    if (isNaN(pageCount)) pageCount = 1;

                    var endSequence = Number(marker.seq) - (-pageCount) - 1;
                    var newSequence = Number(marker.seq) - (-pageCount);

                    var terminal_no = GeckoJS.Session.get('terminal_no');

                    // insert uniform invoices
                    var model = new UniformInvoiceModel();
                    var newInvoice = {
                        order_seq: new Number(data.data.order.seq).toFixed(0),
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
                    
                    // update uniform invoice marker
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
                                          'Uniform Invoice Error',
                                          'No uniform invoice configuration found; please reset UI code and sequence first');
                    return;
                }
            }
        }
  });

})()

( function() {

    include('chrome://viviecr/content/devices/deviceTemplate.js');
    include('chrome://viviecr/content/devices/deviceTemplateUtils.js');
    include('chrome://viviecr/content/reports/template_ext.js');

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: "Journal",
        _dataPath: null,
        _journalPath: null,
        _printTemplate: "",
        _previewTemplate: "",
        _device: null,
        deviceSelected: false,
        isTraining: false,
        isDisabled: false,
        
        initial: function() {
            if (this._dataPath == null) {
                this._dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            }
            this._journalPath = this._dataPath + "/journal/";

            this.isDisabled = GeckoJS.Configure.read('vivipos.fec.settings.internal.disableJournal') || false;
            if (this.isDisabled) this.isTraining = true;

            if (!this.isDisabled) {

                var cart = GeckoJS.Controller.getInstanceByName('Cart');
                cart.addEventListener('afterSubmit', this.submitOrder, this);
                cart.addEventListener('afterVoidSale', this.voidOrder, this);

                this.checkDevices();
            
                cart.addEventListener('beforeFilter', this.cartStatus, this);

                // add Observer for startTrainingMode event.
                var self = this;
                this.observer = GeckoJS.Observer.newInstance( {
                    topics: [ "TrainingMode" ],

                    observe: function( aSubject, aTopic, aData ) {
                        if ( aData == "start" ) {
                            self.isTraining = true;
                        } else if ( aData == "exit" ) {
                            self.isTraining = false;
                            if(self.isDisabled) self.isTraining = true;
                        }
                    }
                } ).register();
                
            }
        },

        checkDevices: function() {
            if(!this.deviceSelected) {
                var doSave = false;
                var doSuspend = false;
                this._device = GeckoJS.Controller.getInstanceByName('Devices');
                var selectedDevices = GeckoJS.BaseObject.unserialize(GeckoJS.Configure.read("vivipos.fec.settings.selectedDevices"));

                if (!selectedDevices) {
                    doSuspend = true;
                }
                else {
                    if(!selectedDevices['journal-print-template']) {
                        selectedDevices['journal-print-template'] = 1;
                        doSave = true;
                    }
                    var receiptDevice = this._device.getEnabledDevices('receipt', selectedDevices['journal-print-template']);
                    if(receiptDevice[0]) {
                        this._printTemplate = receiptDevice[0]['template'];
                    } else {
                        var receiptTemplates = this._device.getTemplates('receipt');
                        if (!receiptTemplates) {
                            doSuspend = true;
                        }
                        else {
                            for (var key in receiptTemplates) {
                                this._printTemplate = key;
                                break;
                            }
                        }
                    }

                    if(selectedDevices['journal-preview-template']) {
                        this._previewTemplate = selectedDevices['journal-preview-template'];
                    } else {
                        var previewTemplates = this._device.getTemplates('preview');
                        if(!previewTemplates) {
                            doSuspend = true;
                        } else {
                            for (var tpl in previewTemplates) {
                                var previewTemplate = tpl;
                                break;
                            }
                            this._previewTemplate = selectedDevices['journal-preview-template'] = previewTemplate;
                            doSave = true;
                        }
                    }
                }

                if(doSave && !doSuspend) {
                    GeckoJS.Configure.remove('vivipos.fec.settings.selectedDevices');
                    GeckoJS.Configure.write('vivipos.fec.settings.selectedDevices', GeckoJS.BaseObject.serialize(selectedDevices));
                }
                if(!doSuspend) {
                    this.deviceSelected = true;
                    return true;
                } else {
                    return false;
                }
            } else {
                return true;
            }
        },

        cartStatus: function(evt) {
            try {
                if(!this.checkDevices()) {

                    var win = this.topmostWindow;
                    if (win.document.documentElement.id == 'viviposMainWindow'
                        && win.document.documentElement.boxObject.screenX < 0)
                        win = null;
                    
                    GREUtils.Dialog.alert(win, _('Journal Error'), _('No electronic journal preview template detected.  Electronic journal entry will not be recorded properly if a preview template is not installed [message #701].'));
                    evt.preventDefault();
                }
            } catch (e) {
                this.log('ERROR', _('Journal Controller cartStatus error [%S]', [GeckoJS.BaseObject.dump(e)]));
            }
        },

        voidOrder: function(evt) {
            if(!this.isTraining) {
                try {
                    var txn = evt;
                    var order_id = txn.data.id;
                    var journal = this.getJournalByOrderId(order_id);

                    journal.void_clerk_displayname = txn.data.void_clerk_displayname;
                    journal.void_time = parseInt(new Date().getTime() / 1000);
                    journal.void_terminal_no = GeckoJS.Session.get('terminal_no');
                    journal.status = txn.data.status;

                    this.saveJournal(journal);
                } catch (e) {
                    this.log('ERROR', _('Journal Controller voidOrder error [%S]', [GeckoJS.BaseObject.dump(e)]));
                }
            }
        },

        submitOrder: function(evt) {
            if(!this.isTraining) {
                try{
                    var txn = evt.data;

                    if (txn.data.status != 1 || !txn.isClosed()) {
                        var journal = {};
                        journal.id = null;
                        journal.branch = txn.data.branch;
                        journal.terminal_no = txn.data.terminal_no;
                        journal.order_id = txn.data.id;
                        journal.status = txn.data.status;
                        journal.invoice_no = txn.data.invoice_no;
                        journal.sequence = txn.data.seq;

                        //determine which directory to plan the files in
                        var orderDate = new Date(txn.data.created * 1000);
                        var year = orderDate.getYear() + 1900;
                        var month = GeckoJS.String.padLeft((orderDate.getMonth() + 1), 2, 0);
                        var date = GeckoJS.String.padLeft(orderDate.getDate(), 2, 0);

                        //produce preview file
                        journal.preview_file = '';
                        var previewContent = this.getSelectedTemplateData(txn, true);
                        if (previewContent != '') {
                            let preview_file = year + '/' + month + '/' + date + '/' + journal.sequence + '.html';
                            let previewFile = new GeckoJS.File(this._journalPath + preview_file, true);
                            if (previewFile) {
                                previewFile.open("wb");
                                previewFile.write(GREUtils.Gzip.deflate(previewContent));
                                previewFile.close();
                                journal.preview_file = preview_file;
                            }
                            else {
                                this.log('ERROR', 'Failed to get handle on preview file [' + this._journalPath + preview_file + ']');
                            }
                        }
                        else {
                            this.log('ERROR', 'No preview content to store');
                        }

                        //produce print file
                        journal.prn_file = '';
                        var prnContent = this.getSelectedTemplateData(txn, false);
                        if (prnContent != '') {
                            let prn_file = year + '/' + month + '/' + date + '/' + journal.sequence + '.prn';
                            let prnFile = new GeckoJS.File(this._journalPath + prn_file, true);
                            if (prnFile) {
                                prnFile.open("wb");
                                prnFile.write(GREUtils.Gzip.deflate(prnContent));
                                prnFile.close();
                                journal.prn_file = prn_file;
                            }
                            else {
                                this.log('ERROR', 'Failed to get handle on print file [' + this._journalPath + prn_file + ']');
                            }
                        }
                        else {
                            this.log('ERROR', 'No receipt content to store');
                        }
                        this.saveJournal(journal);
                    }
                } catch (e) {
                    this.log('ERROR', _('Journal Controller submitOrder error [%S]', [GeckoJS.BaseObject.dump(e)]));
                }
            }
        },

        getJournalByOrderId: function(order_id) {
            var journalModel = new JournalModel();

            return journalModel.findFirst('order_id="' + order_id + '"');
        },

        saveJournal: function(journal) {
            var journalModel = new JournalModel();

            if (!journalModel.saveJournal(journal)) {
                var win = this.topmostWindow;
                if (win.document.documentElement.id == 'viviposMainWindow'
                    && win.document.documentElement.boxObject.screenX < 0)
                    win = null;

                GREUtils.Dialog.openWindow(win,
                _('Journal Error'),
                _('An error was encountered while saving journal entry (error code %S) [message #702].', [journalModel.lastError])
                + '\n\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        }
    },

    getSelectedTemplateData: function(txn, preview) {
        var template = preview ? this._previewTemplate : this._printTemplate;
        var tpl = this._device.getTemplateData(template, false);
        var order = txn.data;
        var result = '';

        // @2009-08-13 irving
        if (!tpl) return result;
            
        var data = {
            txn: txn,
            order: order
        };
        // expand data with storeContact and terminal_no
        if (data) {
            data.customer = GeckoJS.Session.get('current_customer');
            data.store = GeckoJS.Session.get('storeContact');
            if (data.store) data.store.terminal_no = GeckoJS.Session.get('terminal_no');
            var user = this.Acl.getUserPrincipal();
            if (user) {
                data.user = user.username;
                data.display_name = user.description;
            }
        }

        // check if item is linked to this printer and set 'linked' accordingly
        if (data && data.order) {
            if (data.order.items && data.order.items.length > 0) {
                for (var i in data.order.items) {
                    data.order.items[i].linked = true;
                }
            }
            else {
                data.hasLinkedItems = data.order.items.length;
            }
        }

        data.linkgroups = null;
        data.printNoRouting = 1;
        data.routingGroups = null;
        data.autoPrint = 'submit';
        data.duplicate = true;

        var selectedDevices = GeckoJS.BaseObject.unserialize(GeckoJS.Configure.read("vivipos.fec.settings.selectedDevices"));
        var printerChoice = selectedDevices['journal-print-template'];

        var encoding =
        preview ?
        "UTF-8" :
        this._device.getSelectedDevices()['receipt-' + printerChoice + '-encoding'];
            	
        _templateModifiers(TrimPath, encoding);
        result = tpl.process(data);

        return result;
    }
};

	 
    AppController.extend( __controller__ );

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
            main.requestCommand('initial', null, 'Journal');
        });

    }, false);
} )();

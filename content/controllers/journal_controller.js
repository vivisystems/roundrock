( function() {

    include('chrome://viviecr/content/devices/deviceTemplate.js');
    include('chrome://viviecr/content/devices/deviceTemplateUtils.js');
    include('chrome://viviecr/content/reports/template_ext.js');
	 
    var __controller__ = {

        name: "Journal",
        _dataPath: null,
        _journalPath: null,
        _printTemplate: "",
        _previewTemplate: "",
        _device: null,
        
        initial: function() {
            if (this._dataPath == null) {
                this._dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            }
            this._journalPath = this._dataPath + "/journal/";

            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            cart.addEventListener('afterSubmit', this.submitOrder, this);
            cart.addEventListener('afterVoidSale', this.voidOrder, this);

            this._device = GeckoJS.Controller.getInstanceByName('Devices');
            var printerChoice = GeckoJS.Configure.read('vivipos.fec.settings.selectedDevices.journal-print-template');
            if(printerChoice) {
                printerChoice = '1';
                GeckoJS.Configure.write('vivipos.fec.settings.selectedDevices.journal-print-template', printerChoice);
            }
            var previewChoice = GeckoJS.Configure.read('vivipos.fec.settings.selectedDevices.journal-preview-template');
            if(previewChoice) {
                var templates = this._device.getTemplates('preview');
                for(var tmp in templates) {
                    this._previewTemplate = tmp;
                    break;
                }
            }

            var selectedDevices = GeckoJS.BaseObject.unserialize(GeckoJS.Configure.read("vivipos.fec.settings.selectedDevices"));
            if (selectedDevices) {
                this._printTemplate = this._device.getSelectedDevices()['receipt-' + printerChoice + '-template'];               
            }
            
            // add Observer for startTrainingMode event.
            var self = this;
            this.observer = GeckoJS.Observer.newInstance( {
                topics: [ "TrainingMode" ],

                observe: function( aSubject, aTopic, aData ) {
                    if ( aData == "start" ) {
                        self.isTraining = true;
                    } else if ( aData == "exit" ) {
                        self.isTraining = false;
                    }
                }
            } ).register();
        },

        voidOrder: function(evt) {
            if(!this.isTraining) {
                var txn = evt;
                var order_id = txn.data.id;
                var journal = this.getJournalByOrderId(order_id);

                journal.void_clerk_displayname = txn.data.void_clerk_displayname;
                journal.void_time = parseInt(new Date().getTime() / 1000);
                journal.void_terminal_no = GeckoJS.Session.get('terminal_no');
                journal.status = txn.data.status;

                this.saveJournal(journal);
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
                        journal.prn_file = year + '/' + month + '/' + date + '/' + journal.sequence + '.prn';
                        journal.preview_file = year + '/' + month + '/' + date + '/' + journal.sequence + '.html';

                        //produce preview file
                        var previewContent = this.getSelectedTemplateData(txn, true);
                        var previewFile = new GeckoJS.File(this._journalPath + journal.preview_file, true);
                        previewFile.open("wb");
                        previewFile.write(GREUtils.Gzip.deflate(previewContent));
                        previewFile.close();

                        //produce print file
                        var prnContent = this.getSelectedTemplateData(txn, false);
                        //var prnContent = GeckoJS.BaseObject.serialize(txn.data);
                        var prnFile = new GeckoJS.File(this._journalPath + journal.prn_file, true);
                        prnFile.open("wb");
                        prnFile.write(GREUtils.Gzip.deflate(prnContent));
                        prnFile.close();

                        this.saveJournal(journal);
                    }
                } catch (e) {
                    this.log(-('Journal Controller submitOrder error: %', [e]));
                }
            }
        },

        getJournalByOrderId: function(order_id) {
            var journalModel = new JournalModel();

            return journalModel.findFirst('order_id="' + order_id + '"');
        },

        saveJournal: function(journal) {
            var journalModel = new JournalModel();

            try {
                journal = journalModel.save(journal);
            }catch(e) {
                this.log(_('Journal save error: %', [e]));
            }
        },

        getSelectedTemplateData: function(txn, preview) {
            var template = preview ? this._previewTemplate : this._printTemplate;
            var tpl = this._device.getTemplateData(template, false);
            var order = txn.data;

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
                var empty = true;
                var routingGroups = data.routingGroups;

                for (var i in data.order.items) {
                    var item = data.order.items[i];
                    if (data.printAllRouting && (data.duplicate || item.batch == data.order.batchCount)) {
                        item.linked = true;
                        empty = false;
                    }
                    else {
                        item.linked = false;

                        // rules:
                        //
                        // 1. item.link_group does not contain any link groups and device.printNoRouting is true
                        // 2. data.linkgroup intersects item.link_group
                        // 3. item.link_group does not contain any routing groups and device.printNoRouting is true
                        //
                        if (data.printNoRouting) {
                            if (item.link_group == null || item.link_group == '') {
                                item.linked = true;
                            }
                        }

                        if (!item.linked && data.linkgroup != null && data.linkgroup != '' && item.link_group && item.link_group.indexOf(data.linkgroup) > -1) {
                            item.linked = true;
                        }

                        if (!item.linked && data.printNoRouting) {
                            var noRoutingGroups;
                            if (routingGroups == null) {
                                noRoutingGroups = true;
                            }
                            else {
                                var groups = item.link_group.split(',');
                                noRoutingGroups = true;
                                for (i = 0; i < groups.length; i++) {
                                    if (groups[i] in routingGroups) {
                                        noRoutingGroups = false;
                                        break;
                                    }
                                }
                            }

                            if (noRoutingGroups) {
                                item.linked = true;
                            }
                        }

                        item.linked = item.linked && (data.duplicate || item.batch == data.order.batchCount);
                        if (item.linked) empty = false;
                    }
                }

                data.hasLinkedItems = !empty;
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
            var result = tpl.process(data);
            return result;
        }
    };

	 
    GeckoJS.Controller.extend( __controller__ );

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'Journal');
                                      });

    }, false);
} )();

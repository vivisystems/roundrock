(function(){

    include('chrome://viviecr/content/devices/deviceTemplate.js');
    include('chrome://viviecr/content/devices/deviceTemplateUtils.js');
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/template_ext.js');
    include('chrome://viviecr/content/models/journal.js');

    var __controller__ = {

        name: 'ViewJournal',

        template: 'journal_template',
        _dataPath: null,
        _journalPath: null,
        _journalId: null,
        _orderData: null,

        _queryStringPreprocessor: function( s ) {
            var re = /\'/g;
            return s.replace( re, '\'\'' );
        },

        load: function(inputObj) {
            if (this._dataPath == null) {
                this._dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            }
            this._journalPath = this._dataPath + "/journal/";

            // load matching order(s)
            try {
                var journalModel = new JournalModel();
                var journal = journalModel.findById(inputObj.value, 2);

                if (journal) {
                    this.displayJournal(journal);
                }
            }catch(e) {
                this.log('ViewJournal load error:  ' + e);
            }
        },

        displayJournal: function (journal) {
            try {
                if (!journal) return;
                var dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
                var journalPath = dataPath + "/journal/";
                var previewFile = new GeckoJS.File(journalPath + journal.preview_file);
                previewFile.open("rb");
                var content = GREUtils.Gzip.inflate(previewFile.read());

                // get browser content body
                var bw = document.getElementById('preview_frame');
                var doc = bw.contentWindow.document.getElementById( 'abody' );
                var print = document.getElementById('print');

                // load template
                var path = GREUtils.File.chromeToPath('chrome://viviecr/content/tpl/' + this.template + '.tpl');
                var file = GREUtils.File.getFile(path);
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

                var data = {};
                data.journal = journal;
                data.sequence = journal.sequence;
                data.content = content;

                this._journalData = data;
                this._journalId = journal.id;
                var result = tpl.process(data);

                if (doc) {
                    doc.innerHTML = result;

                    print.setAttribute('disabled', false);
                }

                
            } catch (e) {
                alert('ViewJournal displayJournal error:  ' + e);
            }
        },

        printJournal: function() {
            try {
                var id = this._journalId;

                if (!id) return;

                var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                                                        .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
                var printController = mainWindow.GeckoJS.Controller.getInstanceByName('Print');

                var journalModel = new JournalModel();
                var journal = journalModel.findById(this._journalId, 2);

                if (journal) {
                    var prnFile = new GeckoJS.File(this._journalPath + journal.prn_file);
                    prnFile.open("rb");
                    var orderData = GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(prnFile.read()));
                    prnFile.close();
                }

                var data = {
                    order: orderData
                }

                var deviceController = mainWindow.GeckoJS.Controller.getInstanceByName('Devices');
                var selectedDevices = GeckoJS.BaseObject.unserialize(GeckoJS.Configure.read("vivipos.fec.settings.selectedDevices"));
                var printerChoice = selectedDevices['journal-print-template'];

                var template = deviceController.getSelectedDevices()['receipt-' + printerChoice + '-template'];
                var encoding = deviceController.getSelectedDevices()['receipt-' + printerChoice + '-encoding'];
                var port = deviceController.getSelectedDevices()['receipt-' + printerChoice + '-port'];
                var portspeed = deviceController.getSelectedDevices()['receipt-' + printerChoice + '-portspeed'];
                var handshaking = deviceController.getSelectedDevices()['receipt-' + printerChoice + '-handshaking'];;
                var devicemodel = deviceController.getSelectedDevices()['receipt-' + printerChoice + '-devicemodel'];;
                var devicenumber = printerChoice;
                var copies = 1;

                _templateModifiers(TrimPath, encoding);

                data.linkgroups = null;
                data.printNoRouting = 1;
                data.routingGroups = null;
                data.autoPrint = true;
                data.duplicate = true;

                printController.printSlip('receipt', data, template, port, portspeed, handshaking, devicemodel, encoding, devicenumber, copies);
            }catch(e) {
                this.dump(e);
            }
        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', 'Database error: ' + errstr + ' [' +  errno + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                                  _('Data Operation Error'),
                                  errmsg + '\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        },

    };

    GeckoJS.Controller.extend(__controller__);

})();

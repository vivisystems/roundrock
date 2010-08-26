(function(){

    include('chrome://viviecr/content/devices/deviceTemplate.js');
    include('chrome://viviecr/content/devices/deviceTemplateUtils.js');
    include('chrome://viviecr/content/reports/template.js');
    include('chrome://viviecr/content/reports/template_ext.js');
    include('chrome://viviecr/content/controllers/components/order_status.js');

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'ViewJournal',

        template: 'journal_template',

        components: ['OrderStatus'],

        _dataPath: null,
        _journalPath: null,
        _journalId: null,
        _orderData: null,

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
                    let result = this.displayJournal(journal);
                    if (result != '') {
                        GREUtils.Dialog.alert(inputObj.window,
                                              _('Journal Display Error'),
                                              result);
                        window.close();
                    }
                }
            }catch(e) {
                // this branch should not be reachable...
                this.log('ERROR', 'ViewJournal load error:  ' + e);
            }
        },

        displayJournal: function (journal) {
            try {
                if (!journal) return '';

                var dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
                var journalPath = dataPath + "/journal/";
                if (journal.preview_file != '') {
                    var previewFile = new GeckoJS.File(journalPath + journal.preview_file);
                    if (previewFile.exists()) {
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
                        data.journal.status_str = this.OrderStatus.statusToString(journal.status);
                        data.sequence = journal.sequence;
                        data.content = content;

                        this._journalData = data;
                        this._journalId = journal.id;
                        var result = tpl.process(data);

                        if (doc) {
                            doc.innerHTML = result;

                            print.setAttribute('disabled', false);
                        }
                    }
                    else {
                        return _('The selected journal entry cannot be displayed because the preview file no longer exists [message #1807].');
                    }
                }
                else {
                    return _('The selected journal entry cannot be displayed because the original transaction did not generate any preview file [message #1806].');
                }
                
            } catch (e) {
                this.log('ERROR', 'displayJournal error:  ' + e);

                return _('An error was encountered while attempting to display journal. Please restart the machine, and if the problem persists, please contact technical support immediately [message #1801].');
            }
            return '';
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
                    if (journal.prn_file != '') {
                        var prnFile = new GeckoJS.File(this._journalPath + journal.prn_file);
                        if (prnFile.exists()) {
                            prnFile.open("rb");
                            var template = GREUtils.Gzip.inflate(prnFile.read());
                            var re = new RegExp('\\[\\&' + 'PC' + '\\]', 'g');
                            template = template.replace(re,'');
                            prnFile.close();
                        }
                        else {
                            GREUtils.Dialog.alert(this.topmostWindow,
                                                  _('Journal Display Error'),
                                                  _('The selected journal entry cannot be printed because the receipt file no longer exists [message #1803].'));
                            return;
                        }
                    }
                    else {
                        GREUtils.Dialog.alert(this.topmostWindow,
                                              _('Journal Display Error'),
                                              _('The selected journal entry cannot be printed because the original transaction did not generate any receipt [message #1804].'));
                        return;
                    }
                }
                else {
                    GREUtils.Dialog.alert(this.topmostWindow,
                                          _('Journal Display Error'),
                                          _('The selected journal entry cannot be retrieved from the database. Please restart the machine, and if the problem persists, please contact technical support immediately [message #1805].'));
                    return;
                }

                var deviceController = mainWindow.GeckoJS.Controller.getInstanceByName('Devices');
                var selectedDevices = GeckoJS.BaseObject.unserialize(GeckoJS.Configure.read("vivipos.fec.settings.selectedDevices"));
                var printerChoice = selectedDevices['journal-print-template'];

                var encoding = deviceController.getSelectedDevices()['receipt-' + printerChoice + '-encoding'];
                var port = deviceController.getSelectedDevices()['receipt-' + printerChoice + '-port'];
                var portspeed = deviceController.getSelectedDevices()['receipt-' + printerChoice + '-portspeed'];
                var handshaking = deviceController.getSelectedDevices()['receipt-' + printerChoice + '-handshaking'];
                var devicemodel = deviceController.getSelectedDevices()['receipt-' + printerChoice + '-devicemodel'];
                var devicenumber = printerChoice;
                var copies = 1;

                _templateModifiers(TrimPath, encoding);
                printController.printSlip('report', null, template, port, portspeed, handshaking, devicemodel, encoding, devicenumber, copies);
            }catch(e) {
                this.log('ERROR', 'printJournal error:  ' + e);

                GREUtils.Dialog.alert(this.topmostWindow,
                                      _('Journal Display Error'),
                                      _('An error was encountered while attempting to print journal. Please restart the machine, and if the problem persists, please contact technical support immediately [message #1802].'));
            }
        }

    };

    AppController.extend(__controller__);

})();

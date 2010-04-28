( function() {
    /**
     * Journal Report Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );
    include( 'chrome://viviecr/content/models/journal.js' );
    include( 'chrome://viviecr/content/devices/deviceTemplate.js' );
    include( 'chrome://viviecr/content/devices/deviceTemplateUtils.js' );
    include( 'chrome://viviecr/content/reports/template.js' );
    include( 'chrome://viviecr/content/reports/template_ext.js' );

    var __controller__ = {

        name: 'JournalReportController',
        
        _fileName: "journal_report",
        _exporting_file_folder: "journal",
        _exportRecords: [],
        _dataPath: null,
        _journalPath: null,

        _set_reportRecords: function( limit ) {
            try {
                limit = parseInt( limit );
                if ( isNaN( limit ) || limit <= 0 ) limit = this._stdLimit;

                var start = document.getElementById('start_date').value;
                var end = document.getElementById('end_date').value;

                var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
                var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

                start = parseInt(start / 1000, 10);
                end = parseInt(end / 1000, 10);

                var fields = [
                'journal.id',
                'journal.sequence',
                'journal.invoice_no',
                'journal.created',
                'journal.branch',
                'journal.terminal_no',
                'journal.void_clerk_displayname',
                'journal.void_time',
                'journal.status',
                'journal.preview_file'
                ];

                var conditions = "journal.created >='" + start + "' AND journal.created <='" + end + "'";

                var orderby = 'journal.created';

                var journal = new JournalModel();

                var records = journal.find( 'all', {
                    fields: fields,
                    conditions: conditions,
                    order: orderby,
                    recursive: -1,
                    limit: limit
                } );

                records.forEach( function( record ) {
                    delete record.Journal;

                    record.status = this.statusToString(record.status);
                }, this);

                this._reportRecords.head.title = _( 'Journal Report' );
                this._reportRecords.head.start_time = start_str;
                this._reportRecords.head.end_time = end_str;
                this._reportRecords.head.terminal_no = '';

                this._reportRecords.body = records;

                this._reportRecords.foot.foot_datas = {};
            } catch (e) {
            }
        },
        
        execute: function() {
            this._super();

            this.registerOpenJournalDialog();
        },

        registerOpenJournalDialog: function() {
            var div = document.getElementById( this._preview_frame_id ).contentWindow.document.getElementById( this._div_id );

            var self = this;
            if ( div ) {
                div.addEventListener( 'click', function( event ) {
                    if ( event.originalTarget.parentNode.id && event.originalTarget.parentNode.tagName == 'TR' )
                        self.openJournalDialogByKey(self.window, 'id', event.originalTarget.parentNode.id );
                }, true );
            }
        },

        openJournalDialogByKey: function( win, key, value ) {
            var aURL = 'chrome://viviecr/content/view_journal.xul';
            var aName = _( 'Journal Details' );
            var aArguments = {
                index: key,
                value: value,
                window: win
            };
            var posX = 0;
            var posY = 0;
            var width = GeckoJS.Session.get( 'screenwidth' );
            var height = GeckoJS.Session.get( 'screenheight' );
            win.openDialog(
                aURL,
                aName,
                "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height,
                aArguments
            );
        },
        
        load: function() {
            this._super();
        },

        exportFile: function() {
            try {
                this._dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
                this._journalPath = this._dataPath + "/journal/";

                var media_path = this.CheckMedia.checkMedia( this._exporting_file_folder );
                if ( !media_path ) {
                    NotifyUtils.info( _( 'Media not found!! Please attach a USB thumb drive...' ) );
                    return;
                }

                var self = this;

                this._enableButton( false );
                var media_path = this.CheckMedia.checkMedia( this._exporting_file_folder );
                if ( !media_path ) {
                    NotifyUtils.info( _( 'Media not found!! Please attach a USB thumb drive...' ) );
                    return;
                }

                var waitPanel = this._showWaitingPanel();
                var progress = document.getElementById( this._progress_bar_id );
                var caption = document.getElementById( this.getCaptionId() );

                var start = document.getElementById('start_date').value;
                var end = document.getElementById('end_date').value;

                start = parseInt(start / 1000, 10);
                end = parseInt(end / 1000, 10);

                var fields = [
                'journal.id',
                'journal.preview_file'
                ];

                var conditions = "journal.created >='" + start + "' AND journal.created <='" + end + "'";

                var orderby = 'journal.created';

                var journal = new JournalModel();

                var records = journal.find( 'all', {
                    fields: fields,
                    conditions: conditions,
                    order: orderby,
                    recursive: -1
                } );

                var cur = 1;

                records.forEach( function( record ) {
                    delete record.Journal;
                    var previewFileName = self._journalPath + record.preview_file;
                    var previewFile = new GeckoJS.File(previewFileName);
                    previewFile.open("rb");
                    var previewContent = GREUtils.Gzip.inflate(previewFile.read());
                    previewFile.close();

                    var targetFileName = media_path + '/' + record.preview_file;
                    var targetFile = new GeckoJS.File(targetFileName, true);
                    targetFile.open("w");
                    var previewHeader = '<html><head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title>head.title</title><LINK rel="stylesheet" type="text/css" href="../reports/style/rpt_receipt.css" /></head><body id="abody" class="report">';
                    var previewFooter = '</body></html>';
                    previewContent = previewHeader + previewContent + previewFooter;
                    var result = targetFile.write(previewContent);
                    targetFile.close();

                    if(result == 0) {
                        GREUtils.Dialog.alert( this.topmostWindow, 
                                               _('Journal Export'),
                                               _( "An error was encountered while saving the journal export. Please ensure that space is available on the external USB thumb drive [message #2001]." ) );
                    }
                    self.sleep( 10 );
                    if( caption ) {
                        if( caption.label.match( /\(.*\)/ ) ) {
                            caption.label = caption.label.replace( /\(.*\)/, '('+cur+'/'+records.length+')' );
                        }else {
                            caption.label += ' (' + cur +'/'+records.length +')';
                        }
                    }
                    progress.value = parseInt( cur / records.length * 100 );
                    cur++;
                }, this);

                if ( waitPanel != undefined )
                    self._dismissWaitingPanel();
            } catch ( e ) {
                this.log(e);
            }
        },

        multiPrint: function() {
            try {
                this._dataPath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
                this._journalPath = this._dataPath + "/journal/";

                var self = this;

                var waitPanel = this._showWaitingPanel();
                var progress = document.getElementById( this._progress_bar_id );
                var caption = document.getElementById( this.getCaptionId() );

                var start = document.getElementById('start_date').value;
                var end = document.getElementById('end_date').value;

                start = parseInt(start / 1000, 10);
                end = parseInt(end / 1000, 10);

                var fields = [
                'journal.id',
                'journal.prn_file'
                ];

                var conditions = "journal.created >='" + start + "' AND journal.created <='" + end + "'";

                var orderby = 'journal.created';

                var journal = new JournalModel();

                var records = journal.find( 'all', {
                    fields: fields,
                    conditions: conditions,
                    order: orderby,
                    recursive: -1
                } );

                var mass_template = '';
                var count = 1;
                var partialCut = new RegExp('\\[\\&' + 'PC' + '\\]', 'g');
                var fullCut = new RegExp('\\[\\&' + 'FC' + '\\]', 'g');
                var total = records.length;


                records.forEach( function( record ) {
                    var prnFile = new GeckoJS.File(self._journalPath + record.prn_file);
                    prnFile.open("rb");
                    var template = GREUtils.Gzip.inflate(prnFile.read());
                    if (count < total) {
                        template = template.replace(partialCut,'');
                        template = template.replace(fullCut, '');
                    }
                    mass_template = mass_template + template;
                    prnFile.close();
                    count++;
                }, this);
                
                var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
                var printController = mainWindow.GeckoJS.Controller.getInstanceByName('Print');

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
                printController.printSlip('report', null, mass_template, port, portspeed, handshaking, devicemodel, encoding, devicenumber, copies);

                if ( waitPanel != undefined )
                    self._dismissWaitingPanel();
            } catch ( e ) {
                this.log(e);
            }
        }
    };

    RptBaseController.extend( __controller__ );
} )();

( function() {
    /**
     * Report Base Controller
     * This class is used to maintain the utility methods taken advantage by each report controller.
     */
    var __controller__ = {
        name: 'RptBase',
        components: [ 'BrowserPrint', 'CsvExport', 'CheckMedia', 'OrderStatus' ],
        packageName: 'viviecr',
        _recordOffset: 0, // this attribute indicates the number of rows going to be ignored from the beginning of retrieved data rows.
        _recordLimit: 100, // this attribute indicates upper bount of the number of rwos we are going to take.
        _csvLimit: 3000000,
        _stdLimit: 3000,
        _innerHtmlLimit: 2097152,
        _scrollRange: null,
        _scrollRangePreference: "vivipos.fec.settings.scrollRange",
        
        //for the use of manipulating the waiting panel.
        _wait_panel_id: "wait_panel",
        _waiting_caption_id: "waiting_caption",
        _progress_box_id: "progress_box",
        _progress_bar_id: "progress",
        
        _preview_frame_id: "preview_frame",
        _abody_id: "abody",
        _div_id: "docbody",
        _body_table: "body-table",
        
        _tmpFileDir: "/var/tmp/",
        
        _exporting_file_folder: "report_export",
        _fileExportingFlag: false, // true if the exporting task is done, false otherwise.
        
        _mainScreenWidth: 800,
        _mainScreenHeight: 600,
        
        // _data is a reserved word. Don't use it in anywhere of our own controllers.
        _reportRecords: { // data for template to use.
            head: {
                title: '',
                store: null,
                clerk_displayname: ''
            },
            body: {},
            foot: {
                gen_time: ( new Date() ).toString( 'yyyy/MM/dd HH:mm:ss' )
            }
        },
        
        _fileName: '', // for use of template file.
        _exportedFileName: '', // appellation for the exported files.
        _decimals: GeckoJS.Configure.read('vivipos.fec.settings.DecimalPoint') || '.',
        _thousands: GeckoJS.Configure.read('vivipos.fec.settings.ThousandsDelimiter') || ',',
        _precision: GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0,
        
        formatPrice: function(price, showZero) {
            if (parseFloat(price) == 0 && !showZero) {
                return '';
            }

            var options = {
                decimals: this._decimals,
                thousands: this._thousands,
                places: ((this._precision>0)?this._precision:0)
            };
            // format display precision
            return GeckoJS.NumberHelper.format(price, options);
        },

        getCaptionId: function() {
            return this._waiting_caption_id;
        },

        _showWaitingPanel: function( sleepTime, hideProgressbar ) {
            var waitPanel = document.getElementById( this._wait_panel_id );
            
            // set the content of the label attribute be default string, taking advantage of the statusText attribute.
            var caption = document.getElementById( this.getCaptionId() );
            caption.label = caption.statusText;

            var progressBox = document.getElementById( this._progress_box_id );
            var progressBar = document.createElementNS( "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:progressmeter" );
            progressBar.setAttribute( 'value', '0' );
            progressBar.setAttribute( 'mode', 'determined' );
            progressBar.setAttribute( 'id', this._progress_bar_id );
            progressBox.appendChild( progressBar );

            progressBox.hidden = hideProgressbar;

            waitPanel.openPopupAtScreen( 0, 0 );

            // release CPU for progressbar to show up.
            if ( !sleepTime ) {
                sleepTime = 100;
            }
            this.sleep( sleepTime );

            return waitPanel;
        },
        
        _dismissWaitingPanel: function() {
            var progressBox = document.getElementById( this._progress_box_id );
            progressBox.removeChild( progressBox.firstChild );
        	
            var waitPanel = document.getElementById( this._wait_panel_id );
            waitPanel.hidePopup();
        },

        _enableButton: function( enable ) {
            var disabled = !enable;
            $( '#export_pdf' ).attr( 'disabled', disabled );
            $( '#export_csv' ).attr( 'disabled', disabled );
            $( '#export_rcp' ).attr( 'disabled', disabled );
            $( '#print' ).attr( 'disabled', disabled );

            $( '#btnScrollTop' ).attr( 'disabled', disabled );
            $( '#btnScrollUp' ).attr( 'disabled', disabled );
            $( '#btnScrollDown' ).attr( 'disabled', disabled );
            $( '#btnScrollBottom' ).attr( 'disabled', disabled );
            $( '#btnScrollLeft' ).attr( 'disabled', disabled );
            $( '#btnScrollRight' ).attr( 'disabled', disabled );
            $( '#btnScrollLeftMost' ).attr( 'disabled', disabled );
            $( '#btnScrollRightMost' ).attr( 'disabled', disabled );

            this._resizeScrollButtons();
        },

        _resizeScrollButtons: function() {
                var bw = document.getElementById( this._preview_frame_id );
                if ( !bw ) return ;

                var doc = bw.contentWindow.document.getElementById( this._abody_id );
                if ( !doc ) return ;

                if ( doc.scrollWidth > doc.clientWidth ) {
                    $( '#scrollBtnHBox' ).attr( 'hidden', false );
                } else {
                    $( '#scrollBtnHBox' ).attr( 'hidden', true );
                }

                if ( doc.scrollHeight > doc.clientHeight ) {
                    $( '#scrollBtnVBox' ).attr( 'hidden', false );
                } else {
                    $( '#scrollBtnVBox' ).attr( 'hidden', true );
                }
        },
        
        _setTemplateDataHead: function() {
            this._reportRecords.head.store = GeckoJS.Session.get( 'storeContact' );
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null )
                this._reportRecords.head.clerk_displayname = user.description;
        },
        
        _setTemplateDataFoot: function() {
            this._reportRecords.foot.gen_time = ( new Date() ).toString( 'yyyy/MM/dd HH:mm:ss' );
        },

        _set_reportRecords: function( limit ) {
        },

        _set_queryForm: function(){

            var queryForm = GeckoJS.FormHelper.serializeToObject('queryform') ;

            if(GeckoJS.BaseObject.getKeys(queryForm).length == 0)
                queryForm = GeckoJS.FormHelper.serializeToObject('settings');
            
            var queryFormLabel = {};

            for (var fieldName in queryForm ) {
                // check field name is label ?
                if (fieldName.match(/_label$/)) {
                    queryFormLabel[fieldName] = queryForm[fieldName];
                }else {

                    let fieldValueLabel = queryForm[fieldName];
                    try {
                        let inputObj = document.getElementById(fieldName);
                        if (inputObj) {
                            let tagName = inputObj.tagName.toLowerCase();

                           switch(tagName) {
                               case 'menulist':
                               case 'radiogroup':
                                   let selItem = inputObj.selectedItem;
                                   fieldValueLabel = $(selItem).attr('label') || $(selItem).attr('value');
                               break;

                               case 'checkbox':
                                   fieldValueLabel = $(inputObj).attr('label') || $(inputObj).attr('value');
                               break;

                               default:
                                   break;
                           }
                        }

                    }finally {
                        queryFormLabel[fieldName] = fieldValueLabel;
                    }
                }
            }

            this._reportRecords.queryForm = queryForm;
            this._reportRecords.queryFormLabel = queryFormLabel;
            /*@debug condition table*/
            //this.log(this.dump(queryFormLabel));
        },
        
        _exploit_reportRecords: function() {

            this._innerHtmlLimit = parseInt( GeckoJS.Configure.read( "vivipos.fec.settings.reports.innerHtmlLimit" ) || this._innerHtmlLimit );

            try {
                var path = GREUtils.File.chromeToPath( 'chrome://' + this.packageName + '/content/reports/tpl/' + this._fileName + '/' + this._fileName + '.tpl' );
                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
                var result = tpl.process( this._reportRecords );

                var bw = document.getElementById( this._preview_frame_id );
                var doc = bw.contentWindow.document.getElementById( this._abody_id );

                var confirmed = true;

                if (result.length >= this._innerHtmlLimit) {

                    confirmed = GREUtils.Dialog.confirm( this.topmostWindow, '', 
                            _("The file size of the report you are going to generate is greater then %S. It takes a few minutes to complete the report. The screen will be hanging there and no operations allowed. Are you sure? Click OK to proceed. Click Cancel and return to previous page to narrow down your search.",
                            [GeckoJS.NumberHelper.toReadableSize(this._innerHtmlLimit)])
                        );

                }

                if (confirmed) {
                    doc.innerHTML = result;
                }else {
                    doc.innerHTML = "";
                }

                // adjust the size of paper if the content will protrude the border of the paper.
                var bwDocument = bw.contentWindow.document;
                var bodydiv = bwDocument.getElementById( this._div_id );
                var tables = bodydiv.getElementsByTagName( "table" );
                for ( var i = 0; i < tables.length; i++ ) {
                    var table = tables[ i ];
                    if ( table.id == this._body_table && bodydiv.scrollWidth < table.scrollWidth + 40 )
                        bodydiv.style.width = table.scrollWidth + 40;
                }
                return confirmed;
                
            } catch( e ) {}

        },
	    
        previousPage: function() {
            var offset = this._recordOffset - this._recordLimit;
            if ( offset >= 0 ) {
                this._recordOffset = offset;
                this.execute();
            }
        },
	    
        nextPage: function() {
            this._recordOffset += this._recordLimit;
            this.execute();
        },

        statusToString: function(status) {
            return this.OrderStatus.statusToString(status);
        },

        execute: function() {

            this._stdLimit = parseInt( GeckoJS.Configure.read( "vivipos.fec.settings.reports.stdLimit" ) || this._stdLimit );
            var reportResult = false;
            
            try {
                // Doing so to prevent the timeout dialog from prompting during the execution.
                
                this._enableButton( false );

                var waitPanel = this._showWaitingPanel(100, true);
                this._setTemplateDataHead();
                this._set_reportRecords();
                this._set_queryForm();
                this._setTemplateDataFoot();
                reportResult = this._exploit_reportRecords();
            } catch ( e ) {
                this.log( 'ERROR', GeckoJS.BaseObject.dump( e ) );
            } finally {

                if (reportResult) {
                    var splitter = document.getElementById( 'splitter_zoom' );
                    splitter.setAttribute( 'state', 'collapsed' );
                }
                this._enableButton( true );
		        
                if ( waitPanel != undefined )
                    this._dismissWaitingPanel();
            }
        },
        
        /**
		 * @param paperProperties is a object consisted of the width, height, edges, margins of the paper.
		 */
        exportPdf: function( paperProperties ) {
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, '', _( 'Are you sure you want to export PDF copy of this report?' ) ) )
                return;

            var bodydiv = document.getElementById( this._preview_frame_id ).contentWindow.document.getElementById( this._div_id );
            var clientHeight = parseInt( bodydiv.clientHeight );
            var maxClientHeight = parseInt( GeckoJS.Configure.read( "vivipos.fec.settings.maxExportPdfHeight" ) || 30000 );

            if ( clientHeight > maxClientHeight ) {
                GREUtils.Dialog.alert( this.topmostWindow, '', _( 'The document is too large to be exported in .PDF format, please export as .CSV file instead!' ) );
                return;
            }

            var cb = null;

            try {
                this._enableButton( false );
                var media_path = this.CheckMedia.checkMedia( this._exporting_file_folder );
                if ( !media_path ) {
                    NotifyUtils.info( _( 'Media not found!! Please attach a USB thumb drive...' ) );
                    this._enableButton( true );
                    return;
                }

                var waitPanel = this._showWaitingPanel();

                var progress = document.getElementById( this._progress_bar_id );
                var caption = document.getElementById( this.getCaptionId() );
				
                var fileName = this._exportedFileName + ( new Date() ).toString( 'yyyyMMddHHmm' ) + '.pdf';
                var targetDir = media_path;
                var tmpFile = this._tmpFileDir + fileName;
                var self = this;

                cb = function() {
                    // enable buttons
                    self._enableButton( true );
                    // hide panel
                    if ( waitPanel != undefined )
                        self._dismissWaitingPanel();
                };

                this.BrowserPrint.printToPdf( tmpFile, paperProperties, this._preview_frame_id, caption, progress,
                    function() {
                        // printing finished callback,
                        self._copyExportFileFromTmp( tmpFile, targetDir, 180, cb );
                    }
                );
            } catch ( e ) {
                //dump( e );
                this._copyExportFileFromTmp( "/tmp/__notexists__", "/tmp", 0.1,  cb ); // to close the waiting panel.
            }
        },

        exportCsv: function( controller, noReload ) {
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, '', _( 'Are you sure you want to export CSV copy of this report?' ) ) )
                return;
            
            var cb = null;

            this._csvLimit = parseInt( GeckoJS.Configure.read( "vivipos.fec.settings.reports.csvLimit" ) || this._csvLimit );
            
            try {
                this._enableButton( false );
                var media_path = this.CheckMedia.checkMedia( this._exporting_file_folder );
                if ( !media_path ) {
                    NotifyUtils.info( _( 'Media not found!! Please attach a USB thumb drive...' ) );
                    this._enableButton( true );
                    return;
                }

                var waitPanel = this._showWaitingPanel();
                
                var caption = document.getElementById( this.getCaptionId() );
                var progress = document.getElementById( this._progress_bar_id );
                
                var path = GREUtils.File.chromeToPath( 'chrome://' + this.packageName + '/content/reports/tpl/' + this._fileName + '/' + this._fileName + '_csv.tpl' );

                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );

                var tmpRecords = {};
                if ( !noReload ) {
                    tmpRecords.head = GREUtils.extend( {}, this._reportRecords.head );
                    tmpRecords.body = this._reportRecords.body;
                    tmpRecords.foot = GREUtils.extend( {}, this._reportRecords.foot );

                    controller._set_reportRecords( this._csvLimit );
                    this._reportRecords.foot.gen_time = ( new Date() ).toString( 'yyyy/MM/dd HH:mm:ss' );
                }

                var fileName = this._exportedFileName + ( new Date() ).toString( 'yyyyMMddHHmm' ) + '.csv';
                var targetDir = media_path;
                var tmpFile = this._tmpFileDir + fileName;
                
                var self = this;

                cb = function() {
                    if ( !noReload ) {
                        // drop CSV data and garbage collect
                        self._reportRecords = tmpRecords;
                        GREUtils.gc();
                    }
                    // enable buttons
                    self._enableButton( true );
                    // hide panel
                    if ( waitPanel != undefined ) {
                        self._dismissWaitingPanel();
                    }
                };

                this.CsvExport.printToFile( tmpFile, this._reportRecords, tpl, caption, progress );

                this._copyExportFileFromTmp( tmpFile, targetDir, 180,  cb );
            } catch ( e ) {
                this._copyExportFileFromTmp( "/tmp/__notexists__", "/tmp", 0.1,  cb ); // to close the waiting panel.
            }
        },

        exportRcp: function() {
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, '', _( 'Are you sure you want to print this report?' ) ) )
                return;
        		
            try {
                // Doing so to prevent the timeout dialog from prompting during the execution.

                this._enableButton( false );
                var waitPanel = this._showWaitingPanel( 100 );
                
                var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                    .getService( Components.interfaces.nsIWindowMediator ).getMostRecentWindow( 'Vivipos:Main' );
                var rcp = mainWindow.GeckoJS.Controller.getInstanceByName( 'Print' );
   				
                var paperSize = rcp.getReportPaperWidth( 'report' ) || '80mm';
                var path = GREUtils.File.chromeToPath( 'chrome://' + this.packageName + '/content/reports/tpl/' + this._fileName + '/' + this._fileName + '_rcp_' + paperSize + '.tpl' );

                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
                
                rcp.printReport( 'report', tpl, this._reportRecords );
            } catch ( e ) {
                dump( e );
            } finally {
                
                this._enableButton( true );
                
                if ( waitPanel != undefined )
                    this._dismissWaitingPanel();
            }
        },
        
        print: function( paperProperties ) {
            try {
                this._enableButton( false );

                var waitPanel = this._showWaitingPanel();

                var progress = document.getElementById( this._progress_bar_id );
                var caption = document.getElementById( this.getCaptionId() );

                //document.getElementById( 'preview_frame' ).contentWindow.print();
                //this.BrowserPrint.showPageSetup();
                this.BrowserPrint.showPrintDialog( paperProperties, this._preview_frame_id, caption, progress );
            } catch ( e ) {
                dump( e );
            } finally {
                
                this._enableButton( true );
                
                // hide panel
                if ( waitPanel != undefined )
                    this._dismissWaitingPanel();
            }
        },
        
        /**
         * @param fields is an array consisted of strings indicating the fields going to be added to popup menu.
         * @param conditions is a string, the conditions to constrain the DB retrieval. Pass a null string if none of it.
         * @param order is an string indicating the fields by which the retrieved records are going to be ordered.
         * @param group is an string indicating the fields by which the records will be grouped.
         * @param menupopupId is a string standing for the id of the menupopup element.
         * @param valueField is a string meaning the DB field to be the value attribute of the xul menuitem element.
         * @param labelField is a string meaning the DB field to be the label attribute of the xul menuitem element.
         *
         * The propose of this private method is to add some menuitems into a certain xul menupopup element.
         */
        _addMenuitem: function( dbModel, fields, conditions, order, group, menupopupId, valueField, labelField ) {
            //set up the designated pop-up menulist.
            var records = dbModel.find( 'all', {
                fields: fields,
                conditions: conditions,
                order: order,
                group: group
            } );
            var menupopup = document.getElementById( menupopupId );
            
            records.forEach( function( data ) {
                var menuitem = document.createElementNS( "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem" );
                menuitem.setAttribute( 'value', data[ valueField ] );
                menuitem.setAttribute( 'label', data[ labelField ] );
                menupopup.appendChild( menuitem );
            } );
        },
	    
        _queryStringPreprocessor: function( s ) {
            var re = /\'/g;
            return (s == null || s.length == 0) ? '' : s.replace( re, '\'\'' );
        },
	    
        _openOrderDialogByID: function( id ) {
            var aURL = 'chrome://viviecr/content/view_order.xul';
            var aName = _( 'Order Details' );
            var aArguments = {
                orders: [ {
                    id: id
                } ],
                position: 0
            };
            var posX = 0;
            var posY = 0;
            var width = GeckoJS.Session.get( 'screenwidth' );
            var height = GeckoJS.Session.get( 'screenheight' );
	        
            GREUtils.Dialog.openWindow(
                this.topmostWindow,
                aURL,
                aName,
                "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height,
                aArguments
            );
        },
		
        /**
		 * This method can be used to register OpenOrderDialog method for the data rows in a report relative to orders.
		 * Doing so makes people convient to open a popup window to scrutize the detail of a certain order by just clicking the corresponding data row.
		 * Be sure that the id attribue of <tr> indicating the order id is set to be somthing like <tr id="${orders.id}">.
		 * In addition, the id of most outter div element must be 'docbody'.
		 */
        _registerOpenOrderDialog: function() {
            var div = document.getElementById( this._preview_frame_id ).contentWindow.document.getElementById( this._div_id );
        	
            var self = this;
            if ( div ) {
                div.addEventListener( 'click', function( event ) {
                    if ( event.originalTarget.parentNode.id && event.originalTarget.parentNode.tagName == 'TR' )
                        self._openOrderDialogByID( event.originalTarget.parentNode.id );
                }, true );
            }
        },

        _copyExportFileFromTmp: function( tmpFile, targetDir, timeout, callback ) {
            var maxTimes = Math.floor( timeout / 0.2 );
            var tries = 0;
            var nsTmpfile;
            var nsTargetDir;
            var self = this;

            // use setTimeout to wait gecko writing file to disk. XXXX
            var checkFn = function() {
                try {
                    nsTmpfile = GREUtils.File.getFile( tmpFile );
                    nsTargetDir = GREUtils.File.getFile( targetDir );

                    if (nsTargetDir == null) {
                        throw new Exception('Target Directory not Exists');
                    }
                    if ( nsTmpfile == null ) {
                        // not exists waiting...
                        tries++;
                    } else {
                        // check fileSize and diskSpaceAvailable
                        if ( nsTmpfile.fileSize > nsTargetDir.diskSpaceAvailable ) {
                            GREUtils.Dialog.alert( this.topmostWindow, '', _( "The thumb drive does not have enough free space!" ) );
                            throw new Exception( "The thumb drive does not have enough free space!" );
                        }

                        GREUtils.File.copy( nsTmpfile, targetDir );

                        // crazy sync.....
                        GREUtils.File.run( "/bin/sync", [], true );
                        GREUtils.File.run( "/bin/sh", [ '-c', '/bin/sync; /bin/sleep 1; /bin/sync;' ], true );
                        GREUtils.File.run( "/bin/sync", [], true );

                        nsTmpfile.remove( false );

                        tries = maxTimes;
                    }
                    if( tries < maxTimes ) {
                        setTimeout( arguments.callee, 200 );
                    } else {
                        callback.apply( self );
                    }
                } catch( e ) {
                    callback.apply( self );
                }
            };
            setTimeout( checkFn, 200 );
        },

        toggleSize: function () {
            var splitter = document.getElementById( 'splitter_zoom' );
            if ( splitter.getAttribute( 'state' ) == 'collapsed' ) {
                splitter.setAttribute( 'state', 'open' );
            } else {
                splitter.setAttribute( 'state', 'collapsed' );
            }

            this._resizeScrollButtons();
        },

        btnScrollTop: function() {
            var bw = document.getElementById( this._preview_frame_id );
            if ( !bw ) return ;

            var doc = bw.contentWindow.document.getElementById( this._abody_id );
            doc.scrollTop = 0;
        },

        btnScrollUp: function() {
            var bw = document.getElementById( this._preview_frame_id );
            if ( !bw ) return ;

            var doc = bw.contentWindow.document.getElementById( this._abody_id );
            if ( doc.scrollTop <= 0 ) return;

            var scrollRange = GeckoJS.Configure.read( this._scrollRangePreference ) || 200;
            doc.scrollTop -= scrollRange;

            if ( doc.scrollTop < 0 ) doc.scrollTop = 0;
        },

        btnScrollDown: function() {
            var bw = document.getElementById( this._preview_frame_id );
            if ( !bw ) return ;

            var doc = bw.contentWindow.document.getElementById( this._abody_id );
            if ( doc.scrollTop > doc.scrollHeight ) return;

            var scrollRange = GeckoJS.Configure.read( this._scrollRangePreference ) || 200;
            doc.scrollTop += scrollRange;

            if ( doc.scrollTop > doc.scrollHeight ) doc.scrollTop = doc.scrollHeight - doc.clientHeight;
        },

        btnScrollBottom: function() {
            var bw = document.getElementById( this._preview_frame_id );
            if ( !bw ) return ;

            var doc = bw.contentWindow.document.getElementById( this._abody_id );
            doc.scrollTop = doc.scrollHeight - doc.clientHeight;
        },

        btnScrollLeft: function() {
            var bw = document.getElementById( this._preview_frame_id );
            if ( !bw ) return ;

            var doc = bw.contentWindow.document.getElementById( this._abody_id );
            if ( doc.scrollLeft <= 0 ) return;

            var scrollRange = GeckoJS.Configure.read( this._scrollRangePreference ) || 200;
            doc.scrollLeft -= scrollRange;

            if ( doc.scrollLeft < 0 ) doc.scrollLeft = 0;
        },

        btnScrollRight: function() {
            var bw = document.getElementById( this._preview_frame_id );
            if ( !bw ) return ;

            var doc = bw.contentWindow.document.getElementById( this._abody_id );
            if (doc.scrollLeft > doc.scrollWidth) return;

            var scrollRange = GeckoJS.Configure.read( this._scrollRangePreference ) || 200;
            doc.scrollLeft += scrollRange;

            if ( doc.scrollLeft > doc.scrollWidth ) doc.scrollLeft = doc.scrollWidth - doc.clientWidth;
        },
        
        btnScrollLeftMost: function() {
            var bw = document.getElementById( this._preview_frame_id );
            if ( !bw ) return ;

            var doc = bw.contentWindow.document.getElementById( this._abody_id );
            doc.scrollLeft = 0;
        },

        btnScrollRightMost: function() {
            var bw = document.getElementById( this._preview_frame_id );
            if ( !bw ) return ;

            var doc = bw.contentWindow.document.getElementById( this._abody_id );
            doc.scrollLeft = doc.scrollWidth - doc.clientWidth;
        },

        load: function() {
            this._enableButton( false );
            this._mainScreenWidth = GeckoJS.Configure.read( 'vivipos.fec.mainscreen.width' ) || 800;
            this._mainScreenHeight = GeckoJS.Configure.read( 'vivipos.fec.mainscreen.height' ) || 600;
            
            // they are the same in default.
            this._exportedFileName = this._fileName;

            var queryString = window.location.search;

            var queryObj = {};
            if (queryString.length >1) {
               queryObj = this.updateQueryStringFields(queryString);

            }

            this.updateStartEndDateFields(queryObj);

            if (queryObj['auto_execute']) {

               // using some delay for controller loaded.
               window.setTimeout(function() {
                   if ($('#execute').length>0) {
                        $('#execute').click();
                   }else if ($('.ExeBtn').length>0) {
                       $('.ExeBtn').click();
                   }
               }, 1000);
            }

            return queryObj;
        },

        updateStartEndDateFields: function(queryObj) {
            // set default start and end date
            var startDateObj = document.getElementById('start_date');
            var endDateObj = document.getElementById('end_date');

            if (!startDateObj || !endDateObj) return;

            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start, end;

            if ('start_date' in queryObj) {
                if ('end_date' in queryObj) {
                    // case 1: start_date set, end_date set -> noop
                }
                else {
                    // case 2: start_date set, end_date not set
                    end = (new Date(startDateObj.value)).add({days: 1}).getTime();
                    endDateObj.value = end;
                }
            }
            else {
                if ('end_date' in queryObj) {
                    // case 3: start_date not set, end_date set
                    startDateObj.value = endDateObj.value;
                }
                else {
                    // case 4: start_date not set, end_date not set
                    start = ( new Date( yy,mm,dd,0,0,0 ) ).getTime();
                    startDateObj.value = start;
                    end = ( new Date( yy,mm,dd + 1,0,0,0 ) ).getTime();
                    endDateObj.value = end;
                }
            }
            
        },

        /**
         * parse query string by openReport
         *
         * support ${terminal_no} ${branch_id} ${sale_period} ${shift_no}
         * ${}
         * 
         */
        updateQueryStringFields: function(str) {

            var salePeriod = parseInt(GeckoJS.Session.get('sale_period')) * 1000 ;
            var shiftNumber = GeckoJS.Session.get('shift_number');
            var terminalNo = GeckoJS.Session.get('terminal_no') || '';
            var branchId = '';
            var store = GeckoJS.Session.get('storeContact');
            if (store) {
                branchId = store.branch_id;
            }

            var queryObj = {};
            queryObj = GeckoJS.String.parseStr(str.substr(1));

            for (var queryFieldId in queryObj) {
                var queryFieldValue = queryObj[queryFieldId];

                queryFieldValue = queryFieldValue.replace('${sale_period}', salePeriod).replace('${shift_no}', shiftNumber)
                                  .replace('${terminal_no}', terminalNo).replace('${branch_id}', branchId);

                $('#'+queryFieldId).val(queryFieldValue);
            }

            return queryObj;
            
        }
    };
    
    var RptBaseController = window.RptBaseController = GeckoJS.Controller.extend( __controller__ );
} )();

( function() {

    /**
     * Report Base Controller
     * This class is used to maintain the utility methods took advantage by each report controller.
     */

    var __controller__ = {
        name: 'RptBase',
        components: [ 'BrowserPrint', 'CsvExport', 'CheckMedia' ],
        packageName: 'viviecr',
        _recordOffset: 0, // this attribute indicates the number of rows going to be ignored from the beginning of retrieved data rows.
        _recordLimit: 100, // this attribute indicates upper bount of the number of rwos we are going to take.
        _csvLimit: 3000000,
        _stdLimit: 3000,
        
        //for the use of manipulating the waiting panel.
        _wait_panel_id: "wait_panel",
        _waiting_caption_id: "waiting_caption",
        _progress_box_id: "progress_box",
        _progress_bar_id: "progress",
        
        _preview_frame_id: "preview_frame",
        _abody_id: "abody",
        _div_id: "docbody",
        
        _tmpFileDir: "/var/tmp/",
        
        _exporting_file_folder: "report_export",
        _fileExportingFlag: 0,// 1 if the exporting task is done, 0 otherwise.
        
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
        
        _fileName: '', // appellation for the exported files.
        
        getCaptionId: function() {
        	return this._waiting_caption_id;
        },

        _showWaitingPanel: function( sleepTime ) {
            var waitPanel = document.getElementById( this._wait_panel_id );
            var width = GeckoJS.Configure.read( 'vivipos.fec.mainscreen.width' ) || 800;
            var height = GeckoJS.Configure.read( 'vivipos.fec.mainscreen.height' ) || 600;
            waitPanel.sizeTo( 360, 120 );
            var x = ( width - 360 ) / 2;
            var y = ( height - 240 ) / 2;
            
            var caption = document.getElementById( this._waiting_caption_id );
            caption.label = caption.statusText;
            
            var progressBox = document.getElementById( this._progress_box_id );
            var progressBar = document.createElementNS( "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:progressmeter" );
            progressBar.setAttribute( 'value', '0' );
            progressBar.setAttribute( 'mode', 'determined' );
            progressBar.setAttribute( 'id', this._progress_bar_id );
            progressBox.appendChild( progressBar );
            
            // sleep a while so that the actions above will have enough time to accomplish?
            this.sleep( 100 );
            waitPanel.openPopupAtScreen( x, y );

            // release CPU for progressbar to show up.
            if ( !sleepTime ) {
                sleepTime = 1000;
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
        
        _exploit_reportRecords: function() {
            var path = GREUtils.File.chromeToPath( 'chrome://' + this.packageName + '/content/reports/tpl/' + this._fileName + '/' + this._fileName + '.tpl' );
            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
            var result = tpl.process( this._reportRecords );
	        
            var bw = document.getElementById( this._preview_frame_id );
            var doc = bw.contentWindow.document.getElementById( this._abody_id );
            doc.innerHTML = result;
        },
        
        _waitingForExporting: function() {
        	while ( 1 ) { // Because printToPdf will return right away, we have to wait until the exporting task has done so that the waiting panel disappears properly.
            	if ( this._fileExportingFlag )
            		break;
            	this.sleep( 1000 );
            }
        },
	    
        previousPage: function() {
            var offset = this._recordOffset - this._recordLimit;
            if ( offset >= 0 ) {
                this._recordOffset = offset;
                this.execute();
            } else alert( _( 'We are now on the first page.' ) );
        },
	    
        nextPage: function() {
            this._recordOffset += this._recordLimit;
	    	
            this.execute();
        },

        execute: function() {
            try {
                var waitPanel = this._showWaitingPanel();

                this._setTemplateDataHead();
                this._set_reportRecords();
                this._setTemplateDataFoot();
                this._exploit_reportRecords();
            } catch ( e ) {
            } finally {
                this._enableButton( true );
                
                var splitter = document.getElementById( 'splitter_zoom' );
                splitter.setAttribute( 'state', 'collapsed' );
		        
		        if ( waitPanel != undefined )
                	this._dismissWaitingPanel();
            }
        },
        /**
		 * @param paperProperties is a object consisted of the width, height, edges, margins of the paper.
		 */
        exportPdf: function( paperProperties ) {
            if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to export PDF copy of this report?' ) ) )
                return;
        		
            try {
            	// setting the flag be zero means that the exporting has not finished yet.
            	this._fileExportingFlag = 0;
            	
                this._enableButton( false );
                var media_path = this.CheckMedia.checkMedia( this._exporting_file_folder );
                if ( !media_path ) {
                    NotifyUtils.info( _( 'Media not found!! Please attach the USB thumb drive...' ) );
                    return;
                }

                var waitPanel = this._showWaitingPanel();

                var self = this;

                var progress = document.getElementById( this._progress_bar_id );
				
                this.BrowserPrint.getPrintSettings();

                if ( paperProperties ) {
                    if ( paperProperties.paperSize )
                        this.BrowserPrint.setPaperSize( paperProperties.paperSize.width, paperProperties.paperSize.height );
                    if ( paperProperties.paperEdges )
                        this.BrowserPrint.setPaperEdge( paperProperties.paperEdges.left, paperProperties.paperEdges.right, paperProperties.paperEdges.top, paperProperties.paperEdges.bottom );
                    if ( paperProperties.paperMargins )
                        this.BrowserPrint.setPaperMargin( paperProperties.paperMargins.left, paperProperties.paperMargin.right, paperProperties.paperMargins.top, paperProperties.paperMargins.bottom );
                    if ( paperProperties.paperHeader )
                        this.BrowserPrint.setPaperHeader( paperProperties.paperHeader.left, paperProperties.paperHeader.right );
                }
				
                this.BrowserPrint.getWebBrowserPrint( this._preview_frame_id );
                var fileName = this._fileName + ( new Date() ).toString( 'yyyyMMddHHmm' ) + '.pdf';
                var targetDir = media_path;
                var tmpFile = this._tmpFileDir + fileName;
                this.BrowserPrint.printToPdf( tmpFile, progress,
                    function() {
                        // printing finished callback,
                        self.copyExportFileFromTmp( tmpFile, targetDir, 180 );
                    }
                );
                
                // the function below returns only if the fileExportingFlag is set be one in the finally block of copyExportFileFromTmp.
                this._waitingForExporting();
            } catch ( e ) {
            } finally {
            	// enable buttons
                this._enableButton( true );

                // hide panel
                if ( waitPanel != undefined )
                	this._dismissWaitingPanel();
            }
        },

        exportCsv: function(controller, noReload) {
            if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to export CSV copy of this report?' ) ) )
                return;
        		
            try {
            	// setting the flag be zero means that the exporting has not finished yet.
            	this._fileExportingFlag = 0;
            	
                this._enableButton( false );
                var media_path = this.CheckMedia.checkMedia( this._exporting_file_folder );
                if ( !media_path ) {
                    NotifyUtils.info( _( 'Media not found!! Please attach the USB thumb drive...' ) );
                    return;
                }

                var waitPanel = this._showWaitingPanel( 100 );
                var self = this;
                
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

                var fileName = this._fileName + ( new Date() ).toString( 'yyyyMMddHHmm' ) + '.csv';
                var targetDir = media_path;
                var tmpFile = this._tmpFileDir + fileName;

                this.CsvExport.printToFile( tmpFile, this._reportRecords, tpl );

                self.copyExportFileFromTmp( tmpFile, targetDir, 180 );

                if ( !noReload ) {
                    // drop CSV data and garbage collect
                    this._reportRecords = tmpRecords;
                    GREUtils.gc();
                }
                
                // the function below returns only if the fileExportingFlag is set be one in the finally block of copyExportFileFromTmp.
                this._waitingForExporting();
            } catch ( e ) {
            }
            finally {
                // enable buttons
                this._enableButton( true );

                // hide panel
                if ( waitPanel != undefined )
                	this._dismissWaitingPanel();
            }
        },

        exportRcp: function() {
            if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to print this report?' ) ) )
                return;
        		
            try {
                this._enableButton( false );
                var waitPanel = this._showWaitingPanel( 100 );

                var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                .getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
                var rcp = mainWindow.GeckoJS.Controller.getInstanceByName( 'Print' );
   				
                var paperSize = rcp.getReportPaperWidth( 'report' ) || '80mm';
                var path = GREUtils.File.chromeToPath( 'chrome://' + this.packageName + '/content/reports/tpl/' + this._fileName + '/' + this._fileName + '_rcp_' + paperSize + '.tpl' );

                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
                
                rcp.printReport( 'report', tpl, this._reportRecords );
            } catch ( e ) {
                this.log( this.dump( e ) );
            } finally {
                this._enableButton( true );
                
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

            return s.replace( re, '\'\'' );
        },
	    
        _openOrderDialogByKey: function( key, value ) {
            var aURL = 'chrome://viviecr/content/view_order.xul';
            var aName = _( 'Order Details' );
            var aArguments = {
                index: key,
                value: value
            };
            var posX = 0;
            var posY = 0;
            var width = GeckoJS.Session.get( 'screenwidth' );
            var height = GeckoJS.Session.get( 'screenheight' );
	        
            GREUtils.Dialog.openWindow( window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, aArguments );
        },
		
        /**
		 * This method can be used to register OpenOrderDialog method for the data rows in a report relative to orders.
		 * Doing so makes people convient to open a popup window to scrutize the detail of a certain order by just clicking the corresponding data row.
		 * Be sure that the id attribue of <tr> indicating the order id is set to be somthing like <tr id="${orders.id}">.
		 * In addition, the id of most outter div element must be 'docbody'.
		 */
        _registerOpenOrderDialog: function( key ) {
            var div = document.getElementById( this._preview_frame_id ).contentWindow.document.getElementById( this._div_id );
        	
            var self = this;
            if (!key) key = 'id';
            if ( div ) {
		        div.addEventListener( 'click', function( event ) {
		            if ( event.originalTarget.parentNode.id && event.originalTarget.parentNode.tagName == 'TR' )
		                self._openOrderDialogByKey( key, event.originalTarget.parentNode.id );
		        }, true );
		    }
        	
        /*if ( table.hasChildNodes ) {
        		var children = table.getElementsByTagName( 'tr' );
        		
		    	for ( var i = 0; i < children.length; i++ ) {
		    		if ( children[ i ].id ) {
						children[ i ].addEventListener( 'click', function( event ) {
							orderDialog( event.currentTarget.id );
						}, true );
					}
		    	}
		    }*/
        },

        copyExportFileFromTmp: function( tmpFile, targetDir, timeout ) {
			try {
		        var maxTimes = timeout / 0.2;
		        var tries = 0 ;
		        var nsTmpfile ;
		        var self = this;

		        // use setTimeout to wait gecko writing file to disk. XXXX
		        var checkFn = function() {
		            nsTmpfile = GREUtils.File.getFile( tmpFile );
		            if ( nsTmpfile == null ) {
		                // not exists waiting...
		                tries++;
		            } else {
	                    GREUtils.File.copy( nsTmpfile, targetDir );

	                    // crazy sync.....
	                    GREUtils.File.run( "/bin/sync", [], true );
	                    GREUtils.File.run( "/bin/sh", [ '-c', '/bin/sync; /bin/sleep 3; /bin/sync;' ], true );
	                    GREUtils.File.run( "/bin/sync", [], true );

	                    nsTmpfile.remove( false );

		                tries = maxTimes;
		            }
		            if( tries < maxTimes ) {
		                setTimeout( arguments.callee, 200 );
		            }
		        };
		        setTimeout( checkFn, 200 );
		    } catch ( e ) {
		    } finally {
		    	this._fileExportingFlag = 1;
		    }
        },

        load: function() {
            this._enableButton( false );
        }
    };
    
    var RptBaseController = window.RptBaseController = GeckoJS.Controller.extend( __controller__ );
} )();

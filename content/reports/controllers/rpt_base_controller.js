(function(){

    /**
     * Report Base Controller
     * This class is used to maintain the utility methods took advantage by each report controller.
     */

    var __controller__ = {
        name: 'RptBase',
        components: [ 'BrowserPrint', 'CsvExport', 'CheckMedia' ],
        
        _data: { // data for template to use.
		    head: {
		        title: '',
		        store: null,
		        clerk_displayname: ''
		    },
		    body: null,
		    foot: gen_time: (new Date()).toString( 'yyyy/MM/dd HH:mm:ss' )
        },
        
        _fileName: '', // appellation for the exported files.

        _showWaitPanel: function( panel, sleepTime ) {
            var waitPanel = document.getElementById( panel );
            var width = GeckoJS.Configure.read( 'vivipos.fec.mainscreen.width' ) || 800;
            var height = GeckoJS.Configure.read( 'vivipos.fec.mainscreen.height' ) || 600;
            waitPanel.sizeTo( 360, 120 );
            var x = ( width - 360 ) / 2;
            var y = ( height - 240 ) / 2;
            waitPanel.openPopupAtScreen( x, y );

            // release CPU for progressbar ...
            if ( !sleepTime ) {
              sleepTime = 1000;
            }
            this.sleep( sleepTime );
            return waitPanel;
        },

        _enableButton: function( enable ) {
            var disabled = !enable;
            $( '#export_pdf' ).attr( 'disabled', disabled );
            $( '#export_csv' ).attr( 'disabled', disabled );
            $( '#export_rcp' ).attr( 'disabled', disabled );
        },
        
        _set_data: function() {
        },
        
        _set_fileName: function( fileName ) {
        	this._fileName = fileName;
        },

        execute: function() {
        	try {
		        var waitPanel = this._showWaitPanel( 'wait_panel' );

		        _data.store = GeckoJS.Session.get( 'storeContact' );
		        var user = new GeckoJS.AclComponent().getUserPrincipal();
		        if ( user != null )
		            _data.clerk_displayname = user.description;

		        _set_data();

		        var path = GREUtils.File.chromeToPath( 'chrome://viviecr/content/reports/tpl/rpt_departments/' + this._fileName + '.tpl' );
		        var file = GREUtils.File.getFile( path );
		        var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
		        var result = tpl.process( this._data );
		        
		        var bw = document.getElementById( 'preview_frame' );
		        var doc = bw.contentWindow.document.getElementById( 'abody' );
		        doc.innerHTML = result;
		    } catch ( e ) {
            } finally {
                this._enableButton( true );
                
                var splitter = document.getElementById('splitter_zoom');
		        splitter.setAttribute("state", "collapsed");
		        
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }
        },

        exportPdf: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to export PDF copy of this report?' ) ) )
        		return;
        		
            try {
                this._enableButton( false );
                var media_path = this.CheckMedia.checkMedia( 'report_export' );
                if ( !media_path ){
                    NotifyUtils.info( _( 'Media not found!! Please attach the USB thumb drive...' ) );
                    return;
                }

                var waitPanel = this._showWaitPanel( 'wait_panel' );

                this.BrowserPrint.getPrintSettings();

                this.BrowserPrint.setPaperSizeUnit( 1 );
                this.BrowserPrint.setPaperSize( 210, 297 );
                this.BrowserPrint.setPaperEdge( 0, 0, 0, 0 );
                this.BrowserPrint.setPaperMargin( 0, 0, 0, 0 );

                this.BrowserPrint.getWebBrowserPrint( 'preview_frame' );
                this.BrowserPrint.printToPdf( media_path + this._fileName );
            } catch ( e ) {
            } finally {
                this._enableButton( true );
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }
        },

        exportCsv: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to export CSV copy of this report?' ) ) )
        		return;
        		
            try {
                this._enableButton( false );
                var media_path = this.CheckMedia.checkMedia( 'report_export' );
                if ( !media_path ) {
                    NotifyUtils.info( _( 'Media not found!! Please attach the USB thumb drive...' ) );
                    return;
                }

                var waitPanel = this._showWaitPanel( 'wait_panel', 100 );

                var path = GREUtils.File.chromeToPath( 'chrome://viviecr/content/reports/tpl/rpt_departments/' + fileName + '_csv.tpl' );

                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );

                this.CsvExport.printToFile( media_path + this._fileName, this._data, tpl );
            } catch ( e ) {
            } finally {
                this._enableButton( true );
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }

        },

        exportRcp: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to print this report?' ) ) )
        		return;
        		
            try {
                this._enableButton( false );
                var waitPanel = this._showWaitPanel( 'wait_panel', 100 );

				var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
   					.getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow( 'Vivipos:Main' );
   				var rcp = mainWindow.GeckoJS.Controller.getInstanceByName( 'Print' );
   				
   				var paperSize = rcp.getReportPaperWidth( 'report' );
				
                var path = GREUtils.File.chromeToPath( 'chrome://viviecr/content/reports/tpl/rpt_departments/' + '_rcp_' + paperSize + '.tpl' );

                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
                
                rcp.printReport( 'report', tpl, this._data );
            } catch ( e ) {
            } finally {
                this._enableButton( true );
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }
        },

        load: function() {
            this._enableButton( false );
        }
    } );
    
    GeckoJS.Controller.extend( __controller__ );
})();

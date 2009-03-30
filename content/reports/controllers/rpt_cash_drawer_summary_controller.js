(function(){

    /**
     * Cash Drawer Controller
     */

    GeckoJS.Controller.extend( {
        name: 'RptCashDrawerSummary',
        components: ['BrowserPrint', 'CsvExport', 'CheckMedia'],
	
        _datas: null,
        
        _fileName: "/rpt_cash_drawer_summary",

        _showWaitPanel: function( panel, sleepTime ) {
            var waitPanel = document.getElementById( panel );
            var width = GeckoJS.Configure.read( "vivipos.fec.mainscreen.width" ) || 800;
            var height = GeckoJS.Configure.read( "vivipos.fec.mainscreen.height" ) || 600;
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

        execute: function() {
            var waitPanel = this._showWaitPanel( 'wait_panel' );
            
            var storeContact = GeckoJS.Session.get( 'storeContact' );
            var clerk = "";
            var clerk_displayname = "";
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null ) {
                clerk = user.username;
                clerk_displayname = user.description;
            }
			
            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;

            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

            start = parseInt( start / 1000 );
            end = parseInt( end / 1000 );
            
            var cashDrawer = new CashdrawerRecordModel();

            var fields = [
                            'clerk_displayname',
                            'event_type',
                            'count( event_type ) as num_events'
                        ];
                        
            var conditions = "created >= '" + start +
                            "' AND created <= '" + end + "'";

            var groupby = 'clerk_displayname, event_type';
            var orderby = 'num_events desc';
            
            var sortby = document.getElementById( 'sortby' ).value;
            if ( sortby != 'all' )
            	var orderby = sortby;

            var datas = cashDrawer.find( 'all', { fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby } );
            
            var footData = cashDrawer.find( 'first', {
            											fields: 'count( event_type ) as total_num_events',
            											conditions: conditions,
            											recursive: -1
            										 } );

            var data = {
                head: { 
                	title:_( 'Cash Drawer Summary Report' ),
                	start_time: start_str,
                    end_time: end_str,
                    store: storeContact,
                    clerk_displayname: clerk_displayname
                },
                body: datas,
                foot: {
		            foot_data: footData,
		            gen_time: (new Date()).toString('yyyy/MM/dd HH:mm:ss')
                }
            }
            
            this._datas = data;

            var path = GREUtils.File.chromeToPath( "chrome://viviecr/content/reports/tpl/rpt_cash_drawer_summary/rpt_cash_drawer_summary.tpl" );

            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );

            result = tpl.process( data );
            
            var bw = document.getElementById( 'preview_frame' );
            var doc = bw.contentWindow.document.getElementById( 'abody' );

            doc.innerHTML = result;

            this._enableButton( true );
            
            var splitter = document.getElementById( 'splitter_zoom' );
            splitter.setAttribute( "state", "collapsed" );

            waitPanel.hidePopup();
        },

        exportPdf: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to export PDF copy of this report?' ) ) )
        		return;
        		
            try {
                this._enableButton( false );
               var media_path = this.CheckMedia.checkMedia( 'report_export' );
                if ( !media_path ) {
                    NotifyUtils.info( _( 'Media not found!! Please attach the USB thumb drive...' ) );
                    return;
                }

                var waitPanel = this._showWaitPanel( 'wait_panel' );

                this.BrowserPrint.getPrintSettings();
                this.BrowserPrint.setPaperSizeUnit( 1 );
                this.BrowserPrint.setPaperSize( 210, 297 );
                //this.BrowserPrint.setPaperEdge( 20, 20, 20, 20 );

                this.BrowserPrint.getWebBrowserPrint( 'preview_frame' );
                this.BrowserPrint.printToPdf( media_path + this._fileName );
            } catch (e) {
                //
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
                if ( !media_path ){
                    NotifyUtils.info( _( 'Media not found!! Please attach the USB thumb drive...' ) );
                    return;
                }

                var waitPanel = this._showWaitPanel( 'wait_panel', 100 );
				
                var path = GREUtils.File.chromeToPath( "chrome://viviecr/content/reports/tpl/rpt_cash_drawer_summary/rpt_cash_drawer_summary_csv.tpl" );

                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );
                var datas;
                datas = this._datas;

                this.CsvExport.printToFile( media_path + this._fileName, datas, tpl );

            } catch ( e ) {
                //
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

                var path = GREUtils.File.chromeToPath( "chrome://viviecr/content/reports/tpl/rpt_cash_drawer_summary/rpt_cash_drawer_summary_rcp_80mm.tpl" );

                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes(file) );
                var datas;
                datas = this._datas;

                // this.RcpExport.print( datas, tpl );
                var rcp = opener.opener.opener.GeckoJS.Controller.getInstanceByName( 'Print' );
                rcp.printReport( 'report', tpl, datas );
            } catch ( e ) {
                //
            } finally {
                this._enableButton( true );
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }
        },

        load: function() {

            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = ( new Date( yy, mm, dd, 0, 0, 0) ).getTime();
            var end = ( new Date( yy, mm, dd + 1, 0, 0, 0 ) ).getTime();

            document.getElementById( 'start_date' ).value = start;
            document.getElementById( 'end_date' ).value = end;

            this._enableButton( false );
            
        }
	
    });


})();

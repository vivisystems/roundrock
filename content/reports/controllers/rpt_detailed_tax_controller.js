(function(){

    /**
     * Detailed Tax Controller
     */

    GeckoJS.Controller.extend( {
        name: 'RptDetailedTax',
        components: [ 'BrowserPrint', 'CsvExport', 'CheckMedia' ],
	
        _datas: null,
        
        _fileName: "/rpt_detailed_tax",

        _showWaitPanel: function(panel, sleepTime) {
            var waitPanel = document.getElementById(panel);
            var width = GeckoJS.Configure.read("vivipos.fec.mainscreen.width") || 800;
            var height = GeckoJS.Configure.read("vivipos.fec.mainscreen.height") || 600;
            waitPanel.sizeTo(360, 120);
            var x = (width - 360) / 2;
            var y = (height - 240) / 2;
            waitPanel.openPopupAtScreen(x, y);

            // release CPU for progressbar ...
            if (!sleepTime) {
              sleepTime = 1000;
            }
            this.sleep(sleepTime);
            return waitPanel;
        },

        _enableButton: function(enable) {
            var disabled = !enable;
            $('#export_pdf').attr('disabled', disabled);
            $('#export_csv').attr('disabled', disabled);
            $('#export_rcp').attr('disabled', disabled);
        },
        
        _set_datas: function( start, end, periodType, terminalNo ) {
        	
        	var storeContact = GeckoJS.Session.get( 'storeContact' );
        	storeContact.terminal_no = GeckoJS.Session.get( 'terminal_no' ) || "";
            var clerk = "";
            var clerk_displayname = "";
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null ) {
                clerk = user.username;
                clerk_displayname = user.description;
            }
            
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
			var end_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
			
            start = parseInt(start / 1000);
            end = parseInt(end / 1000);
            
            var orderItem = new OrderItemModel();

            var fields = [
            				'orders.sequence',
            				'orders.total',
            				'orders.tax_subtotal',
            				'orders.included_tax_subtotal',
            				'order_items.order_id',
            				'order_items.tax_name',
            				'order_items.tax_type',
            				'order_items.current_subtotal',
            				'order_items.current_qty',
            				'order_items.current_price',
                            'SUM("order_items"."current_tax") + SUM("order_items"."included_tax") as "OrderItem.tax"'
                         ];
                            
            var conditions = "orders." + periodType + ">='" + start +
                            "' AND orders." + periodType + "<='" + end + "'";
            
            if ( terminalNo.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + terminalNo + "%'";

            var groupby = 'order_items.order_id, order_items.tax_name, order_items.tax_type';
            var orderby = 'orders.sequence';

            var datas = orderItem.find( 'all', { fields: fields, conditions: conditions, group: groupby, recursive:1, order: orderby } );
            
            var orderAdditions = new OrderAdditionModel();
            
            var orderAdditionRecords = orderAdditions.find( 'all',
            	{ fields: [ 'order_id', 'sum( current_surcharge ) as surcharge_subtotal', 'sum( current_discount ) as discount_subtotal' ], group: 'order_id', recursive: 0 } );

			var typeCombineTax = 'COMBINE';
			var taxList = [];
			TaxComponent.prototype.getTaxList().forEach( function( tax ) {
				if ( tax.type != typeCombineTax )
					taxList.push( tax );
			} );

			var summary = {
				total: 0,
				tax_subtotal: 0,
				included_tax_subtotal: 0,
				surcharge_subtotal: 0,
				discount_subtotal: 0
			};
			
			taxList.forEach( function( tax ) {
				if ( tax.type != typeCombineTax )
					summary[ tax.no ] = 0;
			} );

			var oid;
			records = {};
			datas.forEach( function( data ) {
				if ( data.order_id != oid ) {
					oid = data.order_id;
					records[ oid ] = GREUtils.extend( {}, data );
					records[ oid ][ 'surcharge_subtotal' ] = 0;
					records[ oid ][ 'discount_subtotal' ] = 0;

					taxList.forEach( function( tax ) {
						if ( tax.type != typeCombineTax )
							records[ oid ][ tax.no ] = 0;
					} );
					
					orderAdditionRecords.forEach( function( orderAdditionRecord ) {
						if ( orderAdditionRecord.order_id == data.order_id ) {
							records[ oid ][ 'surcharge_subtotal' ] += orderAdditionRecord.surcharge_subtotal;
							records[ oid ][ 'discount_subtotal' ] += orderAdditionRecord.discount_subtotal;
						}
					} );
					
					summary.total += data.Order.total;
					summary.tax_subtotal += data.Order.tax_subtotal;
					summary.included_tax_subtotal += data.Order.included_tax_subtotal;
					summary.surcharge_subtotal += records[ oid ][ 'surcharge_subtotal' ];
					summary.discount_subtotal += records[ oid ][ 'discount_subtotal' ];
				}
				
				var taxObject = TaxComponent.prototype.getTax( data.tax_name );
				
				if ( taxObject.type != typeCombineTax ) {
					records[ oid ][ data.tax_name ] += data.tax;
					summary[ data.tax_name ] += data.tax;
				} else {// break down the combined tax.
					taxObject.CombineTax.forEach( function( cTax ) {
						taxAmountObject = TaxComponent.prototype.calcTaxAmount( cTax.no, data.current_subtotal, data.current_price, data.current_qty );
						taxAmount = taxAmountObject[ cTax.no ].charge + taxAmountObject[ cTax.no ].included;
						records[ oid ][ cTax.no ] += taxAmount;
						summary[ cTax.no ] += taxAmount;
					} );
				}
			} );
				
            var data = {
                head: {
                	title: _('Detailed Tax Report'),
                	start_time: start_str,
                    end_time: end_str,
                    machine_id: terminalNo,
                    store: storeContact,
                    clerk_displayname: clerk_displayname
                },
                body: records,
                taxList: taxList,
                foot: {
                	summary: summary,
                	gen_time: (new Date()).toString('yyyy/MM/dd HH:mm:ss')
                }
            }

			this._datas = data;
		},
		
		/**
		 * This method can be invoked internally by other methods in this object or called externally by other objects to print the designated product sales report
		 * by the printer.
		 *
		 * @param start is a thirteen-digit integer indicating the beginning of the time interval.
		 * @param end is a thirteen-digit integer indicating the end of the time interval.
		 * @param periodType determines which kind of time interval the start and end will delimit, modified time or sale period.
		 * @param terminalNo is an intuitive search criteron.
		 * @return nothing.
		 */
		 
		printDetailedTaxReport: function( start, end, periodType, terminalNo ) {
			
			this._set_datas( start, end, periodType, terminalNo );
			
			var path = GREUtils.File.chromeToPath( "chrome://viviecr/content/reports/tpl/rpt_detailed_tax/rpt_detailed_tax_rcp_80mm.tpl" );

            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
			
			tpl.process( this._datas );
            var rcp = opener.opener.opener.GeckoJS.Controller.getInstanceByName( 'Print' );
            //rcp.printReport( 'report', tpl, this._datas );
       	},

        execute: function() {
            var waitPanel = this._showWaitPanel('wait_panel');

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var machineid = document.getElementById('machine_id').value;
            
            var periodType = document.getElementById( 'periodtype' ).value;

			this._set_datas( start, end, periodType, machineid );

            var path = GREUtils.File.chromeToPath( 'chrome://viviecr/content/reports/tpl/rpt_detailed_tax/rpt_detailed_tax.tpl' );

            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );

            result = tpl.process( this._datas );
            
            var bw = document.getElementById( 'preview_frame' );
            var doc = bw.contentWindow.document.getElementById( 'abody' );

            doc.innerHTML = result;

            this._enableButton( true );
            
            var splitter = document.getElementById( 'splitter_zoom' );
            splitter.setAttribute( 'state', 'collapsed' );

            waitPanel.hidePopup();
        },

        exportPdf: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to export PDF copy of this report?' ) ) )
        		return;
        		
            try {
                this._enableButton(false);
                var media_path = this.CheckMedia.checkMedia('report_export');
                if (!media_path){
                    NotifyUtils.info(_('Media not found!! Please attach the USB thumb drive...'));
                    return;
                }

                var waitPanel = this._showWaitPanel('wait_panel');

                this.BrowserPrint.getPrintSettings();
                this.BrowserPrint.setPaperSizeUnit(1);
                this.BrowserPrint.setPaperSize( 297, 210 );
                //this.BrowserPrint.setPaperEdge(20, 20, 20, 20);

                this.BrowserPrint.getWebBrowserPrint('preview_frame');
                this.BrowserPrint.printToPdf( media_path + this._fileName );
            } catch (e) {
                //
            } finally {
                this._enableButton(true);
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }
        },

        exportCsv: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to export CSV copy of this report?' ) ) )
        		return;
        		
            try {
                this._enableButton(false);
                var media_path = this.CheckMedia.checkMedia('report_export');
                if (!media_path){
                    NotifyUtils.info(_('Media not found!! Please attach the USB thumb drive...'));
                    return;
                }

                var waitPanel = this._showWaitPanel('wait_panel', 100);
				
                var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/rpt_detailed_tax/rpt_detailed_tax_csv.tpl");

                var file = GREUtils.File.getFile(path);
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
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

                var path = GREUtils.File.chromeToPath( "chrome://viviecr/content/reports/tpl/rpt_detailed_tax/rpt_detailed_tax_rcp_80mm.tpl" );

                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
                var datas;
                datas = this._datas;

                // this.RcpExport.print(datas, tpl);
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

            var start = (new Date(yy,mm,dd,0,0,0)).getTime();
            var end = (new Date(yy,mm,dd + 1,0,0,0)).getTime();

            document.getElementById('start_date').value = start;
            document.getElementById('end_date').value = end;

            this._enableButton(false);
        }
	
    });

})();

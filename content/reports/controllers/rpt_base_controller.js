(function() {

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
        
        _setTemplateDataHead: function() {
        	this._reportRecords.head.store = GeckoJS.Session.get( 'storeContact' );
	        var user = new GeckoJS.AclComponent().getUserPrincipal();
	        if ( user != null )
	            this._reportRecords.head.clerk_displayname = user.description;
		},
        
        _set_reportRecords: function() {
        },
        
        _exploit_reportRecords: function() {
        	var path = GREUtils.File.chromeToPath( 'chrome://' + this.packageName + '/content/reports/tpl/' + this._fileName + '/' + this._fileName + '.tpl' );
	        var file = GREUtils.File.getFile( path );
	        var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
	        var result = tpl.process( this._reportRecords );
	        
	        var bw = document.getElementById( 'preview_frame' );
	        var doc = bw.contentWindow.document.getElementById( 'abody' );
	        doc.innerHTML = result;
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
		        var waitPanel = this._showWaitPanel( 'wait_panel' );

		        this._setTemplateDataHead();
		        this._set_reportRecords();
				this._exploit_reportRecords();
		    } catch ( e ) {
            } finally {
                this._enableButton( true );
                
                var splitter = document.getElementById( 'splitter_zoom' );
		        splitter.setAttribute( 'state', 'collapsed' );
		        
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
            }
        },
		/**
		 * @param paperProperties is a object consisted of the width, height, edges, margins of the paper.
		 */
        exportPdf: function( paperProperties ) {
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

                this.BrowserPrint.getWebBrowserPrint( 'preview_frame' );
                this.BrowserPrint.printToPdf( media_path + '/' + this._fileName + ( new Date() ).toString( 'yyyyMMddHHmm' ) + '.pdf' );
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

                var path = GREUtils.File.chromeToPath( 'chrome://' + this.packageName + '/content/reports/tpl/' + this._fileName + '/' + this._fileName + '_csv.tpl' );

                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );

                this.CsvExport.printToFile( media_path + '/' + this._fileName + ( new Date() ).toString( 'yyyyMMddHHmm' ) + '.csv', this._reportRecords, tpl );
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
   				
   				var paperSize = rcp.getReportPaperWidth( 'report' ) || '80mm';
                var path = GREUtils.File.chromeToPath( 'chrome://' + this.packageName + '/content/reports/tpl/' + this._fileName + '/' + this._fileName + '_rcp_' + paperSize + '.tpl' );

                var file = GREUtils.File.getFile( path );
                var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
                
                rcp.printReport( 'report', tpl, this._reportRecords );
            } catch ( e ) {
            } finally {
                this._enableButton( true );
                if ( waitPanel != undefined )
                	waitPanel.hidePopup();
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
	        var records = dbModel.find( 'all', { fields: fields, conditions: conditions, order: order, group: group } );
	        var menupopup = document.getElementById( menupopupId );

	        records.forEach( function( data ) {
	            var menuitem = document.createElementNS( "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem" );
	            menuitem.setAttribute( 'value', data[ valueField ] );
	            menuitem.setAttribute( 'label', data[ labelField ] );
	            menupopup.appendChild( menuitem );
	        });
	    },
	    
	    _queryStringPreprocessor: function( s ) {
	    	var re = /\'/g;

	    	return s.replace( re, '\'\'' );
	    },
	    
	    _openOrderDialogByOrderId: function( orderId ) {
	        var aURL = 'chrome://viviecr/content/view_order.xul';
	        var aName = _( 'Order Details' );
	        var aArguments = { index: 'id', value: orderId };
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
		 */
		_registerOpenOrderDialog: function() {
			var div = document.getElementById( 'preview_frame' ).contentWindow.document.getElementById( 'docbody' );
        	
        	var self = this;
        	div.addEventListener( 'click', function( event ) {
        		if ( event.originalTarget.parentNode.id && event.originalTarget.parentNode.tagName == 'TR' )
					self._openOrderDialogByOrderId( event.originalTarget.parentNode.id );
			}, true );
        	
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

        load: function() {
            this._enableButton( false );
        }
    };
    
    var RptBaseController = window.RptBaseController = GeckoJS.Controller.extend( __controller__ );
})();

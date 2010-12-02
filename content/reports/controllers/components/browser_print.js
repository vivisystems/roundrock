( function() {
    try {
        include( 'chrome://viviecr/content/reports/controllers/components/wkhtmltopdf.js' );
    }catch(e) {
        var WkhtmltopdfComponent = window.WkhtmltopdfComponent = GeckoJS.Component.extend( {exists: function() {
                return false;
        }} );
    }

    var __component__ = {

        name: 'BrowserPrint',

        _printSettings: null,
        _webBrowserPrint: null,

        _setPaperProperties: function( paperProperties ) {
            if ( paperProperties ) {
                if ( paperProperties.paperSize )
                    this.setPaperSize( paperProperties.paperSize.width, paperProperties.paperSize.height );
                if ( paperProperties.paperEdges )
                    this.setPaperEdge( paperProperties.paperEdges.left, paperProperties.paperEdges.right, paperProperties.paperEdges.top, paperProperties.paperEdges.bottom );
                if ( paperProperties.paperMargins )
                    this.setPaperMargin( paperProperties.paperMargins.left, paperProperties.paperMargin.right, paperProperties.paperMargins.top, paperProperties.paperMargins.bottom );
                if ( paperProperties.paperHeader )
                    this.setPaperHeader( paperProperties.paperHeader.left, paperProperties.paperHeader.right );
                if ( paperProperties.orientation )
                    this.setPaperOrientation( paperProperties.orientation );
            }
        },
        
        _getAWPListener: function( caption, progress, callback ) {
            var awpListener = {
                numReachingMaxTot: 0,
            	
                QueryInterface: function( aIID ) {
                    if ( aIID.equals( Components.interfaces.nsIWebProgressListener ) ||
                        aIID.equals( Components.interfaces.nsISupportsWeakReference ) ||
                        aIID.equals( Components.interfaces.nsISupports ) )
                        return this;
                    throw Components.results.NS_NOINTERFACE;
                },
			
                onStateChange: function( aWebProgress, aRequest, aFlag, aStatus ) {
                    if ( callback )
                        callback.apply( this );
                },
                
                onProgressChange: function( aWebProgress, aRequest, curSelf, maxSelf, curTot, maxTot ) {
                    if ( curTot == maxTot )
                        this.numReachingMaxTot++;
                    if ( this.numReachingMaxTot > 1 )
                        return;
                    	
                    if( caption ) {
                        if( caption.label.match( /\(.*\)/ ) ) {
                            caption.label = caption.label.replace( /\(.*\)/, '('+curTot+'/'+maxTot+')' );
                        }else {
                            caption.label += ' (' + curTot+'/'+maxTot +')';
                        }
                    }
                    progress.value = parseInt( curTot / maxTot * 100 );
                },
                
                onLocationChange: function( aWebProgress, aRequest, aLocation ) {
                },

                onStatusChange: function( aWebProgress, aRequest, aStatus, aMessage ) {
                },

                onSecurityChange: function( aWebProgress, aRequest, aState ) {
                }
            };
            
            return awpListener;
        },

        showPageSetup: function ( printSettings ) {
            try {
                if ( !printSettings )
                    printSettings = this._getPrintSettings();
                    
                // save the print settings to prefs since the method showPageSetup always read print settings from prefs.
                var printSettingsService =
                    Components.classes[ "@mozilla.org/gfx/printsettings-service;1" ]
                    .getService( Components.interfaces.nsIPrintSettingsService );
                printSettingsService.savePrintSettingsToPrefs( printSettings, false, this._printSettings.kInitSaveAll );
                
                var printPromptService = Components.classes[ "@mozilla.org/embedcomp/printingprompt-service;1" ]
                    .getService( Components.interfaces.nsIPrintingPromptService );
                printPromptService.showPageSetup( window, printSettings, null );
                /*if ( gSavePrintSettings ) {
                    var PSSVC = Components.classes[ "@mozilla.org/gfx/printsettings-service;1" ]
                        .getService( Components.interfaces.nsIPrintSettingsService );
                    PSSVC.savePrintSettingsToPrefs( printSettings, true, printSettings.kInitSaveNativeData );
                }*/
            } catch ( e ) {
                this.log( 'ERROR', 'showPageSetup: ' + e );
                return false;
            }
            return true;
        },
        
        /**
         * @param paperProperties is an object comprising the specified printing settings.
         * @param frameID is a string indicating the XUL element whose contentWindow is going to be printed out.
         * @param caption is a XUL element, for the use of updating the progress bar.
         * @param progress is a XUL element, the progress bar.
         */
        showPrintDialog: function( paperProperties, frameID, caption, progress ) {
            try {
                // Acquire default paper settings.
                this._getPrintSettings();

                // A print dialog will pop up  if printSilent is set be false.
                this._printSettings.printSilent = false;
                this._printSettings.printToFile = false;
                
                this._setPaperProperties( paperProperties );
                
                this.showPageSetup( this._printSettings );
				
                this._getWebBrowserPrint( frameID );

                var isPrintingFinished = false;
                var awpListener = null;
                if ( caption.tagName == "caption" && progress )
                    awpListener = this._getAWPListener( caption, progress, function() {
                        isPrintingFinished = true; } );
        		
                this._webBrowserPrint.print( this._printSettings, awpListener );
                
                while ( 1 ) { // Because print function above will return right away, we have to wait until the printing task has done so that the waiting panel disappears properly.
                	if ( isPrintingFinished )
                		break;
                	this.sleep( 1000 );
                }
            } catch ( e ) {
                this.log( 'ERROR', 'showPrintDialog: ' + e );
                throw e;
            } finally {
            }
        },
        
        /**
         * @param pdfFileName is a string indicating the name of the file about to print.
         * @param paperProperties is an object comprising the specified printing settings.
         * @param frameID is a string indicating the XUL element whose contentWindow is going to be printed out.
         * @param caption is a XUL element, for the use of updating the progress bar.
         * @param progress is a XUL element, the progress bar.
         * @param callback is just a callback function consisted of movements which should be executed right after the printing task finished.
         */
        printToPdf: function( pdfFileName, paperProperties, frameID, caption, progress, callback ) {
            if ( !pdfFileName ) {
                // need filename
                return;
            }

            try {
                this._getPrintSettings();
                
                this._printSettings.outputFormat = Components.interfaces.nsIPrintSettings.kOutputFormatPDF;
                this._printSettings.printToFile = true;
                this._printSettings.printSilent = true;
                this._printSettings.showPrintProgress = true;
                this._printSettings.toFileName = pdfFileName;
                
                this._setPaperProperties( paperProperties );
				
                this._getWebBrowserPrint( frameID );

                var awpListener = null;
                if ( caption.tagName == "caption" && progress )
                    awpListener = this._getAWPListener( caption, progress, callback );
		        
                this._webBrowserPrint.print( this._printSettings, awpListener );
            }
            catch ( e ) {
                this.log( 'ERROR', 'browser.printToPDF: ' + e );
                throw e;
            } finally {
            }
        },
       
        setPaperSizeUnit: function( paperSizeUnit ) {
            if ( !this._printSettings )
                this._getPrintSettings();
            this._printSettings.paperSizeUnit = paperSizeUnit || Components.interfaces.nsIPrintSettings.kPaperSizeMillimeters; //kPaperSizeMillimeters;
        },
        
        getPaperSizeUnit: function() {
            if ( !this._printSettings )
                this._getPrintSettings();
            return this._printSettings.paperSizeUnit; // 1: millimeter; inch otherwise.
        },

        setPaperSize: function( paperWidth, paperHeight ) {
            if ( !this._printSettings )
                this._getPrintSettings();   
            this._printSettings.paperHeight = paperHeight;
            this._printSettings.paperWidth = paperWidth;
        },
        
        setPaperName: function( paperName ) {
            if ( !this._printSettings )
                this._getPrintSettings();   
            this._printSettings.paperName = paperName || "iso_a4"; // na_letter if letter.
        },

        setPaperMargin: function( marginLeft, marginRight, marginTop, marginBottom ) {
            if ( !this._printSettings )
                this._getPrintSettings();
            this._printSettings.marginTop = marginTop || 0.15; // in inch.
            this._printSettings.marginLeft = marginLeft || 0;
            this._printSettings.marginRight = marginRight || 0;
            this._printSettings.marginBottom = marginBottom || 0.15;
        },
        
        setPaperHeader: function( headerStrLeft, headerStrRight ) {
            // set to default value if the parameter is null.
            if ( !this._printSettings )
                this._getPrintSettings();
            this._printSettings.headerStrRight =
                headerStrRight ||
                _( "Generated by VIVIPOS" );
            this._printSettings.headerStrLeft =
                headerStrLeft ||
                //this.controller._reportRecords.head.store.name + ' - ' + this.controller._reportRecords.head.store.branch ||
                _( "Firich Enterprises Co.,Ltd." );
        },

        setPaperEdge: function( edgeLeft, edgeRight, edgeTop, edgeBottom ) {
            if ( !this._printSettings )
                this._getPrintSettings();
            this._printSettings.edgeLeft = edgeLeft || 0;// in inch.
            this._printSettings.edgeRight = edgeRight || 0;
            this._printSettings.edgeTop = edgeTop || 0;
            this._printSettings.edgeBottom = edgeBottom || 0;
        },
        
        setPaperOrientation: function( orientation ) {
            if ( !this._printSettings )
                this._getPrintSettings();
                
            if ( orientation == "portrait" ) {
                this._printSettings.orientation = Components.interfaces.nsIPrintSettings.kPortraitOrientation;
            } else if ( orientation == "landscape" ) {
                this._printSettings.orientation = Components.interfaces.nsIPrintSettings.kLandscapeOrientation;
            }
        },

        _getWebBrowserPrint: function( content ) {
            var _content;
            if ( typeof content == "string" ) {
                try {
                    _content = document.getElementById( content ).contentWindow;
                } catch ( e ) {
                }
            } else if ( typeof content == "object" ) {
                _content = content;
            }
            if ( !_content ) {
                _content = window.contentWindow;
            }
            this._webBrowserPrint = _content.QueryInterface( Components.interfaces.nsIInterfaceRequestor )
                .getInterface( Components.interfaces.nsIWebBrowserPrint );
            return this._webBrowserPrint;
        },

        _getPrintSettings: function() {
            /*var pref = Components.classes[ "@mozilla.org/preferences-service;1" ]
                .getService( Components.interfaces.nsIPrefBranch );
            if ( pref ) {
                gPrintSettingsAreGlobal = pref.getBoolPref( "print.use_global_printsettings", false );
                gSavePrintSettings = pref.getBoolPref( "print.save_print_settings", false );
            }

            try {
                var PSSVC = Components.classes[ "@mozilla.org/gfx/printsettings-service;1" ]
                    .getService( Components.interfaces.nsIPrintSettingsService );
                if ( gPrintSettingsAreGlobal ) {
                    printSettings = PSSVC.globalPrintSettings;
                // do not set default...
                // this.setPrinterDefaultsForSelectedPrinter( PSSVC, printSettings );
                } else {
                    printSettings = PSSVC.newPrintSettings;
                    this.log( this.dump( PSSVC.newPrintSettings ) );
                }
            } catch ( e ) {
                dump( "getPrintSettings: " + e + "\n" );
            }*/
            
            var printSettingsService =
                Components.classes[ "@mozilla.org/gfx/printsettings-service;1" ]
                .getService( Components.interfaces.nsIPrintSettingsService );
            
            var printSettings;
            printSettings = printSettingsService.newPrintSettings;
            this._printSettings = printSettings;
        
            printSettings.showPrintProgress = true;
            printSettings.printSilent = true; // to show printing dialog or not.
            
            //printSettings.paperSizeUnit = Components.interfaces.nsIPrintSettings.kPaperSizeMillimeters;
            //printSettings.paperSizeUnit = Components.interfaces.nsIPrintSettings.kPaperSizeInches;
            this.setPaperSizeUnit( printSettings.kPaperSizeMillimeters );
            
            //printSettings.orientation = Components.interfaces.nsIPrintSettings.kPortraitOrientation;
            //printSettings.orientation = Components.interfaces.nsIPrintSettings.kLandscapeOrientation;
            this.setPaperOrientation( "portrait" );
            
            //printSettings.headerStrRight = _( "Generated by VIVIPOS" );
            //printSettings.headerStrLeft = _( "Firich Enterprises Co.,Ltd." );
            this.setPaperHeader( ' ' );
            
            printSettings.shrinkToFit = true;
            printSettings.printToFile = true;
            
            /*printSettings.edgeLeft = 0; // in inch.
            printSettings.edgeRight = 0;
            printSettings.edgeTop = 0;
            printSettings.edgeBottom = 0;*/
            this.setPaperEdge( 0, 0, 0, 0 );
            
            //printSettings.marginTop = 0.15; // in inch.
            //printSettings.marginLeft = 0;
            //printSettings.marginRight = 0;
            //printSettings.marginBottom = 0.15;
            this.setPaperMargin( 0, 0, 0.15, 0.15 );
            
            printSettings.unwriteableMarginBottom = printSettings.unwriteableMarginTop;
            printSettings.unwriteableMarginLeft = printSettings.unwriteableMarginRight;

            //printSettings.paperHeight = 297;// the size of A4 paper in milli-meter.
            //printSettings.paperWidth = 210;
            this.setPaperSize( 210, 297 );
            
            //printSettings.paperHeight = 11.69;// the size of A4 paper in inch.
            //printSettings.paperWidth = 8.27;
            
            //printSettings.paperName = "iso_a4";
            //printSettings.paperName = "na_letter";
            this.setPaperName( "iso_a4" );
            
            // save the print settings to prefs since the method showPageSetup always read print settings from prefs.
            //printSettingsService.savePrintSettingsToPrefs( printSettings, false, printSettings.kInitSaveAll );

            return printSettings;
        }
    };

    var BrowserPrintComponent = window.BrowserPrintComponent = GeckoJS.Component.extend( __component__ );
} )();

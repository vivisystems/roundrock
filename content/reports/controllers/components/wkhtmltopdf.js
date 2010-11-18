( function() {

    var __component__ = {
        
        name: "Wkhtmltopdf",
        extId: "wkhtmltopdf@vivipos.com.tw",
        extPkg: "wkhtmltopdf",
        _blockSize: 65536,

        fullFileName: "",

        exists: function() {
            var filename = "";
            if (!GREUtils.isWindow()) {
                filename = "chrome://" + this.extPkg + "/content/unix/wkhtmltopdf";
            }else {
                filename = "chrome://" + this.extPkg + "/content/windows/wkhtmltopdf.exe";
            }
            
            var fullFilename = "";
            try {
                fullFilename = GREUtils.File.chromeToPath(filename) || "";
            }catch(e) {
            }

            this.fullFileName = fullFilename;

            if (fullFilename.length >0) {
                return GREUtils.File.exists(fullFilename);
            }
            return false;

        },

        execute: function( cmd, param ) {
            try {
                var exec = new GeckoJS.File( cmd );
                var r = exec.run( param, true );
                // this.log("ERROR", "Ret:" + r + "  cmd:" + cmd + "  param:" + param);
                exec.close();
                return true;
            } catch ( e ) {
                NotifyUtils.warn( _( 'Failed to execute command (%S).', [ cmd + ' ' + param ] ) );
                return false;
            }
        },

        exportToPdf: function( pdfFileName, paperProperties, datas, rep_tpl, layout_tpl, caption, progress ) {

            if ( !pdfFileName ) {
                // need filename
                return;
            }

            var htmlFileName = pdfFileName + ".html";

            try {
                if( caption.tagName != 'caption' )
                    caption = null;

                // release cpu to update ui
                this.sleep( 10 );

                var selectedCharSet = GREUtils.Pref.getPref('vivipos.fec.registry.import_export.charset') || 'utf-8';

                var output = GREUtils.Charset.convertFromUnicode( layout_tpl.process( {report_content: rep_tpl.process( datas )} ), selectedCharSet );

                var bufLength = output.length;
                var blockCount = Math.ceil( bufLength / this._blockSize );

                var onProgressChange = function( curTot, maxTot ) {
                    var numReachingMaxTot =  0;
                    //dump('onProgressChange ' + maxSelf  + '\n');
                    if ( curTot == maxTot )
                        numReachingMaxTot++;
                    if ( numReachingMaxTot > 1 )
                        return;

                    if( caption ) {
                        if( caption.label.match( /\(.*\)/ ) ) {
                            caption.label = caption.label.replace( /\(.*\)/, '(' + GeckoJS.NumberHelper.toReadableSize( curTot )
                                                                             + '/' + GeckoJS.NumberHelper.toReadableSize( maxTot )
                                                                             + ')' );
                        } else {
                            caption.label += ' (' + GeckoJS.NumberHelper.toReadableSize( curTot )
                                           + '/' + GeckoJS.NumberHelper.toReadableSize( maxTot ) +')';
                        }
                    }
                    progress.value = parseInt( curTot / maxTot * 100 );
                };

                var saveFile = new GeckoJS.File( htmlFileName, true );

                saveFile.open( "wb" );

                var offsetCount = 0;
                while( offsetCount < blockCount ) {

                    saveFile.write( output.substr( offsetCount * this._blockSize, this._blockSize ) );
                    
                    onProgressChange( offsetCount * this._blockSize, ( bufLength + 1 ) );
                    offsetCount++;
                    // sleep for release cpu to update ui
                    this.sleep( 10 );
                    
                }
                // add newline at last line
                saveFile.write( "\n" );
                onProgressChange( ( bufLength + 1 ), ( bufLength + 1 ) );
                this.sleep( 10 );

                saveFile.close();

                // initial style directory to tmp directory
                try {

                    var sizeMin = Math.ceil(bufLength/(1024*1024));
                    caption.label = caption.label.replace( /\(.*\)/, '(' + _('About %S Mins', [sizeMin]) + ')');
                    // sleep for release cpu to update ui
                    this.sleep( 10 );

                    var tmpFilePath = GREUtils.File.getFile(htmlFileName).parent.path;
                    var stylePath = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/style/");
                    this.execute( "/bin/cp", [ "-fr", stylePath, tmpFilePath] );

                    var orientation = "Portrait";

                    if (paperProperties && paperProperties.paperSize) {
                        if(paperProperties.paperSize.width > paperProperties.paperSize.height) orientation = "Landscape";
                    }

                    var headerRight = _( "Generated by VIVIPOS" );
                    var footerLeft = "[page] / [topage]"
                    var footerRight = "[date] [time]"

                    // export to pdf
                    this.execute(this.fullFileName, ["--page-size", "A4", "--orientation", orientation, "--print-media-type",
                        "--header-font-name", "Sans", "--header-font-size", "8", "--footer-font-name", "Sans", "--footer-font-size", "8",
                        "--margin-top", "10", "--margin-bottom", "10",
                        "--header-spacing", "3", "--footer-spacing", "3",
                        "--header-right", headerRight, "--footer-left", footerLeft, "--footer-right", footerRight,
                        htmlFileName, pdfFileName]);

                    if (GREUtils.File.exists(pdfFileName)) {
                        // remove temp html and style
                        this.execute( "/bin/rm", [ "-fr", tmpFilePath+"/style" ] );
                        this.execute( "/bin/rm", [ "-f", htmlFileName ] );
                    }

                    // sync to media...
                    this.execute( "/bin/sh", [ "-c", "/bin/sync; /bin/sleep 1; /bin/sync;" ] );

                }catch(e) {
                    //
                }

            }
            catch( e ) {
                this.log( 'ERROR', 'exportPDF: ' + e );
                throw e;
            } finally {
            }
        }
    };

    var WkhtmltopdfComponent = window.WkhtmltopdfComponent = GeckoJS.Component.extend( __component__ );
})();

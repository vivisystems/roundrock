( function() {

    var __component__ = {
        
        name: "Wkhtmltopdf",
        extId: "wkhtmltopdf@vivipos.com.tw",
        extPkg: "wkhtmltopdf",
        _blockSize: 4096,

        exists: function() {
            var filename = "";
            if (!GREUtils.isWindow()) {
                filename = "chrome://" + this.extPkg + "/content/unix/wkhtmltopdf";
            }else {
                filename = "chrome://" + this.extPkg + "/content/windows/wkhtmltopdf.exe";
            }
            alert(filename);
            var fullFilename = "";
            try {
                fullFilename = GREUtils.File.chromeToPath(filename) || "";
            }catch(e) {
            }
            alert(fullFilename);
            return true;
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
            alert(pdfFileName);

            if ( !pdfFileName ) {
                // need filename
                return;
            }

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

                var saveFile = new GeckoJS.File( pdfFileName, true );

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
                
                // sync to media...
                this.execute( "/bin/sh", [ "-c", "/bin/sync; /bin/sleep 1; /bin/sync;" ] );
                alet('done');
            }
            catch( e ) {
                this.log( 'ERROR', 'exportCSV: ' + e );
                throw e;
            } finally {
            }
        }
    };

    var WkhtmltopdfComponent = window.WkhtmltopdfComponent = GeckoJS.Component.extend( __component__ );
})();

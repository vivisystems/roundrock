( function() {
    /**
     * RptCashByClerk Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        
        name: 'RptCashByClerk',
        
        _fileName: 'rpt_cash_by_clerk',
        
        _set_reportData: function( start, end, shiftNo, terminalNo, limit ) {
            var d = new Date();
            d.setTime( start );
            var start_str = d.toString( 'yyyy/MM/dd HH:mm' );
            d.setTime( end );
            var end_str = d.toString( 'yyyy/MM/dd HH:mm' );

            start = parseInt(start / 1000, 10);
            end = parseInt(end / 1000, 10);

            let currencies = GeckoJS.Session.get('Currencies') || [];
            let localCurrency = '';
            if (currencies && currencies[0] && currencies[0].currency && currencies[0].currency.length > 0) {
                localCurrency = currencies[0].currency;
            }

            var fields = [];
            var conditions = "shift_changes.sale_period >= '" + start +
                            "' AND shift_changes.sale_period <= '" + end +
                            "'";
            
            if ( shiftNo.length > 0 )
            	conditions += " and shift_changes.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
            
            if (terminalNo.length > 0)
                conditions += " AND shift_changes.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";

            var groupby = '';

            var orderby = 'shift_changes.sale_period, shift_changes.terminal_no';

            // restore shift change details from backup first
            var shiftChangeDetails = new ShiftChangeDetailModel();
            shiftChangeDetails.restoreFromBackup();

            var shiftChange = new ShiftChangeModel();
            var records = shiftChange.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 2, limit: this._csvLimit } );

            records.forEach(function(o){
                var d = new Date();
                d.setTime( o.starttime * 1000 ); // multiplying one thousand so that the time can be in the millisecond scale.
                o.starttime = d.toString('yy/MM/dd HH:mm');
                d.setTime( o.endtime * 1000 );
                o.endtime = d.toString('yy/MM/dd HH:mm');

                // process shift change details for display purposes
                let details = o.ShiftChangeDetail || [];
                details.forEach(function(d) {
                    if (d.type != 'destination') {
                        if (d.count < 0) {
                            //groupable payment; append amount to name
                            if (d.type != 'cash' || d.name == '' || d.name == localCurrency) {
                                // format payments in local currency
                                d.name += ' ' + this.formatPrice(d.change);
                            }
                            else {
                                // don't format foreign currency
                                d.name += ' ' + d.change;
                            }
                        }
                    }
                }, this);
            }, this);
            
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.cashbyclerk.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_id = terminalNo;
            
            this._reportRecords.body = records;
        },
        
        _set_reportRecords: function( limit ) {
            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 )
                limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;
            
            var shiftNo = document.getElementById( 'shift_no' ).value;

            var terminalNo = document.getElementById( 'terminal_no' ).value;
            
            this._set_reportData( start, end, shiftNo, terminalNo );
        },
        
        set_reportRecords: function( parameters ) { // used while doing shift change.
            document.getElementById( 'start_date' ).value = parameters.start;
            document.getElementById( 'end_date' ).value = parameters.end;
            document.getElementById( 'shift_no' ).value = parameters.shiftNo;
            document.getElementById( 'terminal_no' ).value = parameters.terminalNo;

            this._set_reportData( parameters.start, parameters.end, parameters.shiftNo, parameters.terminalNo );
        },
              
        getProcessedTpl: function( start, end, shiftNo, terminalNo ) {
            // the parameters 'start' and 'end' are both thirteen-digit integer.

            this._set_reportData( start, end, shiftNo, terminalNo );
            this._setTemplateDataHead();

            var path = GREUtils.File.chromeToPath( 'chrome://' + this.packageName + '/content/reports/tpl/' + this._fileName + '/' + this._fileName + '.tpl' );
            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
            
			return tpl.process( this._reportRecords );
        },

        exportCsv: function() {
            this._super(this, true);
        },

        load: function() {
            this._super();
        }
    };

    RptBaseController.extend( __controller__ );
} )();

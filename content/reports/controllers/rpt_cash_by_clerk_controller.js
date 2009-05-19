(function(){

    /**
     * RptCashByClerk Controller
     */
     
     include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        
        name: 'RptCashByClerk',
        
        _fileName: 'rpt_cash_by_clerk',
        
        _set_reportData: function( start, end, shiftNo, terminalNo ) {            
        	var d = new Date();
            d.setTime( start );
            var start_str = d.toString( 'yyyy/MM/dd HH:mm' );
            d.setTime( end );
            var end_str = d.toString( 'yyyy/MM/dd HH:mm' );

            start = parseInt(start / 1000, 10);
            end = parseInt(end / 1000, 10);

            var fields = [];
            var conditions = "shift_changes.sale_period >= '" + start +
                            "' AND shift_changes.sale_period <= '" + end +
                            "'";
            
            if ( shiftNo.length > 0 )
            	conditions += " and shift_changes.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
            
            if (terminalNo.length > 0)
                conditions += " AND shift_changes.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";

            var groupby;

            var orderby = 'shift_changes.terminal_no, shift_changes.sale_period';

            var shiftChange = new ShiftChangeModel();
            var records = shiftChange.find( 'all', { fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: 2 } );

            records.forEach(function(o){
                var d = new Date();
                d.setTime( o.starttime * 1000 ); // multiplying one thousand so that the time can be in the millisecond scale.
                o.starttime = d.toString('yy/MM/dd HH:mm');
                d.setTime( o.endtime * 1000 );
                o.endtime = d.toString('yy/MM/dd HH:mm');
            });
            
            this._reportRecords.head.title = _( 'Shift Change Report' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.machine_id = terminalNo;
            
            this._reportRecords.body = records;
        },
        
        _set_reportRecords: function() {
        	var waitPanel = this._showWaitPanel( 'wait_panel' );

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;
            
            var shiftNo = document.getElementById( 'shift_no' ).value;

            var machineid = document.getElementById( 'machine_id' ).value;
            
            this._set_reportData( start, end, shiftNo, machineid );
        },
        
        set_reportRecords: function( parameters ) { // used while doing shift change.
        	this._set_reportData( parameters.start, parameters.end, parameters.shiftNo, parameters.terminalNo );
        },
        
        printShiftChangeReport: function( start, end, shiftNo, terminalNo ) {
        	// the parameters 'start' and 'end' are both thirteen-digit integer.
        	
        	this._set_reportData( start, end, shiftNo, terminalNo );
        	this._setTemplateDataHead();
        	
        	var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
				.getService( Components.interfaces.nsIWindowMediator ).getMostRecentWindow( 'Vivipos:Main' );
			var rcp = mainWindow.GeckoJS.Controller.getInstanceByName( 'Print' );
			
			var paperSize = rcp.getReportPaperWidth( 'report' ) || '80mm';

            var path = GREUtils.File.chromeToPath( 'chrome://viviecr/content/reports/tpl/' + this._fileName + '/' + this._fileName + '_rcp_' + paperSize + '.tpl' );
            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
       
            rcp.printReport( 'report', tpl, this._reportRecords );
        },
        
        getProcessedTpl: function( start, end, shiftNo, terminalNo ) {
        	// the parameters 'start' and 'end' are both thirteen-digit integer.
        	
        	this._set_reportData( start, end, shiftNo, terminalNo );
        	this._setTemplateDataHead();

            var path = GREUtils.File.chromeToPath( 'chrome://viviecr/content/reports/tpl/' + this._fileName + '/' + this._fileName + '.tpl' );
            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
            
			return tpl.process( this._reportRecords );
        },

        load: function() {
            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = ( new Date( yy,mm,dd,0,0,0 ) ).getTime();
            var end = ( new Date( yy,mm,dd + 1,0,0,0 ) ).getTime();

            document.getElementById( 'start_date' ).value = start;
            document.getElementById( 'end_date' ).value = end;

            this._enableButton( false );
        }
    };

    RptBaseController.extend(__controller__);
})();

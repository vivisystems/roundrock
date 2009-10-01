( function() {
    /**
     * RptHourlySales Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptHourlySales',
        
        _fileName: "rpt_hourly_sales",

        _set_reportRecords: function(limit) {

            limit = parseInt(limit);
            if (isNaN(limit) || limit <= 0) limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;

            var start_str = document.getElementById( 'start_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            var end_str = document.getElementById( 'end_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );

            var terminalNo = document.getElementById( 'terminal_no' ).value;
            var periodType = document.getElementById( 'period_type' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var timeField = periodType;
            if (periodType == 'sale_period') {
                timeField = 'transaction_submitted';
            }
            var fields = [
                            'orders.' + timeField,
                            'orders.terminal_no',
                            'orders.status',
                            'SUM("orders"."total") AS "Order.HourTotal"',
                            'SUM("orders"."item_subtotal") AS "Order.HourGross"',
                            'STRFTIME("%Y-%m-%d",DATETIME("orders"."' + timeField + '", "unixepoch", "localtime")) AS "Order.Date"',
                            'STRFTIME("%H",DATETIME("orders"."' + timeField + '", "unixepoch", "localtime")) AS "Order.Hour"',
                            'COUNT("orders"."id") AS "Order.OrderNum"',
                            'SUM("orders"."no_of_customers") AS "Order.Guests"',
                            'SUM("orders"."qty_subtotal") AS "Order.ItemsCount"'
                        ];

            var conditions = "orders." + periodType + ">='" + start +
                            "' AND orders." + periodType + "<='" + end +
                            "' AND orders.status='1'";

            var groupby;
            if (terminalNo.length > 0) {
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";
                groupby = 'orders.terminal_no,"Order.Date", "Order.Hour"';
            } else {
                groupby = '"Order.Date", "Order.Hour"';
            }

            
            var orderby = '"Order.Date", "Order.Hour"';

            var order = new OrderModel();
            var records = order.find( 'all', {fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: -1, limit: limit} );

            //var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            //var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;
            
            if ( sortby != 'all' ) {
            	records.sort(
            		function ( a, b ) {
            			a = a[ sortby ];
            			b = b[ sortby ];
            			
            			switch ( sortby ) {
            				case 'terminal_no':
            				case 'Hour':
                            case 'Date':
            					if ( a > b ) return 1;
				    			if ( a < b ) return -1;
				    			return 0;
            				case 'OrderNum':
            				case 'HourTotal':
            				case 'Guests':
            				case 'ItemsCount':
            					if ( a < b ) return 1;
				    			if ( a > b ) return -1;
				    			return 0;
				    	}
            		}
            	);
            }

            var HourTotal = 0;
            var HourGross = 0;
            var OrderNum = 0;
            var Guests = 0;
            var ItemsCount = 0;

            records.forEach( function(o) {
                // compute hourly averages
                o.NetPerOrder = (o.OrderNum > 0) ? o.HourTotal / o.OrderNum : 0;
                o.NetPerGuest = (o.Guests > 0) ? o.HourTotal / o.Guests : 0;

                o.GrossPerOrder = (o.OrderNum > 0) ? o.HourGross / o.OrderNum : 0;
                o.GrossPerGuest = (o.Guests > 0) ? o.HourGross / o.Guests : 0;

                // sum
                HourTotal += o.HourTotal;
                HourGross += o.HourGross;
                OrderNum += o.OrderNum;
                Guests += o.Guests;
                ItemsCount += o.ItemsCount;

                //o.HourTotal = GeckoJS.NumberHelper.round(o.HourTotal, precision_prices, rounding_prices) || 0;
                //o.HourTotal = o.HourTotal.toFixed(precision_prices);
            } );

            //HourTotal = GeckoJS.NumberHelper.round(HourTotal, precision_prices, rounding_prices) || 0;
            //HourTotal = HourTotal.toFixed(precision_prices);

            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.hourlysales.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminalNo;

            this._reportRecords.body = records;

            this._reportRecords.foot.HourTotal = HourTotal;
            this._reportRecords.foot.OrderNum = OrderNum;
            this._reportRecords.foot.Guests = Guests;
            this._reportRecords.foot.ItemsCount = ItemsCount;
            this._reportRecords.foot.NetPerOrder = (OrderNum > 0) ? HourTotal / OrderNum : 0;
            this._reportRecords.foot.NetPerGuest = (Guests > 0) ? HourTotal / Guests : 0;
            this._reportRecords.foot.GrossPerOrder = (OrderNum > 0) ? HourGross / OrderNum : 0;
            this._reportRecords.foot.GrossPerGuest = (Guests > 0) ? HourGross / Guests : 0;
        },

        exportCsv: function() {
            this._super(this);
        },

        load: function() {
            this._super();
            
            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = (new Date(yy,mm,dd,0,0,0)).getTime();
            var end = (new Date(yy,mm,dd + 1,0,0,0)).getTime();

            document.getElementById('start_date').value = start;
            document.getElementById('end_date').value = end;
        }
    };

    RptBaseController.extend( __controller__ );
} )();

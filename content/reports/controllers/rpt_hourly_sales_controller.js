(function(){

    /**
     * RptHourlySales Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptHourlySales',
        
        _fileName: "rpt_hourly_sales",

        _set_reportRecords: function() {
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toString('yyyy/MM/dd HH:mm');
            var end_str = document.getElementById('end_date').datetimeValue.toString('yyyy/MM/dd HH:mm');

            var machineid = document.getElementById('machine_id').value;
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt(start / 1000, 10);
            end = parseInt(end / 1000, 10);

            var fields = [
            				'orders.transaction_created',
                            'orders.terminal_no',
                            'orders.status',
                            'SUM("orders"."total") AS "Order.HourTotal"',
                            // 'STRFTIME("%Y-%m-%d %H","orders"."transaction_created_format") AS "Order.Hour"',
                            'STRFTIME("%Y-%m-%d %H",DATETIME("orders"."transaction_created", "unixepoch", "localtime")) AS "Order.Hour"',
                            'COUNT("orders"."id") AS "Order.OrderNum"',
                            'SUM("orders"."no_of_customers") AS "Order.Guests"',
                            'SUM("orders"."items_count") AS "Order.ItemsCount"'
                        ];

            var conditions = "orders.transaction_created>='" + start +
                            "' AND orders.transaction_created<='" + end +
                            "' AND orders.status='1'";
            if (machineid.length > 0) {
                conditions += " AND orders.terminal_no LIKE '" + machineid + "%'";
                var groupby = 'orders.terminal_no,"Order.Hour"';
            } else {
                var groupby = '"Order.Hour"';
            }

            
            var orderby = '"' + sortby + '" desc';//orders.transaction_created';

            var order = new OrderModel();
            var records = order.find( 'all', {fields: fields, conditions: conditions, group: groupby, order: orderby, recursive: -1} );

            var rounding_prices = GeckoJS.Configure.read('vivipos.fec.settings.RoundingPrices') || 'to-nearest-precision';
            var precision_prices = GeckoJS.Configure.read('vivipos.fec.settings.PrecisionPrices') || 0;
            
            if ( sortby != 'all' ) {
            	records.sort(
            		function ( a, b ) {
            			a = a[ sortby ];
            			b = b[ sortby ];
            			
            			switch ( sortby ) {
            				case 'terminal_no':
            				case 'Hour':
            					if ( a > b ) return 1;
				    			if ( a < b ) return -1;
				    			return 0;
            				case 'HourTotal':
            				case 'OrderNum':
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
            var OrderNum = 0;
            var Guests = 0;
            var ItemsCount = 0;

            records.forEach( function(o) {
                HourTotal += o.HourTotal;
                OrderNum += o.OrderNum;
                Guests += o.Guests;
                ItemsCount += o.ItemsCount;

                o.HourTotal = GeckoJS.NumberHelper.round(o.HourTotal, precision_prices, rounding_prices) || 0;
                o.HourTotal = o.HourTotal.toFixed(precision_prices);
            } );

            HourTotal = GeckoJS.NumberHelper.round(HourTotal, precision_prices, rounding_prices) || 0;
            HourTotal = HourTotal.toFixed(precision_prices);

			this._reportRecords.head.title = _( 'Hourly Sales Report' );
			this._reportRecords.head.start_time = start_str;
			this._reportRecords.head.end_time = end_str;
			this._reportRecords.head.machine_id = machineid;
			
			this._reportRecords.body = records;
			
			this._reportRecords.foot.HourTotal = HourTotal;
			this._reportRecords.foot.OrderNum = OrderNum;
			this._reportRecords.foot.Guests = Guests;
			this._reportRecords.foot.ItemsCount = ItemsCount;
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

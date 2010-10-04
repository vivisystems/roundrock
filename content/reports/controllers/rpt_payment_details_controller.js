( function() {
    /**
     * RptPaymentDetails Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        name: 'RptPaymentDetails',
        
        _fileName: 'rpt_payment_details',

        _set_reportRecords: function( limit ) {
            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 ) limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;

            //var start_str = document.getElementById( 'start_date' ).datetimeValue.toLocaleString();
            //var end_str = document.getElementById( 'end_date' ).datetimeValue.toLocaleString();
            var start_str = document.getElementById( 'start_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            var end_str = document.getElementById( 'end_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );

            var terminal_no = document.getElementById( 'terminal_no' ).value;
            var shiftNo = document.getElementById( 'shift_no' ).value;
            var periodType = document.getElementById( 'period_type' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;
            var payment_type = document.getElementById( 'payment_type' ).value;

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var timeField = periodType;
            if (periodType == 'sale_period') {
                timeField = 'created';
            }
            var fields = [
                'order_payments.name as "type"',
                'order_payments.memo1 as "subtype"',
                'order_payments.memo2 as "memo"',
                'order_payments.amount as "amount"',
                'order_payments.origin_amount as "origin_amount"',
                'order_payments.order_items_count as "count"',
                'order_payments.is_groupable as "is_groupable"',
                'order_payments.service_clerk_displayname',
                'order_payments.sale_period',
                'order_payments.shift_number',
                'order_payments.terminal_no',
                'order_payments.' + timeField + ' as "time"',
                'orders.id',
                'orders.sequence',
                'orders.status'
            ];

            var conditions = "order_payments." + periodType + ">='" + start +
            "' AND order_payments." + periodType + "<='" + end + "'";
                            
            if ( terminal_no.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminal_no ) + "%'";
                
            if ( shiftNo.length > 0 )
                conditions += " AND order_payments.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";

            switch(payment_type) {
                case 'all':
                    // skip non-groupable cash
                    conditions += " AND (order_payments.name != 'cash' OR order_payments.memo2 NOT NULL OR order_payments.is_groupable = 1)"
                    break;

                case 'groupables':
                    conditions += " AND order_payments.is_groupable = 1";
                    break;

                default:
                    conditions += " AND order_payments.name = '" + payment_type + "'";
                    break;
            }

            var orderby = 'order_payments.name, order_payments.created';
            
           // initial order history if user selected it.
            var useDbConfig = this.initOrderHistoryDatabase();

            var orderPayment = new OrderPaymentModel();

            orderPayment.useDbConfig = useDbConfig; // udpate dbconfig
            
            var counts = orderPayment.getDataSource().fetchAll('SELECT count (*) as "rowCount" ' + '  FROM order_payments LEFT JOIN orders ON ("order_payments"."order_id" = "orders"."id" )  WHERE ' + conditions);
            var rowCount = counts[0].rowCount;

            var datas = orderPayment.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM order_payments LEFT JOIN orders ON ("order_payments"."order_id" = "orders"."id" )  WHERE ' + conditions + ' ORDER BY ' + orderby + ' LIMIT 0, ' + limit);

            //prepare reporting data
            var repDatas = {};

            var Currencies = GeckoJS.Session.get('Currencies');
            var localCurrencySymbol = '';
            if (Currencies && Currencies.length > 0) {
                localCurrencySymbol = Currencies[0].currency || _('(rpt)cash');
            }

            let lastType;
            let lastTypeRecords;
            datas.forEach( function( data ) {

                if (data.type != lastType) {

                    records = repDatas[data.type] = [];
                    lastType = data.type;
                }

                switch(data.type) {
                    case 'cash':
                        // cash in local currency
                        if (data.subtype == '' || data.subtype == localCurrencySymbol) {
                            data.subtype = localCurrencySymbol;
                        }
                        else {
                        // cash in foreign currency
                            data.amount = data.origin_amount;
                        }
                        break;

                    case 'creditcard':
                    case 'coupon':
                        break;

                    case 'giftcard':
                        break;

                    case 'ledger':
                        break;
                }
                
                if (data.is_groupable) {
                    data.facevalue = data.origin_amount
                }
                else {
                    data.facevalue = '';
                    data.count = '';
                }

                records.push(data);
            });

            for (paymentType in repDatas) {
                let records = repDatas[paymentType];
                records.sort(
                    function ( a, b ) {
                        a = a[ sortby ];
                        b = b[ sortby ];
            			
                        switch ( sortby ) {
                            case 'terminal_no':
                            case 'time':
                            case 'sequence':
                            case 'subtype':
                                if ( a > b ) return 1;
                                if ( a < b ) return -1;
                                return 0;
                            case 'facevalue':
                                if ( a < b ) return 1;
                                if ( a > b ) return -1;
                                return 0;
                        }
                    });
            }

            this._datas = repDatas;
            
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.paymentdetails.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminal_no;
			
            this._reportRecords.body = this._datas;
        },
        
        exportCsv: function() {
            this._super(this);
        },

        execute: function() {
            this._super();
            this._registerOpenOrderDialog();
        },
        
        exportPdf: function() {
            this._super( {
                paperSize: {
                    width: 297,
                    height: 210
                }
            } );
        },
        
        print: function() {
            this._super( {
                orientation: "landscape"
            } );
        },
        
        load: function() {
            this._super();
        }
    };

    RptBaseController.extend( __controller__ );
} )();

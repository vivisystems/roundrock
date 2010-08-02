( function() {
    /**
     * Product Sales Return Controller  
     */
    
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );
 
    var __controller__ = {

        name: 'RptProductSalesReturn',
        
        _fileName: "rpt_product_sales_return",
       
        /* 
        //
        // Function object that Set what data is to be collected from the screen, and how they are processed
        // (1) Start DateTime
        // (2) End DateTime
        // (3) Period Type - this is basically the Order created time such as (a) order opened, (b) order closed 
        //                  as well as if user defined sales period is to be used, e.g business operating days.
        // (4) Shift No
        // (5) Sortby
        // (6) Terminal No
        // (7) Department
        // (8) Limit
        */

        _setData: function( start, end, periodType, shiftNo, sortby, terminalNo, department, returntype, displaymode, breakoutSetmenu, limit ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
            var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );

            // Convert the input to second  
            // Convert to second from milli-second and is base 10
            //

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );
           
            // Instantiate a new Order Item 
            // OrderItemModel represents vivipos_order.order_items table 
            //

            var orderItem = new OrderItemModel();


            // Define the fields we want to retrive from the OrderItem object
            // please note that "net" result is the sum of current subtotal plus surcharge or discount applied 

            var fields = [
                'order_items.product_no',
                'order_items.product_name',
                'order_items.sale_unit',
                'order_items.cate_no',
                'order_items.cate_name',
                'SUM(abs(order_items.current_qty)) as qty',
                'SUM(abs(order_items.weight)) as weight',
                'SUM(abs(order_items.current_subtotal)) as gross',
                'SUM(abs(order_items.current_subtotal) - order_items.current_discount + order_items.current_surcharge) as net'
            ];

            var groupby = '';
            if (displaymode == 'detailed') {
                fields = fields.concat(['order_items.order_id',
                                        'orders.status as status',
                                        'sequence as "order_sequence"']);
                groupby = 'order_items.order_id, order_items.product_no, order_items.product_name, order_items.sale_unit, order_items.cate_no, order_items.cate_name, orders.status';
            }
            else {
                groupby = 'order_items.product_no, order_items.product_name, order_items.sale_unit, order_items.cate_no, order_items.cate_name';
            }
            
            // Define the filtering condition
            //

            var conditions = "orders." + periodType + ">='" + start +
                "' AND orders." + periodType + "<='" + end + "'";

            switch(returntype) {
                case 'all':
                    conditions += ' AND ((orders.status = 1 AND (order_items.current_qty < 0 OR order_items.weight < 0)) OR ' +
                                        '(orders.status = -2 AND (order_items.current_qty > 0 OR order_items.weight > 0)))';
                    break;

                case 'item':
                    conditions += ' AND (orders.status = 1 AND (order_items.current_qty < 0 OR order_items.weight < 0))';
                    break;

                case 'order':
                    conditions += ' AND (orders.status = -2 AND (order_items.current_qty > 0 OR order_items.weight > 0))';
                    break;
            }
            
            if (terminalNo.length > 0)
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";
            
            if ( shiftNo.length > 0 )
                conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";

            if ( !breakoutSetmenu )
                conditions += " AND (order_items.parent_index IS NULL OR order_items.parent_index = '')";
            
            var orderby = '';

            switch( sortby ) {
                case 'avg_price':
                case 'qty':
                case 'gross':
                case 'net':
                    orderby = '"OrderItem.' + sortby + '" desc';
                    break;

                default:
                    orderby = sortby;
                    break;

            }
            
            if ( department != 'all' ) {
                conditions += " AND order_items.cate_no = '" + this._queryStringPreprocessor( department ) + "'";
            }
            

           // Define a categories array
           // Hold information to be assign to the template body
           //

           var categories = {};

           var orderItemRecords = orderItem.getDataSource().fetchAll('SELECT ' + fields.join(', ') + ' FROM orders INNER JOIN order_items ON ("orders"."id" = "order_items"."order_id" )  WHERE ' + conditions + ' GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT 0, ' + this._csvLimit);

           orderItemRecords.forEach( function( record ) {

                if (record['weight'] > 0) {
                    record['units'] = 0;
                    record['avg_price'] = record['gross'] / record['weight'];
                    record['quantity'] = record['weight'] + record['sale_unit'];
                }
                else {
                    record['units'] = record['qty'];
                    if (record['qty'] != 0) {
                        record[ 'avg_price' ] = record[ 'gross' ] / record[ 'units' ];
                    }
                    else {
                        record[ 'avg_price' ] = 0.0;
                    }
                    record['quantity'] = '';
                }
                
                // Here assigne record info into the categories array.
                // The structure, is by category and then by order item 
                //
                //Initialized the data place holder if undefined 
                //

                if ( categories[ record.cate_no ] === undefined ) {
                    categories[ record.cate_no ] = {};
                    categories[ record.cate_no ].no =  record.cate_no;
                    categories[ record.cate_no ].name =  record.cate_name;
                }
                  
           
                if ( categories[ record.cate_no ].orderItems === undefined ) {
                    //Initialize it if undefined
                    categories[ record.cate_no ].orderItems = [];
                }
                categories[ record.cate_no ].orderItems.push( record );

                // add the category summary info 
                //
            
                // Initiate category summary if undefined
                // 
                if ( categories[ record.cate_no ].summary === undefined )  
                    categories[ record.cate_no ].summary = {};

                if ( categories[ record.cate_no ].summary.units === undefined )
                    categories[ record.cate_no ].summary.units = record.units;
                else  
                    categories[ record.cate_no ].summary.units += record.units;
                

                // add the gross summary figure
                //
                if ( categories[ record.cate_no ].summary.gross === undefined ) 
                    categories[ record.cate_no ].summary.gross = record.gross;
                else 
                    categories[ record.cate_no ].summary.gross += record.gross;
                

                // add the net figure
                //
                if ( categories[ record.cate_no ].summary.net === undefined ) 
                    categories[ record.cate_no ].summary.net = record.net;
                else 
                    categories[ record.cate_no ].summary.net += record.net;
               
            } );

	
            /*	     
            // Already sort in the SQL statement
            // for sorting.
            if ( sortby != 'all' ) {
                for ( var category in categories ) {
                    categories[ category ].orderItems.sort(
                        function ( a, b ) {
                            a = a[ sortby ];
                            b = b[ sortby ];

                            switch ( sortby ) {
                                case 'avg_price':
                                case 'qty':
                                case 'gross':
                                case 'net':
                                    if ( a < b ) return 1;
                                    if ( a > b ) return -1;
                                    return 0;
                                case 'product_no':
                                case 'product_name':
                                    if ( a > b ) return 1;
                                    if ( a < b ) return -1;
                                    return 0;
                            }
                        }
                        );
                }
            }
            */

            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.productsalesreturn.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminalNo;

            this._reportRecords.body = categories;
        },

        _set_reportRecords: function( limit ) {

            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 ) limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;

            var terminalNo = document.getElementById( 'terminal_no' ).value;
            
            var periodType = document.getElementById( 'periodtype' ).value;
            var shiftNo = document.getElementById( 'shiftno' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;
            var department = document.getElementById( 'department' ).value;
            var returntype = document.getElementById( 'returntype' ).value;
            var displaymode = document.getElementById( 'displaymode' ).value;
            var breakoutSetmenu = document.getElementById( 'breakout_setmenu' ).checked;

            this._setData( start, end, periodType, shiftNo, sortby, terminalNo, department, returntype, displaymode, breakoutSetmenu, limit );
        },

        set_reportRecords: function( parameters ) {

            document.getElementById( 'start_date' ).value = parameters.start;
            document.getElementById( 'end_date' ).value = parameters.end;

            document.getElementById( 'terminal_no' ).value = parameters.terminalNo;

            document.getElementById( 'periodtype' ).value = parameters.periodtype;
            document.getElementById( 'shiftno' ).value = parameters.shiftno;

            this._setData( parameters.start, parameters.end, parameters.periodtype, parameters.shiftno, 'product_no', parameters.terminalNo, 'all', 'all', 'detailed', false, this._stdLimit );
        },

        printProductReturns: function( start, end, terminalNo, periodType, shiftNo ) {

            this._setData( start, end, periodType, shiftNo, 'product_no', terminalNo, 'all', 'all', 'detailed', false, this._stdLimit );
            this._setTemplateDataHead();

            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                            .getService( Components.interfaces.nsIWindowMediator ).getMostRecentWindow( 'Vivipos:Main' );
            var rcp = mainWindow.GeckoJS.Controller.getInstanceByName( 'Print' );

            var paperSize = rcp.getReportPaperWidth( 'report' ) || '80mm';

            var path = GREUtils.File.chromeToPath( 'chrome://viviecr/content/reports/tpl/' + this._fileName + '/' + this._fileName + '_rcp_' + paperSize + '.tpl' );
            var file = GREUtils.File.getFile( path );
            var tpl = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );

            $do( '_set_queryForm', null, 'RptProductSalesReturn' );
            rcp.printReport( 'report', tpl, this._reportRecords );
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

        
        exportCsv: function() {
            this._super( this, true );
        },


        load: function() {
            this._super();
            
            // setup the department menu.
            var cate = new CategoryModel();
            var cateRecords = cate.find( 'all', {
                fields: [ 'no', 'name' ]
            } );
            var dpt = document.getElementById( 'department_menupopup' );

            cateRecords.forEach( function( data ){
                var menuitem = document.createElementNS( "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem" );
                menuitem.setAttribute( 'value', data.no );
                menuitem.setAttribute( 'label', data.no + "-" + data.name );
                dpt.appendChild( menuitem );
            });
        }
    };

    RptBaseController.extend( __controller__ );
} )();

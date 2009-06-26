( function() {
    /**
     * RptDailySales Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        name: 'RptYourOrder',
        
        _fileName: 'rpt_your_order',
        
        _reportWidthTextBoxId: 'report_width',
        
        _fieldPickerScrollPanelId: 'fieldpickerscrollpanel',
        _fieldPickerPanelId: 'field_picker_panel',
        _fieldPickerBox: 'field_picker_box',
        
        _field_pref_prefix: 'vivipos.fec.report.yourorder',
        
        _fields: null,
        _fields_array: null,
        _selectedFieldIncies: null,
        _pickedFields: null,

        _set_reportRecords: function( limit ) {
            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 ) limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;

            var start_str = document.getElementById( 'start_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            var end_str = document.getElementById( 'end_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );

            var terminal_no = document.getElementById( 'terminal_no' ).value;
            var shiftNo = document.getElementById( 'shift_no' ).value;
            var periodType = document.getElementById( 'period_type' ).value;
            
            var sortby = document.getElementById( 'sortby' ).value;

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            var timeField = periodType;
            if (periodType == 'sale_period') {
                timeField = 'transaction_submitted';
            }
            var fields = [
                'sum(order_payments.amount - order_payments.change) as "payment_subtotal"',
                'order_payments.name as "payment_name"',
                'orders.' + timeField + ' as "time"',
                'orders.*'
            ];

            var conditions = "orders." + periodType + ">='" + start +
                "' AND orders." + periodType + "<='" + end +
                "' AND orders.status=1";
                            
            if ( terminal_no.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminal_no ) + "%'";
                
            if ( shiftNo.length > 0 )
                conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
                
            var groupby = 'orders.id, payment_name';
            var orderby = 'orders.' +  timeField;
            
            var orderPayment = new OrderPaymentModel();
            
            var datas = orderPayment.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders INNER JOIN order_payments ON ("orders"."id" = "order_payments"."order_id" )  WHERE ' +
                conditions + '  GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT 0, ' + limit);

            //prepare reporting data
            var repDatas = {};

            var footDatas = {
                tax_subtotal: 0,
                item_subtotal: 0,
                total: 0,
                surcharge_subtotal: 0,
                discount_subtotal: 0,
                promotion_subtotal: 0,
                revalue_subtotal: 0,
                payment: 0,
                cash: 0,
                check: 0,
                creditcard: 0,
                coupon: 0,
                giftcard: 0,
                no_of_customers: 0,
                qty_subtotal: 0,
                items_count: 0,
                change: 0,
                invoice_count: 0,
                included_tax_subtotal: 0
            };
            
            var old_oid;

            datas.forEach( function( data ) {

                data.Order = data;
                var oid = data.Order.id;
                var o = data.Order;
                o.Order = o;

                if ( !repDatas[ oid ] ) {
                    repDatas[ oid ] = GREUtils.extend( {}, o ); // {cash:0, creditcard: 0, coupon: 0}, o);
                }
				
                if ( old_oid != oid ) {
                    repDatas[ oid ][ 'payment' ] = 0.0;
                    repDatas[ oid ][ 'cash' ] = 0.0;
                    repDatas[ oid ][ 'check' ] = 0.0;
                    repDatas[ oid ][ 'creditcard' ] = 0.0;
                    repDatas[ oid ][ 'coupon' ] = 0.0;
                    repDatas[ oid ][ 'giftcard' ] = 0.0;
                    
                    // make order status readable.
                    switch ( parseInt( repDatas[ oid ].status, 10 ) ) {
                    case 1:
                        repDatas[ oid ].status = _( '(rpt)completed' );
                        break;
                    case 2:
                        repDatas[ oid ].status = _( '(rpt)stored' );
                        break;
                    case -1:
                        repDatas[ oid ].status = _( '(rpt)canceled' );
                        break;
                    case -2:
                        repDatas[ oid ].status = _( '(rpt)voided' );
                        break;
                }
					
                    //for setting up footdata
                    footDatas.total += o.total;
                    footDatas.surcharge_subtotal += o.surcharge_subtotal;
                    footDatas.discount_subtotal += o.discount_subtotal;
                    footDatas.promotion_subtotal += o.promotion_subtotal;
                    footDatas.revalue_subtotal += o.revalue_subtotal;
                    footDatas.tax_subtotal += o.tax_subtotal;
                    footDatas.item_subtotal += o.item_subtotal;
                    footDatas.qty_subtotal += o.qty_subtotal;
                    footDatas.no_of_customers += o.no_of_customers;
                    footDatas.items_count += o.items_count;
                    footDatas.change += o.change;
                    footDatas.invoice_count += o.invoice_count;
                    footDatas.included_tax_subtotal += o.included_tax_subtotal;
                }
				
                repDatas[ oid ][o.payment_name] += o.payment_subtotal;
                repDatas[ oid ][ 'payment' ] += o.payment_subtotal;
                footDatas[ o.payment_name ] += o.payment_subtotal;
                footDatas[ 'payment' ] += o.payment_subtotal;

                old_oid = oid;
            });

            this._datas = GeckoJS.BaseObject.getValues( repDatas );
           
            if ( sortby != 'all' ) {
                this._datas.sort(
                    function ( a, b ) {
                        a = a[ sortby ];
                        b = b[ sortby ];
            			
                        switch ( sortby ) {
                            case 'terminal_no':
                            case 'service_clerk_displayname':
                            case 'proceeds_clerk_displayname':
                            case 'time':
                            case 'discount_subtotal':
                            case 'promotion_subtotal':
                            case 'revalue_subtotal':
                            case 'sequence':
                            case 'invoice_no':
                            case 'status':
                            case 'table_no':
                            case 'check_no':
                            case 'transaction_created':
                            case 'transaction_submitted':
                            case 'member':
                            case 'member_displayname':
                            case 'member_email':
                            case 'member_cellphone':
                            case 'invoice_type':
                            case 'invoice_title':
                            case 'invoice_no':
                            case 'branch_id':
                            case 'branch':
                            case 'transaction_voided':
                            case 'void_clerk':
                            case 'void_clerk_displayname':
                            case 'void_sale_period':
                            case 'void_shift_number':
                            case 'service_clerk':
                            case 'proceeds_clerk':
                                if ( a > b ) return 1;
                                if ( a < b ) return -1;
                                return 0;
                            case 'item_subtotal':
                            case 'tax_subtotal':
                            case 'surcharge_subtotal':
                            case 'total':
                            case 'cash':
                            case 'check':
                            case 'creditcard':
                            case 'coupon':
                            case 'giftcard':
                            case 'items_count':
                            case 'change':
                            case 'included_tax_subtotal':
                            case 'invoice_count':
                                if ( a < b ) return 1;
                                if ( a > b ) return -1;
                                return 0;
                        }
                    }
                );
            }
            
            // contruct pickedFields array.
            this._readFieldsFromPref();
            var pickedFields = this._pickedFields = [];
            this._fields_array.forEach( function( field ) {
                if ( field.ispicked == "true" )
                    pickedFields.push( field );
            } );
            
            this._reportRecords.head.title = _( 'Your Order Report' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminal_no;
            
            this._reportRecords.fields = this._pickedFields;
			
            this._reportRecords.body = GeckoJS.BaseObject.getValues( this._datas );
            this._reportRecords.foot.foot_datas = footDatas;
        },
        
        setPaperSize: function() {
            // set paper size.
            var paperSize = document.getElementById( 'papersize' );
            if ( paperSize )
                paperSize = paperSize.value;
            var iFrame = document.getElementById( 'preview_frame' );
            if ( iFrame )
                iFrame.src = "chrome://viviecr/content/reports/rpt_template" + paperSize + ".html";
        },
        
        exportCsv: function() {
            this._super(this);
        },

        execute: function() {
            this._super();
            this._registerOpenOrderDialog();
            
            // initialize the textbox with id report_width.
            var bw = document.getElementById( this._preview_frame_id );
            var bodydiv = bw.contentWindow.document.getElementById( this._div_id );
            // minus 30 empirically so that at the first time we decrease the width, the width won't increase wrongly.
            // the anomaly is caused by the difference between bodydiv.scrollWidth and bodydiv.style.width.
            document.getElementById( this._reportWidthTextBoxId ).value = bodydiv.scrollWidth - 30;
            
            document.getElementById( this._reportWidthTextBoxId ).disabled = false;
        },
        
        _adjustReportWidth: function( event ) {
            if( event.originalTarget.tagName == "xul:button" ) {
                var bw = document.getElementById( this._preview_frame_id );
                var bodydiv = bw.contentWindow.document.getElementById( this._div_id );
                var bodytable =  bw.contentWindow.document.getElementById( this._body_table );
                var reportWidth = parseInt( document.getElementById( this._reportWidthTextBoxId ).value, 10 );
                
                if ( event.originalTarget.className == "spinbuttons-button spinbuttons-up" ) {
                    bodydiv.style.width = reportWidth;
                } else if ( event.originalTarget.className == "spinbuttons-button spinbuttons-down" ) {
                    if ( bodydiv.scrollWidth > bodytable.scrollWidth + 20 ) {
                        bodydiv.style.width = document.getElementById( this._reportWidthTextBoxId ).value;
                    } else { 
                        document.getElementById( this._reportWidthTextBoxId ).value =
                            reportWidth + parseInt( document.getElementById( this._reportWidthTextBoxId ).increment, 10 );
                    }
                } 
            }
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
        
        _readFieldsFromPref: function() {// if both _fields and _fields_array are existent, then we shall already have the info. we want in the two variables.
            if ( !this._fields || !this._fields_array ) {
                this._fields = GeckoJS.Configure.read( this._field_pref_prefix );
                if ( this._fields )
                    this._fields_array = GeckoJS.BaseObject.getValues( this._fields );
                    
                this._fields_array.sort( function( a, b ) {
                    a = parseInt( a.order, 10 );
                    b = parseInt( b.order, 10 );
                    if ( a > b ) return 1;
                    else if ( a < b ) return -1;
                    return 0;
                } );
            }
        },
        
        showFieldPicker: function() {
            // initialize field picker.
            var fieldPickerScrollPanel = document.getElementById( this._fieldPickerScrollPanelId );
            
            this._readFieldsFromPref();
            
            this._selectedFieldIncies = [];
            for ( var i = 0; i < this._fields_array.length; i++ )
                if ( this._fields_array[ i ].ispicked == "true" )
                    this._selectedFieldIncies.push( i );


            $.popupPanel('field_picker_panel', {fields: this._fields_array, selectedItems: this._selectedFieldIncies});
            /*
            var fieldPickerPanelView = new GeckoJS.NSITreeViewArray( this._fields_array );
            fieldPickerScrollPanel.datasource = fieldPickerPanelView;
            fieldPickerScrollPanel.selectedItems = this._selectedFieldIncies;
            
            var fieldPickerBox = document.getElementById( this._fieldPickerBox );
            fieldPickerBox.width = this._mainScreenWidth + 'px';
            fieldPickerBox.height = this._mainScreenHeight + 'px';
            
            var fieldPickerPanel = document.getElementById( this._fieldPickerPanelId );
            //fieldPickerPanel.sizeTo( this._mainScreenWidth, this._mainScreenHeight );
            fieldPickerPanel.openPopup();
            */
        },
        
        dismissFieldPicker: function() {
            // save the chosen fields.
            var fieldPickerScrollPanel = document.getElementById( this._fieldPickerScrollPanelId );
            var selectedItems = fieldPickerScrollPanel.selectedItems;
            
            this._fields_array.forEach( function( field ) {
                field.ispicked = "";
            } );
            
            var fields = this._fields_array;
            selectedItems.forEach( function( item ) {
                fields[ parseInt( item, 10 ) ].ispicked = "true";
            } );
            
            GeckoJS.Configure.write( this._field_pref_prefix, this._fields );

            $.hidePanel(this._fieldPickerPanelId, true);
        },
        
        load: function() {
            this._super();
            
            var today = new Date();
            var yy = today.getYear() + 1900;
            var mm = today.getMonth();
            var dd = today.getDate();

            var start = ( new Date( yy, mm, dd, 0, 0, 0 ) ).getTime();
            var end = ( new Date( yy, mm, dd + 1, 0, 0, 0 ) ).getTime();

            document.getElementById( 'start_date' ).value = start;
            document.getElementById( 'end_date' ).value = end;
            
            document.getElementById( this._reportWidthTextBoxId ).disabled = true;
        }
    };

    RptBaseController.extend( __controller__ );
} )();

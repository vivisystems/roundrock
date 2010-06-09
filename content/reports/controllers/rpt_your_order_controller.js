( function() {
    /**
     * RptDailySales Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {
        
        name: 'RptYourOrder',
        
        _fileName: 'rpt_your_order',
        
        _report_title: '',
        _report_title_message: 'vivipos.fec.reportpanels.yourorder.label',
        
        _reportWidthTextBoxId: 'report_width',
        
        _fieldPickerScrollPanelId: 'fieldpickerscrollpanel',
        _fieldPickerPanelId: 'field_picker_panel',
        _fieldPickerBox: 'field_picker_box',
        _removeReportButtonId: 'remove_report',
        
        _preference_key: 'yourorder',
        _field_pref_prefix: 'vivipos.fec.report.yourorder.field',
        _setting_pref: 'vivipos.fec.report.yourorder.settings',
        _selected_indices_pref: 'vivipos.fec.report.yourorder.selectedindices',
        _file_name_pref: 'vivipos.fec.report.yourorder.filename',
        _report_panel_pref_prefix: 'vivipos.fec.reportpanels',
        _reportPanelPreference: {},
        
        _setting_form: 'settings',
        
        _fields: null,
        _fields_array: null,
        _selectedFieldIndecies: null,
        _pickedFields: null,

        _set_reportData: function( start, end, start_str, end_str, terminal_no, shiftNo, periodType, sortby, status, destination, limit ) {

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
                "' AND orders." + periodType + "<='" + end + "'";
                            
            if ( terminal_no.length > 0 )
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminal_no ) + "%'";
                
            if ( shiftNo.length > 0 )
                conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";
                
            if ( status.length > 0 && status != "all" )
                conditions += " AND orders.status = '" + status + "'";
                
            if ( destination.length > 0 && destination != "all" )
                conditions += " AND orders.destination = '" + destination + "'";
                
            var groupby = 'orders.id, order_payments.name';
            var orderby = 'orders.' +  timeField;
            
            var orderPayment = new OrderPaymentModel();

            var counts = orderPayment.getDataSource().fetchAll('SELECT count(id) as rowCount from (SELECT distinct (orders.id) ' + '  FROM orders LEFT JOIN order_payments ON ("orders"."id" = "order_payments"."order_id" )  WHERE ' + conditions + '  GROUP BY ' + groupby +')');
            var rowCount = counts[0].rowCount;

            var datas = orderPayment.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders OUTER LEFT JOIN order_payments ON ("orders"."id" = "order_payments"."order_id" )  WHERE ' +
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
                included_tax_subtotal: 0,
                rowCount: rowCount
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
                    repDatas[ oid ].status = this.statusToString( repDatas[ oid ].status );
					
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
				
                if (o.payment_name) repDatas[ oid ][o.payment_name] += o.payment_subtotal;
                repDatas[ oid ][ 'payment' ] += o.payment_subtotal;
                if (o.payment_name) footDatas[ o.payment_name ] += o.payment_subtotal;
                footDatas[ 'payment' ] += o.payment_subtotal;

                old_oid = oid;
            }, this);

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
            
            // We have to sort this._selectedFieldIndecies, which is an array, so that the fields can be shown in the order we set in preference file.
            // However, not sorting it makes ppl possible to determine the order of rendering those fields.
            /*this._selectedFieldIndecies.sort( function( a, b ) {
                if ( a > b ) return 1;
                else if ( a < b ) return -1;
                return 0;
            } );*/
            
            this._selectedFieldIndecies.forEach( function( index ) {
                pickedFields.push( this._fields_array[ parseInt( index, 10 ) ] );
            }, this );
            
            this._reportRecords.head.title = this._report_title;
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminal_no;
            
            this._reportRecords.fields = this._pickedFields;
			
            this._reportRecords.body = GeckoJS.BaseObject.getValues( this._datas );
            this._reportRecords.foot.foot_datas = footDatas;
        },

        _set_reportRecords: function( limit ) {
            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 )
                limit = this._stdLimit;

            var start = document.getElementById( 'start_date' ).value;
            var end = document.getElementById( 'end_date' ).value;

            var start_str = document.getElementById( 'start_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );
            var end_str = document.getElementById( 'end_date' ).datetimeValue.toString( 'yyyy/MM/dd HH:mm' );

            var terminal_no = document.getElementById( 'terminal_no' ).value;
            var shiftNo = document.getElementById( 'shift_no' ).value;
            var periodType = document.getElementById( 'period_type' ).value;

            var sortby = document.getElementById( 'sortby' ).value;

            var status = document.getElementById( 'status' ).value;

            var destination = document.getElementById( 'destination' ).value;

            this._set_reportData( start, end, start_str, end_str, terminal_no, shiftNo, periodType, sortby, status, destination, limit);
        },

        printCustomerReport: function(salePeriod, salePeriod, terminalNo, shiftNumber, settings, key ){

            var periodType = settings.period_type;
            var sortby = settings.sortby;
            var status = settings.status;
            var destination = settings.destination;

            var start_str = new Date(salePeriod).toString( 'yyyy/MM/dd HH:mm' );
            var end_str = new Date(salePeriod).toString( 'yyyy/MM/dd HH:mm' );

            this.load(key);
            this._set_reportData( salePeriod, salePeriod, start_str, end_str, terminalNo, shiftNumber, periodType, sortby, status, destination, this._stdLimit );
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
        
        setPaperSize: function( doNotSetReportWidthTextBoxZero ) {
            // set pper size.
            var paperSize = document.getElementById( 'papersize' );
            if(!paperSize) return
            
            if ( paperSize )
                paperSize = paperSize.value;
            var iFrame = document.getElementById( 'preview_frame' );
            if ( iFrame )
                iFrame.src = "chrome://viviecr/content/reports/rpt_template" + paperSize + ".html";
            // After changing the size of the template, the report currently showing on screen no longer exists.
            // We have to disable the report-width adjuster at that moment to prevent an error from occuring.
            document.getElementById( this._reportWidthTextBoxId ).disabled = true;
            this._enableButton( false );
            if ( !doNotSetReportWidthTextBoxZero )
                document.getElementById( this._reportWidthTextBoxId ).value = 0;
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
            var defaultWidth = bodydiv.scrollWidth - 30;
            // set the paper size.
            var bodytable =  bw.contentWindow.document.getElementById( this._body_table );
            var reportWidth = parseInt( document.getElementById( this._reportWidthTextBoxId ).value, 10 );
            document.getElementById( this._reportWidthTextBoxId ).value = defaultWidth;
            
            if ( reportWidth ) {
                bodydiv.style.width = reportWidth;
                document.getElementById( this._reportWidthTextBoxId ).value = reportWidth;
                if ( bodydiv.scrollWidth <= bodytable.scrollWidth + 20 ) {
                    bodydiv.style.width = defaultWidth;
                    document.getElementById( this._reportWidthTextBoxId ).value = defaultWidth;
                }
            }
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
                    var increment = parseInt( document.getElementById( this._reportWidthTextBoxId ).increment, 10 );
                    if ( bodydiv.scrollWidth - increment > bodytable.scrollWidth + 20 ) {
                        bodydiv.style.width = reportWidth;
                    } else { 
                        document.getElementById( this._reportWidthTextBoxId ).value = reportWidth + increment;
                    }
                }
            }
        },
        
        exportPdf: function() {
            var paperSize = document.getElementById( 'papersize' );
            if ( paperSize )
                paperSize = parseInt( paperSize.value, 10 );
            
            var paper = {
                paperSize: {
                    width: 297,
                    height: 210
                }
            };
            if ( paperSize < 3 ) {// for portrait.
                var temp = paper.paperSize.width;
                paper.paperSize.width = paper.paperSize.height;
                paper.paperSize.height = temp;
            }
            this._super( paper );
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
                if ( this._fields_array ) {
                    this._fields_array.sort( function( a, b ) {
                        a = parseInt( a.order, 10 );
                        b = parseInt( b.order, 10 );
                        if ( a > b ) return 1;
                        else if ( a < b ) return -1;
                        return 0;
                    } );
                    // for language localization.
                    this._fields_array.forEach( function( field ) {
                        field.name = _( field.name );
                    } );
                }
            }
        },
        
        showFieldPicker: function() {
            // initialize field picker.
            var fieldPickerScrollPanel = document.getElementById( this._fieldPickerScrollPanelId );
            
            this._readFieldsFromPref();
            
            this._selectedFieldIndecies = GeckoJS.BaseObject.unserialize(
                GeckoJS.Configure.read( this._selected_indices_pref )
            ) || [];

            $.popupPanel( this._fieldPickerPanelId, { fields: this._fields_array, selectedItems: this._selectedFieldIndecies } );
        },
        
        dismissFieldPicker: function() {
            $.hidePanel( this._fieldPickerPanelId, true );
        },
        
        dismissFieldPickerAndSave: function() {
            // save the chosen fields and leave.
            var fieldPickerScrollPanel = document.getElementById( this._fieldPickerScrollPanelId );
            var selectedItems = fieldPickerScrollPanel.selectedItems;
            
            GeckoJS.Configure.write(
                this._selected_indices_pref,
                GeckoJS.BaseObject.serialize( selectedItems )
            );

            this.dismissFieldPicker();
        },
        
        saveSettings: function() {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=350';
            var inputObj = {
                input0: this._reportPanelPreference.label || "",
                require0: true,
                input1: this._exportedFileName,
                require1: true,
                alphanumeric1: true
            };

            GREUtils.Dialog.openWindow(
                this.topmostWindow,
                aURL,
                _( 'Saving Properties' ),
                features,
                _( 'Saving Properties' ),
                '',
                _( 'Report Name' ),
                _( 'Report ID (alphanumeric)' ),
                inputObj
            );
            
            if ( inputObj.ok && inputObj.input0 && inputObj.input1 ) {
                var settingPref = this._setting_pref;
                
                // for file name.
                var fileNamePref;
                var fileName = inputObj.input1;
                
                // flag indicating if we are going to create a new report. When user try to use a file name other than the original one, a new report will be generated.
                var isCreatingReport = inputObj.input0 != this._reportPanelPreference.label;
                
                if ( isCreatingReport ) {
                    var label = inputObj.input0;
                    
                    var newReportPrefKey = GeckoJS.String.uuid();
                    
                    settingPref = settingPref.replace( this._preference_key, newReportPrefKey );
                    var reportPanelPref = this._report_panel_pref_prefix + "." + newReportPrefKey;
                    
                    // Register new report by adding preference.
                    // for report panel.
                    var reportPanelPreference = GREUtils.extend( {}, this._reportPanelPreference ); // not doing so will bring about reference problem.
                    reportPanelPreference.label = label;
                    reportPanelPreference.key = newReportPrefKey;
                    reportPanelPreference.roles = 'acl_report_yourorder';
                    GeckoJS.Configure.write( reportPanelPref, reportPanelPreference );
                    
                    // for selected fields.
                    var selectedIndices = GeckoJS.Configure.read( this._selected_indices_pref );
                    var selectedIndicesPref = this._selected_indices_pref.replace( this._preference_key, newReportPrefKey );
                    GeckoJS.Configure.write( selectedIndicesPref, selectedIndices );
                    
                    // for fileName.
                    fileNamePref = this._file_name_pref.replace( this._preference_key, newReportPrefKey );
                } else { // not gonna generate a new report.
                    // for fileName.
                    fileNamePref = this._file_name_pref.replace( this._preference_key, this._reportPanelPreference.key );
                    this._exportedFileName = fileName;
                }
                
                // for fileName.
                GeckoJS.Configure.write( fileNamePref, fileName );
                
                // for setting.
                this.log(this.dump( this._setting_form));
                GeckoJS.Configure.write( settingPref, GeckoJS.FormHelper.serialize( this._setting_form ) );
                
                if ( isCreatingReport ) {
                    GREUtils.Dialog.alert(
                        this.topmostWindow,
                        '',
                        _( 'New report' ) + ' ' + label + ' ' + _( 'has been generated' ) + '.'
                    );
                    
                    // refresh the report panel so that ppl can approach the created report.
                    opener.refreshPanel();
                    doOKButton(); // close this report first.
                }
            } else {
                return;
            }
        },
        
        removeReport: function() {
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, '', _( 'Are you sure you want to remove this report?' ) ) )
                return;
                
            try {
                GeckoJS.Configure.remove( this._setting_pref ); // remove settings.
                GeckoJS.Configure.remove( this._selected_indices_pref ); // remove info. about selected fields.
                GeckoJS.Configure.remove( this._report_panel_pref_prefix + '.' + this._preference_key ); // remove report button.
            } catch ( e ) {
                dump( e );
            } finally {
                // refresh the report panel so that ppl can approach the created report.
                opener.refreshPanel();
                doOKButton(); // close this report first.
            }
        },
        
        load: function(pref) {
            this._super();

            // initialize the destination selector.
            var destination_records = GeckoJS.Configure.read( "vivipos.fec.settings.Destinations" );
            destination_records = GeckoJS.BaseObject.unserialize( GeckoJS.String.urlDecode( destination_records ) );
            
            var menupopup = document.getElementById( "destination_menupopup" );

            if(menupopup){
            destination_records.forEach( function( record ) {
                var menuitem = document.createElementNS( "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul", "xul:menuitem" );
                menuitem.setAttribute( 'value', record.name );
                menuitem.setAttribute( 'label', record.name );
                menupopup.appendChild( menuitem );
            } );
            }
            // disable the textbox for width since we have nothing to adjust this time.
            var textbox = document.getElementById( this._reportWidthTextBoxId )
            if(textbox)
                textbox.disabled = true;

            // Get preferences from report.js for this report.
            if(pref)
                this._reportPanelPreference = GREUtils.extend( {}, pref );
            else
                this._reportPanelPreference = GREUtils.extend( {}, window.arguments[ 0 ] );
            
            // remove the ( custom ) marker added in reportPanel.js.
            if(this._reportPanelPreference.label)
                this._reportPanelPreference.label = this._reportPanelPreference.label.replace( /^\(\ .*?\ \)/, '' );
            
            if ( this._reportPanelPreference.key == this._preference_key ) { // if it is the root report, say, original your order report.
                var reportButton = document.getElementById( this._removeReportButtonId );
                if(reportButton)
                    reportButton.hidden = true;
                // Use proper report title.
                this._report_title = _( this._report_title_message );
            } else {
                // Use proper preference key.
                this._selected_indices_pref = this._selected_indices_pref.replace( this._preference_key, this._reportPanelPreference.key );
                this._setting_pref =  this._setting_pref.replace( this._preference_key, this._reportPanelPreference.key );
                this._file_name_pref =  this._file_name_pref.replace( this._preference_key, this._reportPanelPreference.key );
                this._preference_key = this._reportPanelPreference.key;
                
                // Use proper report title.
                this._report_title = this._reportPanelPreference.label;
            }
            
            // Use proper file name.
            var fileName = GeckoJS.Configure.read( this._file_name_pref );
            if ( fileName )
                this._exportedFileName = fileName;
                
            // Retrieve field indices. This array will be unsorted. The order of the elements is just the order user selected it.
            this._selectedFieldIndecies = GeckoJS.BaseObject.unserialize(
                GeckoJS.Configure.read( this._selected_indices_pref )
            ) || [];
            
            // initialize the settings according to the preference.
            var settings = GeckoJS.Configure.read( this._setting_pref );
            if ( settings )
                GeckoJS.FormHelper.unserialize( this._setting_form, settings );
            this.setPaperSize( true );
        }
    };

    RptBaseController.extend( __controller__ );
} )();

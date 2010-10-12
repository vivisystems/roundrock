( function() {
    /**
     * Product Sales Controller
     */
    
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptProductSales',
        
        _fileName: "rpt_product_sales",
        
        _setData: function( start, end, periodType, shiftNo, sortby, terminalNo, department, empty_department, noSalesProduct, breakout_setmenu, limit, selectCategory ) {
            var start_str = ( new Date( start ) ).toString( 'yyyy/MM/dd HH:mm' );
            var end_str = ( new Date( end ) ).toString( 'yyyy/MM/dd HH:mm' );

            start = parseInt( start / 1000, 10 );
            end = parseInt( end / 1000, 10 );

            // initial order history if user selected it.
            var useDbConfig = this.initOrderHistoryDatabase();

            var orderItem = new OrderItemModel();

            orderItem.useDbConfig = useDbConfig; // udpate dbconfig

            var fields = [
                'order_items.product_no',
                'order_items.product_name',
                'SUM("order_items"."current_qty") as "qty"',
                'SUM("order_items"."current_subtotal") as "gross"',
                'SUM("order_items"."current_subtotal" + "order_items"."current_discount" + "order_items"."current_surcharge") as "net"',
                'order_items.cate_no',
                'order_items.cate_name'
            ];
            
            var conditions = "orders." + periodType + ">='" + start +
                "' AND orders." + periodType + "<='" + end + "'" +
                " AND orders.status = 1";
            
            if (terminalNo.length > 0)
                conditions += " AND orders.terminal_no LIKE '" + this._queryStringPreprocessor( terminalNo ) + "%'";
            
            if ( shiftNo.length > 0 )
                conditions += " AND orders.shift_number = '" + this._queryStringPreprocessor( shiftNo ) + "'";

            if ( !breakout_setmenu ) {
                conditions += " AND (order_items.parent_index IS NULL OR order_items.parent_index = '')";
            }

            var groupby = "order_items.product_no";

            var orderby = '';

            switch( sortby ) {
                case 'product_no':
                case 'product_name':
                    orderby = sortby;
                    break;

                case 'avg_price':
                case 'qty':
                case 'gross':
                case 'net':
                    orderby = '"OrderItem.' + sortby + '" desc';
                    break;
            }
            
            // prepare category stuff.
            var deptCondition = '';
            var categoryModel = new CategoryModel();
            var categoryRecords = categoryModel.find( 'all', {
                fields: [ 'no', 'name' ],
                conditions: deptCondition,
                order: 'no',
                limit: this._csvLimit
            } );
	        
            var categories = { department:{}, group:{} };
	        
            categoryRecords.forEach( function( categoryRecord ) {
                categories.department[ categoryRecord.no ] = {
                    no: categoryRecord.no,
                    name: categoryRecord.name,
                    orderItems: [],
                    prodByNo: {},
                    summary: {
                        qty: 0,
                        gross: 0.0,
                        net: 0.0
                    }
                }
            } );
           categories.group = this._setGroups();
           if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', this.dump(categories,20));       

           var orderItemRecords = orderItem.getDataSource().fetchAll('SELECT ' +fields.join(', ')+ '  FROM orders INNER JOIN order_items ON ("orders"."id" = "order_items"."order_id" )  WHERE ' + conditions + '  GROUP BY ' + groupby + ' ORDER BY ' + orderby + ' LIMIT 0, ' + this._csvLimit);

            orderItemRecords.forEach( function( record ) {
                delete record.OrderItem;
                if (record['qty'] > 0)
                    record[ 'avg_price' ] = record[ 'net' ] / record[ 'qty' ];
                else
                    record[ 'avg_price' ] = 0.0;

                if (!(record.cate_no in categories.department)) {
                    categories.department[ record.cate_no ] = {
                        no: record.cate_no,
                        name: record.cate_name,
                        orderItems: [ record ],
                        summary: {
                            qty: record.qty,
                            gross: record.gross,
                            net: record.net
                            },
                        prodByNo: {}
                    };
                }
                else {
                    categories.department[ record.cate_no ].orderItems.push( record );
                    categories.department[ record.cate_no ].summary.qty += record.qty;
                    categories.department[ record.cate_no ].summary.gross += record.gross;
                    categories.department[ record.cate_no ].summary.net += record.net;
                }
                categories.department[ record.cate_no ].prodByNo[ record.product_no ] = 1;
            } );

             if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', this.dump(categories,20));
             categories.group =  this._setGroupOrderItem(orderItemRecords, categories.group);

            // insert the zero sales products =====================================> department
            if ( noSalesProduct == 'show' ) {
                
                var productModel = new ProductModel();
                var allProducts = productModel.find('all', {
                    fields: [ "cate_no", "no", "name" ],
                    limit: 3000000,
                    recursive: 0
                });
		        
                allProducts.forEach( function( p ) {
                    if (!(p.cate_no in categories.department)) {
                        categories.department[ p.cate_no ] = {
                            no: p.cate_no,
                            name: p.cate_no + ' - ' + _('Obsolete'),
                            orderItems: [ p ],
                            summary: {
                                qty: 0,
                                gross: 0.0,
                                net: 0.0
                            },
                            prodByNo: {}
                        };
                        categories.department[ p.cate_no ].prodByNo[ p.no ] = 1;
                    }
                    else if (!(p.no in categories.department[ p.cate_no ].prodByNo)) {
                        categories.department[ p.cate_no ].orderItems.push( {
                            product_no: p.no,
                            product_name: p.name,
                            avg_price: 0.0,
                            qty: 0,
                            gross: 0.0,
                            net: 0.0
                        } );
                    }
                });
            }

            // insert the zero sales products =====================================> group
            if ( noSalesProduct == 'show' ) {

                var productModel = new ProductModel();
                var allProducts = productModel.find('all', {
                    fields: [ "cate_no", "no", "name" ],
                    limit: 3000000,
                    recursive: 0
                });

                // we need insert info to allProducts[] about product linkgroup property
                allProducts = this._setGroupProperty(allProducts);

                // inser insert the zero sales products
                for( var i = 0 ; i< allProducts.length ; i++){

                    for(var j = 0 ; j < allProducts[i].grouplink.length ; j++){

                         var groupID = allProducts[i].grouplink[j].id
                         // if the product doesn't have sales recorder...then inser empty info
                         if (!(allProducts[i].no in categories.group[ groupID ].prodByNo)) {
                            categories.group[ groupID ].orderItems.push( {
                            product_no: allProducts[i].no,
                            product_name: allProducts[i].name,
                            avg_price: 0.0,
                            qty: 0,
                            gross: 0.0,
                            net: 0.0
                            } );
                         }
                    }
                }          
            }

            if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', this.dump(categories,20));
            //hide unselected categroy
            if(  'department' in selectCategory || 'group' in selectCategory ){

                //============='========================================> hide department
                if('department' in selectCategory){

                   var departmentNo = this._getDepartmentNo(selectCategory.department);
                                     
                   for ( var category in categories.department ) {
                        if ( departmentNo.indexOf(category) == -1 )
                            delete categories.department[ category ];
                   }

                }
                 //=====================================================> hide group
                if('group' in selectCategory){

                    var groupID = this._getGroupID(selectCategory.group);
                    
                    for ( var group in categories.group ) {
                        if ( groupID.indexOf(group) == -1 )
                            delete categories.group[ group ];
                    }
                }
            }
            if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', this.dump(categories,20));


            // hide the no sales department if users want it that way.
            if ( empty_department == 'hide' ) {
                 //=====================================================> hide department
                for ( var category in categories.department ) {
                    if ( categories.department[ category ].summary.qty == 0 )
                        delete categories.department[ category ];
                }
                 //=====================================================> hide group
                for ( var group in categories.group ) {
                    if ( categories.group[ group ].summary.qty == 0 )
                        delete categories.group[ group ];
                }
            }

            // for sorting ================================================> department
            if ( sortby != 'all' ) {
                for ( var category in categories.department ) {
                    categories.department[ category ].orderItems.sort(
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

            // for sorting ================================================> group
            if ( sortby != 'all' ) {
                for ( var category in categories.group ) {
                    categories.group[ category ].orderItems.sort(
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

            var total_record = 0;
            var total_summary = 0;
            var total_gross = 0;
            var total_net = 0;

            for(var cate in categories){
                for(var obj in categories[cate]){
                    total_record += categories[cate][obj].orderItems.length;
                    total_summary += categories[cate][obj].summary.qty;
                    total_gross += categories[cate][obj].summary.gross;
                    total_net += categories[cate][obj].summary.net;
                }
            }

            //set group
            //categories.group = GeckoJS.BaseObject.clone(categories.department);
            if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', this.dump(categories,20));
            var departmentKeys = GeckoJS.BaseObject.getKeys(categories.department);           
          
            this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.productsales.label' );
            this._reportRecords.head.start_time = start_str;
            this._reportRecords.head.end_time = end_str;
            this._reportRecords.head.terminal_no = terminalNo;

            this._reportRecords.body = categories;

            this._reportRecords.foot.record = total_record;
            this._reportRecords.foot.total_summary = total_summary;
            this._reportRecords.foot.total_gross = total_gross;
            this._reportRecords.foot.total_net = total_net;
        },

        _setGroupProperty: function( allProducts ){

            for(var i = 0; i< allProducts.length ; i++){

                 var linkGroups = this.returnProductPlu(allProducts[i].no);

                 allProducts[i]['grouplink'] = linkGroups;

                 allProducts[i].Product['grouplink'] = linkGroups;
            }          
            return allProducts;
        },

        _setGroupOrderItem: function( orderItemRecords, group){

            orderItemRecords = this._addGroupLinkpProperty(orderItemRecords);

            orderItemRecords.forEach( function( record ) {
                delete record.OrderItem;
                if (record['qty'] > 0)
                    record[ 'avg_price' ] = record[ 'net' ] / record[ 'qty' ];
                else
                    record[ 'avg_price' ] = 0.0;

                for(var i = 0; i< record.grouplink.length ; i++){

                    if (!record.grouplink[i]) continue;
                    
                    group[ record.grouplink[i].id ].orderItems.push( record );
                    group[ record.grouplink[i].id ].summary.qty += record.qty;
                    group[ record.grouplink[i].id ].summary.gross += record.gross;
                    group[ record.grouplink[i].id ].summary.net += record.net;
                    group[ record.grouplink[i].id ].prodByNo[ record.product_no ] = 1;
                    
                }
            } );

            return group ;
        },

        _setGroups: function(){

            var groupRecords = [];
            var plugroups = GeckoJS.Session.get('plugroupsById');
            plugroups = GeckoJS.BaseObject.getValues(plugroups);

            for(var i = 0; i< plugroups.length; i++){

                groupRecords.push({ group:{ name:plugroups[i].Plugroup.name, id:plugroups[i].id}, name:plugroups[i].Plugroup.name,id:plugroups[i].id });
            }

            var groups ={};
             groupRecords.forEach( function( categoryRecord ) {
                groups[ categoryRecord.id ] = {
                    no: categoryRecord.id,
                    name: categoryRecord.name,
                    orderItems: [],
                    prodByNo: {},
                    summary: {
                        qty: 0,
                        gross: 0.0,
                        net: 0.0
                    }
                }
            } );

            return groups;
        },

        _addGroupLinkpProperty: function( orderItemRecords ){

            for(var i =0 ; i< orderItemRecords.length ; i++){

                orderItemRecords[i].grouplink = this.returnProductPlu(orderItemRecords[i].product_no);
            }

            return orderItemRecords;
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

            var empty_department = document.getElementById( 'empty_department' ).value;
            var noSalesProduct = document.getElementById( 'no_sales_product' ).value;
            var breakoutSetmenu = document.getElementById( 'breakout_setmenu' ).checked;
            var selectCategory = {};
            
            //set department && group
            if(department == 'select'){
                
                selectCategory.department = GeckoJS.BaseObject.unserialize( GeckoJS.Configure.read('vivipos.fec.settings.rptConfigure.department'));
                selectCategory.group = GeckoJS.BaseObject.unserialize( GeckoJS.Configure.read('vivipos.fec.settings.rptConfigure.group'));
            }
            this._setData( start, end, periodType, shiftNo, sortby, terminalNo, department, empty_department, noSalesProduct, breakoutSetmenu, limit, selectCategory );
        },
        
        exportCsv: function() {
            this._super( this, true );
        },

       linkToSetDepartmentGroup: function(){

            var screenwidth = GeckoJS.Session.get('screenwidth');
            var screenheight = GeckoJS.Session.get('screenheight');
            var aURL = 'chrome://viviecr/content/reports/rpt_setDepartmentGroup.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                selectedTemplate: "",
                selectedBarcode: ""
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('select_rate'), aFeatures, inputObj);
       },

        returnProductPlu: function( productNumber ){

          // get product ID
           var productId = this.returnProductID( productNumber ) ;

           var groups = [];

           var productLinkGroup = GeckoJS.Session.get('productsIndexesByLinkGroupAll');
           var plugroups = GeckoJS.Session.get('plugroupsById');
           
           var groupID = GeckoJS.BaseObject.getKeys(productLinkGroup);

           productLinkGroup = GeckoJS.BaseObject.getValues(productLinkGroup);
           plugroups = GeckoJS.BaseObject.getValues(plugroups);

           for(var i=0 ; i< productLinkGroup.length ; i++){

                for(var j=0 ; j<productLinkGroup[i].length ; j++){

                    if(productLinkGroup[i][j] == productId )
                        groups.push( this._getGroupObject( groupID[i] ) );
                }
           }
          if (GeckoJS.Log.defaultClassLevel.value <= 1) this.log('DEBUG', this.dump(groups,20));
           return groups;
        },

        _getGroupObject: function(id){

             var plugroups = GeckoJS.Session.get('plugroupsById');
             plugroups = GeckoJS.BaseObject.getValues(plugroups);

             for(var i=0; i<plugroups.length ; i++){

                 if(plugroups[i].id == id)
                     return plugroups[i];
             }
        },

        returnProductID: function( productNumber ){

            var products = GeckoJS.Session.get('products');

            for(var i = 0 ; i< products.length ; i++){

                 if( products[i].no == productNumber )
                     return products[i].id;
             }
            return false ;
        },

        _getDepartmentNo: function( departments){

            var departmentNo = [];

            departments.forEach(function(department){

                departmentNo.push(department.no);
            });
            return departmentNo ;
        },

        _getGroupID: function( groups){

             var groupID = [];

             groups.forEach(function(group){

                groupID.push(group.id);
            });
            return groupID ;
        },

        test: function(){
/*
           var a = GeckoJS.Session.get('productsIndexesByLinkGroupAll');
           var x = GeckoJS.BaseObject.getValues(a);
           var g = this.returnProductPlu('002001');
           var c = this._setGroups();
           */
           var departmentPref = GeckoJS.BaseObject.unserialize( GeckoJS.Configure.read('vivipos.fec.settings.rptConfigure.department'));
           var groupPref = GeckoJS.BaseObject.unserialize( GeckoJS.Configure.read('vivipos.fec.settings.rptConfigure.group'));
           var gg = 0;
        },

        load: function() {
            this._super();
        }        
    };

    RptBaseController.extend( __controller__ );
} )();

(function(){

    /**
     * Class ViviPOS.StockRecordsController
     */

    var __controller__ = {
        name: 'StockRecords',
        scaffold: false,
        uses: [ 'Product' ],

        _listObj: null,
        _listData: null,
        _panelView: null,
        _selectedIndex: 0,
        _stockRecordsByProductNo: null,
        _barcodesIndexes: null,
        _records: null,

        getListObj: function() {
            if( this._listObj == null ) {
                this._listObj = document.getElementById( 'stockrecordscrollablepanel' );
                //this._stockRecordsByProductNo = GeckoJS.Session.get( 'stockRecordsByProductNo' );
                this._barcodesIndexes = GeckoJS.Session.get( 'barcodesIndexes' );
            }
            return this._listObj;
        },

        list: function() {
            var stockRecordModel = new StockRecordModel();
            
            var sql =
            	"select s.*, p.no as product_no, p.name as product_name " +
            	"from stock_records s join products p on s.product_no = p.no " +
            	"order by product_no;"; // the result must be sorted by product_no for the use of binary search in locateIndex method.
            	
            var stockRecords = stockRecordModel.getDataSource().fetchAll( sql );
            
            this._listData = stockRecords;
            
            // construct _stockRecordsByProductNo.
            this._stockRecordsByProductNo = {};
            stockRecordsByProductNo = this._stockRecordsByProductNo;
            stockRecords.forEach( function( stockRecord ) {
            	stockRecord.new_quantity = stockRecord.quantity;
            	stockRecord.memo = '';
            	stockRecordsByProductNo[ stockRecord.product_no ] = stockRecord;
            } );
        },

        /*beforeScaffoldView: function(evt) {
            this._listObj.selectedIndex = this._selectedIndex;
        },*/

        afterScaffoldEdit: function (evt) {
            /*if (evt.justUpdate) {
                // update stock in session...
                var stockRecordsByProductNo = GeckoJS.Session.get( 'stockRecordsByProductNo' );
                var product = stockRecordsByProductNo[ evt.data.id ];
                product.stock = evt.data.stock;
                product.min_stock = evt.data.min_stock;
            } else {
                var product = this._stockRecordsByProductNo[ evt.data.id ];
                product.stock = evt.data.stock;
                product.min_stock = evt.data.min_stock;

                var productModel = new ProductModel();
                var products = productModel.find( 'all', {
                    order: 'no'
                } );
                this._listData = products;
                this.updateStock();

                // @todo OSD
                OsdUtils.info( _( 'Stock level for [%S] modified successfully', [ evt.data.name ]) );
            }*/
        },

        searchPlu: function () {
            var barcode = document.getElementById( 'plu' ).value.replace( /^\s*/, '' ).replace( /\s*$/, '' );
            $( '#plu' ).val( '' ).focus();
            if ( barcode == '' ) return;

            // var stockRecordsByProductNo = GeckoJS.Session.get( 'stockRecordsByProductNo' );
            // var barcodesIndexes = GeckoJS.Session.get( 'barcodesIndexes' );
            var product;

            if ( !this._barcodesIndexes[ barcode ] ) {
                // barcode notfound
                GREUtils.Dialog.alert(window,
                                      _( 'Product Search' ),
                                      _( 'Product/Barcode Number (%S) not found!', [ barcode ] ) );
            } else {
                product = this._stockRecordsByProductNo[ barcode ];
                GeckoJS.FormHelper.reset( 'productForm' );
                GeckoJS.FormHelper.unserializeFromObject( 'productForm', product );

                this._selectedIndex =  this.locateIndex( product, this._records );
                this._listObj.selectedIndex = this._selectedIndex;
                this._listObj.vivitree.selection.select( this._selectedIndex );
                this._panelView.tree.ensureRowIsVisible( this._selectedIndex );
            }

            this.validateForm();
        },

        updateStock: function ( reset ) {
            var lowstock = document.getElementById( 'show_low_stock' ).checked;

            if ( lowstock ) {
                var oldlength = this._records.length;
                this._records = this._listData.filter( function( d ) {
                    return parseInt( d.stock, 10 ) >= parseInt( d.min_stock, 10 );
                } );
                if ( oldlength != this._records.length )
                	reset = true;
            } else {
                this._records = this._listData;
            }
            
            if ( reset || this._panelView == null ) {
                this._panelView = new GeckoJS.NSITreeViewArray( this._records );
                this.getListObj().datasource = this._panelView;
            } else {
                this._panelView.data = this._records;
            }
            
            this._listObj.vivitree.refresh();
            //this.select( this._selectedIndex );
            this.validateForm();
        },

        clickLowStock: function () {
            this._selectedIndex = -1;
            this.updateStock( true );
        },

        locateIndex: function ( product, list ) {
            // locate product in list using binary search
            var low = 0;
            var N = list.length;
            var high = N;
            while ( low < high ) {
                var mid = Math.floor( ( low - ( - high ) ) / 2 );
                ( list[ mid ].product_no < product.product_no ) ? low = mid + 1 : high = mid;
            }
            // high == low, using high or low depends on taste
            if ( ( low < N ) && ( list[ low ].product_no == product.product_no ) )
                return low; // found
            else return -1; // not found
        },

        decStock: function ( obj ) {
            //this._productsById = GeckoJS.Session.get( 'productsById' );
            this._barcodesIndexes = GeckoJS.Session.get( 'barcodesIndexes' );

            for ( o in obj.items ) {
                var ordItem = obj.items[ o ];
                var item = this.Product.findById( ordItem.id );
                if ( item && item.auto_maintain_stock && !ordItem.stock_maintained ) {
					// renew the stock record.
					var stockRecordModel = new StockRecordModel();
					var stockRecord = stockRecordModel.get( 'first', { conditions: "product_no = '" + item.no + "'" } );
					
					if ( stockRecord.quantity > 0 || item.return_stock )
                        stockRecord.quantity -= ordItem.current_qty;
                        
                    stockRecordModel.set( stockRecord );
					
					delete stockRecordModel;
					
					// stock had maintained
                    ordItem.stock_maintained = true;

                    // fire onLowStock event...
                    if ( item.min_stock > item.stock ) {
                        this.dispatchEvent( 'onLowStock', item );
                    }

                    // update Session Data...
                    //var evt = { data: item, justUpdate: true };
                    //this.afterScaffoldEdit( evt );
                }
            }
        },

        load: function () {
            this._selectedIndex = -1;
            this.list();
            $( '#plu_id' ).val( '' );
            this.updateStock();
        },

        select: function( index ) {
        	if ( index >= this._records.length )
        		index = this._records.length - 1;
        		
            this._selectedIndex = index;

            if ( index >= 0 ) {
                var item = this._records[ index ];
                //this.requestCommand( 'view', item.product_id );
                GeckoJS.FormHelper.unserializeFromObject( 'productForm', item );
            }
            else {
                // clear form only if plu_id not set
                if ( $( '#plu_id' ).val() == '' )
                    GeckoJS.FormHelper.reset( 'productForm' );
            }

            this.validateForm();
        },

        validateForm: function () {
            var inputObj = GeckoJS.FormHelper.serializeToObject( 'productForm' );
            if ( inputObj.product_no != null && inputObj.product_no != '' ) {
                var newQuantity = inputObj.new_quantity.replace( /^\s*/, '' ).replace( /\s*$/, '' );
                //var min_stock = inputObj.min_stock.replace( /^\s*/, '' ).replace( /\s*$/, '' );

                document.getElementById( 'modify_stock' ).setAttribute( 'disabled', isNaN( newQuantity ) );
                //document.getElementById( 'quantity' ).removeAttribute( 'disabled' );
                document.getElementById( 'new_quantity' ).removeAttribute( 'disabled' );
            } else {
                document.getElementById( 'modify_stock' ).setAttribute( 'disabled', true );
                //document.getElementById( 'quantity' ).setAttribute( 'disabled', true );
                document.getElementById( 'new_quantity' ).setAttribute( 'disabled', true );
            }
        },
        
        reset: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to reset all the stock records?' ) ) )
        		return;
        	
        	var sql = "select distinct no from products;";
        	var products = this.Product.getDataSource().fetchAll( sql );
        	
        	var stockRecordModel = new StockRecordModel();
        	stockRecordModel.reset( products );
        	
        	this.load();
        	
        	// not doing so makes the tree panel show nothing.
        	var rowCount = this._listObj.datasource.tree.view.rowCount;
        	this._listObj.datasource.tree.rowCountChanged( 0, rowCount );
        },
        
        modifyStock: function() {
        	//var product_id = document.getElementById( 'plu_id' ).value;
        	var product_no = document.getElementById( 'product_no' ).value;
        	var product_name = document.getElementById( 'product_name' ).value;
        	var newQuantity = document.getElementById( 'new_quantity' ).value;
        	var memo = document.getElementById( 'memo' ).value;
        	
        	var stockRecord = this._stockRecordsByProductNo[ product_no ];
        	stockRecord.new_quantity = newQuantity;
        	stockRecord.memo = memo;
        	
        	/*var stockRecordModel = new StockRecordModel();
        	stockRecordModel.id = stockRecord.id;
        	stockRecordModel.save( stockRecord );*/
        	
        	this.updateStock();
        	
        	// @todo OSD
            //OsdUtils.info( _( 'Stock level for [%S] modified successfully', [ product_name ] ) );
        },
        
        commitChanges: function() {
        	if ( !GREUtils.Dialog.confirm( window, '', _( 'Are you sure you want to commit all changes?' ) ) )
        		return;
        		
        	var records = this._records;
        	var stockRecords = [];
        	
        	for ( record in records ) {
				stockRecords.push( {
					id: records[ record ].id || '',
					product_no: records[ record ].product_no,
					warehouse: records[ record ].warehouse,
					quantity: records[ record ].new_quantity
				} );
			}
        	
        	var stockRecordModel = new StockRecordModel();
        	stockRecordModel.setAll( stockRecords );
        	
        	var inventoryRecordModel = new InventoryRecordModel();
        	inventoryRecordModel.setAll( records );
        	
        	this.load();
        }
    };
    
    GeckoJS.Controller.extend( __controller__ );
})();

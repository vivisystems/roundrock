( function() {

    var __controller__ = {

        name: 'StockAdjustments',

        scaffold: false,

        uses: [ 'Product' ],

        _listObj: null,
        _listData: null,
        _panelView: null,
        _selectedIndex: 0,
        _stockRecordsByProductNo: null,
        _barcodesIndexes: null,
        _records: null,
        _folderName: 'vivipos_stock',
        _fileName: 'stock.csv',

        getListObj: function() {
            if( this._listObj == null ) {
                this._listObj = document.getElementById( 'stockadjustmentscrollablepanel' );
                //this._stockRecordsByProductNo = GeckoJS.Session.get( 'stockRecordsByProductNo' );
                this._barcodesIndexes = GeckoJS.Session.get( 'barcodesIndexes' );
            }
            return this._listObj;
        },

        list: function() {
            var stockRecordModel = new StockRecordModel();
            
            var sql =
            	"select s.*, p.no as product_no, p.name as product_name, p.min_stock as min_stock " +
            	"from stock_records s join products p on s.product_no = p.no " +
            	"order by product_no;"; // the result must be sorted by product_no for the use of binary search in locateIndex method.
            	
            var stockRecords = stockRecordModel.getDataSource().fetchAll( sql );
            
            this._listData = stockRecords;
            
            // construct _stockRecordsByProductNo.
            this._stockRecordsByProductNo = {};
            var stockRecordsByProductNo = this._stockRecordsByProductNo;
            stockRecords.forEach( function( stockRecord ) {
            	stockRecord.memo = '';
            	stockRecordsByProductNo[ stockRecord.product_no ] = stockRecord;
            } );
        },

        searchPlu: function () {
            var barcode = document.getElementById( 'plu' ).value.replace( /^\s*/, '' ).replace( /\s*$/, '' );
            $( '#plu' ).val( '' ).focus();
            if ( barcode == '' ) return;
            
            var product;

            if ( !this._barcodesIndexes[ barcode ] ) {
                // barcode notfound
                GREUtils.Dialog.alert(this.topmostWindow,
                                      _( 'Product Search' ),
                                      _( 'Product/Barcode Number (%S) not found!', [ barcode ] ) );
            } else {
                product = this._stockRecordsByProductNo[ barcode ];
                GeckoJS.FormHelper.reset( 'productForm' );
                GeckoJS.FormHelper.unserializeFromObject( 'productForm', product );

                this._selectedIndex =  this.locateIndex( product, this._records );
                this._listObj.selectedIndex = this._selectedIndex;
                this._listObj.selection.select( this._selectedIndex );
                this._panelView.tree.ensureRowIsVisible( this._selectedIndex );
            }

            this.validateForm();
        },

        updateStock: function ( reset ) {
            this._records = this._listData;
            
            if ( reset || this._panelView == null ) {
                this._panelView = new GeckoJS.NSITreeViewArray( this._records );
                this.getListObj().datasource = this._panelView;
            } else {
                this._panelView.data = this._records;
            }
            
            this._listObj.refresh();
            this.validateForm();
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
                var quantity = inputObj.quantity.replace( /^\s*/, '' ).replace( /\s*$/, '' );

                document.getElementById( 'modify_stock' ).setAttribute( 'disabled', isNaN( quantity ) );
                document.getElementById( 'quantity' ).removeAttribute( 'disabled' );
            } else {
                document.getElementById( 'modify_stock' ).setAttribute( 'disabled', true );
                document.getElementById( 'quantity' ).setAttribute( 'disabled', true );
            }
        },
        
        modifyStock: function() {// used by stock adjustment.
            var product_no = document.getElementById( 'product_no' ).value;
        	var quantity = parseInt( document.getElementById( 'quantity' ).value, 10 );
        	var memo = document.getElementById( 'memo' ).value;
        	
        	this.adjustStock( product_no, quantity, memo );
        	
        	this.updateStock();
        },
        
        adjustStock: function( product_no, quantity, memo ) {// used by stock adjustment.
        	var stockRecord = this._stockRecordsByProductNo[ product_no ];
        	var qty_difference = quantity - stockRecord.quantity;
        	stockRecord.quantity = quantity;
        	stockRecord.memo = memo;
        	
        	var user = this.Acl.getUserPrincipal();
        	
        	var stockRecordModel = new StockRecordModel();
        	stockRecordModel.set( stockRecord );
        	
        	var adjustment = {};
        	for ( attr in stockRecord )
        		adjustment[ attr ] = stockRecord[ attr ];
        	adjustment.id = '';
        	adjustment.difference = qty_difference;
        	adjustment.new_quantity = quantity;
        	adjustment.sale_period = GeckoJS.Session.get( 'sale_period' );
        	adjustment.shift_number = GeckoJS.Session.get( 'shift_number' );
        	adjustment.clerk = user.username;
        	
        	var stockAdjustmentModel = new StockAdjustmentModel();
        	stockAdjustmentModel.set( adjustment );
        }
    };
    
    GeckoJS.Controller.extend( __controller__ );
} )();

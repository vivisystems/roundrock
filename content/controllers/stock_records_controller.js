( function() {
    // for using the checkMedia method.
    include( 'chrome://viviecr/content/reports/controllers/components/check_media.js' );
    
    // including models.
    include( "chrome://viviecr/content/models/stock_record.js" );
    include( "chrome://viviecr/content/models/inventory_record.js" );
    include( "chrome://viviecr/content/models/inventory_commitment.js" );

    var __controller__ = {

        name: 'StockRecords',

        scaffold: false,

        uses: [ 'Product', 'StockRecord' ],

        _listObj: null,
        _listData: null,
        _panelView: null,
        _selectedIndex: 0,
        _stockRecordsByProductNo: null,
        _barcodesIndexes: null,
        _records: null,
        _folderName: 'vivipos_stock',
        _fileName: 'stock.csv',

        syncSettings: null,
        
        initial: function () {
            // get handle to Main controller
            var main = GeckoJS.Controller.getInstanceByName( 'Main' );
            if ( main ) {
                main.addEventListener( 'afterTruncateTxnRecords', this._emptyStockRelativeTables, this );
            }
        },

        getListObj: function() {
            if( this._listObj == null ) {
                this._listObj = document.getElementById( 'stockrecordscrollablepanel' );
                this._barcodesIndexes = GeckoJS.Session.get( 'barcodesIndexes' );
            }
            return this._listObj;
        },

        list: function() {
            var stockRecordModel = new StockRecordModel();
            
            var sql =
                "select s.*, p.no as product_no, p.name as product_name, p.min_stock as min_stock, p.auto_maintain_stock as auto_maintain_stock " +
                "from stock_records s join products p on s.id = p.no " +
                "order by product_no;"; // the result must be sorted by product_no for the use of binary search in locateIndex method.
            	
            var stockRecords = stockRecordModel.getDataSource().fetchAll( sql );
            
            this._listData = stockRecords;
            
            // construct _stockRecordsByProductNo.
            this._stockRecordsByProductNo = {};
            var stockRecordsByProductNo = this._stockRecordsByProductNo;
            stockRecords.forEach( function( stockRecord ) {
                stockRecord.new_quantity = stockRecord.quantity;
                stockRecord.qty_difference = stockRecord.new_quantity - stockRecord.quantity;
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
                GREUtils.Dialog.alert(
                    this.topmostWindow,
                    _( 'Product Search' ),
                    _( 'Product/Barcode Number (%S) not found!', [ barcode ] )
                );
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
            var lowstock = false;
            var showLowStock = document.getElementById( 'show_low_stock' );
            if ( showLowStock )
                lowstock = showLowStock.checked;
            
            var qtyDiff = false;
            var showQtyDiff = document.getElementById( 'show_qty_diff' );
            if ( showQtyDiff )
                qtyDiff = showQtyDiff.checked;
                
            var maintainedOnes = false;
            var showMaintainedOnes = document.getElementById( 'show_maintained_ones' );
            if ( showMaintainedOnes )
                maintainedOnes = showMaintainedOnes.checked;

            this._records = this._listData;
            // filter the records by the constraints user checked.
            if ( lowstock || qtyDiff || maintainedOnes ) {
                var oldlength = this._records.length;
                this._records = this._records.filter( function( d ) {
                    var r = true;
                    if ( lowstock ) r = r && parseInt( d.quantity, 10 ) < parseInt( d.min_stock, 10 );
                    if ( qtyDiff ) r = r && parseInt( d.qty_difference, 10 ) != 0;
                    if ( maintainedOnes ) r = r && d.auto_maintain_stock;
                    return r;
                } );
                if ( oldlength != this._records.length ) reset = true;
            }
            
            if ( reset || this._panelView == null ) {
                this._panelView = new GeckoJS.NSITreeViewArray( this._records );
                this.getListObj().datasource = this._panelView;
            } else {
                this._panelView.data = this._records;
            }
            
            this._listObj.refresh();
            this.validateForm();
        },

        clickLowStock: function () {
            this._selectedIndex = -1;
            this.updateStock( true );
        },
        
        clickQtyDiff: function () {
            this._selectedIndex = -1;
            this.updateStock( true );
        },
        
        clickMaintainedOnes: function () {
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

        load: function () {

            var isMaster = this.StockRecord.getRemoteServiceUrl('auth') === false;
            var isTraining = GeckoJS.Session.get( "isTraining" );
            
            if ( isMaster && !isTraining ) {
                // insert untracked products into stock_record table. Take branch ID to be warehouse.
                var branch_id = '';
                var storeContact = GeckoJS.Session.get( 'storeContact' );
                if ( storeContact )
                    branch_id = storeContact.branch_id;
                var sql = "SELECT p.no, p.barcode, '" + branch_id + "' AS warehouse FROM products p LEFT JOIN stock_records s ON ( p.no = s.id ) WHERE s.id IS NULL;";
                var products = this.Product.getDataSource().fetchAll( sql );
                
                var stockRecordModel = new StockRecordModel();
                if ( products.length > 0 )
                	stockRecordModel.insertNewRecords( products );
                
                // remove the products which no longer exist from stock_record table.
                sql = "SELECT s.id FROM stock_records s LEFT JOIN products p ON ( s.id = p.no ) WHERE p.no IS NULL;";
                var stockRecords = stockRecordModel.getDataSource().fetchAll( sql );
                if ( stockRecords.length > 0 ) {
                    stockRecords.forEach( function( stockRecord ) {
                        stockRecordModel.remove( stockRecord.id );
                    } );
                }
            } else {
                document.getElementById( 'commitchanges' ).setAttribute( 'disabled', true );
            }
                        
            this.reload();
        },
        
        _emptyStockRelativeTables: function() {
            try {
                var r;
                var stockRecordModel = new StockRecordModel();
                r = stockRecordModel.execute( "DELETE FROM stock_records;" );
                var inventoryRecordModel = new InventoryRecordModel();
                r = inventoryRecordModel.execute( "DELETE FROM inventory_records;" );
                var inventoryCommitmentModel = new InventoryCommitmentModel();
                r = inventoryCommitmentModel.execute( "DELETE FROM inventory_commitments;" );
            } catch ( e ) {
                dump( e );
                throw e;
            }
        },
        
        reload: function() {
            this._selectedIndex = -1;
            this.list();
            //$( '#plu_id' ).val( '' );
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
            }/*
            else {
                // clear form only if plu_id not set
                if ( $( '#plu_id' ).val() == '' )
                    GeckoJS.FormHelper.reset( 'productForm' );
            }*/

            this.validateForm();
        },

        validateForm: function () {
            var inputObj = GeckoJS.FormHelper.serializeToObject( 'productForm' );
            if ( inputObj.product_no != null && inputObj.product_no != '' ) {
                var newQuantity = null;
                if ( inputObj.new_quantity )
                    newQuantity = inputObj.new_quantity.replace( /^\s*/, '' ).replace( /\s*$/, '' );

                document.getElementById( 'modify_stock' ).setAttribute( 'disabled', isNaN( newQuantity || "If newQty is null, doing this for isNaN to return true." ) );
                var new_qty = document.getElementById( 'new_quantity' ); 
                if ( new_qty )
                    new_qty.removeAttribute( 'disabled' );
            } else {
                document.getElementById( 'modify_stock' ).setAttribute( 'disabled', true );
                var new_qty = document.getElementById( 'new_quantity' ); 
                if ( new_qty )
                    new_qty.setAttribute( 'disabled', true );
            }
        },
        
        reset: function() {
            if ( !GREUtils.Dialog.confirm( this.topmostWindow, _('Stock Control'), _( 'Are you sure you want to reset all the stock records?' ) ) )
                return;
        		
            //var oldRowCount = this._listObj.datasource.tree.view.rowCount;
            //if ( oldRowCount > 0 )// We have to remove the existent data and refresh the treeview first.
                //this._listObj.datasource.tree.rowCountChanged( 0, -oldRowCount );
                
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=420';
            var inputObj = {
                input0: null,
                require0: true,
                numberOnly0: true,
                numpad: true
            };

            GREUtils.Dialog.openWindow(
                this.topmostWindow,
                aURL,
                _('Set All Stock'),
                aFeatures,
                _('Set All Stock'),
                '',
                _('Quantity:'),
                '',
                inputObj
            );
            
            // get and set the new stock quantity of all products.
            var stockQuantity = 0;
            if ( inputObj.ok && inputObj.input0 ) {
                stockQuantity = inputObj.input0;
            }
            
            this._records.forEach( function( record ) {
                record.new_quantity = stockQuantity;
                record.qty_difference = record.new_quantity - record.quantity;
            } );
        	
            this.updateStock();
            
            // not doing so makes the tree panel show nothing.
            //var rowCount = this._listObj.datasource.tree.view.rowCount;
            //this._listObj.datasource.tree.rowCountChanged( 0, rowCount );
        },
        
        modifyStock: function() {
            var product_no = document.getElementById( 'product_no' ).value;
            var newQuantity = document.getElementById( 'new_quantity' ).value;
            var memo = document.getElementById( 'memo' ).value;
        	
            var stockRecord = this._stockRecordsByProductNo[ product_no ];
            stockRecord.new_quantity = newQuantity;
            stockRecord.qty_difference = stockRecord.new_quantity - stockRecord.quantity;
            stockRecord.memo = memo;
        	
            this.updateStock();
        },
        
        commitChanges: function() {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {
                input0: null,
                require0: false,
                menu: null,
                menuItems : [
                    { label: _( "Check Stock" ), value: "check_stock", selected: true },
                    { label: _( "Procure" ), value: "procure" },
                    { label: _( "Waste" ), value: "waste" },
                    { label: _( "Others" ), value: "others" }
               ]
            };

            GREUtils.Dialog.openWindow(
                this.topmostWindow,
                aURL,
                _( 'Commit Changes' ),
                aFeatures,
                _( 'Commit Changes' ),
                '',
                _( 'Memo' ) + ':',
                '',
                inputObj,
                _( 'Type' ) + ':'
            );
            
            var commitmentType = '';
            var commitmentMemo = '';
            if ( inputObj.ok && inputObj.menu ) {
                commitmentType = inputObj.menu;
                commitmentMemo = inputObj.input0;
            } else {// user cancled.
                return;
            }
            
            var commitmentID = GeckoJS.String.uuid();
            
            var inventoryCommitmentModel = new InventoryCommitmentModel();
            inventoryCommitmentModel.set( {
                id: commitmentID,
                type: commitmentType,
                memo: commitmentMemo
            } );
            
            var records = this._records;
            var stockRecords = [];
            var user = this.Acl.getUserPrincipal();
        	
            for ( record in records ) {
                stockRecords.push( {
                    id: records[ record ].product_no,
                    warehouse: records[ record ].warehouse,
                    quantity: records[ record ].new_quantity
                } );
                records[ record ].clerk = user.username;
                records[ record ].commitment_id = commitmentID;
            }
        	
            var stockRecordModel = new StockRecordModel();
            stockRecordModel.setAll( stockRecords );
        	
            var inventoryRecordModel = new InventoryRecordModel();
            inventoryRecordModel.setAll( records.filter( function( record ) { //When the commit type is not check_stock, we just save the non-zero rows.
                    if ( commitmentType == "check_stock" || record.qty_difference != 0 )
                        return true;
                    return false;
                } )
            );
            
            GeckoJS.Observer.notify( null, "StockRecords", "commitChanges" );
        	
            this.reload();
        },

        importRecords: function() {
            /*
            // pop up a file chooser.
  			var nsIFilePicker = Components.interfaces.nsIFilePicker;
			var fileChooser = Components.classes[ "@mozilla.org/filepicker;1" ].createInstance( nsIFilePicker );
			fileChooser.init( window, "Select a File to import", nsIFilePicker.modeOpen );
			
			// set up the default path for our file picker.
			var nsILocalFile = Components.interfaces.nsILocalFile;
			var localFile = Components.classes[ "@mozilla.org/file/local;1" ].createInstance( nsILocalFile );
			
			var initPath = "~/";
			
			// check if there is a usb thumb driver.
			var checkMedia = new CheckMediaComponent();
			var media = checkMedia.checkMedia();
			if ( media ) {
				// the media carrying the path. However, it's dedicated to the use of report. Accordingly, we have to truncate it to be /media/drive name/
				media = media.match( /^\/[^\/]+\/[^\/]+\// );
				initPath = media;
			}
			
			localFile.initWithPath( initPath );
			
			fileChooser.displayDirectory = localFile;
			fileChooser.appendFilter( "filterCSV", "*.csv" );
			var fileChooserReturnValue = fileChooser.show();
			
			var filePath;
			if ( fileChooserReturnValue == fileChooser.returnOK )
				filePath = fileChooser.file.path;
				
			if ( !filePath ) {
				alert( _( 'User canceled or errors occured.' ) );
				return;
			}
			*/
			
            // the stubstitution for the file picker.
            // check if there is a usb thumb driver.
            var filePath;
            var checkMedia = new CheckMediaComponent();
            var media = checkMedia.checkMedia();
            if ( media ) {
                // the media carrying the path. However, it's dedicated to the use of report. Accordingly, we have to truncate it to be /media/drive name/
                media = media.match( /^\/[^\/]+\/[^\/]+\// );
                filePath = media + this._folderName + '/' + this._fileName;
            }
			
            if ( !filePath )
                return;
            
            // Retrieve the content of the comma separated values.
            var file = GREUtils.File.getFile( filePath );
            
            if ( !file ) {
                alert( filePath + _( ' does not exist.' ) );
                return;
            }
            
            file = GREUtils.Charset.convertToUnicode( GREUtils.File.readAllBytes( file ) );
	    
            var re = /[^\x0A]+/g;
            var lines = file.match( re );
	        
            // the question mark in the RE makes .* matches non-greedly.
            re = /".*?"/g;
	        
            var self = this;
            var unmatchableRecords = [];
	        
            lines.forEach( function( line ) {
                var values = line.match( re );
	        	
                // strip off the enclosing double quotes in a stupid way.
                var product_no = values[ 0 ].substr( 1, values[ 0 ].length - 2 );
                var quantity = parseInt( values[ 1 ].substr( 1, values[ 1 ].length - 2 ), 10 );
                var memo = values[ 2 ].substr( 1, values[ 2 ].length - 2 );
	        	
                var stockRecord = self._stockRecordsByProductNo[ product_no ];
                if ( stockRecord ) {
                    stockRecord.new_quantity = quantity;
                    stockRecord.qty_difference = stockRecord.new_quantity - stockRecord.quantity;
                    stockRecord.memo = memo;
                } else {
                    unmatchableRecords.push( product_no );
                }
            } );
	        
            if ( unmatchableRecords.length > 0 ) {
                alert( _( 'The following product numbers do not exist.' ) + '\n' + unmatchableRecords );
            }
        	
            // renew the content of the tree.
            this.updateStock();
        }
    };
    
    GeckoJS.Controller.extend( __controller__ );
    
    window.addEventListener( 'load', function() {
        var main = GeckoJS.Controller.getInstanceByName( 'Main' );
        if(main) main.addEventListener( 'afterInitial', function() {
            main.requestCommand( 'initial', null, 'StockRecords' );
        } );
    }, false );
} )();

(function() {
    // for using the checkMedia method.
    include('chrome://viviecr/content/reports/controllers/components/check_media.js');
    
    // including models.
    include("chrome://viviecr/content/models/stock_record.js");
    include("chrome://viviecr/content/models/inventory_record.js");
    include("chrome://viviecr/content/models/inventory_commitment.js");

    var __controller__ = {

        name: 'StockRecords',

        scaffold: false,

        uses: ['Product', 'StockRecord'],

        _listObj: null,
        _listData: [],
        _panelView: null,
        _selectedIndex: 0,
        _stockRecordsByProductNo: null,
        _barcodesIndexes: null,
        _records: [],
        _folderName: 'vivipos_stock',
        _fileName: 'stock.csv',

        syncSettings: null,
        
        initial: function() {
            // get handle to Main controller
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('afterTruncateTxnRecords', this._emptyStockRelativeTables, this);
                main.addEventListener('afterClearOrderData', this._expireStockRelativeTables, this);
            }
        },

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('stockrecordscrollablepanel');
                this._barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            }
            return this._listObj;
        },

        list: function() {
            var stockRecordModel = new StockRecordModel();
            
            var sql =
                "select s.*, p.no as product_no, p.name as product_name, p.min_stock as min_stock, p.auto_maintain_stock as auto_maintain_stock " +
                "from stock_records s join products p on s.id = p.no " +
                "order by product_no;"; // the result must be sorted by product_no for the use of binary search in locateIndex method.

            var ds = stockRecordModel.getDataSource()
            var stockRecords = ds.fetchAll(sql);
            if (ds.lastError != 0) {
                this._dbError(ds.lastError, ds.lastErrorString,
                              _('An error was encountered while retrieving stock records (error code %S).', [ds.lastError]));
            }
            this._listData = stockRecords;
            
            // construct _stockRecordsByProductNo.
            this._stockRecordsByProductNo = {};
            var stockRecordsByProductNo = this._stockRecordsByProductNo;
            stockRecords.forEach(function(stockRecord) {
                stockRecord.new_quantity = stockRecord.quantity;
                stockRecord.qty_difference = stockRecord.new_quantity - stockRecord.quantity;
                stockRecord.memo = '';
                stockRecordsByProductNo[stockRecord.product_no] = stockRecord;
            });
        },

        searchPlu: function() {
            var barcode = document.getElementById('plu').value.replace(/^\s*/, '').replace(/\s*$/, '');
            $('#plu').val('').focus();
            if (barcode == '') return;

            var product;

            if (!this._barcodesIndexes[barcode]) {
                // barcode notfound
                GREUtils.Dialog.alert(
                    this.topmostWindow,
                    _('Product Search'),
                    _('Product/Barcode Number (%S) not found!', [barcode])
               );
            } else {
                product = this._stockRecordsByProductNo[barcode];
                GeckoJS.FormHelper.reset('productForm');
                GeckoJS.FormHelper.unserializeFromObject('productForm', product);

                this._selectedIndex =  this.locateIndex(product, this._records);
                this._listObj.selectedIndex = this._selectedIndex;
                this._listObj.selection.select(this._selectedIndex);
                this._panelView.tree.ensureRowIsVisible(this._selectedIndex);
            }

            this.validateForm();
        },

        updateStock: function(reset) {
            var lowstock = false;
            var showLowStock = document.getElementById('show_low_stock');
            if (showLowStock)
                lowstock = showLowStock.checked;
            
            var qtyDiff = false;
            var showQtyDiff = document.getElementById('show_qty_diff');
            if (showQtyDiff)
                qtyDiff = showQtyDiff.checked;
                
            var maintainedOnes = false;
            var showMaintainedOnes = document.getElementById('show_maintained_ones');
            if (showMaintainedOnes)
                maintainedOnes = showMaintainedOnes.checked;

            this._records = this._listData;
            // filter the records by the constraints user checked.
            if (lowstock || qtyDiff || maintainedOnes) {
                var oldlength = this._records.length;
                this._records = this._records.filter(function(d) {
                    var r = true;
                    if (lowstock) r = r && parseInt(d.quantity, 10) < parseInt(d.min_stock, 10);
                    if (qtyDiff) r = r && parseInt(d.qty_difference, 10) != 0;
                    if (maintainedOnes) r = r && d.auto_maintain_stock;
                    return r;
                });
                if (oldlength != this._records.length) reset = true;
            }
            
            if (reset || this._panelView == null) {
                this._panelView = new GeckoJS.NSITreeViewArray(this._records);
                this.getListObj().datasource = this._panelView;
            } else {
                this._panelView.data = this._records;
            }
            
            this._listObj.refresh();
            this.validateForm();
        },

        clickLowStock: function() {
            this._selectedIndex = -1;
            this.updateStock(true);
        },
        
        clickQtyDiff: function() {
            this._selectedIndex = -1;
            this.updateStock(true);
        },
        
        clickMaintainedOnes: function() {
            this._selectedIndex = -1;
            this.updateStock(true);
        },

        locateIndex: function(product, list) {
            // locate product in list using binary search
            var low = 0;
            var N = list.length;
            var high = N;
            while (low < high) {
                var mid = Math.floor((low - (- high)) / 2);
                (list[mid].product_no < product.product_no) ? low = mid + 1 : high = mid;
            }
            // high == low, using high or low depends on taste
            if ((low < N) && (list[low].product_no == product.product_no))
                return low; // found
            else return -1; // not found
        },

        load: function() {

            var isMaster = this.StockRecord.getRemoteServiceUrl('auth') === false;
            var isTraining = GeckoJS.Session.get("isTraining");
            
            if (isMaster && !isTraining) {
                
                var branch_id = '';
                var storeContact = GeckoJS.Session.get('storeContact');
                if (storeContact)
                    branch_id = storeContact.branch_id;

                var sql = "SELECT p.no, p.barcode, '" + branch_id + "' AS warehouse FROM products p LEFT JOIN stock_records s ON (p.no = s.id) WHERE s.id IS NULL;";
                var ds = this.Product.getDataSource();
                var products = ds.fetchAll(sql);
                if (ds.lastError != 0) {
                    this._dbError(ds.lastError, ds.lastErrorString,
                                  _('An error was encountered while retrieving products (error code %S).', [ds.lastError]));
                }

                var stockRecordModel = new StockRecordModel();
                if (products.length > 0) {
                	if (!stockRecordModel.insertNewRecords(products)) {
                        this._dbError(stockRecordModel.lastError, stockRecordModel.lastErrorString,
                                      _('An error was encountered while inserting product stock records (error code %S).', [stockRecordModel.lastError]));
                    }
                }
                
                // remove the products which no longer exist from stock_record table.
                sql = "SELECT s.id FROM stock_records s LEFT JOIN products p ON (s.id = p.no) WHERE p.no IS NULL;";
                var stockRecords = stockRecordModel.getDataSource().fetchAll(sql);
                if (stockRecords.length > 0) {
                    stockRecords.forEach(function(stockRecord) {
                        stockRecordModel.remove(stockRecord.id);
                    });
                }
            } else {
                document.getElementById('commitchanges').setAttribute('disabled', true);
            }
                        
            this.reload();
        },
        
        _emptyStockRelativeTables: function() {
            var stockRecordModel = new StockRecordModel();
            stockRecordModel.execute("DELETE FROM stock_records;");

            var inventoryRecordModel = new InventoryRecordModel();
            inventoryRecordModel.execute("DELETE FROM inventory_records;");

            var inventoryCommitmentModel = new InventoryCommitmentModel();
            inventoryCommitmentModel.execute("DELETE FROM inventory_commitments;");
        },
        
        reload: function() {
            this._selectedIndex = -1;
            this.list();
            this.updateStock();

            document.getElementById('plu').focus();
        },

        select: function(index) {
            if (index >= this._records.length)
                index = this._records.length - 1;
        		
            this._selectedIndex = index;

            if (index >= 0) {
                var item = this._records[index];
                GeckoJS.FormHelper.unserializeFromObject('productForm', item);
            }

            this.validateForm();
        },

        validateForm: function() {
            var inputObj = GeckoJS.FormHelper.serializeToObject('productForm');
            if (inputObj.product_no != null && inputObj.product_no != '') {
                var newQuantity = null;
                if (inputObj.new_quantity)
                    newQuantity = inputObj.new_quantity.replace(/^\s*/, '').replace(/\s*$/, '');

                document.getElementById('modify_stock').setAttribute('disabled', isNaN(newQuantity || "If newQty is null, doing this for isNaN to return true."));
                var new_qty = document.getElementById('new_quantity'); 
                if (new_qty)
                    new_qty.removeAttribute('disabled');
            } else {
                document.getElementById('modify_stock').setAttribute('disabled', true);
                var new_qty = document.getElementById('new_quantity'); 
                if (new_qty)
                    new_qty.setAttribute('disabled', true);
            }
        },
        
        reset: function() {
            if (!GREUtils.Dialog.confirm(this.topmostWindow, _('Stock Control'), _('Are you sure you want to reset stock for all the products?')))
                return;
        		
            var aURL = 'chrome://viviecr/content/prompt_stockadjustment.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=550';
            var inputObj = {reset: true};

            GREUtils.Dialog.openWindow(
                this.topmostWindow,
                aURL,
                _('Reset Stock'),
                aFeatures,
                inputObj
           );
            
            // get and set the new stock quantity of all products.
            var stockQuantity;
            if (inputObj.ok && inputObj.quantity) {
                stockQuantity = parseFloat(inputObj.quantity);
            }
            
            if (!isNaN(stockQuantity)) {
                this._records.forEach(function(record) {
                    record.new_quantity = stockQuantity;
                    record.qty_difference = record.new_quantity - record.quantity;
                });
            }
            else {
                GREUtils.Dialog.alert(
                    this.topmostWindow,
                    _('Stock Adjustment'),
                    _('Cannot reset product stock to [%S]', [inputObj.quantity]));
                return;
            }
        	
            this.updateStock();
        },
        
        modifyStock: function() {
            var product_no = document.getElementById('product_no').value;
            var newQuantity = parseFloat(document.getElementById('new_quantity').value);
            var memo = document.getElementById('memo').value;
        	
            if (!isNaN(newQuantity)) {
                var stockRecord = this._stockRecordsByProductNo[product_no];
                stockRecord.new_quantity = newQuantity;
                stockRecord.qty_difference = stockRecord.new_quantity - stockRecord.quantity;
                stockRecord.memo = memo;

                this.updateStock();
            }
        },
        
        commitChanges: function() {

            // check if there are changes to commit
            var changed = false;
            for (var i = 0; !changed && i < this._records.length; i++) {
                changed = (this._records[i].qty_difference != 0)
            }

            if (!changed) {
                GREUtils.Dialog.alert(
                    this.topmostWindow,
                    _('Stock Adjustment'),
                    _('No adjustment has been made'));
                return;
            }

            var aURL = 'chrome://viviecr/content/prompt_stockadjustment.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=450,height=560';

            // retrieve list of suppliers
            var inventoryCommitmentModel = new InventoryCommitmentModel();
            var suppliers = inventoryCommitmentModel.find('all', {fields: ['supplier'],
                                                                  group: 'supplier',
                                                                  limit: 3000,
                                                                  recursive: 0});
            if (inventoryCommitmentModel.lastError != 0) {
                this._dbError(inventoryCommitmentModel.lastError, inventoryCommitmentModel.lastErrorString,
                              _('An error was encountered while retrieving stock adjustment records (error code %S).', [inventoryCommitmentModel.lastError]));
                return;
            }
            
            var inputObj = {commit: true, suppliers: suppliers};

            GREUtils.Dialog.openWindow(
                this.topmostWindow,
                aURL,
                _('Stock Adjustment'),
                aFeatures,
                inputObj
           );

            var adjustmentReason = '';
            var adjustmentMemo = '';
            var adjustmentSupplier = '';
            if (inputObj.ok && inputObj.reason) {
                adjustmentReason = inputObj.reason;
                adjustmentMemo = inputObj.memo;
                adjustmentSupplier = inputObj.supplier;
            } else {// user canceled.
                return;
            }
            
            var commitmentID = GeckoJS.String.uuid();
            
            if (!inventoryCommitmentModel.set({
                    id: commitmentID,
                    type: adjustmentReason,
                    memo: adjustmentMemo,
                    supplier: adjustmentSupplier
                })) {
                this._dbError(inventoryCommitmentModel.lastError, inventoryCommitmentModel.lastErrorString,
                              _('An error was encountered while saving stock adjustment records (error code %S).', [inventoryCommitmentModel.lastError]));
                return;
            }
            
            var stockRecords = [];
            var user = this.Acl.getUserPrincipal();
        	
            var records = this._records.filter(function(record) { //When the commit type is not 'inventory', we just save the non-zero rows.
                    if (adjustmentReason == "inventory" || record.qty_difference != 0)
                        return true;
                    return false;
                });

            for (record in records) {
                stockRecords.push({
                    id: records[record].product_no,
                    warehouse: records[record].warehouse,
                    quantity: records[record].new_quantity
                });
                records[record].clerk = user.username;
                records[record].commitment_id = commitmentID;
            }
        	
            var stockRecordModel = new StockRecordModel();
            stockRecordModel.setAll(stockRecords);
        	
            var inventoryRecordModel = new InventoryRecordModel();
            inventoryRecordModel.setAll(records);

            GeckoJS.Observer.notify(null, 'StockRecords', 'commitChanges');
        	
            GREUtils.Dialog.alert(
                this.topmostWindow,
                _('Stock Adjustment'),
                _('Stock level has been successfully adjusted')
           );

            this.reload();
        },

        importRecords: function() {
			
            // check if there is a usb thumb driver.
            var filePath;
            var checkMedia = new CheckMediaComponent();
            var media = checkMedia.checkMedia();
            if (media) {
                // the media carrying the path. However, it's dedicated to the use of report. Accordingly, we have to truncate it to be /media/drive name/
                media = media.match(/^\/[^\/]+\/[^\/]+\//);
                filePath = media + this._folderName + '/' + this._fileName;
            }
			
            if (!filePath)
                return;
            
            // Retrieve the content of the comma separated values.
            var file = GREUtils.File.getFile(filePath);
            
            if (!file) {
                alert(filePath + _(' does not exist.'));
                return;
            }
            
            file = GREUtils.Charset.convertToUnicode(GREUtils.File.readAllBytes(file));
	    
            var re = /[^\x0A]+/g;
            var lines = file.match(re);
	        
            // the question mark in the RE makes .* matches non-greedly.
            re = /".*?"/g;
	        
            var self = this;
            var unmatchableRecords = [];
	        
            lines.forEach(function(line) {
                var values = line.match(re);
	        	
                // strip off the enclosing double quotes in a stupid way.
                var product_no = values[0].substr(1, values[0].length - 2);
                var quantity = parseInt(values[1].substr(1, values[1].length - 2), 10);
                var memo = values[2].substr(1, values[2].length - 2);
	        	
                var stockRecord = self._stockRecordsByProductNo[product_no];
                if (stockRecord) {
                    stockRecord.new_quantity = quantity;
                    stockRecord.qty_difference = stockRecord.new_quantity - stockRecord.quantity;
                    stockRecord.memo = memo;
                } else {
                    unmatchableRecords.push(product_no);
                }
            });
	        
            if (unmatchableRecords.length > 0) {
                alert(_('The following product numbers do not exist.') + '\n' + unmatchableRecords);
            }
        	
            // renew the content of the tree.
            this.updateStock();
        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', errmsg + '\nDatabase Error [' +  errno + ']: [' + errstr + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                                  _('Data Operation Error'),
                                  errmsg + '\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        }
    };
    
    GeckoJS.Controller.extend(__controller__);
    
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
            main.requestCommand('initial', null, 'StockRecords');
        });
    }, false);
})();

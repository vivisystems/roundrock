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
        _stockRecordsByProductNo: {},
        _stockRecordsByBarcode: {},
        _barcodesIndexes: null,
        _records: [],
        _folderName: 'stock_import',
        _fileName: 'stock.csv',

        syncSettings: null,
        
        initial: function() {
            // get handle to Main controller
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if (main) {
                main.addEventListener('afterTruncateTxnRecords', this._emptyStockRelativeTables, this);
                main.addEventListener('afterClearOrderData', this._expireStockRelativeTables, this);
                main.addEventListener('afterPackOrderData', this._packStockRelativeTables, this);
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

            // sync stock record before list, if machine not master.
            this.StockRecord.syncAllStockRecords();
            
            var stockRecords = this.StockRecord.find('all', {order: 'products.no', recursive: 1});

            stockRecords.forEach(function(stock) {
                if (stock.Product) {
                    stock.product_no = stock.Product.no;
                    stock.product_name = stock.Product.name;
                    stock.product_barcode = stock.Product.barcode;
                    stock.min_stock = stock.Product.min_stock;
                    stock.auto_maintain_stock = stock.Product.auto_maintain_stock;
                }
            }, this);
            
            if (this.StockRecord.lastError != 0) {
                this._dbError(this.StockRecord.lastError, this.StockRecord.lastErrorString,
                              _('An error was encountered while retrieving stock records (error code %S).', [this.StockRecord.lastError]));
            }
            this._listData = stockRecords;
            
            // construct _stockRecordsByProductNo & _stockRecordsByBarcode;
            var stockRecordsByProductNo = {};
            var stockRecordsByBarcode = {};
            stockRecords.forEach(function(stockRecord) {
                stockRecord.new_quantity = stockRecord.quantity;
                stockRecord.qty_difference = stockRecord.new_quantity - stockRecord.quantity;
                stockRecord.memo = '';
                stockRecord.price = null;
                stockRecordsByProductNo[stockRecord.product_no] = stockRecord;
                stockRecordsByBarcode[stockRecord.product_barcode] = stockRecord;
            });
            this._stockRecordsByProductNo = stockRecordsByProductNo;
            this._stockRecordsByBarcode= stockRecordsByBarcode;
        },

        searchPlu: function() {
            var barcode = document.getElementById('plu').value.replace(/^\s*/, '').replace(/\s*$/, '');
            $('#plu').val('').focus();
            if (barcode == '') return;

            var product = this._stockRecordsByProductNo[barcode] || this._stockRecordsByBarcode[barcode];

            if (!product) {
                // barcode notfound
                GREUtils.Dialog.alert(
                    this.topmostWindow,
                    _('Product Search'),
                    _('Product/Barcode Number (%S) not found!', [barcode])
               );
            } else {
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

                var stockRecordModel = new StockRecordModel();

                // explicitly invoke restoreFromBackup() before calling fetchAll()
                this.Product.restoreFromBackup();
                stockRecordModel.restoreFromBackup();
                
                var sql = "SELECT p.no, p.barcode, '" + branch_id + "' AS warehouse FROM products p LEFT JOIN stock_records s ON (p.no = s.id) WHERE s.id IS NULL;";
                var ds = this.Product.getDataSource();
                var products = ds.fetchAll(sql);
                if (ds.lastError != 0) {
                    this._dbError(ds.lastError, ds.lastErrorString,
                                  _('An error was encountered while retrieving products (error code %S).', [ds.lastError]));
                }

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
            try {
                var model = new StockRecordModel();
                var r = model.truncate();
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing all stock records (error code %S).', [model.lastError])};
                }

                model = new InventoryRecordModel();
                r = model.truncate();
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing all stock adjustment details (error code %S).', [model.lastError])};
                }

                model = new InventoryCommitmentModel();
                r = model.truncate();
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: ('An error was encountered while removing stock adjustment records (error code %S).', [model.lastError])};
                }
            }
            catch(e) {
                this._dbError(e.errno, e.errstr, e.errmsg);
            }
        },

        _expireStockRelativeTables: function() {
            
            var retainDays = GeckoJS.Configure.read('vivipos.fec.settings.InventoryAdjustmentRetainDays') || 0;

            if (retainDays > 0) {
                try {
                    var retainDate = Date.today().addDays(retainDays * -1).getTime() / 1000;
                    
                    var model = new InventoryCommitmentModel();
                    var r = model.restoreFromBackup();
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring backup stock adjustment records (error code %S).', [model.lastError])};
                    }

                    r = model.execute('delete from inventory_commitments where created <= ' + retainDate);
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring stock adjustment records (error code %S).', [model.lastError])};
                    }

                    model = new InventoryRecordModel();
                    r = model.restoreFromBackup();
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring backup stock adjustment details (error code %S).', [model.lastError])};
                    }

                    r = model.execute('delete from inventory_records where not exists (select 1 from inventory_commitments where inventory_commitments.id == inventory_records.commitment_id)') && r;
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring stock adjustment details (error code %S).', [model.lastError])};
                    }
                }
                catch(e) {
                    this._dbError(e.errno, e.errstr, e.errmsg);
                }
            }
        },

        _packStockRelativeTables: function() {
            var model = new InventoryRecordModel();

            model.execute('VACUUM');
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
            }
        },
        
        modifyStock: function() {
            var product_no = document.getElementById('product_no').value;
            var newQuantity = parseFloat(document.getElementById('new_quantity').value);
            var memo = document.getElementById('memo').value;
            var price = document.getElementById('price').value;
        	
            if (!isNaN(newQuantity)) {
                var stockRecord = this._stockRecordsByProductNo[product_no];
                stockRecord.new_quantity = newQuantity;
                stockRecord.qty_difference = stockRecord.new_quantity - stockRecord.quantity;
                stockRecord.memo = memo;
                stockRecord.price = price;

                this.updateStock();
            }
        },
        
        commitChanges: function() {

            // check if there are changes to commit
            var changed = false;
            for (var i = 0; !changed && i < this._records.length; i++) {
                changed = (this._records[i].qty_difference != 0);
                changed = changed || this._records[i].memo.length > 0;
                changed = changed || this._records[i].price;
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
                adjustmentReason = inputObj.reason || '';
                adjustmentMemo = inputObj.memo || '';
                adjustmentSupplier = inputObj.supplier || '';
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
            if (!stockRecordModel.setAll(stockRecords)) {
                this._dbError(stockRecordModel.lastError, stockRecordModel.lastErrorString,
                              _('An error was encountered while saving stock records (error code %S).', [stockRecordModel.lastError]));
                return;
            }
        	
            var inventoryRecordModel = new InventoryRecordModel();
            if (!inventoryRecordModel.setAll(records)) {
                this._dbError(inventoryRecordModel.lastError, inventoryRecordModel.lastErrorString,
                              _('An error was encountered while saving stock adjustment details (error code %S).', [inventoryRecordModel.lastError]));
                return;
            }

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
            else {
                NotifyUtils.warn( _( 'Media not found!! Please attach the USB thumb drive...' ) );
                return;
            }
            
            // Retrieve the content of the comma separated values.
            var file = GREUtils.File.getFile(filePath);
            
            if (!file) {
                GREUtils.Dialog.alert(
                    this.topmostWindow,
                    _('Import Product Stock'),
                    _('File [%S] does not exist', [filePath])
                );
                return;
            }
            
            var lines = GREUtils.File.readAllLine(file);
            var memo = _('imported from [%S]', [filePath]);
            var unmatchedRecords = [];
	        var count = 0;
            lines.forEach(function(line, index) {

                var values = GeckoJS.String.parseCSV(line, ',');
                if (values[0]) {
                    var product_no = values[0][0] || '';
                    var quantity = values[0][1] || '';
                    var price = values[0][2] || '';

                    var stockRecord = this._stockRecordsByProductNo[product_no] || this._stockRecordsByBarcode[product_no];
                    if (stockRecord) {
                        stockRecord.new_quantity = quantity;
                        stockRecord.qty_difference = stockRecord.new_quantity - stockRecord.quantity;
                        stockRecord.price = price || null;
                        stockRecord.memo = memo;
                        count++;
                    } else {
                        unmatchedRecords.push({line: index + 1, no: product_no});
                    }
                }
            }, this);
	        
            if (unmatchedRecords.length > 0) {
                var errorPanel = document.getElementById('error_panel');
                if (errorPanel) {
                    var errorlist = document.getElementById('errorscrollablepanel');
                    if (errorlist) {
                        errorlist.datasource = unmatchedRecords;

                        errorPanel.openPopupAtScreen(0, 0);
                    }
                }
            }

            GREUtils.Dialog.alert(
                this.topmostWindow,
                _('Import Product Stock'),
                _('Product stock information imported: %S successes, %S failures)', [count, unmatchedRecords.length])
            );
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

    // mainWindow register stock initial
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {

        window.addEventListener('load', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) main.addEventListener('afterInitial', function() {
                main.requestCommand('initial', null, 'StockRecords');
            });
        }, false);
    }
    
})();

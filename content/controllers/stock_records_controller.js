(function() {

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    // for using the checkMedia method.
    include('chrome://viviecr/content/reports/controllers/components/check_media.js');

    // for using the isBuiltInSaleUnit method.
    include('chrome://viviecr/content/controllers/components/cart_utils.js');
    
    // including models.
    include("chrome://viviecr/content/models/stock_record.js");
    include("chrome://viviecr/content/models/inventory_record.js");
    include("chrome://viviecr/content/models/inventory_commitment.js");

    var __controller__ = {

        name: 'StockRecords',

        components: ['CartUtils'],
        
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
        _adjustmentReason: '',
        _adjustmentMemo: '',
        _adjustmentSupplier: '',

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
            
            // make progressbar move
            this.sleep(100);

            //var stockRecords = this.StockRecord.find('all', {fields: "products." , order: 'products.no', recursive: 1});
            // attach vivipos.sqlite to use product table.
            var productDB = this.Product.getDataSource().path + '/' + this.Product.getDataSource().database;
            var sql = "ATTACH '" + productDB + "' AS vivipos;";
            this.StockRecord.execute( sql );
            
            // make progressbar move
            this.sleep(100);

            sql = "SELECT products.no, products.name, products.barcode, products.sale_unit, products.min_stock, products.auto_maintain_stock, stock_records.warehouse, stock_records.quantity FROM products INNER  JOIN stock_records ON (products.no=stock_records.id) ORDER BY products.no";
            var stockRecords = this.StockRecord.getDataSource().fetchAll(sql);
            
            // make progressbar move
            this.sleep(100);

            // detach the file.
            sql = "DETACH vivipos;";
            this.StockRecord.execute( sql );

            // make progressbar move
            this.sleep(100);

            var saleUnitCache = {};
            stockRecords.forEach(function(stock) {
                stock.product_no = stock.no;
                stock.product_name = stock.name;
                stock.product_barcode = stock.barcode;
                stock.real_sale_unit = stock.sale_unit;

                stock.sale_unit = saleUnitCache[stock.sale_unit] ||
                                 (saleUnitCache[stock.sale_unit] = (this.CartUtils.isBuiltInSaleUnit(stock.sale_unit) ? _('(saleunit)' + stock.sale_unit) : stock.sale_unit));
            }, this);
            
            // make progressbar move
            this.sleep(100);

            if (this.StockRecord.lastError != 0) {
                this._dbError(this.StockRecord.lastError, this.StockRecord.lastErrorString,
                              _('An error was encountered while retrieving stock records (error code %S) [message #1601].', [this.StockRecord.lastError]));
            }
            this._listData = stockRecords;
            
            // construct _stockRecordsByProductNo & _stockRecordsByBarcode;
            var stockRecordsByProductNo = {};
            var stockRecordsByBarcode = {};
            stockRecords.forEach(function(stockRecord) {
                stockRecord.new_quantity = stockRecord.quantity;
                stockRecord.delta = stockRecord.new_quantity - stockRecord.quantity;
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
            var showQtyDiff = document.getElementById('show_delta');
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
                    if (qtyDiff) r = r && parseInt(d.delta, 10) != 0;
                    if (maintainedOnes) r = r && d.auto_maintain_stock;
                    return r;
                });
                if (oldlength != this._records.length) reset = true;
            }

            document.getElementById('records_shown').value = this._records.length;
            document.getElementById('records_total').value = this._listData.length;

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

        load: function(data) {

            var isMaster = this.StockRecord.isRemoteService() === false;
            var isTraining = GeckoJS.Session.get("isTraining");
            
            if (isMaster && !isTraining) {

                this._adjustmentReason = data.reason || '';
                this._adjustmentMemo = data.memo || '';
                this._adjustmentSupplier = data.supplier || '';

                var details = '';
                if (this._adjustmentReason == 'procure') {
                    details = _('(inventory)' + this._adjustmentReason) + (this._adjustmentSupplier ? ' [' + this._adjustmentSupplier + ' ]' : '');
                }
                else {
                    details = _('(inventory)' + this._adjustmentReason);
                }
                details += (this._adjustmentMemo ? ' (' + this._adjustmentMemo + ')' : '');
                document.getElementById('adjustment_type').value = details;

                // adjust form fields according to adjustment reason
                switch(this._adjustmentReason) {

                    case 'inventory':
                        document.getElementById('reset').removeAttribute('hidden');
                        document.getElementById('qtytype').value = _('(inventory)New Quantity');
                        document.getElementById('new_qty').setAttribute('name', 'new_quantity');
                        break;

                    case 'procure':
                        document.getElementById('price_container').removeAttribute('hidden');
                        document.getElementById('qtytype').value = _('(inventory)Procured Quantity (+)');
                        document.getElementById('new_qty').setAttribute('name', 'delta');
                        break;

                    case 'waste':
                        document.getElementById('qtytype').value = _('(inventory)Waste Quantity (-)');
                        document.getElementById('new_qty').setAttribute('name', 'delta');
                        break;

                    case 'other':
                        document.getElementById('qtytype').value = _('(inventory)+/-');
                        document.getElementById('new_qty').setAttribute('name', 'delta');
                        document.getElementById('new_qty').setAttribute('min', '-Infinity');
                        break;
                }
                
                var branch_id = '';
                var storeContact = GeckoJS.Session.get('storeContact');
                if (storeContact)
                    branch_id = storeContact.branch_id;

                var stockRecordModel = new StockRecordModel();

                // explicitly invoke restoreFromBackup() before calling fetchAll()
                this.Product.restoreFromBackup();
                stockRecordModel.restoreFromBackup();

                // attach vivipos.sqlite to use product table.
                var productDB = this.Product.getDataSource().path + '/' + this.Product.getDataSource().database;
                var sql = "ATTACH '" + productDB + "' AS vivipos;";
                this.StockRecord.execute( sql );

                sql = "SELECT p.no, p.barcode, '" + branch_id + "' AS warehouse FROM products p LEFT JOIN stock_records s ON (p.no = s.id) WHERE s.id IS NULL;";
                var ds = this.StockRecord.getDataSource();
                var products = ds.fetchAll(sql);
                if (ds.lastError != 0) {
                    this._dbError(ds.lastError, ds.lastErrorString,
                                  _('An error was encountered while retrieving products (error code %S) [message #1602].', [ds.lastError]));
                }

                if (products.length > 0) {
                	if (!stockRecordModel.insertNewRecords(products)) {
                        this._dbError(stockRecordModel.lastError, stockRecordModel.lastErrorString,
                                      _('An error was encountered while inserting product stock records (error code %S) [message #1603].', [stockRecordModel.lastError]));
                    }
                }

                // remove the products which no longer exist from stock_record table.
                // sql = "SELECT s.id FROM stock_records s LEFT JOIN products p ON (s.id = p.no) WHERE p.no IS NULL;";
                sql = "SELECT s.id FROM stock_records s WHERE s.id NOT IN (SELECT s.id FROM products p INNER JOIN stock_records s ON (p.no = s.id));";
                var stockRecords = stockRecordModel.getDataSource().fetchAll(sql);

                // detach the file.
                sql = "DETACH vivipos;";
                this.StockRecord.execute( sql );

                if (stockRecords.length > 0) {
                    stockRecords.forEach(function(stockRecord) {
                        stockRecordModel.remove(stockRecord.id);
                    });
                }
            } else {
                document.getElementById('toolbar').setAttribute('hidden', true);
            }

            this.reload();
        },
        
        _emptyStockRelativeTables: function() {
            try {
                var model = new StockRecordModel();
                var r = model.execute('delete from stock_records');
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing all stock records (error code %S) [message #1604].', [model.lastError])};
                }

                model = new InventoryRecordModel();
                r = model.execute('delete from inventory_records');
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: _('An error was encountered while removing all stock adjustment details (error code %S) [message #1605].', [model.lastError])};
                }

                model = new InventoryCommitmentModel();
                r = model.execute('delete from inventory_commitments');
                if (!r) {
                    throw {errno: model.lastError,
                           errstr: model.lastErrorString,
                           errmsg: ('An error was encountered while removing stock adjustment records (error code %S) [message #1606].', [model.lastError])};
                }

                model.execute('VACUUM');
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

                    model = new InventoryRecordModel();
                    r = model.restoreFromBackup();
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring backup stock adjustment details (error code %S) [message #1609].', [model.lastError])};
                    }

                    r = model.execute('delete from inventory_records where inventory_records.commitment_id in (select inventory_commitments.id from inventory_commitments where created <= ' + retainDate + ')');
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring stock adjustment details (error code %S) [message #1610].', [model.lastError])};
                    }
                    
                    var model = new InventoryCommitmentModel();
                    var r = model.restoreFromBackup();
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring backup stock adjustment records (error code %S) [message #1607].', [model.lastError])};
                    }

                    r = model.execute('delete from inventory_commitments where created <= ' + retainDate);
                    if (!r) {
                        throw {errno: model.lastError,
                               errstr: model.lastErrorString,
                               errmsg: _('An error was encountered while expiring stock adjustment records (error code %S) [message #1608].', [model.lastError])};
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

        _showWaitPanel: function(message) {
            var waitPanel = document.getElementById('wait_panel');
            waitPanel.openPopupAtScreen(0, 0);

            var caption = document.getElementById( 'wait_caption' );
            caption.label = message;

            // release CPU for progressbar ...
            this.sleep(500);
            return waitPanel;
        },

        reload: function() {
            var waitPanel = this._showWaitPanel(_('Retrieving Stock Information...'))

            this._selectedIndex = -1;
            this.list();
            
            this.updateStock();

            if (waitPanel) waitPanel.hidePopup();
            
            document.getElementById('plu').focus();
        },

        select: function(index) {
            if (index >= this._records.length)
                index = this._records.length - 1;
        		
            this._selectedIndex = index;

            if (index >= 0) {
                var item = this._records[index];

                GeckoJS.FormHelper.unserializeFromObject('productForm', item);

                if (this._adjustmentReason == 'waste') {
                    document.getElementById('new_qty').value = 0 - item.delta;
                }
                if (item.real_sale_unit == 'unit') {
                    document.getElementById('new_qty').setAttribute('decimalplaces', '0');
                }
                else {
                    document.getElementById('new_qty').setAttribute('decimalplaces', 'Infinity');
                }

            }

            this.validateForm();

            document.getElementById('new_qty').select();
        },

        validateForm: function() {
            var newQtyObj = document.getElementById('new_qty');
            var priceObj = document.getElementById('price');
            var memoObj = document.getElementById('memo');
            var modifyBtnObj = document.getElementById('modify_stock');

            var inputObj = GeckoJS.FormHelper.serializeToObject('productForm');
            if (inputObj.product_no != null && inputObj.product_no != '') {
                var newQuantity = null;
                var delta = null;

                if (inputObj.new_quantity)
                    newQuantity = GeckoJS.String.trim(inputObj.new_quantity);

                if (inputObj.delta)
                    delta = GeckoJS.String.trim(inputObj.delta);

                modifyBtnObj.setAttribute('disabled', isNaN(newQuantity) && isNaN(delta));
                newQtyObj.removeAttribute('disabled');
                memoObj.removeAttribute('disabled');
                if (priceObj) priceObj.removeAttribute('disabled');
            } else {
                modifyBtnObj.setAttribute('disabled', true);
                newQtyObj.setAttribute('disabled', true);
                memoObj.setAttribute('disabled', true);
                if (priceObj) priceObj.setAttribute('disabled', true);
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
                        record.delta = record.new_quantity - record.quantity;
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
            var product_no = document.getElementById('prod_no').value;
            var newQuantity = parseFloat(document.getElementById('new_qty').value);
            var memo = document.getElementById('memo').value;
            var price = document.getElementById('price').value;
        	
            if (!isNaN(newQuantity)) {
                var stockRecord = this._stockRecordsByProductNo[product_no];
                
                switch(this._adjustmentReason) {
                    case 'inventory':
                        stockRecord.new_quantity = newQuantity;
                        stockRecord.delta = stockRecord.new_quantity - stockRecord.quantity;
                        break;

                    case 'procure':
                    case 'other':
                        stockRecord.delta = newQuantity;
                        stockRecord.new_quantity = stockRecord.quantity + newQuantity;
                        break;

                    case 'waste':
                        stockRecord.delta = 0 - newQuantity;
                        stockRecord.new_quantity = stockRecord.quantity - newQuantity;
                        break;
                }
                stockRecord.memo = memo;
                stockRecord.price = price;

                this.updateStock();

                OsdUtils.info(_('Stock level adjusted for product [%S - %S]', [stockRecord.no, stockRecord.name]));
            }
        },

        isStockAdjusted: function() {
            // check if there are changes to commit
            var changed = false;
            for (var i = 0; !changed && i < this._records.length; i++) {
                changed = (this._records[i].delta != 0);
                changed = changed || this._records[i].memo.length > 0;
                changed = changed || this._records[i].price;
            }
            return changed;
        },

        exit: function(data) {
            if (this.isStockAdjusted()) {
                if (GREUtils.Dialog.confirm(
                        this.topmostWindow,
                        _('Stock Adjustment'),
                        _('You have made one or more stock adjustments. Discard the changes and exit?'))) {
                    window.close();
                    return;
                }
            }
            else {
                window.close();
            }
        },

        commitChanges: function() {

            if (!this.isStockAdjusted()) {
                GREUtils.Dialog.alert(
                    this.topmostWindow,
                    _('Stock Adjustment'),
                    _('No adjustment has been made'));
                return;
            }

            var waitPanel = this._showWaitPanel(_('Saving Stock Data...'))

            var inventoryCommitmentModel = new InventoryCommitmentModel();
            var commitmentID = GeckoJS.String.uuid();
            var user = this.Acl.getUserPrincipal();

            if (!inventoryCommitmentModel.set({
                    id: commitmentID,
                    type: this._adjustmentReason,
                    memo: this._adjustmentMemo,
                    supplier: this._adjustmentSupplier,
                    clerk: user.username
                })) {
                waitPanel.hidePopup();
                this._dbError(inventoryCommitmentModel.lastError, inventoryCommitmentModel.lastErrorString,
                              _('An error was encountered while saving stock adjustment records (error code %S) [message #1611].', [inventoryCommitmentModel.lastError]));
                return;
            }
            
            var stockRecords = [];
        	var records;
            var doInventory = this._adjustmentReason == 'inventory';
            if (doInventory) {
                records = this._records;
            }
            else {
                records = (this._records.filter(function(record) {
                        if (record.delta != 0)
                            return true;
                        else
                            return false;
                    })).concat([]);
            }

            for (record in records) {
                stockRecords.push({
                    id: records[record].product_no,
                    warehouse: records[record].warehouse,
                    quantity: records[record].new_quantity,
                    delta: records[record].delta
                });
                records[record].commitment_id = commitmentID;
                records[record].value = (doInventory) ? records[record].new_quantity : records[record].delta;
            }
        	
            var stockRecordModel = new StockRecordModel();
            if (!stockRecordModel.setAll(stockRecords, doInventory)) {
                this._dbError(stockRecordModel.lastError, stockRecordModel.lastErrorString,
                              _('An error was encountered while saving stock records (error code %S) [message #1612].', [stockRecordModel.lastError]));
                waitPanel.hidePopup();
                return;
            }
        	
            var inventoryRecordModel = new InventoryRecordModel();
            if (!inventoryRecordModel.setAll(records, doInventory)) {
                this._dbError(inventoryRecordModel.lastError, inventoryRecordModel.lastErrorString,
                              _('An error was encountered while saving stock adjustment details (error code %S) [message #1613].', [inventoryRecordModel.lastError]));
                waitPanel.hidePopup();
                return;
            }
            waitPanel.hidePopup();
            
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
                        stockRecord.delta = stockRecord.new_quantity - stockRecord.quantity;
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
                _('Product stock information imported; %S successes, %S failures', [count, unmatchedRecords.length])
            );

            // renew the content of the tree.
            this.updateStock();
        },

        _dbError: function(errno, errstr, errmsg) {
            this.log('ERROR', errmsg + '\nDatabase Error [' +  errno + ']: [' + errstr + ']');
            GREUtils.Dialog.alert(this.topmostWindow,
                                  _('Data Operation Error'),
                                  errmsg + '\n\n' + _('Please restart the machine, and if the problem persists, please contact technical support immediately.'));
        }
    };
    
    AppController.extend(__controller__);

    // mainWindow register stock initial
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {

        window.addEventListener('load', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.requestCommand('initial', null, 'StockRecords');
            }
        }, false);
    }
    
})();

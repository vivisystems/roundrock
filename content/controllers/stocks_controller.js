(function(){

    /**
     * Class ViviPOS.StocksController
     */

    GeckoJS.Controller.extend( {
        name: 'Stocks',
        scaffold: true,
        uses: ['Product'],
	
        _listObj: null,
        _listDatas: null,
        _panelView: null,
        _selectedIndex: 0,
        _productsById: null,
        _barcodesIndexes: null,
        _datas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('stockscrollablepanel');
                this._productsById = GeckoJS.Session.get('productsById');
                this._barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            }
            return this._listObj;
        },

        beforeScaffold: function(evt) {

        },

        list: function() {
            var productModel = new ProductModel();
            var products = productModel.find('all', {
                order: 'no'
            });
            this._listDatas = products;
        },

        afterScaffoldIndex: function(evt) {
        },

        beforeScaffoldView: function(evt) {
            this._listObj.selectedIndex = this._selectedIndex;

        },

        afterScaffoldView: function(evt) {

        },

        beforeScaffoldSave: function (evt) {
        },

        afterScaffoldSave: function(evt) {

        },

        beforeScaffoldAdd: function (evt) {

        },

        afterScaffoldAdd: function (evt) {

        },

        beforeScaffoldEdit: function (evt) {

        },

        afterScaffoldEdit: function (evt) {
            if (evt.justUpdate) {
                //
                //alert('just update');
            } 
            else {
                var product = this._productsById[evt.data.id];
                product.stock = evt.data.stock;
                product.min_stock = evt.data.min_stock;

                var productModel = new ProductModel();
                var products = productModel.find('all', {
                    order: 'no'
                });
                this._listDatas = products;
                this.updateStock();

                // @todo OSD
                OsdUtils.info(_('Stock level for [%S] modified successfully', [evt.data.name]));
            }
        },


        beforeScaffoldDelete: function(evt) {

        },

        afterScaffoldDelete: function(evt) {

        },

        searchPlu: function () {
            var barcode = document.getElementById('plu').value.replace(/^\s*/, '').replace(/\s*$/, '');
            $('#plu').val('').focus();
            if (barcode == '') return;

            // var productsById = GeckoJS.Session.get('productsById');
            // var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var product;

            if (!this._barcodesIndexes[barcode]) {
                // barcode notfound
                alert(_('Product/Barcode Number (%S) not found!', [barcode]));
            }else {
                var id = this._barcodesIndexes[barcode];
                product = this._productsById[id];
                GeckoJS.FormHelper.reset('productForm');
                GeckoJS.FormHelper.unserializeFromObject('productForm', product);

                this._selectedIndex =  this.locateIndex(product, this._datas);
                this._listObj.selectedIndex = this._selectedIndex;
                this._listObj.vivitree.selection.select(this._selectedIndex);
                this._panelView.tree.ensureRowIsVisible(this._selectedIndex);
            }

            this.validateForm();
        },

        updateStock: function (reset) {
            var lowstock = document.getElementById('show_low_stock').checked;

            if (lowstock) {
                var oldlength = this._datas.length;
                this._datas = this._listDatas.filter(function(d){
                    return parseInt(d.stock) < parseInt(d.min_stock);
                });
                if (oldlength != this._datas.length) reset = true;
            }
            else {
                this._datas = this._listDatas;
            }
            if (reset || this._panelView == null) {
                this._panelView = new GeckoJS.NSITreeViewArray(this._datas);
                this.getListObj().datasource = this._panelView;
            }
            else {
                this._panelView.data = this._datas;
            }
            this._listObj.vivitree.refresh();
            //this.select(this._selectedIndex);
            this.validateForm();
        },

        clickLowStock: function () {
            this._selectedIndex = -1;
            this.updateStock(true);
        },

        locateIndex: function (product, list) {

            // locate product in list using binary search

            var low = 0;
            var N = list.length;
            var high = N;
            while (low < high) {
                var mid = Math.floor((low - (- high))/2);
                (list[mid].no < product.no) ? low = mid + 1 : high = mid;
            }
            // high == low, using high or low depends on taste
            if ((low < N) && (list[low].no == product.no))
                return low // found
            else
                return -1 // not found             },
        },

        decStock: function (obj) {
            this._productsById = GeckoJS.Session.get('productsById');
            this._barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');

            for (o in obj.items) {
                var ordItem = obj.items[o];
                var item = this.Product.findById(ordItem.id);
                if (item.auto_maintain_stock) {
                    if (ordItem.current_qty > 0 || item.return_stock)
                        item.stock = item.stock - ordItem.current_qty;
                    var product = new ProductModel();

                    product.id = item.id;
                    product.save(item);
                    delete product;
                    
                    // fire onLowStock event...
                    if (item.min_stock > item.stock) {
                        this.dispatchEvent('onLowStock', item);
                    }

                    // update Session Data...
                    var evt = {data:item, justUpdate: true};
                    this.afterScaffoldEdit(evt);
                }
            }
        },

        load: function () {

            this._selectedIndex = -1;
            this.requestCommand('list');
            $('#plu_id').val('');
            this.updateStock();
        },

        select: function(index){

           if (index >= this._datas.length) index = this._datas.length - 1;
            this._selectedIndex = index;
            
            if (index >= 0) {
                var item = this._datas[index];
                this.requestCommand('view', item.id);
            }
            else {
                // clear form only if plu_id not set
                if ($('#plu_id').val() == '')
                    GeckoJS.FormHelper.reset('productForm');
            }

            this.validateForm();
        },

        validateForm: function () {
            var inputObj = GeckoJS.FormHelper.serializeToObject('productForm');
            if (inputObj.id != null && inputObj.id != '') {
                var stock = inputObj.stock.replace(/^\s*/, '').replace(/\s*$/, '');
                var min_stock = inputObj.min_stock.replace(/^\s*/, '').replace(/\s*$/, '');

                document.getElementById('modify_stock').setAttribute('disabled', isNaN(stock) || isNaN(min_stock));
                document.getElementById('stock').removeAttribute('disabled');
                document.getElementById('min_stock').removeAttribute('disabled');
            }
            else {
                document.getElementById('modify_stock').setAttribute('disabled', true);
                document.getElementById('stock').setAttribute('disabled', true);
                document.getElementById('min_stock').setAttribute('disabled', true);
            }
        }
	
    });


})();


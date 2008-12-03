(function(){

    /**
     * Class ViviPOS.StocksController
     */

    GeckoJS.Controller.extend( {
        name: 'Stocks',
        scaffold: true,
        uses: ["Product"],
	
        _listObj: null,
        _listDatas: null,
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

        afterScaffoldIndex: function(evt) {

            this._listDatas = evt.data;
            return;
            
            var lowstock = document.getElementById('show_low_stock').checked;

            if (lowstock) {
                this._listDatas = evt.data.filter(function(d){
                    return parseInt(d.stock) < parseInt(d.min_stock);
                });
            }else {
                this._listDatas = evt.data;
            }
            var panelView =  new GeckoJS.NSITreeViewArray(this._listDatas);
            this.getListObj().datasource = panelView;

            this._listObj.selectedIndex = this._selectedIndex;
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
           alert( GeckoJS.FormHelper.isFormModified("productForm"));
        },

        afterScaffoldEdit: function (evt) {
            var barcode = evt.data.no;
            var product;
            var id = this._barcodesIndexes[barcode];
            product = this._productsById[id];
            product.stock = evt.data.stock;
            product.min_stock = evt.data.min_stock;
            //            this.log("product:" + this.dump(product));
            this.load();
            
        },


        beforeScaffoldDelete: function(evt) {

        },

        afterScaffoldDelete: function(evt) {

        },

        searchPlu: function (barcode) {
            // alert(barcode);
            $('#plu').val('').focus();
            // $('#plu').focus();
            if (barcode == "") return;

            // var productsById = GeckoJS.Session.get('productsById');
            // var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var product;

            if (!this._barcodesIndexes[barcode]) {
                // barcode notfound
                alert("Plu (" + barcode + ") Not Found!");
            }else {
                var id = this._barcodesIndexes[barcode];
                product = this._productsById[id];
                // this.log("product:" + this.dump(product));
                GeckoJS.FormHelper.unserializeFromObject('productForm', product);
            }
        },

        clickLowStock: function () {
            // var datas = [];
            var lowstock = document.getElementById('show_low_stock').checked;

            if (lowstock) {
                this._datas = this._listDatas.filter(function(d){
                    return parseInt(d.stock) < parseInt(d.min_stock);
                });
            }else {
                this._datas = this._listDatas;
            }
            var panelView =  new GeckoJS.NSITreeViewArray(this._datas);
            this.getListObj().datasource = panelView;

            this._listObj.selectedIndex = this._selectedIndex;
        },

        load: function (data) {
            this.requestCommand('list');
            this.clickLowStock();
        },

        select: function(index){
            if (index >= 0) {
                // var item = this._listDatas[index];
                var item = this._datas[index];
                this._selectedIndex = index;
                this.requestCommand('view', item.id);
            }
        }
	
    });


})();


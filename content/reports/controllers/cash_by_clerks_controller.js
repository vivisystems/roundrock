(function(){

    /**
     * Class ViviPOS.ProductSalesController
     */

    GeckoJS.Controller.extend( {
        name: 'CashByClerks',
	
        _listObj: null,
        _listDatas: null,
        _panelView: null,
        _selectedIndex: 0,
        _datas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('datascrollablepanel');
                // this._productsById = GeckoJS.Session.get('productsById');
                // this._barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            }
            return this._listObj;
        },

        list: function() {
            /*
            var productModel = new ProductModel();
            var products = productModel.find('all', {
                order: 'no'
            });
            this._listDatas = products;
            */
        },

        load: function () {
            this._selectedIndex = -1;
            var order_payment = new OrderPaymentModel();
            var datas = order_payment.find('all');
            this._datas = datas;
            this._panelView = new GeckoJS.NSITreeViewArray(this._datas);
            this.getListObj().datasource = this._panelView;
            // $('#plu_id').val('');
            // this.updateStock();
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

        }
	
    });


})();


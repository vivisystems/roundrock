(function(){

    /**
     * Class ViviPOS.ProductsController
     */
    // GeckoJS.define('ViviPOS.ProductsController');

    GeckoJS.Controller.extend( {
        name: 'Products',
        helpers: ['Form'],
        
        scaffold: true,

        _listObj: null,
        _listProdDatas: null,
        _selCateNo: null,

        getListProductObj: function() {
            if(this._listObj == null) this._listObj = this.query("#simpleListBoxProduct")[0];
            //return this._listObj;
            return this.query("#simpleListBoxProduct")[0];
        },

        setCatNo: function(catno) {
            this._selCateNo = catno;
        },

        load: function (data) {

            // alert("product loaded" + window + " ," + document + "," + this.window['ggyy']) ;

            var cate_no = this._selCateNo;
            var listObj = this.getListProductObj();
            var productModel = new ProductModel();
            var products = productModel.findByIndex('all', {
                index: "cate_no",
                value: cate_no
            });

            this._listProdDatas = products;
            listObj.loadData(products);

            var i = 0;
            var j = 0;
            if (data) {
                if ((typeof data) == 'object' ) {
                    products.forEach(function(o) {
                        if (o.no == data.no) {
                            j = i;
                        }
                        i++;
                    });
                }
            }
            this._listObj.selectedIndex = j;
            this._listObj.ensureIndexIsVisible(j);
        },
	
        afterScaffoldSave: function(evt) {
            this.load(evt.data);
            this.query("#status_bar").val('data saved!');
        },

        /*
        beforeScaffoldDelete: function(evt) {
            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?") == false) {
                evt.preventDefault();
            }
        },
        */
        beforeScaffold: function(evt) {
            if (evt.data == 'delete') {
                if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?") == false) {
                    evt.preventDefault();
                }
            }
        },

        beforeScaffoldSave: function (evt) {

        },

        afterScaffoldDelete: function() {
            this.load();
        },

        beforeScaffoldAdd: function (evt) {
            var product = evt.data;
            if ((product.no == '') || (product.name == '')){
                alert('product no or product name is empty...');
                evt.preventDefault();
                return ;
            }
            var productModel = new ViviPOS.ProductModel();

            var products = productModel.findByIndex('all', {
                index: "no",
                value: product.no
            });
            var barcodes = productModel.findByIndex('all', {
                index: "barcode",
                value: product.barcode
            });

            if (products != null) {
                alert('Duplicate product no...' + product.no);
                evt.preventDefault();
            } else if (barcodes != null) {
                alert('Duplicate barcode...' + product.barcode);
                evt.preventDefault();
            }
        },

        beforeScaffoldEdit: function (evt) {
            var product = evt.data;

            if ((product.no == '') || (product.name == '')){
                alert('product no or product name is empty...');
                evt.preventDefault();
                return ;
            }
            var productModel = new ViviPOS.ProductModel();

            var products = productModel.findByIndex('all', {
                index: "no",
                value: product.no
            });
            var barcodes = productModel.findByIndex('all', {
                index: "barcode",
                value: product.barcode
            });
            /*
            if ((products != null) && (products[0].id != this.Scaffold.currentData.id)) {
                alert('Duplicate product no...' + product.no);
                evt.preventDefault();
            } else if ((barcodes != null) && (barcodes[0].id != this.Scaffold.currentData.id)) {
                alert('Duplicate barcode...' + product.barcode);
                evt.preventDefault();
            }*/

        },

        afterScaffoldView: function(evt) {

            var window = this.window;
            var document = this.document;
            //var $ = window.jQuery;

            valObj = evt.data;
            // alert(document.getElementById('pluimage') + ", " + this.query('#pluimage')[0]+ "," + $('#pluimage')[0]);
            document.getElementById('pluimage').setAttribute("src", "chrome://viviecr/content/skin/pluimages/" + valObj.no + ".png?" + Math.random());
        },

        select: function(evt){

            var listObj = this.getListProductObj();
            var selectedIndex = listObj.selectedIndex;
            if (selectedIndex >= 0) {
                this.Form.reset('productForm');
                var product = this._listProdDatas[selectedIndex];
                this.requestCommand('view', product.id);
            }
        }

    });


})();

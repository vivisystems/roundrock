(function(){

    /**
     * Class ViviPOS.MainController
     */
    GeckoJS.Controller.extend( {

        name: 'Plus',
        screenwidth: 800,
        screenheight: 600,
        _selectedIndex: null,

        createPluPanel2: function () {
            /*
            var categories;

            var cateModel = new CategoryModel();
            categories = cateModel.find('all', {
                order: "no"
            });
            // GeckoJS.Session.add('categories', categories);
            */

            var categories = GeckoJS.Session.get('categories');

            // bind categories data
            var catePanelView =  new NSICategoriesView(categories);
            var catescrollablepanel = document.getElementById('catescrollablepanel');
            catescrollablepanel.datasource = catePanelView;


            // bind plu data
            var firstCateNo = categories[0]['no'];

        },

        changePluPanel2: function(index) {

            var categories = GeckoJS.Session.get('categories');
            var cateNo = categories[index]['no'];

            this._selectedIndex = index;
            this.setInputData(categories[index]);

        },

        createPluPanel: function () {
            /*
            var categories, products, barcodesIndexes = {}, productsIndexesByCate= {};

            var cateModel = new CategoryModel();
            categories = cateModel.find('all', {
                order: "no"
            });
            GeckoJS.Session.add('categories', categories);
            */
            var categories = GeckoJS.Session.get('categories');
            // bind categories data
            var catePanelView =  new NSICategoriesView();
            var catescrollablepanel = document.getElementById('catescrollablepanel');
            catescrollablepanel.datasource = catePanelView;

            var productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCate');
            // var cateNo = categories[index]['no'];

            var firstCateNo = categories[0]['no'];
            var prodscrollablepanel = document.getElementById('prodscrollablepanel');
            var productPanelView = new NSIProductsView(productsIndexesByCate[firstCateNo]);
            prodscrollablepanel.datasource = productPanelView;

            // var prodscrollablepanel = document.getElementById('prodscrollablepanel');
            // prodscrollablepanel.datasource = productsIndexesByCate[cateNo];



        },

        changePluPanel: function(index) {

            var categories = GeckoJS.Session.get('categories');
            var productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCate');
            var cateNo = categories[index]['no'];

            var prodscrollablepanel = document.getElementById('prodscrollablepanel');
            prodscrollablepanel.datasource = productsIndexesByCate[cateNo];

            

        },

        clickPluPanel: function(index) {

            var products = GeckoJS.Session.get('products');
            var prodscrollablepanel = document.getElementById('prodscrollablepanel');
            var productIndex = prodscrollablepanel.datasource.getCurrentIndexData(index);

            this.setInputData(products[productIndex]);
            this._selectedIndex = index;
            //            alert(index + "," + productIndex);
            // return this.requestCommand('addItem',products[productIndex],'Cart');

        },

        getInputData: function () {
            return GeckoJS.FormHelper.serializeToObject('productForm', false);
        },

        resetInputData: function () {
            GeckoJS.FormHelper.reset('productForm');
        },

        setInputData: function (valObj) {

            // this.resetInputData();

            GeckoJS.FormHelper.unserializeFromObject('productForm', valObj);

            document.getElementById('pluimage').setAttribute("src", "chrome://viviecr/content/skin/pluimages/" + valObj.no + ".png?" + Math.random());
        },

        add: function  () {
            var inputData = this.getInputData();
            /*
            var inputData = {};
            GREUtils.Dialog.prompt(null, "New Department", "Department No", input);
            inputData.no = input;
            GREUtils.Dialog.prompt(null, "New Department", "Department Name", input);
            inputData.name = input;
            */
            var category = new CategoryModel();
            category.save(inputData);

            var categories = cateModel.find('all', {
                order: "no"
            });
            GeckoJS.Session.add('categories', categories);

            this.resetInputData();
        },

        modify: function  () {
            var inputData = this.getInputData();
            var prodModel = new ProductModel();
            var self = this;
            if(this._selectedIndex >= 0) {

                var products = GeckoJS.Session.get('products');

                prodModel.id = inputData.id;
                prodModel.save(inputData);

                var prodModel = new ProductModel();
                var products = prodModel.find('all', {
                    order: "cate_no"
                });

                var barcodesIndexes = {}, productsIndexesByCate= {};
                for (var pidx in products) {
                    var product = products[pidx];
                    var catno = product['cate_no'];
                    if (typeof catno == 'undefined') continue;
                    var barcode = product['barcode'];

                    if (typeof productsIndexesByCate[catno] == 'undefined') {
                        productsIndexesByCate[catno] = [];
                    }

                    productsIndexesByCate[catno].push(pidx);


                    barcodesIndexes[barcode] = pidx;

                };

                GeckoJS.Session.add('products', products);

                GeckoJS.Session.add('productsIndexesByCate', productsIndexesByCate);
                GeckoJS.Session.add('barcodesIndexes', barcodesIndexes);

                // bind plu data
                // var categories = GeckoJS.Session.get('categories');
                // var cateNo = categories[self._selectedIndex]['no'];
                var prodscrollablepanel = document.getElementById('prodscrollablepanel');
                var productPanelView = new NSIProductsView(productsIndexesByCate[inputData.cate_no]);
                prodscrollablepanel.datasource = productPanelView;
            }
        },

        remove: function() {

            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?")) {
                var prodModel = new ProductModel();
                var index = this._selectedIndex;
                var productIndex = prodscrollablepanel.datasource.getCurrentIndexData(index);

                if(index >= 0) {
                    var products = GeckoJS.Session.get('products');
                    var product = products[productIndex];
                    prodModel.del(product.id);

                    var products = prodModel.find('all', {
                        order: "cate_no"
                    });
                    GeckoJS.Session.add('products', products);

                }
            }
        }

    });

})();


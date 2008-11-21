(function(){

    /**
     * Class PlusController
     */
    GeckoJS.Controller.extend( {

        name: 'Plus',
        screenwidth: 800,
        screenheight: 600,
        _selectedIndex: null,
        _selCateNo: null,
        depPanelView: null,
        productPanelView: null,


        createGroupPanel: function () {
            var pluGroupModel = new PlugroupModel();
            var groups = pluGroupModel.find('all', {
                order: "no"
            });

            var group_listscrollablepanel = document.getElementById('group_listscrollablepanel');
            var plugroupPanelView = new NSIPluGroupsView(groups);
            group_listscrollablepanel.datasource = plugroupPanelView;
        },

        createPluPanel: function () {

            this.depPanelView =  new NSICategoriesView('catescrollablepanel');
            this.depPanelView.toggle();
            this.productPanelView = new NSIProductsView('prodscrollablepanel');
            
            this.productPanelView.setCatePanelView(this.depPanelView);
            this.productPanelView.setCatePanelIndex(0);
            this.productPanelView.toggle();

        },

        changePluPanel: function(index) {

            this.productPanelView.setCatePanelIndex(index);
            var category = this.depPanelView.getCurrentIndexData(index);

            $("#cate_no").val(category.no);

        },

        clickPluPanel: function(index) {

            var product = this.productPanelView.getCurrentIndexData(index);
            this.setInputData(product);
            this._selectedIndex = index;

        },

        getInputData: function () {
            return GeckoJS.FormHelper.serializeToObject('productForm', false);
        },

        resetInputData: function () {
            GeckoJS.FormHelper.reset('productForm');
        },

        setInputData: function (valObj) {

            GeckoJS.FormHelper.unserializeFromObject('productForm', valObj);

            document.getElementById('pluimage').setAttribute("src", "chrome://viviecr/content/skin/pluimages/" + valObj.no + ".png?" + Math.random());
        },

        add: function  () {
            var inputData = this.getInputData();

            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {
                input0:null,
                input1:null
            };
            window.openDialog(aURL, "prompt_additem", features, "New Plu", "Please input:", "No", "Name", inputObj);

            if (inputObj.ok && inputObj.input0 && inputObj.input1) {
                var product = new ProductModel();
                inputData = {
                    no: inputObj.input0,
                    name: inputObj.input1
                    };
                inputData.cate_no = $("#cate_no").val();
                product.save(inputData);

                var products = product.find('all', {
                    order: "cate_no"
                });
                GeckoJS.Session.add('products', products);

                this.resetInputData();
            }

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
                /*
                var prodscrollablepanel = document.getElementById('prodscrollablepanel');
                var productPanelView = new NSIProductsView(productsIndexesByCate[inputData.cate_no]);
                prodscrollablepanel.datasource = productPanelView;
                */
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


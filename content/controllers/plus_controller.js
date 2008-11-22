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
        catePanelView: null,
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

            this.catePanelView =  new NSICategoriesView('catescrollablepanel');
            this.productPanelView = new NSIProductsView('prodscrollablepanel');
            
            this.productPanelView.setCatePanelView(this.catePanelView);
            this.productPanelView.setCatePanelIndex(0);

        },

        changePluPanel: function(index) {

            this.productPanelView.setCatePanelIndex(index);
            var category = this.catePanelView.getCurrentIndexData(index);

            this.resetInputData();
            $("#cate_no").val(category.no);
        },

        clickPluPanel: function(index) {
            this.resetInputData();
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

                this.updateSession();

                this.resetInputData();
            }

        },

        modify: function  () {
            var inputData = this.getInputData();
            var prodModel = new ProductModel();
            var self = this;

            if(this._selectedIndex >= 0) {

                prodModel.id = inputData.id;
                prodModel.save(inputData);

                this.updateSession();
                
            }
        },

        remove: function() {

            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?")) {
                var prodModel = new ProductModel();
                var index = document.getElementById('prodscrollablepanel').selectedIndex;

                var product = this.productPanelView.getCurrentIndexData(index);
                
                if(product) {
                    prodModel.del(product.id);
                    this.updateSession();
                }
            }
        },

        updateSession: function() {
            var prodModel = new ProductModel();
            var products = prodModel.find('all', {
                order: "cate_no"
            });
            GeckoJS.Session.add('products', products);
        }
    });

})();


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
        components: ['Tax'],
        
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

        getDepartment: function () {
            var cate_no = $("#cate_no").val();
            var cates_data = GeckoJS.Session.get('categories');

            var aURL = "chrome://viviecr/content/select_department.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=800,height=600";
            var inputObj = {
                cate_no: cate_no,
                depsData: cates_data
            };
            window.openDialog(aURL, "select_department", features, inputObj);

            if (inputObj.ok && inputObj.cate_no) {
                $("#cate_no").val(inputObj.cate_no);
            }
        },

        getCondiment: function () {
            var cond_group = $("#cond_group").val();
            var aURL = "chrome://viviecr/content/select_condgroup.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=800,height=600";
            var inputObj = {
                cond_group: cond_group
            };
            window.openDialog(aURL, "select_cond_group", features, inputObj);

            if (inputObj.ok && inputObj.cond_group) {
                $("#cond_group").val(inputObj.cond_group);

            }
        },

        getRate: function () {
            var rate = $("#rate").val();
            var aURL = "chrome://viviecr/content/select_tax.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=800,height=600";
            var inputObj = {
                rate: rate
            };

            var taxes = GeckoJS.Session.get('taxes');
            if(taxes == null) taxes = this.Tax.getTaxList();

            inputObj.taxes = taxes;
            
            window.openDialog(aURL, "select_rate", features, inputObj);

            if (inputObj.ok && inputObj.rate) {
                $("#rate").val(inputObj.rate);

            }
        },

        getInputData: function () {
            return GeckoJS.FormHelper.serializeToObject('productForm', false);
        },

        resetInputData: function () {
            GeckoJS.FormHelper.reset('productForm');
        },

        setInputData: function (valObj) {
// this.log("valObj:" + this.dump(valObj));
            GeckoJS.FormHelper.unserializeFromObject('productForm', valObj);

            document.getElementById('pluimage').setAttribute("src", "chrome://viviecr/content/skin/pluimages/" + valObj.no + ".png?" + Math.random());
        },

        _checkData: function (data) {
            var prods = GeckoJS.Session.get('products');
            var result = 0;
            if (data.no.length <= 0) {
                alert('No is empty...');
                result = 3;
            } else if (data.name.length <= 0) {
                alert('Name is empty...');
                result = 4;
            } else {
                prods.forEach(function(o){
                    if (o.no == data.no) {
                        alert('Duplicate Plu No...' + data.no);
                        result = 1;
                    } else if (o.name == data.name) {
                        alert('Duplicate Plu Name...' + data.name);
                        result = 2;
                    }
                });
            }
            return result;
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

                if(this._checkData(inputData) == 0) {
                    inputData.cate_no = $("#cate_no").val();
                    product.save(inputData);

                    this.updateSession();

                    this.resetInputData();
                }
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


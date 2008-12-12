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
        _pluset: [],
        _selectedPluSetIndex: null,


        createGroupPanel: function () {
            var pluGroupModel = new PlugroupModel();
            var groups = pluGroupModel.find('all', {
                
            });

            var group_listscrollablepanel = document.getElementById('group_listscrollablepanel');
            var plugroupPanelView = new NSIPluGroupsView(groups);
            group_listscrollablepanel.datasource = plugroupPanelView;
            var self = this;
            doSetOKCancel(
                function(){

/*
// can't be check if has the boolean fields...
try {
                    var isModify = self.Form.isFormModified("productForm");
}
catch (e) {
    // self.log(self.dump(e));
};
                    alert("isModify:" + isModify);
*/
                    return true;
                },
                function(){
                    // alert("Cancel...");
                    return true;
                }
            );
        },

        createPluPanel: function () {

            this.catePanelView =  new NSICategoriesView('catescrollablepanel');
            this.productPanelView = new NSIProductsView('prodscrollablepanel');
            
            this.productPanelView.setCatePanelView(this.catePanelView);
            //this.productPanelView.setCatePanelIndex(0);

            //this.changePluPanel(0);

        },

        changePluPanel: function(index) {

            this.productPanelView.setCatePanelIndex(index);
            var category = this.catePanelView.getCurrentIndexData(index);

            this.resetInputData();
            if (category) {
                this._selCateNo = category.no;
                $("#cate_no").val(category.no);

                this.clickPluPanel(-1);
            }
        },

        clickPluPanel: function(index) {
            var product = this.productPanelView.getCurrentIndexData(index);

            this._selectedIndex = index;
            if (product) {
                this.resetInputData();
                this.setInputData(product);
            }
            else {
                var plupanel = document.getElementById('prodscrollablepanel');
                plupanel.selectedIndex = -1;
                plupanel.selectedItems = [];
            }

            var rate = $("#rate").val();
            if (!rate || rate == '') {
                // set rate to system default
                var defaultRate = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');
                if (!defaultRate || defaultRate == '') {
                    var taxes = GeckoJS.Session.get('taxes');
                    if (taxes == null) taxes = this.Tax.getTaxList();
                    if (taxes && taxes.length > 0) defaultRate = taxes[0].no;
                }
                $("#rate").val(defaultRate);
            }


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
        
        getPluSetListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('plusetscrollablepanel');
            }
            return this._listObj;
        },

        clickPluSetsPanel: function (index) {
            this._selectedPluSetIndex = index;
        // this.log("clickPluSetsPanel:" + index);
        },

        _searchPlu: function (barcode) {
            // alert(barcode);
            $('#plu').val('').focus();
            // $('#plu').focus();
            if (barcode == "") return;

            var productsById = GeckoJS.Session.get('productsById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var product;

            if (!barcodesIndexes[barcode]) {
                // barcode notfound
                // alert("Plu (" + barcode + ") Not Found!");
                return null;
            }else {
                var id = barcodesIndexes[barcode];
                product = productsById[id];
                return product;
            }
        },

        removePluSet: function (){
            if (this._selectedPluSetIndex == null) return;
            this._pluset.splice(this._selectedPluSetIndex, 1);
            var panelView =  new GeckoJS.NSITreeViewArray(this._pluset);
            this.getPluSetListObj().datasource = panelView;

            var setmenu = [];
            this._pluset.forEach(function(o){
                setmenu.push(o.no + "=" + o.qty);
            });
            $("#setmenu").val( setmenu.join("&"));
        },

        _setPluSet: function () {
            var productsById = GeckoJS.Session.get('productsById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var str = $("#setmenu").val();

            var pluset = GeckoJS.String.parseStr(str);

            // this.log("pluset:" + this.dump(pluset));

            this._pluset = [];
            for (var key in pluset) {
                if (key == "") break;
                
                var qty = pluset[key];
                var id = barcodesIndexes[key];
                var name = productsById[id].name;

                this._pluset.push({
                    no: key,
                    name: name,
                    qty: qty
                });
            };

            var panelView =  new GeckoJS.NSITreeViewArray(this._pluset);
            this.getPluSetListObj().datasource = panelView;
        },



        getPlu: function (){
            // $do('PLUSearchDialog', null, 'Main');

            var aURL = "chrome://viviecr/content/prompt_addpluset.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {
                input0:null,
                input1:1
            };

            window.openDialog(aURL, "prompt_addpluset", features, "Plu Set Menu", "Please input:", "Plu No or Barcode:", "Qty:", inputObj);

            if (inputObj.ok && inputObj.input0 && inputObj.input1) {
                var product = this._searchPlu(inputObj.input0);
                if (product) {
                    var inputData = {
                        no: product.no,
                        name: product.name,
                        qty: inputObj.input1
                    };

                    this._pluset.push(inputData);

                    var panelView =  new GeckoJS.NSITreeViewArray(this._pluset);
                    this.getPluSetListObj().datasource = panelView;
                    var setmenu = [];
                    this._pluset.forEach(function(o){
                        setmenu.push(o.no + "=" + o.qty);
                    });
                    $("#setmenu").val( setmenu.join("&"));
                }

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
            this._setPluSet();
            if (valObj) {
                document.getElementById('pluimage').setAttribute("src", "chrome://viviecr/content/skin/pluimages/" + valObj.no + ".png?" + Math.random());
            }
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
                if (prods) prods.forEach(function(o){
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
            if (this._selCateNo == null) return;

            var inputData = this.getInputData();

            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {
                input0:null,
                input1:null
            };
            window.openDialog(aURL, "prompt_additem", features, "New Plu", "Please input:", "No", "Name", inputObj);

            GREUtils.log(GeckoJS.BaseObject.dump(inputData))
            if (inputObj.ok && inputObj.input0 && inputObj.input1) {
                var product = new ProductModel();
                inputData.no = inputObj.input0;
                inputData.name = inputObj.input1;

                if(this._checkData(inputData) == 0) {
                    if (inputData.cate_no.length == 0) inputData.cate_no = this._selCateNo;
                    this.resetInputData();
                    $("#cate_no").val(inputData.cate_no);
                    var prodData = this.getInputData(); // get product default

                    prodData.id = '';
                    prodData.no = inputData.no;
                    prodData.name = inputData.name;
                    prodData.cate_no = inputData.cate_no;

                    product.save(prodData);

                    this.updateSession();

                    this.clickPluPanel(document.getElementById('prodscrollablepanel').currentIndex);
                }
            }

        },

        modify: function  () {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

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
            if (this._selectedIndex == null || this._selectedIndex == -1) return;
            
            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?")) {
                var prodModel = new ProductModel();
                var index = document.getElementById('prodscrollablepanel').selectedIndex;

                var product = this.productPanelView.getCurrentIndexData(index);
                
                if(product) {
                    prodModel.del(product.id);
                    this.resetInputData();
                    this.updateSession();
                    
                    this.clickPluPanel(document.getElementById('prodscrollablepanel').currentIndex);
                    $("#cate_no").val(this._selCateNo);
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


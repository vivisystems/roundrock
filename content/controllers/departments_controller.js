(function(){

    /**
     * Class DepartmentsController
     */
    GeckoJS.Controller.extend( {

        name: 'Departments',
        screenwidth: 800,
        screenheight: 600,
        _selectedIndex: null,
        catePanelView: null,


        createDepartmentPanel: function () {

            this.catePanelView =  new NSICategoriesView('catescrollablepanel');

        },

        changeDepartmentPanel: function(index) {

            var category = this.catePanelView.getCurrentIndexData(index);
            this._selectedIndex = index;
            this.setInputData(category);
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
            return GeckoJS.FormHelper.serializeToObject('depForm', false);
        },

        resetInputData: function () {
            GeckoJS.FormHelper.reset('depForm');

            // make sure tax rate field is always populated
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

        setInputData: function (valObj) {
            GeckoJS.FormHelper.unserializeFromObject('depForm', valObj);
        },

        _checkData: function (data) {
            var cates = GeckoJS.Session.get('categories');
            var result = 0;

            if (data.no.length <= 0) {
                alert('No is empty...');
                result = 3;
            } else if (data.name.length <= 0) {
                alert('Name is empty...');
                result = 4;
            } else {
                if (cates) cates.forEach(function(o){
                    if (o.no == data.no) {
                        alert('Duplicate Department No...' + data.no);
                        result = 1;
                    } else if (o.name == data.name) {
                        alert('Duplicate Department Name...' + data.name);
                        result = 2;
                    }
                });
            }

            return result;
        },

        add: function  () {
            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {
                input0:null,
                input1:null
            };
            window.openDialog(aURL, "prompt_additem", features, _("New Department"), _("Please input:"), _("No"), _("Name"), inputObj);
            if (inputObj.ok && inputObj.input0 && inputObj.input1) {
                var category = new CategoryModel();

                this.resetInputData();
                var inputData = this.getInputData();
                inputData.no = inputObj.input0;
                inputData.name = inputObj.input1

                if(this._checkData(inputData) == 0) {
                    category.save(inputData);

                    this.updateSession();

                    this.changeDepartmentPanel(document.getElementById('catescrollablepanel').currentIndex);
                }
            }
        },

        modify: function  () {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            var inputData = this.getInputData();
            var cateModel = new CategoryModel();

            if(this._selectedIndex >= 0) {

                var category = this.catePanelView.getCurrentIndexData(this._selectedIndex);

                    inputData.id = category.id;
                    cateModel.id = category.id;
                    cateModel.save(inputData);

                    this.updateSession();

            }
        },

        remove: function() {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?")) {
                var cateModel = new CategoryModel();
                if(this._selectedIndex >= 0) {

                    var category = this.catePanelView.getCurrentIndexData(this._selectedIndex);

                    cateModel.del(category.id);

                    this.resetInputData();
                    this.updateSession();
                    
                    this.changeDepartmentPanel(document.getElementById('catescrollablepanel').currentIndex);
                }
            }
        },

        updateSession: function() {
            var cateModel = new CategoryModel();
            var categories = cateModel.find('all', {
                order: "no"
            });
            GeckoJS.Session.add('categories', categories);
        }


    });

})();


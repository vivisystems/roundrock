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
            this.catePanelView.toggle();

        },

        changeDepartmentPanel: function(index) {

            var categories = GeckoJS.Session.get('categories');
            var cateNo = categories[index]['no'];

            this._selectedIndex = index;
            this.setInputData(categories[index]);

        },

        getInputData: function () {
            return GeckoJS.FormHelper.serializeToObject('depForm', false);
        },

        resetInputData: function () {
            GeckoJS.FormHelper.reset('depForm');
        },

        setInputData: function (valObj) {
            GeckoJS.FormHelper.unserializeFromObject('depForm', valObj);
        },

        add: function  () {
            var inputData = this.getInputData();
            
            var aURL = "chrome://viviecr/content/prompt_additem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {
                input0:null,
                input1:null
            };
            window.openDialog(aURL, "prompt_additem", features, _("New Department"), _("Please input:"), _("No"), _("Name"), inputObj);
            if (inputObj.ok && inputObj.input0 && inputObj.input1) {
                var category = new CategoryModel();
                inputData = {
                    no: inputObj.input0,
                    name: inputObj.input1
                    };

                category.save(inputData);

                var categories = category.find('all', {
                    order: "no"
                });
                GeckoJS.Session.add('categories', categories);

                this.resetInputData();
            }
        },

        modify: function  () {
            var inputData = this.getInputData();
            var cateModel = new CategoryModel();

            if(this._selectedIndex >= 0) {

                var categories = GeckoJS.Session.get('categories');
                var category = categories[this._selectedIndex];

                inputData.id = category.id;
                cateModel.id = category.id;
                cateModel.save(inputData);

                var categories = cateModel.find('all', {
                    order: "no"
                });
                GeckoJS.Session.add('categories', categories);
            }
        },

        remove: function() {

            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?")) {
                var cateModel = new CategoryModel();
                if(this._selectedIndex >= 0) {
                    var categories = GeckoJS.Session.get('categories');
                    var category = categories[this._selectedIndex];
                    cateModel.del(category.id);

                    var categories = cateModel.find('all', {
                        order: "no"
                    });
                    GeckoJS.Session.add('categories', categories);
                }
            }
        }

    });

})();


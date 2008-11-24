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
            var cateNo = category['no'];

            this._selectedIndex = index;
            this.setInputData(category);

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

                this.updateSession();

                this.resetInputData();
            }
        },

        modify: function  () {
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

            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?")) {
                var cateModel = new CategoryModel();
                if(this._selectedIndex >= 0) {

                    var category = this.catePanelView.getCurrentIndexData(this._selectedIndex);

                    cateModel.del(category.id);

                    this.updateSession();
                    
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


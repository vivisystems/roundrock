(function(){

    /**
     * Class DepartmentsController
     */
    GeckoJS.Controller.extend( {

        screenwidth: GeckoJS.Session.get('screenwidth') || 800,
        screenheight: GeckoJS.Session.get('screenheight') || 600,
        name: 'Departments',
        _selectedIndex: null,
        _deptscrollablepanel: null,
        deptPanelView: null,


        createDepartmentPanel: function () {

            this._deptscrollablepanel = document.getElementById('deptscrollablepanel');
            this.deptPanelView =  new NSICategoriesView('deptscrollablepanel');

            this.changeDepartmentPanel(-1);

        },

        changeDepartmentPanel: function(index) {

            var dept = this.deptPanelView.getCurrentIndexData(index);
            this._selectedIndex = index;
            this.setInputData(dept);

            this._deptscrollablepanel.selectedIndex = index;
            this._deptscrollablepanel.selectedItems = [index];

            if (index == -1) this.resetInputData();
            this.validateForm();
        },

        getRate: function () {

            if (this._selectedIndex == null || this._selectedIndex == -1) return;
            
            var rate = $('#rate').val();
            var aURL = 'chrome://viviecr/content/select_tax.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            var inputObj = {
                rate: rate
            };

            var taxes = GeckoJS.Session.get('taxes');
            if(taxes == null) taxes = this.Tax.getTaxList();

            inputObj.taxes = taxes;

            window.openDialog(aURL, "select_rate", features, inputObj);

            if (inputObj.ok && inputObj.rate) {
                $('#rate').val(inputObj.rate);

            }
        },

        getInputData: function () {
            return GeckoJS.FormHelper.serializeToObject('deptForm', false);
        },

        resetInputData: function () {
            GeckoJS.FormHelper.reset('deptForm');

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
            GeckoJS.FormHelper.unserializeFromObject('deptForm', valObj);
        },

        _checkData: function (data) {
            var depts = GeckoJS.Session.get('categories');
            var result = 0;

            if (data.no.length <= 0) {
                alert(_('Department Number must not be empty'));
                result = 3;
            } else if (data.name.length <= 0) {
                alert(_('Department Name must not be empty'));
                result = 4;
            } else {
                if (depts) depts.forEach(function(o){
                    if (o.no == data.no) {
                        alert(_('Duplicate Department Number (%S)', [data.no]));
                        result = 1;
                    } else if (o.name == data.name) {
                        alert(_('Duplicate Department Name (%S)', [data.name]))
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
                input0:null, require0:true,
                input1:null, require1:true
            };
            window.openDialog(aURL, "prompt_additem", features, _('New Department'), _('Please input:'), _('Department Number'), _('Department Name'), inputObj);
            if (inputObj.ok && inputObj.input0 && inputObj.input1) {
                var dept = new CategoryModel();

                var inputData = this.getInputData();
                inputData.no = inputObj.input0;
                inputData.name = inputObj.input1

                if(this._checkData(inputData) == 0) {
                    dept.save(inputData);

                    // look for dept.id
                    var cateModel = new CategoryModel();
                    var dept = cateModel.findByIndex('all', {
                        index: 'no',
                        value: inputData.no
                    });
                    var id = (dept.length > 0) ? dept[0].id : -1;
                    var index = this.updateSession('add', id);

                    this.changeDepartmentPanel(index);
                }
            }
        },

        modify: function  () {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            var inputData = this.getInputData();
            var cateModel = new CategoryModel();

            if(this._selectedIndex >= 0) {

                var dept = this.deptPanelView.getCurrentIndexData(this._selectedIndex);

                inputData.id = dept.id;
                cateModel.id = dept.id;
                cateModel.save(inputData);

                var index = this.updateSession('modify');

                this.changeDepartmentPanel(index);
            }
        },

        remove: function() {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            if (GREUtils.Dialog.confirm(null, _('confirm delete'), _('Are you sure?'))) {
                var cateModel = new CategoryModel();
                if(this._selectedIndex >= 0) {

                    var dept = this.deptPanelView.getCurrentIndexData(this._selectedIndex);

                    cateModel.del(dept.id);

                    this.resetInputData();

                    var index = this.updateSession('remove');
                    this.changeDepartmentPanel(index);
                }
            }
        },

        updateSession: function(mode, id) {

            var cateModel = new CategoryModel();
            var categories = cateModel.find('all', {
                order: 'no'
            });

            GeckoJS.Session.set('categories');

            var data = this.deptPanelView.data;

            switch(mode) {

                case 'add':
                    for (var i = 0; i < data.length; i++) {
                        if (data[i] == id) {
                            return i;
                        }
                    }
                    break;

                case 'modify':
                    return this._selectedIndex;
                    break;

                case 'remove':
                    if (this._selectedIndex >= data.length) return data.length - 1;
                    return this._selectedIndex;
                    break;
            }
            return -1;
        },

        validateForm: function () {

            // update button & text field states
            if (this._selectedIndex == null || this._selectedIndex == -1) {
                document.getElementById('dept_name').disabled = true;

                document.getElementById('modify_dept').disabled = true;
                document.getElementById('delete_dept').disabled = true;
            }
            else {
                document.getElementById('dept_name').disabled = false;

                document.getElementById('modify_dept').disabled = false;
                document.getElementById('delete_dept').disabled = false;
            }
        }

    });

})();


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

            if (index > -1) {
                document.getElementById('dept_name').focus();
            }
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

            window.openDialog(aURL, 'select_rate', features, inputObj);

            if (inputObj.ok && inputObj.rate) {
                $('#rate').val(inputObj.rate);
                $('#rate_name').val(inputObj.name);
            }
        },

        getInputDefault: function () {
            var valObj = {};
            this.query('[form=deptForm]').each(function() {
                var n = this.name || this.getAttribute('name');
                if (!n) return;
                var v = this.getAttribute('default');

                if (typeof v != 'undefined') {
                    valObj[n] = v;
                }
            });
            return valObj;

        },

        getInputData: function () {
            return GeckoJS.FormHelper.serializeToObject('deptForm', false);
        },

        resetInputData: function () {
            GeckoJS.FormHelper.reset('deptForm');

            // make sure tax rate field is always populated
            var rate = $('#rate').val();
            var taxes = GeckoJS.Session.get('taxes');
            if (!rate || rate == '') {
                // set rate to system default
                var rate = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');
                if (!rate || rate == '') {
                    if (taxes == null) taxes = this.Tax.getTaxList();
                    if (taxes && taxes.length > 0) rate = taxes[0].no;
                }
                $('#rate').val(rate);
            }
            var rate_name = rate;
            for (var i = 0; i < taxes.length; i++) {
                if (taxes[i].no == rate) {
                    rate_name = taxes[i].name;
                    break;
                }
            }
            $('#rate_name').val(rate_name);

        },

        setInputData: function (valObj) {
            var rate = (valObj && 'rate' in valObj && valObj.rate) || '';
            var rate_name = rate;
            var taxes = GeckoJS.Session.get('taxes');

            if (taxes && taxes.length > 0) {
                for (var i = 0; i < taxes.length; i++) {
                    if (taxes[i].no == rate) {
                        rate_name = taxes[i].name;
                        break;
                    }
                }
            }
            if (typeof valObj == 'object') valObj.rate_name = rate_name;
            GeckoJS.FormHelper.unserializeFromObject('deptForm', valObj);
        },

        _checkData: function (data, id) {
            var depts = GeckoJS.Session.get('categories');
            var result = 0;

            if (data.no.length <= 0) {
                // @todo OSD
                OsdUtisl.warn(_('Department Number must not be empty'));
                result = 3;
            } else if (data.name.length <= 0) {
                // @todo OSD
                OsdUtils.warn(_('Department Name must not be empty'));
                result = 4;
            } else {
                if (depts)
                    for (var i = 0; i < depts.length; i++) {
                        var o = depts[i];
                        if (o.no == data.no && !id) {
                            // @todo OSD
                            OsdUtils.warn(_('Duplicate Department Number (%S); department not %S.', [data.no, id ? 'modified' : 'added']));
                            return 1;
                        } else if (o.name == data.name && o.id != id) {
                            // @todo OSD
                            OsdUtils.warn(_('Duplicate Department Name (%S); department not %S.', [data.name, id ? 'modified' : 'added']))
                            return 2;
                        }
                    }
            }

            return result;
        },

        add: function  () {
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250';
            var inputObj = {
                input0:null, require0:true, alphaOnly0:true,
                input1:null, require1:true
            };
            window.openDialog(aURL, _('Add New Department'), features, _('New Department'), '', _('Department Number'), _('Department Name'), inputObj);
            if (inputObj.ok && inputObj.input0 && inputObj.input1) {
                var dept = new CategoryModel();

                var inputData = this.getInputDefault();
                inputData.no = inputObj.input0;
                inputData.name = inputObj.input1

                if(this._checkData(inputData) == 0) {

                    try {
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

                        // @todo OSD
                        OsdUtils.info(_('Department [%S] added successfully', [inputData.name]));
                    }
                    catch (e) {
                        // @todo OSD
                        OsdUtils.error(_('An error occurred while adding Department [%S]; the department may not have been added successfully', [inputData.name]));
                    }
                }
            }
        },

        modify: function  () {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            var inputData = this.getInputData();
            var cateModel = new CategoryModel();

            var dept = this.deptPanelView.getCurrentIndexData(this._selectedIndex);

            try {
                if (this._checkData(inputData, dept.id) == 0) {
                    inputData.id = dept.id;
                    cateModel.id = dept.id;
                    cateModel.save(inputData);

                    var index = this.updateSession('modify');
                    this.changeDepartmentPanel(index);

                    // @todo OSD
                    OsdUtils.info(_('Department [%S] modified successfully', [inputData.name]));
                }
            }
            catch (e) {
                // @todo OSD
                OsdUtils.error(_('An error occurred while modifying Department [%S]\nThe department may not have been modified successfully', [inputData.name]));
            }
        },

        remove: function() {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            var dept = this.deptPanelView.getCurrentIndexData(this._selectedIndex);

            if (GREUtils.Dialog.confirm(null, _('confirm delete %S', [dept.name]), _('Are you sure?'))) {
                var cateModel = new CategoryModel();

                try {
                    cateModel.del(dept.id);

                    this.resetInputData();

                    var index = this.updateSession('remove');
                    this.changeDepartmentPanel(index);

                    // @todo OSD
                    OsdUtils.info(_('Department [%S] removed successfully', [dept.name]));
                }
                catch (e) {
                    // @todo OSD
                    OsdUtils.error(_('An error occurred while removing Department [%S]\nThe department may not have been removed successfully', [dept.name]));
                }
            }
        },

        updateSession: function(mode, id) {

            var cateModel = new CategoryModel();
            var categories = cateModel.find('all', {
                order: 'no'
            });
            GeckoJS.Session.set('categories');
            this.deptPanelView.updateCategories();
            var data = GeckoJS.Session.get('categories');

            switch(mode) {

                case 'add':
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id == id) {
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
                document.getElementById('dept_name').setAttribute('disabled', true);

                document.getElementById('modify_dept').setAttribute('disabled', true);
                document.getElementById('delete_dept').setAttribute('disabled', true);
            }
            else {
                var cond_name = document.getElementById('dept_name').value.replace(/^\s*/, '').replace(/\s*$/, '');
                document.getElementById('dept_name').removeAttribute('disabled');

                document.getElementById('modify_dept').setAttribute('disabled', (cond_name.length < 1));
                document.getElementById('delete_dept').setAttribute('disabled', false);
            }
        }

    });

})();

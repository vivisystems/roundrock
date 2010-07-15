(function(){

    var __controller__ = {

        name: 'Departments',
        
        screenwidth: GeckoJS.Session.get('screenwidth') || 800,
        screenheight: GeckoJS.Session.get('screenheight') || 600,
        _selectedIndex: null,
        _deptscrollablepanel: null,
        deptPanelView: null,

        createDepartmentPanel: function () {

            this._deptscrollablepanel = document.getElementById('deptscrollablepanel');
            this.deptPanelView =  new NSICategoriesView('deptscrollablepanel');

            this.changeDepartmentPanel(-1);

        },

        changeDepartmentPanel: function(index) {

            if (index == this._selectedIndex) return;
            
            if (!this.confirmChangeDepartment(index)) {
                this._deptscrollablepanel.selectedItems = [this._selectedIndex];
                this._deptscrollablepanel.selectedIndex = this._selectedIndex;
                return;
            }

            var dept = this.deptPanelView.getCurrentIndexData(index);
            this._selectedIndex = index;
            this.setInputData(dept);

            this._deptscrollablepanel.selectedIndex = index;
            this._deptscrollablepanel.selectedItems = [index];
            this._deptscrollablepanel.ensureIndexIsVisible(index);

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

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, 'select_rate', features, inputObj);

            if (inputObj.ok) {
                if (inputObj.rate) {
                    $('#rate').val(inputObj.rate);
                    $('#rate_name').val(inputObj.name);
                }
                else {
                    $('#rate').val('');
                    $('#rate_name').val('');
                }
            }
        },

        initDefaultTax: function () {

            // make sure tax rate field is always populated
            var rate = '';
            var taxes = GeckoJS.Session.get('taxes');
            if (taxes == null) taxes = this.Tax.getTaxList();

            // set rate to system default
            var taxid = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');
            if (taxid == null) {
                if (taxes && taxes.length > 0) taxid = taxes[0].id;
            }

            // go from rate ID to rate no
            for (var i = 0; i < taxes.length; i++) {
                if (taxes[i].id == taxid) {
                    rate = taxes[i].no;
                    break;
                }
            }
            $('#rate')[0].setAttribute('default', rate);

            // look up rate_name from rate id
            var rate_name = rate;
            for (var i = 0; i < taxes.length; i++) {
                if (taxes[i].no == rate) {
                    rate_name = taxes[i].name;
                    break;
                }
            }
            $('#rate_name')[0].setAttribute('default', rate_name);

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

        exit: function() {
            // check if department form has been modified
            if (this._selectedIndex != -1 && GeckoJS.FormHelper.isFormModified('deptForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to the current department. Save changes before exiting?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    this.modify();
                }
            }
            window.close();
        },

        confirmChangeDepartment: function(index) {
            // check if department form has been modified
            if (this._selectedIndex != -1 && (index == null || (index != -1 && index != this._selectedIndex))
                && GeckoJS.FormHelper.isFormModified('deptForm')) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('Discard Changes'),
                                             _('You have made changes to the current department. Are you sure you want to discard the changes?'))) {
                    return false;
                }
            }
            return true;
        },

        _checkData: function (data, id) {
            var depts = GeckoJS.Session.get('categories');
            var result = 0;

            if (data.no.length <= 0) {
                OsdUtisl.warn(_('Department Number must not be empty'));
                result = 3;
            } else if (data.name.length <= 0) {
                NotifyUtils.warn(_('Department Name must not be empty'));
                result = 4;
            } else {
                if (depts)
                    for (var i = 0; i < depts.length; i++) {
                        var o = depts[i];
                        if (o.no == data.no && !id) {
                            NotifyUtils.warn(_('Duplicate Department Number (%S); department not %S.', [data.no, id ? 'modified' : 'added']));
                            return 1;
                        } else if (o.name == data.name && o.id != id) {
                            NotifyUtils.warn(_('Duplicate Department Name (%S); department not %S.', [data.name, id ? 'modified' : 'added']))
                            return 2;
                        }
                    }
            }

            return result;
        },

        add: function  () {
            
            if (!this.confirmChangeDepartment()) {
                return;
            }

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=350';
            var inputObj = {
                input0:null, require0:true, alphaOnly0:true,
                input1:null, require1:true
            };
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Department'), features,
                                       _('New Department'), '', _('Department Number'), _('Department Name'), inputObj);
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

                        this._selectedIndex = -1;
                        this.changeDepartmentPanel(index);

                        OsdUtils.info(_('Department [%S] added successfully', [inputData.name]));
                    }
                    catch (e) {
                        NotifyUtils.error(_('An error occurred while adding Department [%S]; the department may not have been added successfully', [inputData.name]));
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

                    var index = this.updateSession('modify', dept.id);
                    this._selectedIndex = -1;
                    this.changeDepartmentPanel(index);

                    OsdUtils.info(_('Department [%S] modified successfully', [inputData.name]));
                }
            }
            catch (e) {
                NotifyUtils.error(_('An error occurred while modifying Department [%S]. The department may not have been modified successfully', [inputData.name]));
            }
        },

        remove: function() {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            var dept = this.deptPanelView.getCurrentIndexData(this._selectedIndex);

            // make sure department has not been assigned to products
            var productModel = new ProductModel();
            var products = productModel.findByIndex('all', {
                index: 'cate_no',
                value: dept.no
            });

            if (products && products.length > 0) {
                NotifyUtils.warn(_('[%S] has one or more products and may not be deleted', [dept.name]));
                return;
            }

            if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete %S', [dept.name]), _('Are you sure?'))) {
                var cateModel = new CategoryModel();

                try {
                    cateModel.del(dept.id);

                    this.resetInputData();

                    var index = this.updateSession('remove');                   
                    this._selectedIndex = -1;
                    this.changeDepartmentPanel(index);
                    this._ifPanelEmpty();                

                    OsdUtils.info(_('Department [%S] removed successfully', [dept.name]));
                }
                catch (e) {
                    NotifyUtils.error(_('An error occurred while removing Department [%S]. The department may not have been removed successfully', [dept.name]));
                }
            }
        },

        _ifPanelEmpty: function(){

             if(!GeckoJS.Session.get('categories')){

                 this.deptPanelView.init('deptscrollablepanel');
                 this.validateForm();
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
                case 'modify':
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].id == id) {
                            return i;
                        }
                    }
                    break;

                case 'remove':
                    if (data) {
                        if (this._selectedIndex >= data.length) return data.length - 1;
                        return this._selectedIndex;
                    }
                    break;
            }
            return -1;
        },

        validateForm: function () {

            // update button & text field states
            if (this._selectedIndex == null || this._selectedIndex == -1) {
                document.getElementById('dept_name').setAttribute('disabled', true);
                document.getElementById('rate_name').setAttribute('disabled', true);
                document.getElementById('sale_unit').setAttribute('disabled', true);
                document.getElementById('dept_visible').setAttribute('disabled', true);
                document.getElementById('dept_cansale').setAttribute('disabled', true);
                document.getElementById('scale').setAttribute('disabled', true);
                document.getElementById('display_order').setAttribute('disabled', true);
                document.getElementById('dept_button_color').setAttribute('disabled', true);
                document.getElementById('dept_font_size').setAttribute('disabled', true);
                document.getElementById('rate_name').setAttribute('disabled', true);
                document.getElementById('non_discountable').setAttribute('disabled', true);
                document.getElementById('non_surchargeable').setAttribute('disabled', true);

                document.getElementById('modify_dept').setAttribute('disabled', true);
                document.getElementById('delete_dept').setAttribute('disabled', true);
            }
            else {
                var cond_name = document.getElementById('dept_name').value.replace(/^\s*/, '').replace(/\s*$/, '');
                document.getElementById('dept_name').removeAttribute('disabled');
                document.getElementById('display_order').removeAttribute('disabled');
                document.getElementById('rate_name').removeAttribute('disabled');
                document.getElementById('rate_name').removeAttribute('disabled');
                document.getElementById('sale_unit').setAttribute('disabled', false);
                document.getElementById('dept_visible').setAttribute('disabled', false);
                document.getElementById('dept_cansale').setAttribute('disabled', false);
                document.getElementById('scale').setAttribute('disabled', false);
                document.getElementById('dept_button_color').setAttribute('disabled', false);
                document.getElementById('dept_font_size').setAttribute('disabled', false);
                document.getElementById('non_discountable').setAttribute('disabled', false);
                document.getElementById('non_surchargeable').setAttribute('disabled', false);

                document.getElementById('modify_dept').setAttribute('disabled', (cond_name.length < 1));
                document.getElementById('delete_dept').setAttribute('disabled', false);
            }
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();

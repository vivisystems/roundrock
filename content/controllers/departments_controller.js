(function(){

    /**
     * Class DepartmentsController
     */
    GeckoJS.Controller.extend( {

        screenwidth: GeckoJS.Session.get('screenwidth') || 800,
        screenheight: GeckoJS.Session.get('screenheight') || 600,
        name: 'Departments',
        _selectedIndex: null,
        _catescrollablepanel: null,
        catePanelView: null,


        createDepartmentPanel: function () {

            this._catescrollablepanel = document.getElementById('catescrollablepanel');
            this.catePanelView =  new NSICategoriesView('catescrollablepanel');

        },

        changeDepartmentPanel: function(index) {

            var category = this.catePanelView.getCurrentIndexData(index);
            this._selectedIndex = index;
            this.setInputData(category);

            this._catescrollablepanel.selectedIndex = index;
            this._catescrollablepanel.selectedItems = [index];

            //this.validateForm();
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
                alert(_('Department Number must not be empty'));
                result = 3;
            } else if (data.name.length <= 0) {
                alert(_('Department Name must not be empty'));
                result = 4;
            } else {
                if (cates) cates.forEach(function(o){
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
                var category = new CategoryModel();

                this.resetInputData();
                var inputData = this.getInputData();
                inputData.no = inputObj.input0;
                inputData.name = inputObj.input1

                if(this._checkData(inputData) == 0) {

                    category.save(inputData);

                    this.updateSession('add', inputData);

                    var cates = GeckoJS.Session.get('categories');
                    this._selectedIndex = (cates) ? cates.length - 1: -1;

                    this.changeDepartmentPanel(this._selectedIndex);
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

                this.updateSession('modify', inputData);

                this.changeDepartmentPanel(this._selectedIndex);
            }
        },

        remove: function() {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            if (GREUtils.Dialog.confirm(null, _('confirm delete'), _('Are you sure?'))) {
                var cateModel = new CategoryModel();
                if(this._selectedIndex >= 0) {

                    var category = this.catePanelView.getCurrentIndexData(this._selectedIndex);

                    cateModel.del(category.id);

                    this.resetInputData();
                    this.updateSession('remove');
                    
                    var cates = GeckoJS.Session.get('categories');
                    if (cates) {
                        if (this._selectedIndex >= cates.length) this._selectedIndex = cates.length - 1;
                    }
                    else {
                        this._selectedIndex = -1;
                    }

                    this.changeDepartmentPanel(this._selectedIndex);
                }
            }
        },

        updateSession: function(mode, data) {
            
            var cates = GeckoJS.Session.get('categories');

            switch(mode) {

                case 'add':
                    cates.push(data);
                    break;

                case 'modify':
                    cates[this._selectedIndex] = data;
                    break;

                case 'remove':
                    cates.splice(this._selectedIndex, 1);
                    break;
            }

            GeckoJS.Session.set('categories');
        },

        validateForm: function () {

            // update button & text field states
            if (this._selectedIndex == null || this._selectedIndex == -1) {
                document.getElementById('modify-group').disabled = true;
                document.getElementById('delete-group').disabled = true;

                document.getElementById('add-condiment').disabled = true;
                document.getElementById('modify-condiment').disabled = true;
                document.getElementById('delete-condiment').disabled = true;

                document.getElementById('condiment_group_name').disabled = true;
                document.getElementById('condiment_name').disabled = true;
                document.getElementById('condiment_price').disabled = true;
            }
            else {
                document.getElementById('condiment_group_name').disabled = false;

                // validate group name
                var group_name = document.getElementById('condiment_group_name').value.replace(/^\s*/, '').replace(/\s*$/, '');

                document.getElementById('modify-group').disabled = group_name.length == 0;
                document.getElementById('delete-group').disabled = false;

                document.getElementById('add-condiment').disabled = false;

                if (this._selectedCondIndex == null || this._selectedCondIndex == -1) {
                    document.getElementById('condiment_name').disabled = true;
                    document.getElementById('condiment_price').disabled = true;

                    document.getElementById('modify-condiment').disabled = true;
                    document.getElementById('delete-condiment').disabled = true;
                }
                else {
                    document.getElementById('condiment_name').disabled = false;
                    document.getElementById('condiment_price').disabled = false;

                    // validate condiment name and price
                    var cond_name = document.getElementById('condiment_name').value.replace(/^\s*/, '').replace(/\s*$/, '');
                    var cond_price = document.getElementById('condiment_price').value.replace(/^\s*/, '').replace(/\s*$/, '');

                    if (cond_name.length > 0 && !isNaN(parseInt(cond_price))) {
                        document.getElementById('modify-condiment').disabled = false;
                    }
                    else {
                        document.getElementById('modify-condiment').disabled = true;
                    }
                    document.getElementById('delete-condiment').disabled = false;
                }
            }
        }

    });

})();


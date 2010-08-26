(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'Taxes',

        components: ['Tax'],
        
        _listObj: null,
        _listDatas: null,
        _listSingleTaxObj: null,
        _listSingleTaxDatas: null,
        _panelView: null,
        _singleTaxPanelView: null,
        _selectedIndex: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('taxscrollablepanel');
            }
            return this._listObj;
        },

        getSingleTaxListObj: function() {
            if(this._listSingleTaxObj == null) {
                this._listSingleTaxObj = document.getElementById('singletaxscrollablepanel');
            }
            return this._listSingleTaxObj;
        },
		
	
        getInputData: function () {
        
            return GeckoJS.FormHelper.serializeToObject('taxForm');
        
        },

        resetInputData: function () {

            var Obj = {
                no:'',
                name:'',
                rate: 0,
                type: 'ADDON',
                typestr: _('(taxType)ADDON'),
                rate_type:'%',
                threshold:0
            };
            GeckoJS.FormHelper.unserializeFromObject('taxForm', Obj);
        },

        setInputData: function (valObj) {
            var propDeck = document.getElementById('prop_deck');
            //GeckoJS.FormHelper.reset('taxForm');

            valObj.combine_tax = '';

            if (valObj.type == 'COMBINE') {
                if (propDeck) document.getElementById('prop_deck').selectedIndex=1;

                var taxes = this.Tax.getTax(valObj.no);
                var combineTax = taxes.CombineTax;
                var combineTaxarray = GeckoJS.Array.objectExtract(combineTax, '{n}.no');
                var combineTaxStr = combineTaxarray ? combineTaxarray.join(',') : '';
                valObj.combine_tax = combineTaxStr;
                
            } else {
                if (propDeck) document.getElementById('prop_deck').selectedIndex=0;

                
            }
            valObj.typestr = _('(taxType)' + valObj.type);

            GeckoJS.FormHelper.unserializeFromObject('taxForm', valObj);
        },

        exit: function() {
            // check if tax form has been modified
            if (this._selectedIndex != -1 && GeckoJS.FormHelper.isFormModified('taxForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to the current tax. Save changes before exiting?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    this.update();
                }
            }
            window.close();
        },

        confirmChangeTax: function(index) {
            // check if tax form has been modified
            if (this._selectedIndex != -1 && (index == null || (index != -1 && index != this._selectedIndex))
                && GeckoJS.FormHelper.isFormModified('taxForm')) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('Discard Changes'),
                                             _('You have made changes to the current tax. Are you sure you want to discard the changes?'))) {
                    return false;
                }
            }
            return true;
        },

        _checkData: function (data, id) {
            var taxes = this._listDatas;
            var result = 0;

            if (data.no.length <= 0) {

                NotifyUtils.warn(_('Tax code must not be empty.'));
                result = 3;
            } else if (data.name.length <= 0) {

                NotifyUtils.warn(_('Tax name must not be empty.'));
                result = 4;
            } else {
                if (taxes)
                    for (var i = 0; i < taxes.length; i++) {
                        var o = taxes[i];
                            if (o.no == data.no && !id) {

                                NotifyUtils.warn(_('Duplicate tax code [%S]; tax not added', [data.no]));
                                return 1;
                            } else if (o.name == data.name && o.id != id) {

                                NotifyUtils.warn(_('Duplicate tax name [%S]; tax not %S', [data.name, id ? 'modified' : 'added']));
                                return 2;
                            }
                    }
            }
            return result;
        },

        add: function (evt) {
            var aURL = 'chrome://viviecr/content/prompt_addtaxitem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=450';
            var inputObj = {
                input0:null, require0:true, alphaOnly0:true,
                input1:null, require1:true,
                addon: _('(taxType)ADDON'),
                included: _('(taxType)INCLUDED'),
                combine: _('(taxType)COMBINE'),
                vat_on_vat: _('(taxType)VAT & VAT'),
                combinetax:false
            };
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Tax Status'), aFeatures, _('New Tax Status'), '', _('Tax Code'), _('Tax Name'), inputObj);
            if (inputObj.ok && inputObj.input0 && inputObj.input1) {

                var tax_type = 'ADDON';
                tax_type = inputObj.rate_type;
                // var data = this.getInputData();
                var data = {
                    no: inputObj.input0,
                    name: inputObj.input1,
                    type: tax_type,
                    typestr: _('(taxType' + tax_type)
                };

                if (this._checkData(data) == 0) {

                    try {
                        this.Tax.setTax(data.no, data);

                        this.createSingleTaxList();

                        this.load(this._listDatas.length);

                        // find index of newly added tax
                        var index = -1;
                        for (var i = 0; i < this._listDatas.length; i++) {
                            if (this._listDatas[i].no == data.no) {
                                index = i;
                                break;
                            }
                        }
                        var listObj = this.getListObj();
                        listObj.selectedIndex = index;
                        this.select();

                        OsdUtils.info(_('Tax [%S] added successfully', [data.name]));
                    }
                    catch (e) {

                        NotifyUtils.error(_('An error occurred while adding Tax [%S]; the tax may not have been added successfully', [data.name]));
                    }
                }
            }
        },

        remove: function () {
            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;

            if (selectedIndex == null || selectedIndex < 0) return;

            var tax = this._listDatas[selectedIndex];

            // make sure tax has not been assigned to departments
            var deptModel = new CategoryModel();
            var depts = deptModel.findByIndex('all', {
                index: 'rate',
                value: tax.no
            });

            if (depts && depts.length > 0) {
                NotifyUtils.warn(_('[%S] has been assigned to one or more departments and may not be deleted', [tax.name]));
                return;
            }

            // make sure tax has not been assigned to products
            var productModel = new ProductModel();
            var products = productModel.findByIndex('all', {
                index: 'rate',
                value: tax.no
            });

            if (products && products.length > 0) {
                NotifyUtils.warn(_('[%S] has been assigned to one or more products and may not be deleted', [tax.name]));
                return;
            }

            // check if tax is part of a combined tax
            var taxList = this.Tax.getTaxList('COMBINE');
            for (var i = 0; i < taxList.length; i++) {
                var cTax = taxList[i];
                if (cTax.CombineTax) {
                    for (var j = 0; j < cTax.CombineTax.length; j++) {
                       if (cTax.CombineTax[j].combine_tax_id == tax.id) {
                            NotifyUtils.warn(_('[%S] is part of combined tax [%S] and may not be deleted', [tax.name, cTax.name]));
                            return;
                       }
                    }
                }
            }
            
            if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete %S', [tax.name]), _('Are you sure?')) == false) {
                return;
            }
            try {
                this.Tax.removeTax(tax.no);

                this._selectedIndex = null;
                if (selectedIndex >= this._listDatas.length - 1) {
                    selectedIndex--;
                }

                this.createSingleTaxList();

                // check if tax is the default tax
                var defaultTax = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');
                if (defaultTax == tax.id) {
                    GeckoJS.Configure.write('vivipos.fec.settings.DefaultTaxStatus', '');
                }

                this.load(selectedIndex);

                OsdUtils.info(_('Tax [%S] removed successfully', [tax.name]));
            }
            catch (e) {

                NotifyUtils.error(_('An error occurred while removing Tax [%S]; the tax may not have been removed successfully', [tax.name]));
            }
        },

        update: function () {
            
            var data = this.getInputData();
            if (this._checkData(data, data.id) == 0) {
                try {
                    if (data.type == 'COMBINE' || data.type =='VAT') {
                        if (data.combine_tax != null)
                            this.Tax.addCombineTax(data.no, data.combine_tax.split(','));
                    }
                    delete(data.combine_tax);
                    this.Tax.setTax(data.no, data);

                    this.createSingleTaxList();
                    
                    this._selectedIndex = -1;
                    this.load(this.getListObj().selectedIndex);

                    OsdUtils.info(_('Tax [%S] modified successfully', [data.name]));
                }
                catch (e) {
                    
                    NotifyUtils.error(_('An error occurred while adding Tax [%S]; the tax may not have been added successfully', [data.name]));
                }
            }
            
        },

        createSingleTaxList: function () {

            var singleTaxListObj = this.getSingleTaxListObj();
            if (singleTaxListObj != null) {
                var taxes = this.Tax.getTaxList('ADDON').concat(this.Tax.getTaxList('INCLUDED'));
                if (!this._singleTaxPanelView) {
                    this._singleTaxPanelView =  new NSISingleTaxesView(taxes);
                    singleTaxListObj.datasource = this._singleTaxPanelView;
                }
                else {
                    this._singleTaxPanelView.data = taxes;
                    singleTaxListObj.refresh();
                }
                this._listSingleTaxDatas = taxes;
            }
        },

        load: function (index) {
            var listObj = this.getListObj();
            var taxes = this.Tax.getTaxList();
            if (index == null) index = -1;

            var panelView = this._panelView;
            if (panelView == null) {
                panelView =  this._panelView = new NSITaxesView(taxes);
                this.getListObj().datasource = panelView;
            }
            panelView.data = taxes;
            this._listDatas = taxes;
            panelView.tree.invalidate();

            if (index == -1 || listObj.selectedIndex != index) {
                listObj.selectedIndex = index;
                if (index != -1) {
                    listObj.selectedItems = [index];
                }
                else {
                    listObj.selectedItems = [index];
                    this._selectedIndex = null;
                }
            }
            this.select();

        },

        select: function(){

            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;
            
            if (selectedIndex == this._selectedIndex) return;
            
            if (!this.confirmChangeTax(selectedIndex)) {
                listObj.selectedItems = [this._selectedIndex];
                listObj.selectedIndex = this._selectedIndex;
                return;
            }

            this._selectedIndex = selectedIndex;
            if (selectedIndex > -1) {
                var tax = this._listDatas[selectedIndex];
                this.setInputData(tax);

                listObj.ensureIndexIsVisible(selectedIndex);
            }
            else {
                GeckoJS.FormHelper.reset('taxForm');
            }

            var nameTextbox = document.getElementById('tax_name');
            if (nameTextbox) {
                this.validateForm();
                nameTextbox.focus();
            }
        },

        validateForm: function() {
            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;
            var nameTextbox = document.getElementById('tax_name');
            var typeTextbox = document.getElementById('tax_type');
            var rateTextbox = document.getElementById('tax_rate');
            var thresholdTextbox = document.getElementById('tax_threshold');
            var percentageType = document.getElementById('tax_rate_type_percentage');
            var amountType = document.getElementById('tax_rate_type_amount');
            var modBtn = document.getElementById('modify_tax');
            var setdefaultBtn = document.getElementById('set_default');
            var cleardefaultBtn = document.getElementById('clear_default');
            var delBtn = document.getElementById('delete_tax');

            if (selectedIndex == -1) {
                nameTextbox.setAttribute('disabled', true);
                typeTextbox.setAttribute('disabled', true);
                rateTextbox.setAttribute('disabled', true);
                thresholdTextbox.setAttribute('disabled', true);
                percentageType.setAttribute('disabled', true);
                amountType.setAttribute('disabled', true);

                modBtn.setAttribute('disabled', true);
                delBtn.setAttribute('disabled', true);
                setdefaultBtn.setAttribute('hidden', true);
                cleardefaultBtn.setAttribute('hidden', true);
            }
            else {
                var defaultId = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');
                var tax = this._listDatas[selectedIndex];

                nameTextbox.removeAttribute('disabled');
                typeTextbox.removeAttribute('disabled');
                rateTextbox.removeAttribute('disabled');
                thresholdTextbox.removeAttribute('disabled');
                percentageType.removeAttribute('disabled');
                amountType.removeAttribute('disabled');

                var name = nameTextbox.value.replace(/^\s*/, '').replace(/\s*$/, '');
                var rate = rateTextbox.value.replace(/^\s*/, '').replace(/\s*$/, '');
                modBtn.setAttribute('disabled', name.length == 0 || rate.length == 0 || isNaN(rate));
                delBtn.setAttribute('disabled', false);

                setdefaultBtn.setAttribute('hidden', (tax.id == defaultId));
                cleardefaultBtn.setAttribute('hidden', !(tax.id == defaultId));
            }
        },

        setDefaultTaxStatus: function() {
            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;

            var tax = this._listDatas[selectedIndex];
            GeckoJS.Configure.write('vivipos.fec.settings.DefaultTaxStatus', tax.id);

            GeckoJS.Session.set('defaultTaxNo', tax.no);

            listObj.refresh();
            this.validateForm();
        },
        
        clearDefaultTaxStatus: function() {
            var listObj = this.getListObj();

            GeckoJS.Configure.write('vivipos.fec.settings.DefaultTaxStatus', '');

            GeckoJS.Session.remove('defaultTaxNo');

            listObj.refresh();
            this.validateForm();
        }

    };

    AppController.extend(__controller__);

})();

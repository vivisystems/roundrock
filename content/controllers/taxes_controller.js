(function(){

    /**
     * Class ViviPOS.TaxesController
     */

    var __controller__ = {
        name: 'Taxes',
        components: ['Tax'],
        
        _listObj: null,
        _listDatas: null,
        _listAddonObj: null,
        _listAddonDatas: null,
        _panelView: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('taxscrollablepanel');
            }
            return this._listObj;
        },

        getAddonListObj: function() {
            if(this._listAddonObj == null) {
                this._listAddonObj = document.getElementById('addontaxscrollablepanel');
            }
            return this._listAddonObj;
        },
		
	
        getInputData: function () {
        
            return GeckoJS.FormHelper.serializeToObject('taxForm');
        
        },

        resetInputData: function () {

            var Obj = {
                no:'',
                name:'',
                rate:0,
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

            GeckoJS.FormHelper.unserializeFromObject('taxForm', valObj);

        },

        _checkData: function (data, id) {
            var taxes = this._listDatas;
            var result = 0;

            if (data.no.length <= 0) {
                // @todo OSD
                NotifyUtils.warn(_('Tax code must not be empty.'));
                result = 3;
            } else if (data.name.length <= 0) {
                // @todo OSD
                NotifyUtils.warn(_('Tax name must not be empty.'));
                result = 4;
            } else {
                if (taxes)
                    for (var i = 0; i < taxes.length; i++) {
                        var o = taxes[i];
                            if (o.no == data.no && !id) {
                                // @todo OSD
                                NotifyUtils.warn(_('Duplicate tax code [%S]; tax not added', [data.no]));
                                return 1;
                            } else if (o.name == data.name && o.id != id) {
                                // @todo OSD
                                NotifyUtils.warn(_('Duplicate tax name [%S]; tax not %S', [data.name, id ? 'modified' : 'added']));
                                return 2;
                            }
                    }
            }
            return result;
        },

        add: function (evt) {
            var aURL = 'chrome://viviecr/content/prompt_addtaxitem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=560,height=450';
            var inputObj = {
                input0:null, require0:true, alphaOnly0:true,
                input1:null, require1:true,
                addon: _('Add-On'),
                included: _('Included'),
                combine: _('Combined'),
                vat_on_vat: _('VAT & VAT'),
                combinetax:false
            };
            window.openDialog(aURL, _('Add New Tax Status'), features, _('New Tax Status'), '', _('Tax Code'), _('Tax Name'), inputObj);
            if (inputObj.ok && inputObj.input0 && inputObj.input1) {

                var tax_type = 'ADDON';
                tax_type = inputObj.rate_type;
                // var data = this.getInputData();
                var data = {
                    no: inputObj.input0,
                    name: inputObj.input1,
                    type: tax_type
                };

                if (this._checkData(data) == 0) {

                    try {
                        this.Tax.setTax(data.no, data);

                        this.createAddonTaxList();

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

                        // @todo OSD.text to be replaced by OSD.info
                        OsdUtils.info(_('Tax [%S] added successfully', [data.name]));
                    }
                    catch (e) {
                        // @todo OSD
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

            // check if tax is the default tax
            var defaultTax = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');
            if (defaultTax == tax.id) {
                NotifyUtils.warn(_('[%S] is the default tax and may not be deleted', [tax.name]));
                return;
            }

            if (GREUtils.Dialog.confirm(null, _('confirm delete %S', [tax.name]), _('Are you sure?')) == false) {
                return;
            }
            try {
                this.Tax.removeTax(tax.no);

                if (selectedIndex >= this._listDatas.length - 1) {
                    selectedIndex--;
                }
                this.load(selectedIndex);

                // @todo OSD.text to be replaced by OSD.info
                OsdUtils.info(_('Tax [%S] removed successfully', [tax.name]));
            }
            catch (e) {
                // @todo OSD
                NotifyUtils.error(_('An error occurred while removing Tax [%S]; the tax may not have been removed successfully', [tax.name]));
            }
        },

        update: function () {
            
            var data = this.getInputData();
            
            if (this._checkData(data, data.id) == 0) {
                try {
                    if (data.type == 'COMBINE' || data.type =='VAT') {
                        this.Tax.addCombineTax(data.no, data.combine_tax.split(','));
                    }
                    delete(data.combine_tax);
                    this.Tax.setTax(data.no, data);
            
                    this.load(this.getListObj().selectedIndex);

                    // @todo OSD
                    OsdUtils.info(_('Tax [%S] modified successfully', [data.name]));
                }
                catch (e) {
                    // @todo OSD
                    NotifyUtils.error(_('An error occurred while adding Tax [%S]; the tax may not have been added successfully', [data.name]));
                }
            }
            
        },

        createAddonTaxList: function () {

            if (this.getAddonListObj() != null) {
                var taxes = this.Tax.getTaxList('ADDON');
                var panelView =  new NSIAddonTaxesView(taxes);
                this.getAddonListObj().datasource = panelView;

                this._listAddonDatas = taxes;
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

            if (listObj.selectedIndex != index) {
                listObj.selectedIndex = index;
                listObj.selectedItems = [index];
            }
            this.select();

        },

        select: function(){
		
            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;
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
            }
            else {
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
            }
        },

        setDefaultTaxStatus: function() {
            if (this._listObj) {
                this._selectedIndex = this._listObj.selectedIndex;
                if (this._selectedIndex >= 0) {
                    var tax = this._listDatas[this._selectedIndex];
                    if (tax) {
                        GeckoJS.Configure.write('vivipos.fec.settings.DefaultTaxStatus', tax.id);
                    }
                }
            }
        },

        initTaxStatus: function(tax_id) {
            this.load();

            var listObj = this.getListObj();
            var taxes = this._listDatas;

            if (taxes && listObj) {
                listObj.selectedItems = [];
                listObj.selectedIndex = -1;
                for (var i = 0; i < taxes.length; i++) {
                    if (taxes[i].id == tax_id) {
                        listObj.selectedItems = [i];
                        listObj.selectedIndex = i;
                        break;
                    }
                }
            }
        }

    };

    GeckoJS.Controller.extend(__controller__);

})();

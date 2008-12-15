(function(){

    /**
     * Class ViviPOS.TaxesController
     */

    GeckoJS.Controller.extend({
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

        _checkData: function (data) {
            var taxes = this._listDatas;
            var result = 0;

            if (data.no.length <= 0) {
                alert(_('Tax code must not be empty.'));
                result = 3;
            } else if (data.name.length <= 0) {
                alert(_('Tax name must not be empty.'));
                result = 4;
            } else {
                taxes.forEach(function(o){
                    if (o.no == data.no) {
                        alert(_('Duplicate tax code (%S); tax not added', [data.no]));
                        result = 1;
                    } else if (o.name == data.name) {
                        alert(_('Duplicate tax name (%S); tax not added', [data.name]));
                        result = 2;
                    }
                });
            }
            return result;
        },

        add: function (evt) {
            var aURL = 'chrome://viviecr/content/prompt_addtaxitem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=600,height=400';
            var inputObj = {
                input0:null, require0:true,
                input1:null, require1:true,
                addon: _('Add-On'),
                included: _('Included'),
                combine: _('Combined'),
                vat_on_vat: _('VAT & VAT'),
                combinetax:false
            };
            window.openDialog(aURL, 'prompt_additem', features, _('New Tax'), '', _('Tax Code:'), _('Tax Name:'), inputObj);
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
                    this.Tax.setTax(data.no, data);

                    this.createAddonTaxList();

                    this.load(this._listDatas.length);
                }
            }

        },

        remove: function (evt) {
            if (GREUtils.Dialog.confirm(null, _('confirm delete'), _('Are you sure?')) == false) {
                return;
            }
            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;
            var tax = this._listDatas[selectedIndex];

            this.Tax.removeTax(tax.no);

            if (selectedIndex >= this._listDatas.length - 1) {
                selectedIndex--;
            }
            this.load(selectedIndex);
        },

        update: function (evt) {
            
            var data = this.getInputData();
            
            //alert(this.dump(data));

            if (data.type == 'COMBINE' || data.type =='VAT') {
                this.Tax.addCombineTax(data.no, data.combine_tax.split(','));
            }
            delete(data.combine_tax);
            this.Tax.setTax(data.no, data);
            
            this.load(this.getListObj().selectedIndex);
            
        },

        createAddonTaxList: function () {

            var taxes = this.Tax.getTaxList('ADDON');
            var panelView =  new NSIAddonTaxesView(taxes);
            this.getAddonListObj().datasource = panelView;

            this._listAddonDatas = taxes;

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
                        GeckoJS.Configure.write('vivipos.fec.settings.DefaultTaxStatus', tax.no);
                    }
                }
            }
        },

        initTaxStatus: function(tax_no) {
            this.load();

            var listObj = this.getListObj();
            var taxes = this._listDatas;

            if (taxes && listObj) {
                listObj.selectedItems = [];
                listObj.selectedIndex = -1;
                for (var i = 0; i < taxes.length; i++) {
                    if (taxes[i].no == tax_no) {
                        listObj.selectedItems = [i];
                        listObj.selectedIndex = i;
                        break;
                    }
                }
            }
        }

    });

})();


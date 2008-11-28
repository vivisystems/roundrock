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
            var self = this;
            GeckoJS.FormHelper.reset('taxForm');

            valObj.combine_tax = "";

            if (valObj.type == 'COMBINE') {
                document.getElementById('prop_deck').selectedIndex=1;

                var taxes = this.Tax.getTax(valObj.no);
                var combineTax = taxes.CombineTax;
                var combineTaxarray = GeckoJS.Array.objectExtract(combineTax, '{n}.no');
                var combineTaxStr = combineTaxarray.join(",");
                valObj.combine_tax = combineTaxStr;
                
            } else {
                document.getElementById('prop_deck').selectedIndex=0;
                
            }

            GeckoJS.FormHelper.unserializeFromObject('taxForm', valObj);

        },

        _checkData: function (data) {
            var taxes = this._listDatas;
            var result = 0;

            if (data.no.length <= 0) {
                alert('No is empty...');
                result = 3;
            } else if (data.name.length <= 0) {
                alert('Name is empty...');
                result = 4;
            } else {
                taxes.forEach(function(o){
                    if (o.no == data.no) {
                        alert('Tax No...' + data.no);
                        result = 1;
                    } else if (o.name == data.name) {
                        alert('Tax Name...' + data.name);
                        result = 2;
                    }
                });
            }
            return result;
        },

        add: function (evt) {
            var self = this;
            var aURL = "chrome://viviecr/content/prompt_addtaxitem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=600,height=400";
            var inputObj = {
                input0:null,
                input1:null,
                combinetax:false
            };
            window.openDialog(aURL, "prompt_additem", features, "New Tax", "Please input:", "Tax Code:", "Tax Name:", inputObj);
            if (inputObj.ok && inputObj.input0 && inputObj.input1) {

                var tax_type = "ADDON";
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

                    // set selectedIndex to added data
                    this.getListObj().selectedIndex = this._listDatas.length;
                    this.getListObj().selectedItems = [this._listDatas.length];

                    this.load(data);
                }
            }

        },

        remove: function (evt) {
            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?") == false) {
                return;
            }
            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;
            var tax = this._listDatas[selectedIndex];

            this.Tax.removeTax(tax.no);
            this.load();
        },

        update: function (evt) {
            
            var data = this.getInputData();
            
            //alert(this.dump(data));

            if (data.type == 'COMBINE' || data.type =='VAT') {
                this.Tax.addCombineTax(data.no, data.combine_tax.split(','));
            }
            delete(data.combine_tax);
            this.Tax.setTax(data.no, data);

            this.load(data);
            
        },

        createAddonTaxList: function () {

            var self = this;
            var taxes = this.Tax.getTaxList("ADDON");
            var panelView =  new NSIAddonTaxesView(taxes);
            this.getAddonListObj().datasource = panelView;

            this._listAddonDatas = taxes;

        },

        load: function (data) {

            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;
            var taxes = this.Tax.getTaxList();

            var panelView =  new NSITaxesView(taxes);
            this.getListObj().datasource = panelView;

            this._listDatas = taxes;

            var index = 0;

            if (data) {
                listObj.value = data;
                listObj.selectedItems = [selectedIndex];
                listObj.selectedIndex = selectedIndex;
            }else if(taxes) {
                listObj.selectedItems = [0];
                listObj.selectedIndex = 0;
            }

            this.select();



        },

        select: function(){
		
            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;
            var tax = this._listDatas[selectedIndex];
            this.setInputData(tax);
        }
	
    });

})();


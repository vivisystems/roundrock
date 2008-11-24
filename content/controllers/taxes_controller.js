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

                var taxes = this.Tax.getTax(valObj.name);
                var combineTax = taxes.CombineTax;
                var combineTaxarray = GeckoJS.Array.objectExtract(combineTax, '{n}.name');
                var combineTaxStr = combineTaxarray.join(",");
                valObj.combine_tax = combineTaxStr;
                
            } else {
                document.getElementById('prop_deck').selectedIndex=0;
                
            }

            GeckoJS.FormHelper.unserializeFromObject('taxForm', valObj);

        },

        add: function (evt) {
            var self = this;
            var aURL = "chrome://viviecr/content/prompt_addtaxitem.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250";
            var inputObj = {
                input0:null,
                input1:null,
                combinetax:false
            };
            window.openDialog(aURL, "prompt_additem", features, "New Tax", "Please input:", "No:", "Name", inputObj);
            if (inputObj.ok && inputObj.input0 && inputObj.input1) {

                var tax_type = "ADDON";
                if (inputObj.combinetax) tax_type = "COMBINE";
                // var data = this.getInputData();
                var data = {
                    no: inputObj.input0,
                    name: inputObj.input1,
                    type: tax_type
                };
                this.Tax.setTax(data.name, data);

                this.createAddonTaxList();
                this.load(data);
            }

        },

        remove: function (evt) {
            if (GREUtils.Dialog.confirm(null, "confirm delete", "Are you sure?") == false) {
                return;
            }
            var listObj = this.getListObj();
            var selectedIndex = listObj.selectedIndex;
            var tax = this._listDatas[selectedIndex];
            this.Tax.removeTax(tax.name);
            this.load();
        },

        update: function (evt) {
            
            var data = this.getInputData();
            this.Tax.setTax(data.name, data);
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
            var taxes = this.Tax.getTaxList();

            var panelView =  new NSITaxesView(taxes);
            this.getListObj().datasource = panelView;

            this._listDatas = taxes;

            var index = 0;
            if (data) {
                listObj.value = data;
            } else if (taxes) {
                listObj.selectedItems = [0];
                listObj.selectedIndex = 0;
            };

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


(function(){

    /**
     * Class ViviPOS.TaxesController
     */
    // GeckoJS.define('ViviPOS.TaxesController');

    GeckoJS.Controller.extend({
        name: 'Taxes',
        components: ['Tax'],
        
        _listObj: null,
        _listDatas: null,
        _listCombineObj: null,
        _listCombineDatas: null,
        _listAddonObj: null,
        _listAddonDatas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = this.query("#simpleListBoxTax")[0];
                this._listCombineObj = this.query("#simpleListBoxTaxCombine")[0];
                this._listAddonObj = this.query("#simpleListBoxTaxAddon")[0];
            }
            // return this._listObj;
            return this.query("#simpleListBoxTax")[0];
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
            // GeckoJS.FormHelper.reset('taxForm');
            this.resetInputData();
            
            if (valObj.type == 'COMBINE') {
                var taxes = this.Tax.getTax(valObj.name);
                // this._listCombineDatas = taxes.CombineTax;
                this._listCombineObj.loadData(taxes.CombineTax);

                var addontaxes = this.Tax.getTaxList("ADDON");
                // remove the used items
                taxes.CombineTax.forEach(function(o){
                    o.CombineTax = null;
                    var i = GeckoJS.FECPosUtils.inArray(o, addontaxes);
                    if (i >= 0) addontaxes.splice(i, 1);
                });
                // this.log('addontaxes after:' + addontaxes.length + ',,,' + this.dump(addontaxes));
                this._listAddonObj.loadData(addontaxes);
            } else {
                this._listCombineObj.resetData();
                this._listAddonObj.resetData();
            }

            GeckoJS.FormHelper.unserializeFromObject('taxForm', valObj);
            // GeckoJS.FECPosUtils.setConfigures('hh:nn-ss');
            // this.log('Configures:' + this.dump(GeckoJS.FECPosUtils.getConfigures()));
            
            // GeckoJS.Configure.loadPreferences("extensions.vivipos.settings");
            // this.log('Conf map:' + (GeckoJS.Configure.read('extensions2.vivipos')));
        },

        add: function (evt) {
            var self = this;
            /*
            var no = $('#tax_no').val();
            var name = $('#tax_name').val();
            var rate = $('#tax_rate').val();
            var rate_type = $('#tax_rate_type').val();
            var threshold = $('#tax_threshold').val();
            this.Tax.addTax(name, no, rate, rate_type,  threshold);
            */
            var data = this.getInputData();
            this.Tax.setTax(data.name, data);
            this.load(data);
        },

        delete: function (evt) {
            alert('delete');
        },

        update: function (evt) {
            // alert('update');
            var self = this;
            /*
            var no = $('#tax_no').val();
            var name = $('#tax_name').val();
            var rate = $('#tax_rate').val();
            var rate_type = $('#tax_rate_type').val();
            var threshold = $('#tax_threshold').val();
            */
            var data = this.getInputData();
            // this.log('data:' + this.dump(data));
            this.Tax.setTax(data.name, data);
            this.load(data);
            /*
            var roles = this.Acl.getRoleListInGroup(group);
            roles.forEach(function(o) {
                self.Acl.removeRoleFromGroup(group, o.name);
            });

            roles = this.Acl.getRoleList();
            roles.forEach(function(o) {
                if ($('#role_' + o.name)[0].checked) {
                    self.Acl.addRoleToGroup(group, o.name);
                }
            });*/
        },

        load: function (data) {
            // alert(GeckoJS.BaseObject.dump(this));
            var listObj = this.getListObj();

            // var tc = new GeckoJS.TaxComponent();
            // taxes = this.Tax.getTaxList("ADDON");
            taxes = this.Tax.getTaxList();
            // this.log('Tax List:' + this.dump(taxes));

            this._listDatas = taxes;
            listObj.loadData(taxes);

            var i = 0;
            var j = 0;
            if (data) {
                if ((typeof data) == 'object' ) {
                    taxes.forEach(function(o) {
                        if (o.no == data.no) {
                            j = i;
                        }
                        i++;
                    });
                }
            }
            this._listObj.selectedIndex = j;
            this._listObj.ensureIndexIsVisible(j);

            GeckoJS.FormHelper.clearItems($('#taxList')[0]);
            GeckoJS.FormHelper.appendItems($('#taxList')[0], taxes, function(){
                return {
                    label: this.name + " - " + this.rate,
                    value: this.name
                };
            });
            // this.log(this.dump(GeckoJS.Session.getInstance().getMap()));
            // this.log('extensions.vivipos.firstrun:' + GREUtils.Pref.getPref('extensions.venkman.lastThrowMode'));
        },

        select: function(){
		
            var listObj = this.getListObj();
            selectedIndex = listObj.selectedIndex;
            var tax = this._listDatas[selectedIndex];
            this.setInputData(tax);
        }
	
    });

})();


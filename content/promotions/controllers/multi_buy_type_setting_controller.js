(function(){

    // key is in prefs 's registry key
    var key = 'multi_buy';
    var sessionKey = "promotions_manager.type.settings."+key;

    /**
     * Controller Promotions Manager
     * 
     */
    var __controller__ = {

        name: 'MultiBuyTypeSetting',
        
        _treeData: [],

        /*
         * initial promotions rules for register
         */
        initial: function() {

            var settings = GeckoJS.Session.get(sessionKey) || null;

            this.setSettings(settings);

        },

        setSettings: function(settings) {
            this.updateForm(settings);
        },

        getSettings: function() {

            var formData = this.Form.serializeToObject('multiBuyForm');

            var settings = formData;

            // add treeData to data
            settings.data = this._treeData;

            // set to sessions
            GeckoJS.Session.set(sessionKey, settings);

        },

        updateForm: function(item) {

            if (item) {
                
                this.Form.unserializeFromObject('multiBuyForm', item);
                
                // update product
                this._treeData = item.data || [];
                this.updateTreeView();

            }else {
                this.Form.reset('multiBuyForm');
            }
            
        },

        updateTreeView: function() {

            var treeObj = this._treeObj = this._treeObj || document.getElementById('qtyTree');
            treeObj.datasource = this._treeData;

        },

        addQuantity: function(item) {

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=350';
            var inputObj = {
                input0:null, require0:true, alphaOnly0:true,
                input1:null, require1:true
            };
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Multi-Buy Quantity Setting'), features,
                                       _('New Multi-Buy Quantity Setting'), '', _('Multi-Buy Quantity'), _('Multi-Buy Value'), inputObj);
            if (inputObj.ok && inputObj.input0 && inputObj.input1) {

                var quantity = isNaN(parseFloat(inputObj.input0)) ? 0 : parseFloat(inputObj.input0) ;
                var value = isNaN(parseFloat(inputObj.input1)) ? 0 : parseFloat(inputObj.input1) ;

                if(quantity > 0) {

                    this._treeData.push({quantity: quantity, value: value});

                    new GeckoJS.ArrayQuery(this._treeData).orderBy("quantity asc");

                    this.updateTreeView();

                }

            }


        },

        removeQuantity: function() {

            var treeObj = this._treeObj = this._treeObj || document.getElementById('qtyTree');

            var index = treeObj.selectedIndex;

            this._treeData.splice(index, 1);

            this.updateTreeView();
        }


    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('load', function() {
        $do('initial', null, 'MultiBuyTypeSetting');
    }, false);

    // when promotion rule modify
    window.addEventListener('promotion_modify', function() {
        $do('getSettings', null, 'MultiBuyTypeSetting');
    }, false);

    
})();

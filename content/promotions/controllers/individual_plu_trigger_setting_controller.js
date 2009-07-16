(function(){

    // key is in prefs 's registry key
    var key = 'individual_plu';
    var sessionKey = "promotions_manager.trigger.settings."+key;

    /**
     * Controller Promotions Manager
     * 
     */
    var __controller__ = {

        name: 'IndividualPluTriggerSetting',

        _treeObj: null,

        _treeData: [],

        /*
         * initial promotions rules for register
         */
        initial: function() {

            this.screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            this.screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            var settings = GeckoJS.Session.get(sessionKey) || null;

            this.setSettings(settings);

        },

        setSettings: function(settings) {
            this.updateForm(settings);
        },

        getSettings: function() {
            var formData = this.Form.serializeToObject('individualPluForm');
            
            // process formData to settings

            
            // set to sessions
            var settings = formData;

            // add treeData to data
            settings.data = this._treeData;

            GeckoJS.Session.set(sessionKey, settings);

        },

        updateForm: function(item) {

            if (item) {
                
                this.Form.unserializeFromObject('individualPluForm', item);

                // update product
                this._treeData = item.data || [];
                this.updateTreeView();


            }else {
                this.Form.reset('individualPluForm');
            }

        },

        searchDialog: function () {

            var aURL = "chrome://viviecr/content/plusearch.xul";
            var aName = _('Product Search');
            var aFeatures = "chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=" + this.screenwidth + ",height=" + this.screenheight
            var treeObj = this._treeObj = this._treeObj || document.getElementById('pluTree');
            var index = treeObj.selectedIndex;

            var buf = "";
            if (index >= 0) {
                buf = (this._treeData[index]) ? this._treeData[index].no : "" ;
            }

            //var buf = document.getElementById('keyword').value;
            
            var item = null;

            var aArguments = {
                buffer: buf,
                item: item,
                select: true
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures, aArguments);

            if (aArguments.ok) {
                if (aArguments.item) {
                    return this.addPlu(aArguments.item);
                }else {
                    // return this.updateForm(null);
                }
            }

            return null;
          
        },

        updateTreeView: function() {

            var treeObj = this._treeObj = this._treeObj || document.getElementById('pluTree');
            treeObj.datasource = this._treeData;

        },

        addPlu: function(item) {
            this._treeData.push({id: item.id, no: item.no, name: item.name});
            this.updateTreeView();
        },

        removePlu: function() {

            var treeObj = this._treeObj = this._treeObj || document.getElementById('pluTree');

            var index = treeObj.selectedIndex;

            this._treeData.splice(index, 1);
            
            this.updateTreeView();
        }

    };

    GeckoJS.Controller.extend(__controller__);


    window.addEventListener('load', function() {
        $do('initial', null, 'IndividualPluTriggerSetting');
    }, false);

    // when promotion rule modify
    window.addEventListener('promotion_modify', function(event) {
        $do('getSettings', null, 'IndividualPluTriggerSetting');
    }, false);

})();

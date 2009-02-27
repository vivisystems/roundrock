(function(){

    GeckoJS.Controller.extend( {
        name: 'Destinations',
	
        _listObj: null,
        _listDatas: [],

        initial: function() {
            // load default destination
            var defaultDest = null;
            var datastr = GeckoJS.Configure.read('vivipos.fec.settings.Destinations');
            var listDatas = null;

            if (datastr != null) {
                listDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datastr));
                var curDefaults = new GeckoJS.ArrayQuery(listDatas).filter('defaultMark = *');
                if (curDefaults.length > 0) {
                    defaultDest = curDefaults[0];
                }
            }
            GeckoJS.Session.set('destinations', listDatas);
            GeckoJS.Session.set('defaultDestination', defaultDest);

            // add listener for newTransaction event
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if (cart) {
                cart.addEventListener('newTransaction', this.initTransaction, this);
            }

        },

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('destscrollablepanel');
            }
            return this._listObj;
        },

        load: function (data) {

            if (this._listDatas.length <= 0) {
                var datas = document.getElementById('pref_destinations').value;
                if (datas != null) this._listDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datas));
                if (this._listDatas.length <= 0) this._listDatas = [];
            }

            this.getListObj().datasource = this._listDatas;

            this.validateForm();
        },

        addDestination: function(){
            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {input0:null, require0:true};

            window.openDialog(aURL, _('Add New Destination'), features, _('New Destination'), '', _('Name'), '', inputObj);
            if (inputObj.ok && inputObj.input0) {
                var destName = inputObj.input0;

                var dupNames = new GeckoJS.ArrayQuery(this._listDatas).filter('name = ' + destName);
                if (dupNames.length > 0) {
                    // @todo OSD
                    NotifyUtils.warn(_('Destination [%S] already exists', [destName]));
                    return;
                }

                this._listDatas.push({defaultMark: '', name: destName, pricelevel: '-', prefix: ''});

                this.saveDestinations();

                // loop through tihs._listDatas to find the newly added destination and select it
                var index = 0;
                for (var index = 0; index < this._listDatas.length; index++) {
                    if (this._listDatas[index].name == destName) {
                        this.select(index);
                        break;
                    }
                }

                // @todo OSD
                OsdUtils.info(_('Destination [%S] added successfully', [destName]));
            }
        },

        modifyDestination: function() {
            var inputObj = GeckoJS.FormHelper.serializeToObject('destinationForm');
            var index = this.getListObj().selectedIndex;
            if (index > -1) {
                if (inputObj.name != null && inputObj.name.length > 0) {
                    this._listDatas[index].pricelevel = inputObj.pricelevel;
                    this._listDatas[index].prefix = GeckoJS.String.trim(inputObj.prefix);
                    this.setDefaultDestination(inputObj.defaultCheckbox);

                    this.saveDestinations();

                    var destName = this._listDatas[index].name;
                    OsdUtils.info(_('Destination [%S] modified successfully', [destName]));
                }
                else {
                    // shouldn't happen, but check anyways
                    NotifyUtils.warn(_('Destination name must not be empty'));
                }
            }
        },

        deleteDestination: function(){
            var index = this.getListObj().selectedIndex;
            if (index >= 0) {
                var destName = this._listDatas[index].name;
                this._listDatas.splice(index, 1);
                this.saveDestinations();

                // @todo OSD
                OsdUtils.info(_('Destination [%S] deleted successfully', [destName]));

                this.load();

                index = this.getListObj().selectedIndex;
                if (index >= this._listDatas.length) index = this._listDatas.length - 1;
                this.select(index);
            }
        },

        saveDestinations: function() {
            var datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy('name asc');
            var datastr = GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(datas));

            document.getElementById('pref_destinations').value = datastr;
            GeckoJS.Session.set('defaultDestination', this.getDefaultDestination());
            GeckoJS.Session.set('destinations', datas);

            this.load();
        },

        setDefaultDestination: function(checked) {
            var index = this.getListObj().selectedIndex;
            if (index >= 0) {

                if (checked) {
                // find current default and clear it
                    var curDefaults = new GeckoJS.ArrayQuery(this._listDatas).filter('defaultMark = *');
                    if (curDefaults.length > 0) {
                        // @todo OSD
                        curDefaults.forEach(function(ele) {
                            ele.defaultMark = '';
                        });
                    }
                    this._listDatas[index].defaultMark = '*';
                }
                else {
                    this._listDatas[index].defaultMark = '';
                }
            }
        },

        getDefaultDestination: function() {
            // get default destination
            if (this._listDatas != null) {
                var curDefaults = new GeckoJS.ArrayQuery(this._listDatas).filter('defaultMark = *');
                if (curDefaults.length > 0) {
                    return curDefaults[0];
                }
            }
            return null;
        },

        validateForm: function() {

            var addBtn = document.getElementById('add_destination');
            var modifyBtn = document.getElementById('modify_destination');
            var deleteBtn = document.getElementById('delete_destination');
            var prefixTextbox = document.getElementById('destination_prefix');
            var defaultCheckbox = document.getElementById('destination_default');

            var panel = this.getListObj();
            if (panel.selectedIndex > -1) {
                deleteBtn.removeAttribute('disabled');
                modifyBtn.removeAttribute('disabled');
                defaultCheckbox.removeAttribute('disabled');
                prefixTextbox.removeAttribute('disabled');
            } else {
                deleteBtn.setAttribute('disabled', true);
                modifyBtn.setAttribute('disabled', true);
                defaultCheckbox.checked = false;
                defaultCheckbox.setAttribute('disabled', true);
                prefixTextbox.setAttribute('disabled', true);
            }
        },
	
        select: function(index){
            this.getListObj().vivitree.selection.select(index);
            if (index > -1) {
                var inputObj = this._listDatas[index];
                if (inputObj.defaultMark == '*')
                    inputObj.defaultCheckbox = 1;
                else
                    inputObj.defaultCheckbox = 0;
                GeckoJS.FormHelper.unserializeFromObject('destinationForm', inputObj);

            }
            else {
                GeckoJS.FormHelper.reset('destinationForm');
            }

            this.validateForm();
        },

        // handles newTransaction event from cart controller to initialize a new transaction
        initTransaction: function() {
            var defaultDest = GeckoJS.Session.get('defaultDestination');
            if (defaultDest != null) {
                this.setDestination(defaultDest.name);
            }
            else {
                var cart = GeckoJS.Controller.getInstanceByName('Cart');
                if (cart) {
                    var txn = cart._getTransaction();
                    if (txn) {
                        txn.data.destination_prefix = '';
                        txn.data.destination = null;
                    }
                }
            }
        },

        setDestination: function(destName) {
            // check if destination is valid
            var destinations = GeckoJS.Session.get('destinations');
            var results = new GeckoJS.ArrayQuery(destinations).filter('name = ' + destName);

            if (results == null || results.length == 0) {
                NotifyUtils.warn(_('Destination [%S] has not been defined', [destName]));
                return;
            }
            var dest = results[0];
            
            // get cart controller
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if (cart == null) {
                NotifyUtils.error(_('Shopping cart is missing; please contact your dealer for technical support'));
                return;
            }

            // get current transaction
            var txn = cart._getTransaction();

            if (txn.isClosed()) {
                NotifyUtils.warn(_('This order is closed pending payment and may not be modified'));
                return;
            }

            if (txn == null || txn.isSubmit() || txn.isCancel()) {
                // create a new transaction
                txn = cart._newTransaction();
                cart.clear();
            }

            // set current destination
            GeckoJS.Session.set('vivipos_fec_order_destination', dest.name);

            // set price level if necessary
            if (isNaN(dest.pricelevel)) {
                if (dest.pricelevel != '-') {
                    this.requestCommand('changeToCurrentLevel', null, 'Pricelevel');
                }
            }
            else {
                this.requestCommand('change', dest.pricelevel, 'Pricelevel');
            }

            // set txn destination
            txn.data.destination = dest.name;

            // store destination prefix in transaction
            txn.data.destination_prefix = (dest.prefix == null) ? '' : dest.prefix + ' ';
        }
	
    });

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('onInitial', function() {
                                            main.requestCommand('initial', null, 'Destinations');
                                      });

    }, false);

})();


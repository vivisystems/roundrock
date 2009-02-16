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
                var curDefaults = new GeckoJS.ArrayQuery(listDatas).filter('default = *');
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
            var destName = GeckoJS.String.trim(document.getElementById('destination_name').value);
            var destPriceLevel = document.getElementById('destination_pricelevel').value;
            var destPrefix = GeckoJS.String.trim(document.getElementById('destination_prefix').value);

            if (this._listDatas) {
                var dupNames = new GeckoJS.ArrayQuery(this._listDatas).filter('name = ' + destName);
                if (dupNames.length > 0) {
                    // @todo OSD
                    NotifyUtils.warn(_('Destination [%S] already exists', [destName]));
                    return;
                }
            }
            this._listDatas.push({default: '', name: destName, pricelevel: destPriceLevel, prefix: destPrefix});

            document.getElementById('destination_name').value = '';
            document.getElementById('destination_pricelevel').value = '-';
            document.getElementById('destination_prefix').value = '';

            this.saveDestinations();

            // @todo OSD
            OsdUtils.info(_('Destination [%S] added successfully', [destName]));

            this.load();
        },

        removeDestination: function(){
            var index = this.getListObj().selectedIndex;
            if (index >= 0) {
                var destName = this._listDatas[index].name;
                this._listDatas.splice(index, 1);
                this.saveDestinations();

                // @todo OSD
                OsdUtils.info(_('Destination [%S] removed successfully', [destName]));

                this.load();

                index = this.getListObj().selectedIndex;
                if (index >= this._listDatas.length) index = this._listDatas.length - 1;
                this.getListObj().selectedIndex = index;
                this.select(index);
            }
        },

        saveDestinations: function() {
            var datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy('name asc');
            var datastr = GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(datas));

            document.getElementById('pref_destinations').value = datastr;
            GeckoJS.Session.set('defaultDestination', this.getDefaultDestination());
            GeckoJS.Session.set('destinations', datas);
        },

        setDefaultDestination: function(checked) {
            var index = this.getListObj().selectedIndex;
            if (index >= 0) {

                if (checked) {
                // find current default and clear it
                    var curDefaults = new GeckoJS.ArrayQuery(this._listDatas).filter('default = *');
                    if (curDefaults.length > 0) {
                        // @todo OSD
                        curDefaults.forEach(function(ele) {
                            ele.default = '';
                        });
                    }
                    this._listDatas[index].default = '*';
                }
                else {
                    this._listDatas[index].default = '';
                }
                var destName = this._listDatas[index].name;
                var datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy('name asc');
                var datastr = GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(datas));

                document.getElementById('pref_destinations').value = datastr;
                GeckoJS.Session.set('defaultDestination', this.getDefaultDestination());

                // @todo OSD
                OsdUtils.info(_('Destination [%S] set as default successfully', [destName]));

                this.load();
            }
        },

        getDefaultDestination: function() {
            // get default destination
            if (this._listDatas != null) {
                var curDefaults = new GeckoJS.ArrayQuery(this._listDatas).filter('default = *');
                if (curDefaults.length > 0) {
                    return curDefaults[0];
                }
            }
            return null;
        },

        validateForm: function() {

            var addBtn = document.getElementById('add_destination');
            var removeBtn = document.getElementById('remove_destination');
            var defaultCheckbox = document.getElementById('default_destination');

            var destName = document.getElementById('destination_name').value;
            var destPriceLevel = document.getElementById('destination_pricelevel').value;

            var panel = this.getListObj();
            if (panel.selectedIndex > -1) {
                removeBtn.setAttribute('disabled', false);
                defaultCheckbox.setAttribute('disabled', false);
            } else {
                removeBtn.setAttribute('disabled', true);
                defaultCheckbox.checked = false;
                defaultCheckbox.setAttribute('disabled', true);
            }

            if (destName.length > 0 && destPriceLevel.length > 0) {
                addBtn.setAttribute('disabled', false);
            } else {
                addBtn.setAttribute('disabled', true);
            }
        },
	
        select: function(index){
            if (index > -1) {
                document.getElementById('default_destination').checked = (this._listDatas[index].default == '*');
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
                        txn.destination_prefix = '';
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
                NotifyUtils.warn('Destination [%S] has not been defined', [destName]);
                return;
            }
            var dest = results[0];
            
            // get cart controller
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if (cart == null) {
                NotifyUtils.error('Shopping cart is missing; please contact your dealer for technical support');
                return;
            }

            // get current transaction
            var txn = cart._getTransaction();
            if (txn == null || txn.isSubmit() || txn.isCancel()) {
                // create a new transaction
                txn = cart._newTransaction();
                cart.clear();
            }

            // set current destination
            GeckoJS.Session.set('vivipos_fec_order_destination', dest.name);

            // set price level if necessary
            if (!isNaN(dest.pricelevel)) {
                this.requestCommand('change', dest.pricelevel, 'Pricelevel');
            }

            // set txn destination
            txn.data.destination = dest.name;

            // store destination prefix in transaction
            txn.destination_prefix = (dest.prefix == null) ? '' : dest.prefix + ' ';
        }
	
    });

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('onInitial', function() {
                                            main.requestCommand('initial', null, 'Destinations');
                                      });

    }, false);

})();


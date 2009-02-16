(function(){

    GeckoJS.Controller.extend( {
        name: 'Destinations',
	
        _listObj: null,
        _listDatas: [],

        initial: function() {
            // load default destination
            var defaultDest = null;
            var datastr = GeckoJS.Configure.read('vivipos.fec.settings.Destinations');

            if (datastr != null) {
                var listDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datastr));
                var curDefaults = new GeckoJS.ArrayQuery(listDatas).filter('default = *');
                if (curDefaults.length > 0) {
                    defaultDest = curDefaults[0];
                }
            }
            GeckoJS.Session.set('defaultDestination', defaultDest);
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

            var datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy('name asc');
            var datastr = GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(datas));

            document.getElementById('pref_destinations').value = datastr;
            GeckoJS.Session.set('defaultDestination', this.getDefaultDestination());

            // @todo OSD
            OsdUtils.info(_('Destination [%S] added successfully', [destName]));

            this.load();
        },

        removeDestination: function(){
            var index = this.getListObj().selectedIndex;
            if (index >= 0) {
                var destName = this._listDatas[index].name;
                this._listDatas.splice(index, 1);
                var datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy('name asc');
                var datastr = GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(datas));

                document.getElementById('pref_destinations').value = datastr;
                GeckoJS.Session.set('defaultDestination', this.getDefaultDestination());

                // @todo OSD
                OsdUtils.info(_('Destination [%S] removed successfully', [destName]));

                this.load();

                index = this.getListObj().selectedIndex;
                if (index >= datas.length) index = datas.length - 1;
                this.getListObj().selectedIndex = index;
                this.select(index);
            }
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

        // invoked from cart controller to initialize a new transaction
        initTransaction: function(txn) {
            var defaultDest = GeckoJS.Session.get('defaultDestination');
            if (defaultDest != null) {
                GeckoJS.Session.set('vivipos_fec_order_destination', defaultDest.name);

                // check if price level needs to be set
                if (!isNaN(defaultDest.pricelevel)) {
                    this.requestCommand('change', defaultDest.pricelevel, 'Pricelevel');
                }

                // store destination prefix in transaction
                txn.destination_prefix = (defaultDest.prefix == null) ? null: defaultDest.prefix + ' ';
            }
        }
	
    });

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('onInitial', function() {
                                            main.requestCommand('initial', null, 'Destinations');
                                      });

    }, false);

})();


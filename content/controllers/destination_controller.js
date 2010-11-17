(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'Destinations',

        components: ['Tax'],

        _taxNames: {},
        _listObj: null,
        _listView: null,
        _listDatas: [],
        _selectedIndex: -1,

        initial: function() {
            // load default destination
            var datastr = GeckoJS.Configure.read('vivipos.fec.settings.Destinations');
            var defaultDest = GeckoJS.Configure.read('vivipos.fec.settings.DefaultDestination');
            var defaultFound = false;
            var listDatas = null;
            
            if (datastr != null) {
                listDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datastr));
                for (var i = 0; i < listDatas.length; i++) {
                    if (defaultDest == listDatas[i].name) {
                        defaultFound = true;
                    }
                }
            }
            if (!defaultFound) {
                defaultDest = '';
            }
            GeckoJS.Session.set('destinations', listDatas);
            GeckoJS.Session.set('defaultDestination', defaultDest);

            this.setDestinationsByNameSession(listDatas);

            // add listener for newTransaction event
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if (cart) {
                cart.addEventListener('newTransaction', this.initTransaction, this);
            }

        },


        setDestinationsByNameSession: function(destinations) {

            destinations = destinations || [];

            var destinationsByName = {};

            destinations.forEach(function(d) {
                destinationsByName[d.name] = d;
            });

            GeckoJS.Session.set('destinationsByName', destinationsByName);

        },


        getListObj: function() {
            if (this._listObj == null) {
                this._listObj = document.getElementById('destscrollablepanel');

                var panelView = new GeckoJS.NSITreeViewArray();
                panelView.getCellValue = function(row, col) {
                    var sResult;
                    var dest;
                    var key;
                    try {
                        key = col.id;
                        dest = this.data[row];
                        sResult= dest[key];

                        if (key == 'default') {
                            var defaultDest = GeckoJS.Session.get('defaultDestination');
                            if (dest.name == defaultDest) {
                                sResult = true;
                            }
                        }
                    }
                    catch (e) {
                        return "";
                    }
                    return sResult;
                }
                this._listView = panelView;
            }
            return this._listObj;
        },

        load: function (init) {

            // populate tax menu
            if (init) {
                var taxes = this.Tax.getTaxList();
                var taxMenu = this.document.getElementById('destination_taxno');

                taxes.forEach(function(tax) {
                    taxMenu.appendItem(tax.name + ' (' + tax.no + ')', tax.no);
                    this._taxNames[tax.no] = tax.name;
                }, this)
            }
            if (this._listDatas.length <= 0) {
                var datas = GeckoJS.Configure.read('vivipos.fec.settings.Destinations');
                if (datas != null) this._listDatas = GeckoJS.BaseObject.unserialize(GeckoJS.String.urlDecode(datas));
                if (this._listDatas.length <= 0) this._listDatas = [];
            }

            var listObj = this.getListObj();
            this._listView.data = this._listDatas;
            listObj.datasource = this._listView;
            listObj.refresh();
            
            this.validateForm();
        },

        addDestination: function(){

            if (!this.confirmChangeDestination()) {
                return;
            }

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {input0:null, require0:true};

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Destination'), features,
                                       _('New Destination'), '', _('Destination'), '', inputObj);
            if (inputObj.ok && inputObj.input0) {
                var destName = inputObj.input0.replace('\'', '"', 'g');

                var dupNames = new GeckoJS.ArrayQuery(this._listDatas).filter('name = \'' + destName + '\'');
                if (dupNames.length > 0) {
                    NotifyUtils.warn(_('Destination [%S] already exists', [destName]));
                    return;
                }

                this._listDatas.push({name: destName, pricelevel: '', prefix: '', taxno: '', taxname: ''});

                this.saveDestinations();

                // loop through this._listDatas to find the newly added destination and select it
                var index = 0;
                for (var index = 0; index < this._listDatas.length; index++) {
                    if (this._listDatas[index].name == destName) {
                        this.select(index);
                        break;
                    }
                }

                OsdUtils.info(_('Destination [%S] added successfully', [destName]));
            }
        },

        modifyDestination: function() {
            var inputObj = GeckoJS.FormHelper.serializeToObject('destinationForm');
            var index = this.getListObj().selectedIndex;
            if (index > -1) {
                if (inputObj.name != null && inputObj.name.length > 0) {
                    this._listDatas[index].taxno = inputObj.taxno;
                    this._listDatas[index].taxname = this._taxNames[inputObj.taxno];
                    this._listDatas[index].pricelevel = inputObj.pricelevel;
                    this._listDatas[index].prefix = GeckoJS.String.trim(inputObj.prefix);

                    this.saveDestinations();

                    var destName = this._listDatas[index].name;

                    this.getListObj().treeBoxObject.ensureRowIsVisible(index);
                    OsdUtils.info(_('Destination [%S] modified successfully', [destName]));

                    return true;
                }
                else {
                    // shouldn't happen, but check anyways
                    NotifyUtils.warn(_('Destination name must not be empty'));

                    return false;
                }
            }
            return true;
        },

        deleteDestination: function(){
            var index = this.getListObj().selectedIndex;
            if (index >= 0) {
                var destName = this._listDatas[index].name;

                if (!GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete destination [%S]', [destName]), _('Are you sure you want to delete destination [%S]?', [destName]))) {
                    return;
                }

                this._listDatas.splice(index, 1);
                this.saveDestinations();

                OsdUtils.info(_('Destination [%S] deleted successfully', [destName]));

                index = this.getListObj().selectedIndex;
                if (index >= this._listDatas.length) index = this._listDatas.length - 1;
                this.select(index);
            }
        },

        saveDestinations: function() {
            var datas = new GeckoJS.ArrayQuery(this._listDatas).orderBy('name asc');
            var datastr = GeckoJS.String.urlEncode(GeckoJS.BaseObject.serialize(datas));

            GeckoJS.Configure.write('vivipos.fec.settings.Destinations', datastr);
            GeckoJS.Session.set('destinations', datas);

            this.setDestinationsByNameSession(datas);

            this._selectedIndex = -1;
            this.load();
        },

        setDefaultDestination: function() {
            var panel = this.getListObj();
            var index = panel.selectedIndex;
            var defaultDest = '';
            if (index >= 0) {
                var dest = this._listDatas[index];
                if (dest) {
                    defaultDest = dest.name;
                }
            }

            GeckoJS.Session.set('defaultDestination', defaultDest);
            GeckoJS.Configure.write('vivipos.fec.settings.DefaultDestination', defaultDest);

            panel.refresh();

            this.validateForm();
        },

        clearDefaultDestination: function() {
            GeckoJS.Session.set('defaultDestination', '');
            GeckoJS.Configure.write('vivipos.fec.settings.DefaultDestination', '');
            
            var panel = this.getListObj();
            
            panel.refresh();

            this.validateForm();
        },

        validateForm: function() {

            var modifyBtn = document.getElementById('modify_destination');
            var deleteBtn = document.getElementById('delete_destination');
            var setdefaultBtn = document.getElementById('set_default');
            var cleardefaultBtn = document.getElementById('clear_default');
            var pricelevelMenu = document.getElementById('destination_pricelevel');
            var taxMenu = document.getElementById('destination_taxno');
            var prefixTextbox = document.getElementById('destination_prefix');

            var panel = this.getListObj();
            var dest = this._listDatas[panel.selectedIndex];
            if (dest) {
                var defaultDest = GeckoJS.Session.get('defaultDestination');

                deleteBtn.setAttribute('disabled', false);
                modifyBtn.setAttribute('disabled', false);
                pricelevelMenu.removeAttribute('disabled');
                taxMenu.removeAttribute('disabled');
                prefixTextbox.removeAttribute('disabled');

                var dflt = (defaultDest == dest.name);

                setdefaultBtn.setAttribute('hidden', dflt);
                cleardefaultBtn.setAttribute('hidden', !dflt);
            } else {
                deleteBtn.setAttribute('disabled', true);
                modifyBtn.setAttribute('disabled', true);
                pricelevelMenu.setAttribute('disabled', true);
                taxMenu.setAttribute('disabled', true);
                prefixTextbox.setAttribute('disabled', true);

                setdefaultBtn.setAttribute('hidden', true);
                cleardefaultBtn.setAttribute('hidden', true);
            }
        },
	
        select: function(index){

            var panel = this.getListObj();

            if (index == this._selectedIndex && index != -1) return;

            if (!this.confirmChangeDestination(index)) {
                panel.selection.select(this._selectedIndex);
                return;
            }

            this._selectedIndex = index;
            panel.selection.select(index);
            panel.treeBoxObject.ensureRowIsVisible(index);
            if (index > -1) {
                var inputObj = this._listDatas[index];
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
            if (defaultDest != null && defaultDest != '') {
                this.setDestination(defaultDest);
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
            var destinationsByName = GeckoJS.Session.get('destinationsByName');

            if (!destinationsByName[destName]) {
                NotifyUtils.warn(_('Destination [%S] has not been defined', [destName]));
                return;
            }
            var dest = destinationsByName[destName];
            
            // get cart controller
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            if (cart == null) {
                NotifyUtils.error(_('Shopping cart is missing; please contact your dealer for technical support'));
                return;
            }

            // get current transaction
            var txn = cart._getTransaction();

            if (txn == null || txn.isSubmit() || txn.isCancel()) {
                // create a new transaction
                txn = cart._newTransaction();
                cart.clear();
            }
            else if (txn.isClosed()) {
                NotifyUtils.warn(_('This order is closed pending payment and may not be modified'));
                return;
            }

            // send beforeSetDestination event
            if (this.dispatchEvent('beforeSetDestination', txn)) {
                
                // set current destination
                GeckoJS.Session.set('vivipos_fec_order_destination', dest.name);

                // set price level if necessary
                if (isNaN(dest.pricelevel)) {
                    this.requestCommand('changeToCurrentLevel', null, 'Pricelevel');
                }
                else {
                    if (dest.pricelevel != '') {
                        var oldPriceLevel = GeckoJS.Session.get('vivipos_fec_price_level');
                        if (oldPriceLevel != dest.pricelevel) {
                            this.requestCommand('change', dest.pricelevel, 'Pricelevel');
                            NotifyUtils.info(_('Price Level changed from [%S] to [%S] for destination [%S]',
                                               [oldPriceLevel, dest.pricelevel, dest.name]));
                        }
                    }
                }

                // set default tax if available
                if (dest.taxno) {
                    GeckoJS.Session.set('defaultTaxNo', dest.taxno);
                }
                else {
                    // else reset to system default tax
                    let defaultTaxId = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');
                    let defaultTax = this.Tax.getTaxById(defaultTaxId);
                    
                    if (defaultTax) GeckoJS.Session.set('defaultTaxNo', defaultTax.no);
                    else GeckoJS.Session.remove('defaultTaxNo');
                }
                
                // set txn destination
                txn.data.destination = dest.name;

                // store destination prefix in transaction
                txn.data.destination_prefix = (dest.prefix == null) ? '' : dest.prefix + ' ';

                // save transaction for failure recovery
                cart.subtotal();

                // send afterSetDestination event to signal success
                this.dispatchEvent('afterSetDestination', {transaction: txn, destination: dest});
            }
        },
	
        confirmChangeDestination: function(index) {
            // check if destination form has been modified
            if (this._selectedIndex != -1 && (index == null || (index != -1 && index != this._selectedIndex))
                && GeckoJS.FormHelper.isFormModified('destinationForm')) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('Discard Changes'),
                                             _('You have made changes to the current destination. Are you sure you want to discard the changes?'))) {
                    return false;
                }
            }
            return true;
        },

        exit: function() {
            // check if destination form has been modified
            if (this._selectedIndex != -1&& GeckoJS.FormHelper.isFormModified('destinationForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to the current destination. Save changes before exiting?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    if (!this.modifyDestination()) return;
                }
            }
            window.close();
        }

    };

    AppController.extend(__controller__);

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'Destinations');
                                      });

    }, false);

})();


(function(){

    GeckoJS.include('chrome://viviecr/content/models/storecontact.js');
    GeckoJS.include('chrome://viviecr/content/models/stock_record.js');

    var __controller__ = {

        name: 'StoreContact',
        
        components: ['Form'],


        // load store contact from database into session cache
        initial: function() {
            var terminal_no = "" ;

            // terminal_no from sync_settings
            var syncSettings = (new SyncSetting()).read() || {};

            var terminal_no = syncSettings.machine_id;
            GeckoJS.Session.set('terminal_no', terminal_no);

            var contact;
            var storeContactModel = new StoreContactModel();
            if (terminal_no == null || terminal_no == '') {
                contact = storeContactModel.findFirst();
            }
            else {
                contact = storeContactModel.findByIndex('first', {
                                    index: 'terminal_no',
                                    value: terminal_no});
            }

            if (contact == null) {
                contact = {
                    name: '',
                    branch: '',
                    branch_id: '',
                    contact: '',
                    telephone1: '',
                    telephone2: '',
                    address1: '',
                    address2: '',
                    city: '',
                    county: '',
                    state: '',
                    zip: '',
                    country: '',
                    fax: '',
                    email: '',
                    note: ''

                };
            }

            contact.terminal_no = terminal_no;
            GeckoJS.Session.set('storeContact', contact);
        },

        isAlphaNumeric: function(str) {
            var nonalphaRE = /[^a-zA-Z0-9]/;
            return !nonalphaRE.test(str);
        },

        update: function () {
            var formObj = GeckoJS.FormHelper.serializeToObject('storecontactForm');
            if (formObj == null) {
                NotifyUtils.error(_('Unable to save store contact!'));
                return false;
            }
            else {

                // check required field: name
                var name = (formObj.name == null) ? '' : GeckoJS.String.trim(formObj.name);

                if (name.length == 0) {
                    GREUtils.Dialog.alert(this.topmostWindow, _('Store Contact'),
                                          _('Store name must not be blank!'));
                    return false;
                }
                formObj.name = name;

                // check required field: branch
                var branch = (formObj.branch == null) ? '' : GeckoJS.String.trim(formObj.branch);

                if (branch.length == 0) {
                    GREUtils.Dialog.alert(this.topmostWindow, _('Store Contact'),
                                          _('Branch name must not be blank!'));
                    return false;
                }
                formObj.branch = branch;

                // check required field: branch_id
                var branch_id = (formObj.branch_id == null) ? '' : GeckoJS.String.trim(formObj.branch_id);

                if (branch_id.length == 0) {
                    GREUtils.Dialog.alert(this.topmostWindow, _('Store Contact'),
                                          _('Branch ID must not be blank!'));
                    return false;
                }

                if (!this.isAlphaNumeric(branch_id)) {
                    GREUtils.Dialog.alert(this.topmostWindow, _('Store Contact'),
                                          _('Branch ID must only contain [a-z], [A-Z], and [0-9]!'));
                    return false;
                }
                formObj.branch_id = branch_id;
                
                // update stock_record.
                var stockRecordModel = new StockRecordModel();
                var sql = "UPDATE stock_records SET warehouse = '" + formObj.branch_id + "';";
                stockRecordModel.execute( sql );
            }
            
            var storeContactModel = new StoreContactModel();
            storeContactModel.id = formObj.id;
            storeContactModel.save(formObj);

            GeckoJS.Session.set('storeContact', formObj);

            return true;
        },
        
        load: function () {

            var terminal_no = GeckoJS.Session.get('terminal_no');
            
            var storeContactModel = new StoreContactModel();
            
            if(terminal_no==null || terminal_no==""){
                var formObj = storeContactModel.find('first' );
            }else{
                var formObj = storeContactModel.findByIndex('first', {
                                    index: 'terminal_no',
                                    value: terminal_no});
            }
	    
            if (formObj != null) {
                GeckoJS.FormHelper.unserializeFromObject('storecontactForm', formObj);
            }
            else {
                GeckoJS.FormHelper.reset('storecontactForm');
            }
        },

        validateForm: function() {
        }

    };

    GeckoJS.Controller.extend(__controller__);

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'StoreContact');
                                      });

    }, false);

})();

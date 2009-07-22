(function(){

    GeckoJS.include('chrome://viviecr/content/models/storecontact.js');
    GeckoJS.include('chrome://viviecr/content/models/stock_record.js');

    var __controller__ = {

        name: 'StoreContact',
        
        components: ['Form'],

        _old_branch_id: null,
        
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
                return;
            }
            else {

                // check required field: name
                var name = (formObj.name == null) ? '' : GeckoJS.String.trim(formObj.name);

                if (name.length == 0) {
                    GREUtils.Dialog.alert(this.topmostWindow, _('Store Contact'),
                                          _('Store name must not be blank!'));
                    return;
                }
                formObj.name = name;

                // check required field: branch
                var branch = (formObj.branch == null) ? '' : GeckoJS.String.trim(formObj.branch);

                if (branch.length == 0) {
                    GREUtils.Dialog.alert(this.topmostWindow, _('Store Contact'),
                                          _('Branch name must not be blank!'));
                    return;
                }
                formObj.branch = branch;

                // check required field: branch_id
                var branch_id = (formObj.branch_id == null) ? '' : GeckoJS.String.trim(formObj.branch_id);

                if (branch_id.length == 0) {
                    GREUtils.Dialog.alert(this.topmostWindow, _('Store Contact'),
                                          _('Branch ID must not be blank!'));
                    return;
                }

                if (!this.isAlphaNumeric(branch_id)) {
                    GREUtils.Dialog.alert(this.topmostWindow, _('Store Contact'),
                                          _('Branch ID must only contain [a-z], [A-Z], and [0-9]!'));
                    return;
                }
                formObj.branch_id = branch_id;
                
                // update stock_record.
                if (this._old_branch_id != branch_id) {
                    var stockRecordModel = new StockRecordModel();
                    var sql = "UPDATE stock_records SET warehouse = '" + formObj.branch_id + "' WHERE warehouse = '" + this._old_branch_id + "';";
                    stockRecordModel.execute( sql );
                    
                    this._old_branch_id = branch_id;
                }
            }
            
            var storeContactModel = new StoreContactModel();
            storeContactModel.id = formObj.id;
            if (storeContactModel.save(formObj)) {
                NotifyUtils.info(_('Store contact information successfully saved'));
                GeckoJS.Session.set('storeContact', formObj);

                GeckoJS.FormHelper.unserializeFromObject('storecontactForm', formObj);
            }
            else {
                NotifyUtils.error(_('Failed to save store contact information (error code %S); please try again.', [storeContactModel.lastError]));
                this.log('ERROR', 'Failed to save store contact information:' + '\nDatabase Error [' +
                                  storeContactModel.lastError + ']: [' + storeContactModel.lastErrorString + ']');
            }
        },
        
        load: function () {

            var terminal_no = GeckoJS.Session.get('terminal_no');
            var formObj;
            
            var storeContactModel = new StoreContactModel();

            if(terminal_no==null || terminal_no==""){
                formObj = storeContactModel.find('first' );
            }else{
                formObj = storeContactModel.findByIndex('first', {
                                    index: 'terminal_no',
                                    value: terminal_no});
            }
	        
	        this._old_branch_id = "";
	        
            if (formObj != null) {
                GeckoJS.FormHelper.unserializeFromObject('storecontactForm', formObj);
                this._old_branch_id = formObj.branch_id;
            }
            else {
                GeckoJS.FormHelper.reset('storecontactForm');
            }
        },

        confirmExit: function(data) {
            // check if job form has been modified
            data.close = true;
            if (GeckoJS.FormHelper.isFormModified('storecontactForm')) {
                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                             _('Discard Changes'),
                                             _('You have made changes to store contact information. Are you sure you want to discard the changes?'))) {
                    data.close = false;
                }
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

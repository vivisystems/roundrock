(function(){

    GeckoJS.include('chrome://viviecr/content/models/storecontact.js');

    /**
     * Contact Info Controller
     */

    GeckoJS.Controller.extend( {
        name: 'StoreContact',
        components: ['Form'],


        // load store contact from database into session cache
        initial: function() {
            var storeContactModel = new StoreContactModel();
            var contact = storeContactModel.findFirst();

            if (contact == null) {
                contact = {
                    name: '',
                    branch: '',
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
                    note: '',
                    terminal_no: ''
                };
            }
            GeckoJS.Session.set('storeContact', contact);
            GeckoJS.Session.set('terminal_no', contact == null ? '' : contact.terminal_no);
        },

        update: function () {
            var formObj = GeckoJS.FormHelper.serializeToObject('storecontactForm');

            if (formObj == null) {
                NotifyUtils.error(_('Unable to save store contact!'));
                return false;
            }
            else {
                var name = (formObj.name == null) ? '' : GeckoJS.String.trim(formObj.name);
                var terminal_no = (formObj.terminal_no == null) ? '' : GeckoJS.String.trim(formObj.terminal_no);

                if (name.length == 0 || terminal_no == 0) {
                    NotifyUtils.warn(_('Store name and terminal ID must not be blank!'));
                    return false;
                }
            }
            formObj.name = name;
            formObj.terminal_no = terminal_no;
            
            var storeContactModel = new StoreContactModel();
            storeContactModel.id = formObj.id;
            storeContactModel.save(formObj);

            GeckoJS.Session.set('storeContact', formObj);
            GeckoJS.Session.set('terminal_no', terminal_no);

            return true;
        },
        
        load: function () {

            var storeContactModel = new StoreContactModel();
            var formObj = storeContactModel.findFirst();

            if (formObj != null) {
                GeckoJS.FormHelper.unserializeFromObject('storecontactForm', formObj);
            }
            else {
                GeckoJS.FormHelper.reset('storecontactForm');
            }
        },

        validateForm: function() {
        }

    });

    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('onInitial', function() {
                                            main.requestCommand('initial', null, 'StoreContact');
                                      });

    }, false);

})();


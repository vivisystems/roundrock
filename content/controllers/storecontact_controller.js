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
        },

        update: function () {
            var formObj = GeckoJS.FormHelper.serializeToObject('storecontactForm');

            alert(this.dump(formObj));
            
            if (formObj == null) {
                NotifyUtils.error(_('Unable to save store contact!'));
                return false;
            }
            else {
                var store = (formObj.store == null) ? '' : GeckoJS.String.trim(formObj.store);
                var terminal_no = (formObj.terminal_no == null) ? '' : GeckoJS.String.trim(formObj.terminal_no);

                if (store.length == 0 || terminal_no == 0) {
                    NotifyUtils.warn(_('Store and/or terminal ID must not be blank!'));
                    return false;
                }
            }
            alert(this.dump(formObj));

            var storeContactModel = new StoreContactModel();
            storeContactModel.save(formObj);
            
            return true;
        },
        
        load: function () {
            var storeContactModel = new StoreContactModel();
            var formObj = storeContactModel.findFirst();

            alert(this.dump(formObj));

            GeckoJS.FormHelper.unserializeFromObject('storecontactForm', formObj);
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


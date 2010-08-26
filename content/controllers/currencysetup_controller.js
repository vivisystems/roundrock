(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'CurrencySetup',

        _currencies: [],

        // initialize and load currency exchange table into Session

        initial: function (evt) {

            var currtmps = [{currency: '', currency_symbol: '', currency_exchange: 1.00}];
            var currtmp = {currency:'', currency_symbol:'', currency_exchange: 0.00};
            for (var i = 1; i < 6; i++)  currtmps.push(currtmp);

            var currencies = GeckoJS.Session.get('Currencies');

            if (currencies == null) {
                var datastr = GeckoJS.Configure.read('vivipos.fec.settings.Currencies') || '';
                if (datastr.length > 0)
                    var currencies = GeckoJS.BaseObject.unserialize(datastr);
                else
                    var currencies = currtmps;
                GeckoJS.Session.set('Currencies', currencies);
            }
        },

        load: function() {

            this.initial();
            
            var currencies = GeckoJS.Session.get('Currencies');
            var obj = {};
            var i;
            for (var i = 0; i < currencies.length; i++) {
                obj['currency_' + i] = currencies[i].currency;
                obj['currency_symbol_' + i] = currencies[i].currency_symbol;
                obj['currency_exchange_' + i] = currencies[i].currency_exchange || 0;
            }
            for (; i < 6; i++) {
                obj['currency_exchange_' + i] = 0;
            }
            this.Form.unserializeFromObject('currencyForm', obj);
            var formObj = this.Form.serializeToObject('currencyForm');
        },

        save: function () {
            var currencies = [];
            var obj = this.Form.serializeToObject('currencyForm', false);
            // this.log(this.dump(obj));

            for (var i = 0; i < 6; i++) {
                if (obj['currency_' + i] == '') {
                    obj['currency_symbol_' + i] = '';
                    obj['currency_exchange_' + i] = 0;
                }

                currencies.push({
                    currency: obj['currency_' + i],
                    currency_symbol: obj['currency_symbol_' + i],
                    currency_exchange: obj['currency_exchange_' + i]
                })
            }

            GeckoJS.Session.set('Currencies', currencies);

            var datastr = GeckoJS.BaseObject.serialize(currencies);

            GeckoJS.Configure.write('vivipos.fec.settings.Currencies', datastr);

            this.Form.unserializeFromObject('currencyForm', obj);
            OsdUtils.info(_('Currency exchange rates saved'));
        },

        exit: function() {
            if (GeckoJS.FormHelper.isFormModified('currencyForm')) {
                var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                        .getService(Components.interfaces.nsIPromptService);
                var check = {data: false};
                var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                            prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_CANCEL +
                            prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_IS_STRING;

                var action = prompts.confirmEx(this.topmostWindow,
                                               _('Exit'),
                                               _('You have made changes to currency exchange rates. Save changes before exiting?'),
                                               flags, _('Save'), '', _('Discard Changes'), null, check);
                if (action == 1) {
                    return;
                }
                else if (action == 0) {
                    this.save();
                }
            }
            window.close();
        }

    };

    AppController.extend(__controller__);

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'CurrencySetup');
                                      });

    }, false);

})();

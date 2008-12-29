(function(){

    /**
     * Class ViviPOS.CartController
     */

    GeckoJS.Controller.extend( {
        name: 'CurrencySetup',
        _currencies: [],

        // initialize and load currency exchange table into Session

        initial: function () {
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

            for (var i = 0; i < currencies.length; i++) {
                obj['currency_' + i] = currencies[i].currency;
                obj['currency_symbol_' + i] = currencies[i].currency_symbol;
                obj['currency_exchange_' + i] = currencies[i].currency_exchange;
            }

            this.Form.unserializeFromObject('currencyForm', obj);
        },

        save: function () {
            var currencies = [];
            var obj = this.Form.serializeToObject('currencyForm', false);
            // this.log(this.dump(obj));

            for (var i = 0; i < 6; i++) {
                currencies.push({
                    currency: obj['currency_' + i],
                    currency_symbol: obj['currency_symbol_' + i],
                    currency_exchange: obj['currency_exchange_' + i]
                })
            }

            // this.log(this.dump(currencies));

            GeckoJS.Session.set('Currencies', currencies);

            var datastr = GeckoJS.BaseObject.serialize(currencies);

            GeckoJS.Configure.write('vivipos.fec.settings.Currencies', datastr);
        }

    });

})();

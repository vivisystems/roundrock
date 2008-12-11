(function(){

    /**
     * Class ViviPOS.CartController
     */

    GeckoJS.Controller.extend( {
        name: 'CurrencySetup',
        _currencies: [],
        
        load: function() {

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
            
            currencies = [
            {
                currency: obj.currency_0,
                currency_symbol: obj.currency_symbol_0,
                currency_exchange: obj.currency_exchange_0
            },

            {
                currency: obj.currency_1,
                currency_symbol: obj.currency_symbol_1,
                currency_exchange: obj.currency_exchange_1
            },

            {
                currency: obj.currency_2,
                currency_symbol: obj.currency_symbol_2,
                currency_exchange: obj.currency_exchange_2
            },

            {
                currency: obj.currency_3,
                currency_symbol: obj.currency_symbol_3,
                currency_exchange: obj.currency_exchange_3
            },

            {
                currency: obj.currency_4,
                currency_symbol: obj.currency_symbol_4,
                currency_exchange: obj.currency_exchange_4
            },

            {
                currency: obj.currency_5,
                currency_symbol: obj.currency_symbol_5,
                currency_exchange: obj.currency_exchange_5
            },
            ];
                
            // this.log(this.dump(currencies));

            GeckoJS.Session.set('Currencies', currencies);

            var datastr = GeckoJS.BaseObject.serialize(currencies);

            GeckoJS.Configure.write('vivipos.fec.settings.Currencies', datastr);
        }

    });

})();

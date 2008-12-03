(function(){

    /**
     * Class ViviPOS.CartController
     */

    GeckoJS.Controller.extend( {
        name: 'CurrencySetup',
        _currencies: [],

        initial: function() {

            this.load();
        },
        
        load: function() {

            var currtmp = {currency:'', currency_sign:'', currency_change:0.00};
            var currtmps = [];
            for (var i = 0; i < 5; i++)  currtmps.push(currtmp);

            var currencies = GeckoJS.Session.get('Currencies');
            
            if (currencies == null) {
                var datastr = GeckoJS.Configure.read('vivipos.fec.settings.Currencies') || '';
                if (datastr.length > 0)
                    var currencies = GeckoJS.BaseObject.unserialize(datastr);
                else
                    var currencies = currtmps;
                GeckoJS.Session.set('Currencies', currencies);
            }
// this.log(this.dump(currencies));
            var obj = {};
            for (var i = 0; i < currencies.length; i++) {
                obj['currency_' + i] = currencies[i].currency;
                obj['currency_sing_' + i] = currencies[i].currency_sign;
                obj['currency_change_' + i] = currencies[i].currency_change;
            }
/*
            obj.currency_1 = currencies[1].currency;
            obj.currency_sing_1 = currencies[1].currency_sign;
            obj.currency_change_1 = currencies[1].currency_change;

            obj.currency_2 = currencies[2].currency;
            obj.currency_sing_2 = currencies[2].currency_sign;
            obj.currency_change_2 = currencies[2].currency_change;

            obj.currency_3 = currencies[3].currency;
            obj.currency_sing_3 = currencies[3].currency_sign;
            obj.currency_change_3 = currencies[3].currency_change;

            obj.currency_4 = currencies[4].currency;
            obj.currency_sing_4 = currencies[4].currency_sign;
            obj.currency_change_4 = currencies[4].currency_change;

            obj.currency_5 = currencies[5].currency;
            obj.currency_sing_5 = currencies[5].currency_sign;
            obj.currency_change_5 = currencies[5].currency_change;
*/
            this.Form.unserializeFromObject('currencyForm', obj);
        },

        save: function () {
            var currencies = [];
            var obj = this.Form.serializeToObject('currencyForm', false);
            // this.log(this.dump(obj));
            
            // var currency = obj.currency
            currencies = [
            {
                currency: obj.currency_0,
                currency_sign: obj.currency_sign_0,
                currency_change: obj.currency_change_0
            },

            {
                currency: obj.currency_1,
                currency_sign: obj.currency_sign_1,
                currency_change: obj.currency_change_1
            },

            {
                currency: obj.currency_2,
                currency_sign: obj.currency_sign_2,
                currency_change: obj.currency_change_2
            },

            {
                currency: obj.currency_3,
                currency_sign: obj.currency_sign_3,
                currency_change: obj.currency_change_3
            },

            {
                currency: obj.currency_4,
                currency_sign: obj.currency_sign_4,
                currency_change: obj.currency_change_4
            },

            {
                currency: obj.currency_5,
                currency_sign: obj.currency_sign_5,
                currency_change: obj.currency_change_5
            },
            ];
                
            // this.log(this.dump(currencies));

            GeckoJS.Session.set('Currencies', currencies);

            var datastr = GeckoJS.BaseObject.serialize(currencies);

            GeckoJS.Configure.write('vivipos.fec.settings.Currencies', datastr);
        // GeckoJS.FormHelper.unserializeFromObject('productForm', valObj);
        // return GeckoJS.FormHelper.serializeToObject('productForm', false);
        }

    });

})();

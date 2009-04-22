(function(){

    /**
     * Class ViviPOS.CartController
     */

    var __controller__ = {
        name: 'Pricelevel',

        limit: 9,
        _manualChange: false,

        initial: function() {
            
            this.schedule();
        },

        schedule: function(changeToCurrent) {

            var activeSchedule = GeckoJS.Configure.read("vivipos.fec.settings.ActivePriceLevelSchedule") || false;
            var revertSchedule = GeckoJS.Configure.read("vivipos.fec.settings.PriceLevelRevert") || false;

            if (activeSchedule) {

                // @todo cron job
                var schedule = GeckoJS.Session.get('pricelevelSchedule');


                if (!schedule || revertSchedule || changeToCurrent) {
                    this.requestCommand('readPrefSchedule', null, 'PriceLevelSchedule');
                    schedule = GeckoJS.Session.get('pricelevelSchedule');
                }

                if (schedule != null) {
                    var timenow = new Date();
                    var hours = timenow.getHours();
                    var minutes = timenow.getMinutes();
                    var timestr =  (hours > 9 ? hours : "0" + hours)+ ":" + (minutes > 9 ? minutes : "0" + minutes);

                    var idx = -1;
                    for (i = 0; i < schedule.length; i++) {
                        if (timestr >= schedule[i].time) {
                            idx = i;
                        } else break;
                    }

                    //if (idx >= 0 && !this._manualChange) {
                    if (idx >= 0) {
                        var oldpriceLevel = GeckoJS.Session.get('vivipos_fec_price_level');
                        var newpriceLevel = schedule[idx].pricelevel;
                        if (newpriceLevel == 0) newpriceLevel = GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel') || 1;
                        if (!changeToCurrent && oldpriceLevel && oldpriceLevel != newpriceLevel)
                            NotifyUtils.info(_('Price Level changed from [%S] to [%S]', [oldpriceLevel, newpriceLevel]));
                        this._changeLevel(newpriceLevel);
                        schedule.splice(0, idx + 1);
                    }
                }
                this._manualChange = false;

            }
            else if (changeToCurrent) {
                // no schedule, but changeToCurrent is requested, so we change to system/user default
                var priceLevel = GeckoJS.Session.get('default_price_level') || GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel') || 1;

                GeckoJS.Session.set('vivipos_fec_price_level', priceLevel);
            }

            var priceLevel = GeckoJS.Session.get('vivipos_fec_price_level');
            
            if (priceLevel == null) {
                priceLevel = GeckoJS.Configure.read('default_price_level') || GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel') || 1;
                GeckoJS.Session.set('vivipos_fec_price_level', priceLevel);
            }

        },

        changeToCurrentLevel: function() {
            
            this.schedule(true);
        },

        _changeLevel: function(level) {

            var currentLevel = GeckoJS.Session.get('vivipos_fec_price_level');

            if ( (typeof level != 'undefined') && (level >=1 && level <= this.limit)) {
                GeckoJS.Session.set('vivipos_fec_price_level', level);
            }else {
                currentLevel = (++currentLevel <= this.limit) ? (currentLevel) : 1;
                GeckoJS.Session.set('vivipos_fec_price_level', currentLevel);
            }
            GeckoJS.Session.set('cart_last_sell_item', null);
        },

        change: function(level) {
            this._manualChange = true;
            this._changeLevel(level);
        }

    };

    GeckoJS.Controller.extend(__controller__);

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'Pricelevel');
                                      });

    }, false);

})();

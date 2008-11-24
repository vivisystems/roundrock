(function(){

    /**
     * Class ViviPOS.CartController
     */

    GeckoJS.Controller.extend( {
        name: 'Pricelevel',

        limit: 9,

        initial: function() {
            
            this.schedule();
        },

        schedule: function() {

            var priceLevel = GeckoJS.Session.get('vivipos_fec_price_level');
            
            if (priceLevel == null) {
                priceLevel = GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel');
                GeckoJS.Session.set('vivipos_fec_price_level', priceLevel);
            }

        },

        change: function(level) {

            var currentLevel = GeckoJS.Session.get('vivipos_fec_price_level');

            if ( (typeof level != 'undefined') && (level >=1 && level <= this.limit)) {
                GeckoJS.Session.set('vivipos_fec_price_level', level);
            }else {
                currentLevel = (currentLevel++ <= this.level) ? (currentLevel) : 1;
                GeckoJS.Session.set('vivipos_fec_price_level', currentLevel);
            }
        }

    });

})();

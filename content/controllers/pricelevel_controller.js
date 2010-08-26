(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'Pricelevel',

        limit: 9,
        _manualChange: false,
        _scheduleDay: null,
        _priceLevelSession: "vivipos_fec_price_level",
        _priceLevelSessionBackup: null,

        initial: function() {
            // listen to the broadcast propagated by Training Mode Controller.
            var self = this;
            this.observer = GeckoJS.Observer.newInstance( {
                topics: [ "TrainingMode" ],

                observe: function( aSubject, aTopic, aData ) {
                    if ( aData == "start" ) {
                    	self.startTraining( true );
                    } else if ( aData == "exit" ) {
                    	self.startTraining( false );
                    }
                }
            } ).register();

            // load price level preference
            this.requestCommand('readPrefSchedule', null, 'PriceLevelSchedule');

            this._scheduleDay = (new Date()).getDay();
            this.schedule();
        },
        
        startTraining: function( isTraining ) {
        	if ( isTraining ) {
        		this._priceLevelSessionBackup = GeckoJS.Session.get( this._priceLevelSession );
        	} else {
        		GeckoJS.Session.set( this._priceLevelSession, this._priceLevelSessionBackup );
        	}
        },

        schedule: function(changeToCurrent) {

            var activeSchedule = GeckoJS.Configure.read("vivipos.fec.settings.ActivePriceLevelSchedule") || false;
            var revertSchedule = GeckoJS.Configure.read("vivipos.fec.settings.PriceLevelRevert") || false;

            if (activeSchedule) {

                // @todo cron job
                var scheduleData = GeckoJS.Session.get('pricelevelSchedule');
                var schedule = scheduleData ? scheduleData.schedule : null;
                var scheduleDay = scheduleData ? scheduleData.day : null;
                var today = (new Date()).getDay();
                if (!schedule || revertSchedule || changeToCurrent || scheduleDay != today) {
                    this.requestCommand('readPrefSchedule', null, 'PriceLevelSchedule');
                    scheduleData = GeckoJS.Session.get('pricelevelSchedule');
                    schedule = scheduleData ? scheduleData.schedule : null;
                    scheduleDay = scheduleData ? scheduleData.day : null;
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
                        var oldpriceLevel = GeckoJS.Session.get(this._priceLevelSession);
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

                GeckoJS.Session.set(this._priceLevelSession, priceLevel);
            }

            var priceLevel = GeckoJS.Session.get(this._priceLevelSession);
            
            if (priceLevel == null) {
                priceLevel = GeckoJS.Configure.read('default_price_level') || GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel') || 1;
                GeckoJS.Session.set(this._priceLevelSession, priceLevel);
            }
        },

        changeToCurrentLevel: function() {
            
            this.schedule(true);
        },

        _changeLevel: function(level) {

            var currentLevel = GeckoJS.Session.get(this._priceLevelSession);

            if ( (typeof level != 'undefined') && (level >=1 && level <= this.limit)) {
                GeckoJS.Session.set(this._priceLevelSession, level);
            }else {
                currentLevel = (++currentLevel <= this.limit) ? (currentLevel) : 1;
                GeckoJS.Session.set(this._priceLevelSession, currentLevel);
            }
            GeckoJS.Session.set('cart_last_sell_item', null);
        },

        change: function(level) {
            this._manualChange = true;
            this._changeLevel(level);
        },
        
        destroy: function() {
        	this.observer.unregister();
    	}
    };

    AppController.extend(__controller__);

    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'Pricelevel');
                                      });

    }, false);
    
    window.addEventListener('unload', function() {
        var controller = GeckoJS.Controller.getInstanceByName('PriceLevel');
        if (controller) controller.destroy();
    }, false);
})();

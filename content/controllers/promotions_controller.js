(function(){

    // include promotion trigger / type class
    include('chrome://viviecr/content/promotions/promotion_trigger.js');
    include('chrome://viviecr/content/promotions/promotion_type.js');

    // in-memory data models
    include('chrome://viviecr/content/models/promotion_active.js');
    include('chrome://viviecr/content/models/promotion_cart_item.js');

    /**
     * Controller Promotions
     * 
     */
    var __promotions_controller__ = {

        name: 'Promotions',

        uses: ['Promotion'],

        _activedPromotions: [],
        _currentPromotions: [],

        _triggerPrefs: {},
        _typePrefs: {},

        _activedTriggers: {},
        _activedTypes: {},

        // cart 's transaction object
        _cartItemModel: null,

        _transaction: null,

        /*
         * initial promotions rules for register
         */
        initial: function() {

            // initial schema for in-memory data models
            this.createSchema();
            
            // load promotions trigger / type class
            var triggerPrefs = GeckoJS.Configure.read('vivipos.fec.registry.promotion.trigger') || false;
            if (triggerPrefs){
                // load class
                for (var trigger_key in triggerPrefs) {
                    try {
                        var triggerObj = GREUtils.extend({
                            key: trigger_key,
                            name: _('trigger.'+trigger_key+'.name'),
                            label: _('trigger.'+trigger_key+'.label'),
                            desc: _('trigger.'+trigger_key+'.desc')
                        }, triggerPrefs[trigger_key]);

                        var trigger_class_uri = triggerObj['class_uri'];

                        // dynamic include class define
                        include(trigger_class_uri);

                        // success add to _triggerPrefs
                        this._triggerPrefs[trigger_key] = triggerObj;
                       
                    }catch(e){
                    // this.log('include trigger ' + e);
                    }
                }
            }

            var TypePrefs = GeckoJS.Configure.read('vivipos.fec.registry.promotion.type') || false;
            if(TypePrefs) {
                // load class
                for (var type_key in TypePrefs) {
                    try {
                        var typeObj = GREUtils.extend({
                            key: type_key,
                            name: _('type.'+type_key+'.name'),
                            label: _('type.'+type_key+'.label'),
                            desc: _('type.'+type_key+'.desc')
                        }, TypePrefs[type_key]);

                        var type_class_uri = typeObj['class_uri'];

                        // dynamic include class define
                        include(type_class_uri);

                        // success add to _triggerPrefs
                        this._typePrefs[type_key] = typeObj;

                    }catch(e){
                    // this.log('include type ' + e);
                    }
                }
            }

            var activedPromotions = this.Promotion.getActivedPromotions();

            this._activedPromotions = activedPromotions;
            this._currentPromotions = this._activedPromotions.concat([]); // clone array

            this.initialInstances(); // initial Triggers / types

            // register events and observe
            var self = this;
            if(Transaction) {
                Transaction.events.addListener('onCalcPromotions', function(evt) {
                    self.prepareTransactionData(evt);
                    self.process();
                });
            }

            // manager update promotions rules observer update
            this.observer = GeckoJS.Observer.newInstance({
                topics: ['promotions'],

                observe: function(aSubject, aTopic, aData) {
                    if (aData == 'rules-updated') {
                        self.updatePromotions();
                    }else if (aData == 'process') {
                        self.resetTransactionData();
                        self.process();
                    }
                }
            }).register();

        },

        destroy: function() {

            this.observer.unregister();
            
        },


        updatePromotions: function() {

            this.log('updatePromotions ');
            var activedPromotions = this.Promotion.getActivedPromotions();

            this._activedPromotions = activedPromotions;
            this._currentPromotions = this._activedPromotions.concat([]); // clone array

            this._activedTriggers = {};
            this._activedTypes = {};

            this.initialInstances(); // initial Triggers / types

        },


        initialInstances: function() {

            //this.log('_activedPromotions \n' + this.dump(this._activedPromotions));
            //this.log(' triggerPrefs \n' + this.dump(this._triggerPrefs));

            var self = this;
            this._activedPromotions.forEach(function(promotion) {
                try {
                    
                    var Id = promotion.id;
                    var trigger_classname = self._triggerPrefs[promotion.trigger]['classname'] || GeckoJS.Inflector.camelize(promotion.trigger);
                    var trigger_class = PromotionTrigger.getPromotionTriggerClass(trigger_classname);
                    var trigger_data = (promotion.trigger_data == null) ? null : GeckoJS.BaseObject.unserialize(promotion.trigger_data) ;

                    var type_classname = self._typePrefs[promotion.type]['classname'] || GeckoJS.Inflector.camelize(promotion.type);
                    var type_class = PromotionType.getPromotionTypeClass(type_classname);
                    var type_data = (promotion.type_data == null) ? null : GeckoJS.BaseObject.unserialize(promotion.type_data) ;

                    if (trigger_class) {
                        try {
                            var triggerObj = new trigger_class(self, trigger_data);
                            if(triggerObj) {

                                // set prefs define to object
                                triggerObj.setPrefs(self._triggerPrefs[promotion.trigger]);

                                self._activedTriggers[Id] = triggerObj;
                            }
                        }catch(e) {
                        // self.log('instance trigger ' + e);

                        }
                    }

                    if (type_class) {
                        try {
                            var typeObj = new type_class(self, type_data);
                            if(typeObj) {

                                // set prefs define to object
                                typeObj.setPrefs(self._typePrefs[promotion.type]);

                                self._activedTypes[Id] = typeObj;
                            }
                        }catch(e) {
                        // self.log('instance type ' + e);
                        }
                    }

                }catch(e) {
                // self.log('try instance ' + e);
                }

            });

        // this.log(this.dump(this._activedTriggers));
        },


        createSchema: function() {

            var schema = GREUtils.File.getURLContents('chrome://viviecr/content/promotions/schema.sql');

            var datasource = GeckoJS.ConnectionManager.getDataSource('memory');

            try {

                datasource.connect();
                if(schema && datasource.conn) datasource.conn.executeSimpleSQL(schema);
                
            }catch(e) {
            }

        },


        resetCurrentPromotions: function() {

            // maybe disable some rules at once transaction , reset to all actived rules
            this._currentPromotions = this._activedPromotions.concat([]); // clone array
            
        },


        prepareTransactionData: function(evt) {
            
            //this.log('prepareTransactionData ' + evt.data.name);
            this._transaction = evt.data;
            //this.log(this.dump(this._transaction.data));

            var cartItemModel = this._cartItemModel = this._cartItemModel ? this._cartItemModel : new PromotionCartItemModel();
            
            cartItemModel.saveTransactionItems(this._transaction.data);

            cartItemModel.saveTransactionOrder(this._transaction.data);

            // log cartItemModel
            var items = cartItemModel.find('all');
        //this.log(this.dump(items));

        },

        resetTransactionData: function() {

        // var cartItemModel = this._cartItemModel = this._cartItemModel ? this._cartItemModel : new PromotionCartItemModel();

        // cartItemModel.saveTransactionItems(this._transaction.data);

        },


        process: function() {
            
            // transaction onCalcPromotions
            // @todo always clear and recalc promotions items?

            //this.log('Promotions process rules count = '  + this._currentPromotions.length);
            // for each rules

            // trigger with time control for now
            var currentPromotions = this.processTimeControl();

            currentPromotions = this.processMember(currentPromotions);

            //this.log('Promotions process rules 2 count = '  + currentPromotions.length);

            var totalPromotionDiscount = 0 ;
            var maxRecursiveCount = 100;
            
            currentPromotions.forEach(function(promotion){

                var promotionId = promotion.id;

                var triggerObj = this._activedTriggers[promotionId];
                var typeObj = this._activedTypes[promotionId];

                if (!triggerObj) return false;
                if (!typeObj) return false;

                try {

                    // trigger setup with transaction begining
                    triggerObj.setup(this._transaction);

                    // trigger startup
                    triggerObj.startup();

                    // type setup with trigger
                    typeObj.setup(triggerObj);

                    // type startup
                    typeObj.startup();

                    var recursiveCount = 0;

                    // try recursive process trigger
                    do {

                        recursiveCount++;
                        
                        // this.log('try invoke trigger execute') ;
                        var trigger_result = triggerObj.execute();
                        // this.log('trigger execute result = ' + trigger_result) ;

                        if (trigger_result) {

                            // execute type
                            // this.log('try type trigger execute') ;
                            var type_result = typeObj.execute();
                            // this.log('type execute result = ' + type_result +',,,' + typeObj.getDiscountSubtobal() ) ;

                            if (type_result) {
                                
                                totalPromotionDiscount += typeObj.getDiscountSubtobal();

                                // reserve items ?
                                if(promotion.reserve_item) {
                                    // this.log('try type trigger reserveMatchedItems') ;
                                    triggerObj.reserveMatchedItems();
                                }

                            // save promotion rule to in-memory table

                            }

                        }

                    } while (triggerObj.isRepeatable() && recursiveCount < maxRecursiveCount) ;


                }catch(e) {
                  this.log('WARN', 'promotion process ' + promotion.name + ', ' + e.messages);
                }

                return true;

            }, this);

            // update
            this.updateTransaction(totalPromotionDiscount);         
            
        },


        processTimeControl: function() {

            // this._currentPromotions
            var onTimedPromtions = [];
            var now = new Date();
            
            this._currentPromotions.forEach(function(promotion) {

                var startDate = new Date(promotion.start_date*1000);
                var endDate = new Date(promotion.end_date*1000);

                if (!now.between( startDate, endDate)) {
                    this.log('now = ' + now.getTime() + ', start_date = ' + startDate.getTime() + ', endDate = ' + endDate.getTime());
                    this.log('expire or not yet in date');
                    return false;
                }

                var startTime = new Date(promotion.start_time*1000);
                var endTime = new Date(promotion.end_time*1000);
                var nowHourMinute = parseInt(now.toString("HHmm"));
                var startHourMinute = parseInt(startTime.toString("HHmm"));
                var endHourMinute = parseInt(endTime.toString("HHmm"));

                if (nowHourMinute < startHourMinute || nowHourMinute > endHourMinute) {
                    this.log('now = ' + nowHourMinute + ', start_time = ' + startHourMinute + ', end_time = ' + endHourMinute);
                    this.log('not in promotion hours');
                    return false;
                }

                //var daysOfWeek = promotion.days_of_week.split(',');
                //use string.indexOf for quickly search
                var nowOfWeek = now.getDay();

                if (promotion.days_of_week.length != 0 && promotion.days_of_week.indexOf(nowOfWeek) == -1 ) {
                    this.log('now = ' + nowOfWeek + ', days_of_week = ' + promotion.days_of_week);
                    this.log('not in promotion week day');
                    return false;
                }

                onTimedPromtions.push(promotion);
                return false;
                
            }, this);

            return onTimedPromtions;
        },


        processMember: function(onTimedPromtions) {

            var memberPromtions = [];
            var transactionData = this._transaction ? this._transaction.data : {};
            var member = transactionData.member || '';

            onTimedPromtions.forEach(function(promotion) {
                var success = true;
                switch(promotion.member) {
                    case "member":
                        if (member.length <= 0) success = false;
                        break;
                    case "nonmember":
                        if (member.length > 0) success = false;
                        break;
                    case "everyone":
                        success = true;
                        break;
                }
                if (success) memberPromtions.push(promotion);
            }, this);

            return memberPromtions;
           
        },

        updateTransaction: function(totalPromotionDiscount) {
            this._transaction['data']['promotion_subtotal'] = totalPromotionDiscount;
        }


    };

    GeckoJS.Controller.extend(__promotions_controller__);

    // mainWindow register promotions rules
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {
        window.addEventListener('load', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.addEventListener('onInitial', function() {
                    main.requestCommand('initial', null, 'Promotions');
                });
            }

        }, false);
        
        window.addEventListener('unload', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.requestCommand('destroy', null, 'Promotions');
            }

        }, false);

    }
    
})();

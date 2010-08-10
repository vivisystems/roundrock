(function(){

    // include promotion trigger / type class
    include('chrome://viviecr/content/promotions/promotion_trigger.js');
    include('chrome://viviecr/content/promotions/promotion_type.js');

    // in-memory data models
    include('chrome://viviecr/content/models/promotion_apply.js');
    include('chrome://viviecr/content/models/promotion_cart_item.js');
    include('chrome://viviecr/content/models/promotion_cart_addition.js');

    var __promotions_controller__ = {

        name: 'Promotions',

        uses: ['Promotion'],

        components: ['Tax'],

        _activedPromotions: [],
        _currentPromotions: [],
        _triggerPrefs: {},
        _typePrefs: {},
        _activedTriggers: {},
        _activedTypes: {},
        _cartItemModel: null, // cart 's transaction object
        _cartAdditionModel: null, // cart 's transaction object
        _applyModel: null,
        _transaction: null,

        /*
         * initial promotions rules for register
         */
        initial: function() {

//            dump('promotions initial \n');

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
                         this.log('ERROR', 'include trigger error.', e);
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
                        this.log('ERROR', 'include type error.', e);
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
                // on Transaction object created
                Transaction.events.addListener('onCreate', function(evt) {
                    if (!evt || !evt.data) return;

                    self.prepareTransactionData(evt);
                    self.resetCurrentPromotions();
                });

                Transaction.events.addListener('onUnserialize', function(evt) {
                    if (!evt || !evt.data) return;
                    
                    self.appendTransactionDatas(evt.data);
                });
                
                // on Transaction calcPromtions
                Transaction.events.addListener('onCalcPromotions', function(evt) {
                    if (!evt || !evt.data) return;
                    
                    self.process();
                });

                // on Transaction add/modify item
                Transaction.events.addListener('onCalcItemSubtotal', function(evt) {
                    if (!evt || !evt.data) return;
                    
                    self.appendTransactionData(evt.data);
                });

                // on Transaction void item
                Transaction.events.addListener('afterVoidItem', function(evt) {
                    if (!evt || !evt.data) return;
                    
                    self.removeTransactionData(evt.data);
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

            if (this.observer) this.observer.unregister();
            
        },

        getCartItemModel: function() {
            
            if (!this._cartItemModel) {
                this._cartItemModel = new PromotionCartItemModel();
                this._cartItemModel.getDataSource().connect();
            }
            return this._cartItemModel;

        },

        getCartAdditionModel: function() {

            if (!this._cartAdditionModel) {
                this._cartAdditionModel = new PromotionCartAdditionModel();
                this._cartAdditionModel.getDataSource().connect();
            }
            return this._cartAdditionModel;

        },

        getApplyModel: function() {

            if (!this._applyModel) {
                this._applyModel = new PromotionApplyModel();
                this._applyModel.getDataSource().connect();
            }
            return this._applyModel;

        },


        updatePromotions: function() {

            // this.log('updatePromotions ');
            var activedPromotions = this.Promotion.getActivedPromotions();
            this._activedPromotions = activedPromotions;
            this._currentPromotions = this._activedPromotions.concat([]); // clone array
            this._activedTriggers = {};
            this._activedTypes = {};

            this.initialInstances(); // initial Triggers / types

        },


        initialInstances: function() {

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
                            self.log('ERROR', 'instance trigger exception error.', e);
                        }
                    }

                    if (type_class) {
                        try {
                            var typeObj = new type_class(self, type_data);
                            if(typeObj) {
                                // set prefs define to object
                                typeObj.setPrefs(self._typePrefs[promotion.type]);
                                typeObj.setTaxNo(promotion.tax_no);
                                self._activedTypes[Id] = typeObj;
                            }
                        }catch(e) {}
                    }

                }catch(e) {
                    self.log('ERROR', 'try instance error.', e);
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
            }catch(e) {}

        },


        resetCurrentPromotions: function() {

            // maybe disable some rules at once transaction , reset to all actived rules
            this._currentPromotions = this._activedPromotions.concat([]); // clone array
            
        },


        removeTransactionData: function(item) {

            if(this._currentPromotions.length == 0) return;
            
            var cartItemModel = this.getCartItemModel();
            cartItemModel.removeItem(item);

        },

        appendTransactionDatas: function(transaction) {
           
            if(this._currentPromotions.length == 0) return;

            try {
                for (var index in transaction.data.items) {
                    if(transaction.data.items[index]) {
                        if ( (!transaction.data.items[index]['parent_index']) ||
                             (typeof transaction.data.items[index]['parent_index'] == 'string' && transaction.data.items[index]['parent_index'] == 'null' )
                           ) {
                            this.appendTransactionData(transaction.data.items[index]);
                        }
                    }
                }
            }catch(e) {
                this.log('ERROR', 'appendTransactionDatas error.', e);
            }
        },

        appendTransactionData: function(item) {

            if(this._currentPromotions.length == 0) return;

            var cartItemModel = this.getCartItemModel();
            cartItemModel.appendItem(item);

        },


        prepareTransactionData: function(evt) {

            if(this._currentPromotions.length == 0) return;

            this._transaction = evt.data;
            var cartItemModel = this.getCartItemModel();
            var cartAdditionModel = this.getCartAdditionModel();
            cartItemModel.truncate();
            cartAdditionModel.truncate();

        },


        resetTransactionData: function() {

            // reset in-memory data and recalculate promotions

        },


        process: function() {

            if (this._currentPromotions.length == 0) return;
            if (!this._transaction) return;

            //var profileStart = (new Date()).getTime();
            // triggers with time control for now
            var currentPromotions = this.processTimeControl();
            // triggers with member 
            currentPromotions = this.processMember(currentPromotions);

            // initial promotion discount and recursive 100
            var totalPromotionDiscount = 0 ;
            var taxSubtotal = 0 ;
            var taxIncludedSubtotal = 0 ;
            var maxRecursiveCount = 100;
            var promotionMatchedItems = [] ;

            // truncate apply rules
            var applyModel = this.getApplyModel();
            applyModel.truncate();
            
            currentPromotions.forEach(function(promotion){
                
                var triggerObj = this._activedTriggers[promotion.id];
                var typeObj = this._activedTypes[promotion.id];

                if (!triggerObj || !typeObj) return false;

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

                        var trigger_result = triggerObj.execute();
                        if (trigger_result) {

                            var type_result = typeObj.execute();
                            if (type_result) {
                                
                                // reserve items
                                if(promotion.reserve_item) {
                                    // this.log('try type trigger reserveMatchedItems') ;
                                    triggerObj.reserveMatchedItems();
                                }

                                // save promotion rule to in-memory table
                                //this.log('appendItem ' + typeObj.getDiscountSubtotal());
                                applyModel.appendItem(promotion, triggerObj, typeObj);
                                promotionMatchedItems.push(triggerObj.getMatchedItems());
                                
                                // update promotiondiscount
                                totalPromotionDiscount += typeObj.getDiscountSubtotal();
                                taxSubtotal += typeObj.getDiscountTaxSubtotal();
                                taxIncludedSubtotal += typeObj.getDiscountTaxIncludedSubtotal();

                            }

                        }
                        recursiveCount++;
                    } while (triggerObj.isRepeatable() && recursiveCount < maxRecursiveCount) ;

                }catch(e) {
                  this.log('WARN', 'promotion process ' + promotion.name + ' error.', e);
                }
                return true;

            }, this);

            //var profileEnd = (new Date()).getTime();
            //this.log('process End ' + (profileEnd - profileStart));
            //applyModel.getDiscountSubotal();
            // update
            this.updateTransaction(totalPromotionDiscount, taxSubtotal, taxIncludedSubtotal, promotionMatchedItems);

        },


        processTimeControl: function() {

            // this._currentPromotions
            var onTimedPromtions = [];
            var now = new Date();
            
            this._currentPromotions.forEach(function(promotion) {

                var startDate = new Date(promotion.start_date*1000);
                var endDate = new Date(promotion.end_date*1000);

                if (!now.between( startDate, endDate)) {
                    //this.log('now = ' + now.getTime() + ', start_date = ' + startDate.getTime() + ', endDate = ' + endDate.getTime());
                    //this.log('expire or not yet in date');
                    return false;
                }

                var startTime = new Date(promotion.start_time*1000);
                var endTime = new Date(promotion.end_time*1000);
                var nowHourMinute = parseInt(now.toString("HHmm"));
                var startHourMinute = parseInt(startTime.toString("HHmm"));
                var endHourMinute = parseInt(endTime.toString("HHmm"));

                if (nowHourMinute < startHourMinute || nowHourMinute > endHourMinute) {
                    //this.log('now = ' + nowHourMinute + ', start_time = ' + startHourMinute + ', end_time = ' + endHourMinute);
                    //this.log('not in promotion hours');
                    return false;
                }

                //var daysOfWeek = promotion.days_of_week.split(',');
                //use string.indexOf for quickly search
                var nowOfWeek = now.getDay();

                if (promotion.days_of_week.length != 0 && promotion.days_of_week.indexOf(nowOfWeek) == -1 ) {
                    //this.log('now = ' + nowOfWeek + ', days_of_week = ' + promotion.days_of_week);
                    //this.log('not in promotion week day');
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

        updateTransaction: function(totalPromotionDiscount, taxSubtotal, taxIncludedSubtotal, promotionMatchedItems) {
            
            var applyModel = this.getApplyModel();

            var applyItems = applyModel.getApplyItems();

            this._transaction['data']['promotion_subtotal'] = totalPromotionDiscount;
            this._transaction['data']['promotion_apply_items'] = applyItems;
            this._transaction['data']['promotion_matched_items'] = promotionMatchedItems;
            this._transaction['data']['promotion_tax_subtotal'] = taxSubtotal;
            this._transaction['data']['promotion_included_tax_subtotal'] = taxIncludedSubtotal;

            //this.log('updateTransaction' +  this.dump(applyItems) + this.dump(promotionMatchedItems));
        }

    };

    GeckoJS.Controller.extend(__promotions_controller__);

    // mainWindow register promotions rules
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {
        window.addEventListener('load', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.addEventListener('beforeInitial'/*'onInitial'*/, function() {
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

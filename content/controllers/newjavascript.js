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
                        this.log(trigger_key);
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
                    }
                }
            }

            var TypePrefs = GeckoJS.Configure.read('vivipos.fec.registry.promotion.type') || false;
            if(TypePrefs) {
                // load class
                for (var type_key in TypePrefs) {
                    try {
                        let typeObj = GREUtils.extend({
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

                    }catch(e){}
                }
            }

            var activedPromotions = this.Promotion.getActivedPromotions();

            this._activedPromotions = activedPromotions;
            this._currentPromotions = this._activedPromotions.concat([]); // clone array

            this.initialInstances(); // initial Triggers / types

            // register events and observe

            if(Transaction) {
                var self = this;
                Transaction.events.addListener('onCalcPromotions', function(evt) {
                    self.prepareTransactionData(evt);
                    self.process();
                });
            }

        },

        initialInstances: function() {

            this.log('_activedPromotions \n' + this.dump(this._activedPromotions));
            this.log(' triggerPrefs \n' + this.dump(this._triggerPrefs));

            this._activedPromotions.forEach(function(promotion) {
                try {

                    var Id = promotion.id;
                    var trigger_classname = GeckoJS.Inflector.camelize(promotion.trigger);
                    var trigger_class = PromotionTrigger.getPromotionTriggerClass(trigger_classname);
                    var trigger_data = (promotion.trigger_data == null) ? null : GeckoJS.BaseObject.unserialize(promotion.trigger_data) ;

                    var type_classname = GeckoJS.Inflector.camelize(promotion.type);
                    var type_class = PromotionType.getPromotionTypeClass(type_classname);
                    var type_data = (promotion.type_data == null) ? null : GeckoJS.BaseObject.unserialize(promotion.type_data) ;

                    if (trigger_class) {
                        var triggerObj = new trigger_class(this, trigger_data);
                        if(triggerObj) {
                            // call starup method for class contructor
                            triggerObj.startup();
                            this._activedTriggers[Id] = triggerObj;
                        }
                    }

                    if (type_class) {
                        var typeObj = new type_class(this, type_data);
                        if(typeObj) {
                            // call starup method for class contructor
                            typeObj.startup();
                            this._activedTypes[Id] = typeObj;
                        }
                    }

                }catch(e) {
                }

            }, this);

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

            // this.log('prepareTransactionData ' + evt.data.name);
            this._transaction = evt.data;
            //this.log(this.dump(this._transaction.data));


            var cartItemModel = this._cartItemModel = this._cartItemModel ? this._cartItemModel : new PromotionCartItemModel();

            cartItemModel.saveTransactionItems(this._transaction.data);

            cartItemModel.saveTransactionOrder(this._transaction.data);

        },

        process: function() {

            // transaction onCalcPromotions
            // @todo always clear and recalc promotions items?

            // this.log('Promotions process rules count = '  + this._currentPromotions.length);
            // for each rules

            // trigger with time control for now
            var currentPromotions = this.processTimeControl();

            currentPromotions.forEach(function(promotion){

                var promotionId = promotion.id;
                var triggerObj = this._activedTriggers[promotionId];

                if (!triggerObj) return false;

                try {
                    triggerObj.setup(this._transaction);
                    var result = triggerObj.execute();

                    if (result) {

                        var typeObj = this._activedTypes[promotionId];
                        if (!typeObj) return false;

                        typeObj.setup(triggerObj);
                        typeObj.execute();

                        // reserve items ?
                        if(true) {
                            triggerObj.reserveTriggerItems();
                        }

                    }

                }catch(e) {
                // this.log('WARN', 'process ' + e.messages);
                }

                return true;

            }, this);

        },


        processTimeControl: function() {

            return this._currentPromotions.concat([]);

        }

    };


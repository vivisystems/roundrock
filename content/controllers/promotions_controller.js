(function(){

    // include promotion trigger / type class
    include('chrome://viviecr/content/promotions/promotion_trigger.js');
    include('chrome://viviecr/content/promotions/promotion_type.js');

    // in-memory data models
    include('chrome://viviecr/content/models/promotion_item.js');
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
           var promotionsTriggers = GeckoJS.Configure.read('vivipos.fec.registry.promotion.trigger') || false;
           if (promotionsTriggers){
               // load class
               for (var trigger_name in promotionsTriggers) {
                   try {
                       var trigger_class_uri = promotionsTriggers[trigger_name]['class_uri'];
                       include(trigger_class_uri);
                   }catch(e){}
               }
           }

           var promotionsTypes = GeckoJS.Configure.read('vivipos.fec.registry.promotion.type') || false;
           if (promotionsTypes){
               // load class
               for (var type_name in promotionsTypes) {
                   try {
                       var type_class_uri = promotionsTypes[type_name]['class_uri'];
                       include(type_class_uri);
                   }catch(e){}
               }
           }

           var activedPromotions = this.Promotion.getActivedPromotions();

           this._activedPromotions = activedPromotions;
           this._currentPromotions = this._activedPromotions.concat([]); // clone array

           this.initialInstances(); // initial Triggers

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
            
        },


        /**
         * Admin Initial for Manager 
         */
        admin_initial: function() {
            
        }


    };

    GeckoJS.Controller.extend(__promotions_controller__);

    // mainWindow register promotions rules
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {
        window.addEventListener('load', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) main.addEventListener('onInitial', function() {
                                            main.requestCommand('initial', null, 'Promotions');
                                      });

        }, false);

    }

    var settingsWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("promotionsSettings");

    if (settingsWindow === window) {
        window.addEventListener('load', function() {
            $('admin_initial', null, 'Promotions');
        }, false);
    }

    
})();

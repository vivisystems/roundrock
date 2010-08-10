(function() {

/**
 * PromotionTrigger Abstract Class
 *
 * @name PromotionTrigger
 */
var __klass__ = {

    name: 'PromotionTrigger',

    /**
     * init
     *
     * PromotionTrigger Constructor
     *
     * @param {GeckoJS.Controller} controller controller of PromotionController
     * @param {Object} settings Promotion Trigger Setting for current rule.
     */
    init: function(controller, settings) {
        // PromotionTrigger setup
        this._controller = controller || null;
        this._settings = settings || null;
        this._prefs = {};
        this._cartItemModel = null;
        this._transaction = null;

    },

    /**
     * PromotionController Setter
     *
     * @param {GeckoJS.Controller} controller controller of PromotionController
     */
    setController: function(controller) {
        this._controller = controller || null;
    },

    /**
     * PromotionController getter
     *
     * @return {GeckoJS.Controller} controller controller of PromotionController
     */
    getController: function() {
        return this._controller;
    },

    /**
     * Promotion Trigger Setting Setter
     *
     * @param {Object} settings Promotion Trigger Setting for current rule.
     */
    setSettings: function(settings) {
        this._settings = settings || null;
    },

    /**
     * Promotion Trigger Setting getter
     *
     * @return {Object} settings Promotion Trigger Setting for current rule.
     */
    getSettings: function() {
        return this._settings;
    },

    /**
     * Promotion Trigger From Preference Registry setter
     *
     * @param {Object} prefs Promotion Trigger From Preference Registry 
     */
    setPrefs: function(prefs) {
        this._prefs = prefs || {};
    },

    /**
     * Promotion Trigger From Preference Registry getter
     *
     * @return {Object} prefs Promotion Trigger From Preference Registry
     */
    getPrefs: function() {
        return this._prefs;
    },

    /**
     * Get Current Cart's Transaction Object
     *
     * @return {Object} Current Cart's Transaction Object
     */
    getTransaction: function() {
        return this._transaction;
    },

    /**
     * Get CartItemModel, This database is created in memory.
     *
     * @return {GeckoJS.Model} in-memory CartItemModel
     */
    getCartItemModel: function() {

        // in-memory cart item model
        this._cartItemModel = this._cartItemModel ? this._cartItemModel : new PromotionCartItemModel();

        return this._cartItemModel;

    },

    /**
     * Set repeatable for this trigger.
     *
     * @param {Boolean} repeatable set true for repeatable
     */
    setRepeatable: function(repeatable) {
        this._repeatable = repeatable || false;
    },

    /**
     * Determine repeatable for this trigger
     *
     * @return {Boolean} true for repeatable
     */
    isRepeatable: function() {
        return (this._repeatable || false);
    },

    setup: function(transaction) {
        this._transaction = transaction || null;

        this._matchedItems = [];

        this._matchedAmount = 0;

        this._matchedItemsQty = 0;

        this._matchedItemsSubtotal = 0;

        this._repeatable = false;
        
    },

    startup: function() {

    },


    /*
     * Trigger Action
     */
    execute: function() {
        // abstract
        return false;
    },


    reserveMatchedItems: function(matchedItems) {
        
        matchedItems = matchedItems || this.getMatchedItems();
        
        this.getCartItemModel().reserveItems(matchedItems);
        
    },

    processMatchedItemsByItemsQty: function(items, qty) {

        if(!items || qty == 0) return items;

        // set MatchedItemsQty
        this.setMatchedItemsQty(qty);

        var remain = qty;

        var matchedItems = [];
        var matchedItemsSubtotal = 0;

        var self = this;

        items.forEach(function(item){

            // enough
            if (remain <= 0) {
                return;
            }

            var itemSubtotal = item.current_subtotal;
            var itemQty = item.current_qty;
            // var itemPrice = item.current_price;

            // enough
            if (itemSubtotal <= 0 || itemQty <= 0) {
                return ;
            }

            var matchedItem = GREUtils.extend({}, item);

            if (itemQty > remain) {

                var tmpPrice = itemSubtotal / itemQty ;
                var tmpQty = remain;
                var tmpSubtotal = tmpPrice * tmpQty;

                matchedItem.current_qty = tmpQty ;
                matchedItem.current_subtotal = tmpSubtotal ;

                remain -= tmpQty;
                matchedItemsSubtotal += tmpSubtotal;
            }else {

                remain -= itemQty;
                matchedItemsSubtotal += itemSubtotal;
            }

            matchedItems.push(matchedItem);
        });

        if (remain <= 0) {
            // set MatchedItemsSubtotal
            this.setMatchedItemsSubtotal(matchedItemsSubtotal);

            // set MatchedItems
            this.setMatchedItems(matchedItems);

        }else {
            matchedItems = [];
        }
        return matchedItems;

    },

    processMatchedItemsByItemsSubtotal: function(items, subtotal) {

        if(!items || subtotal == 0) return items;

        // set MatchedItemsSubtotal
        this.setMatchedItemsSubtotal(subtotal);

//        this.log(this.dump(items) + ',,,' + subtotal);
        var remain = subtotal;

        var matchedItems = [];
        var matchedItemsQty = 0;

        items.forEach(function(item){

            // enough
            if (remain <= 0) return;
            
            var itemSubtotal = item.current_subtotal;
            var itemQty = item.current_qty;
            // var itemPrice = item.current_price;

            // enough
            if (itemSubtotal <= 0 || itemQty <= 0) return ;
            
            var matchedItem = GREUtils.extend({}, item);

            if (itemSubtotal > remain) {

                var tmpPrice = itemSubtotal / itemQty ;
                var tmpQty = Math.ceil(remain / tmpPrice);
                var tmpSubtotal = tmpPrice * tmpQty;

                matchedItem.current_qty = tmpQty ;
                matchedItem.current_subtotal = tmpSubtotal ;

                remain -= tmpSubtotal;
                matchedItemsQty += tmpQty;
            }else {

                remain -= itemSubtotal;
                matchedItemsQty += itemQty;
            }
           
            matchedItems.push(matchedItem);
        });

//        this.log(this.dump(matchedItems) + ',,,' + subtotal);

        if (remain <= 0) {
            // set MatchedItemsQty
            this.setMatchedItemsQty(matchedItemsQty);

            // set MatchedItems
            this.setMatchedItems(matchedItems);
        }else {
            matchedItems = [];
        }

        return matchedItems;
    },


    setMatchedItems: function(items) {
        this._matchedItems = items;
    },

    getMatchedItems: function() {
        return this._matchedItems;
    },

    setMatchedAmount: function(amount) {
        this._matchedAmount = amount ;
    },


    getMatchedAmount: function() {
        return this._matchedAmount;
    },

    setMatchedItemsQty: function(items_qty) {
        //this.log('setMatchedItemsQty ' + items_qty);
        this._matchedItemsQty = items_qty ;
    },


    getMatchedItemsQty: function() {
        return this._matchedItemsQty;
    },

    setMatchedItemsSubtotal: function(items_subtotal) {
        // this.log('setMatchedItemsSubtotal ' + items_subtotal);
        this._matchedItemsSubtotal = items_subtotal ;
    },


    getMatchedItemsSubtotal: function() {
        return this._matchedItemsSubtotal;
    }


};

var PromotionTrigger = window.PromotionTrigger = GeckoJS.BaseObject.extend('PromotionTrigger', __klass__);

// unnamed PromotionTrigger counter
PromotionTrigger.unnamedCounter = 1;


/**
 * addObject to ClassRegistry, when PromotionTrigger has been extended.
 * @private
 */
PromotionTrigger.extended = function(klass) {

    if (klass.prototype.name == 'PromotionTrigger') {
        klass.prototype.name = 'Unnamed' + PromotionTrigger.unnamedCounter++;
    }

    var name = klass.prototype.name;
    klass.className = name;

    PromotionTrigger.setPromotionTriggerClass(name, klass);

};

/**
 * Registers the PromotionTrigger sub-class in the Class Registry.
 *
 * @public
 * @static
 * @function
 * @param {String} name               This is the name to register the sub-class with
 * @param {PromotionTrigger} klass   This is the PromotionTrigger sub-class to register
 */
PromotionTrigger.setPromotionTriggerClass = function(name, klass) {

    if (GeckoJS.ClassRegistry.isKeySet("PromotionTriggerClass_" + name)) return ;

    GeckoJS.ClassRegistry.addObject("PromotionTriggerClass_" + name, klass);

};

/**
 * Retrieves the PromotionTrigger sub-class object by name from the Class Registry.
 *
 * @public
 * @static
 * @function
 * @param {String} name                 This is the name of the PromotionTrigger sub-class to retrieve
 * @return {PromotionTrigger}          The PromotionTrigger sub-class identified by name
 */
PromotionTrigger.getPromotionTriggerClass = function(name) {

    return GeckoJS.ClassRegistry.getObject("PromotionTriggerClass_" + name);

};

})();

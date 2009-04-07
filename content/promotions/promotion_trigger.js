(function() {

/**
 * PromotionTrigger Abstract Class
 *
 */
var __klass__ = {

    name: 'PromotionTrigger',

    /**
     * init
     *
     * PromotionTrigger Constructor
     */
    init: function(controller, settings) {
        // PromotionTrigger setup
        this.controller = controller || null;
        this.settings = settings || null;

    },

    startup: function() {
        // after constructor called
    },

    setup: function(transaction) {
        this.transaction = transaction || null;

        this.triggerItems = [];

        this.triggerAmount = 0;
        
    },


    /*
     * Trigger Action
     */
    execute: function() {
        // abstract
        return false;
    },

    reserveTriggerItems: function() {
        
        
    },

    getTriggerItems: function() {
        return this.triggerItems;
    },


    getTriggerAmount: function() {
        return this.triggerAmount;
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

(function() {

/**
 * PromotionType Abstract Class
 *
 */
var __klass__ = {
    
    name: 'PromotionType',

    /**
     * init
     *
     * PromotionType Constructor
     */
    init: function(controller, settings) {
        // PromotionType setup
        this.controller = controller || null;
        this.settings = settings || null;

    },


    startup: function() {
        // after constructor called
    },

    setup: function(trigger) {
        this.trigger = trigger || null;
    },

    /*
     * Type Action
     */
    execute: function() {
        // abstract 
    }


};

var PromotionType = window.PromotionType = GeckoJS.BaseObject.extend('PromotionType', __klass__);

// unnamed PromotionType counter
PromotionType.unnamedCounter = 1;

/**
 * addObject to ClassRegistry, when PromotionType has been extended.
 * @private
 */
PromotionType.extended = function(klass) {

    if (klass.prototype.name == 'PromotionType') {
        klass.prototype.name = 'Unnamed' + PromotionType.unnamedCounter++;
    }

    var name = klass.prototype.name;
    klass.className = name;

    PromotionType.setPromotionTypeClass(name, klass);

};

/**
 * Registers the PromotionType sub-class in the Class Registry.
 *
 * @public
 * @static
 * @function
 * @param {String} name               This is the name to register the sub-class with
 * @param {PromotionType} klass   This is the PromotionType sub-class to register
 */
PromotionType.setPromotionTypeClass = function(name, klass) {

    if (GeckoJS.ClassRegistry.isKeySet("PromotionTypeClass_" + name)) return ;

    GeckoJS.ClassRegistry.addObject("PromotionTypeClass_" + name, klass);

};

/**
 * Retrieves the PromotionType sub-class object by name from the Class Registry.
 *
 * @public
 * @static
 * @function
 * @param {String} name                 This is the name of the PromotionType sub-class to retrieve
 * @return {PromotionType}          The PromotionType sub-class identified by name
 */
PromotionType.getPromotionTypeClass = function(name) {

    return GeckoJS.ClassRegistry.getObject("PromotionTypeClass_" + name);

};

})();

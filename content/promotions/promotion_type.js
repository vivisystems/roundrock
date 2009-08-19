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
        this._controller = controller || null;
        this._settings = settings || null;
        this._prefs = {};
        this._trigger = null;
        this._cartItemModel = null;
        this._discountSubtobal = 0;
        this._taxNo = '';
        this._taxSubtotal = false;
        this._taxIncluedSubtotal = false;

    },

    setController: function(controller) {
        this._controller = controller || null;
    },

    getController: function() {
        return this._controller;
    },

    setSettings: function(settings) {
        this._settings = settings || null;
    },

    getSettings: function() {
        return this._settings;
    },

    setPrefs: function(prefs) {
        this._prefs = prefs || {};
    },

    getPrefs: function() {
        return this._prefs;
    },

    setTaxNo: function(taxNo) {
        this._taxNo = taxNo || '';
    },

    getTaxNo: function() {
        return this._taxNo;
    },

    getTaxComponent: function() {
        return ( this.getController().Tax || new TaxComponent() );
    },

    startup: function() {

    },

    setup: function(trigger) {       
        this._trigger = trigger || null;
        this._discountSubtobal = 0;
        this._taxSubtotal = false;
        this._taxIncluedSubtotal = false;
    },

    getTrigger: function() {
        return this._trigger;
    },

    getTransaction: function() {
        return (this.getTrigger() ? this.getTrigger().getTransaction() : null);
    },

    getCartItemModel: function() {

        // in-memory cart item model

        // use trigger 's model
        this._cartItemModel = this._cartItemModel ? this._cartItemModel : (this.getTrigger() ? this.getTrigger().getCartItemModel() : new PromotionCartItemModel());
        return this._cartItemModel;

        /*
        this._cartItemModel = this._cartItemModel ? this._cartItemModel : ;

        return this._cartItemModel;
        */

    },

    /**
     * Type must implement this method
     */
    setDiscountSubtobal: function(discountSubtobal) {
        discountSubtobal = discountSubtobal || 0 ;
        this._discountSubtobal = discountSubtobal;
    },

    getDiscountSubtobal: function() {
        return this._discountSubtobal;
    },

    getDiscountTaxSubtotal: function() {

        var taxNo = this.getTaxNo();
        var taxComponent = this.getTaxComponent();

        if (!taxNo || !taxComponent) return 0;

        if (this._taxSubtotal === false) {

            var taxChargeObj = taxComponent.calcTaxAmount(taxNo, Math.abs(this.getDiscountSubtobal()), Math.abs(this.getDiscountSubtobal()), 1);

            this._taxSubtotal =  taxChargeObj[taxNo].charge;
            this._taxIncluedSubtotal =  taxChargeObj[taxNo].included;

        }

        return this._taxSubtotal;
    },

    getDiscountTaxIncludedSubtotal: function() {

        var taxNo = this.getTaxNo();
        var taxComponent = this.getTaxComponent();

        if (!taxNo || !taxComponent) return 0;

        if (this._taxSubtotal === false) {

            var taxChargeObj = taxComponent.calcTaxAmount(taxNo, Math.abs(this.getDiscountSubtobal()), Math.abs(this.getDiscountSubtobal()), 1);
            
            this._taxSubtotal =  taxChargeObj[taxNo].charge;
            this._taxIncluedSubtotal =  taxChargeObj[taxNo].included;

        }

        return this._taxIncluedSubtotal;
    },


    /*
     * Type Action
     */
    execute: function() {
        // abstract
        return false;
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

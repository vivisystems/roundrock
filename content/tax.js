/**
 * Defines GeckoJS.TaxComponent namespace
 *
 */
GREUtils.define('GeckoJS.TaxComponent', GeckoJS.global);


/**
 * Creates a new GeckoJS.TaxComponent instance.
 * 
 * @class GeckoJS.TaxComponent implements 
 * <br/>
 * <pre>
 * </pre>
 *
 * @name GeckoJS.TaxComponent
 * @extends GeckoJS.Component
 *
 */
GeckoJS.TaxComponent = GeckoJS.Component.extend({
    name: 'Tax',

    taxModel: GeckoJS.Model.extend({
        name: 'Tax',
        indexes: ['name', 'no', 'type'],
        hasMany: ['CombineTax']
    }),
    
    combineTaxModel: GeckoJS.Model.extend({
        name: 'CombineTax',
        indexes: ['combine_tax_id', 'tax_id'],
        belongsTo: ['Tax']
    }),
    
    _calcTaxCache: {}

});



/**
 * Adds an Tax<br/>
 * <br/>
 *
 * @public
 * @function  
 * @param {String} name
 * @param {String} no
 * @param {String} type               "ADDON" , "TABLE", "COMBINE" , "VAT"
 * @param {Number|Object} rate               percentage for example 05.00 of Object of TABLE
 * @param {String} rate_type               percentage (%) or value ($)
 * @param {Number} threshold
 * @param {String} updateId           tax's id for update , empty for add
 * @return {Boolean|String}           The new Tax uuid, or "false" if the user fails to be added
 */
GeckoJS.TaxComponent.prototype.addTax = function(name, no, type, rate, rate_type, threshold, updateId) {
    
    name = name || null;
    no = no || "";
    type = type || "ADDON";
    rate = rate || 0;
    rate_type = rate_type || '%';
    threshold = threshold || 0;
    updateId =  updateId || false ;

    threshold = parseFloat(threshold);

    // no roleName parameter return false
    if (name == null) return false;

    if(isNaN(threshold) || threshold == Infinity) return false;

    if (type == "ADDON") {
        rate = parseFloat(rate);
        if(isNaN(rate) || rate == Infinity) return false;
    }

    var taxModel = new this.taxModel;

    if (updateId) {
        taxModel.id = updateId;

    }else {
        // check duplicate
        var count = taxModel.find("count", {
            conditions: "name='"+name+"'"
        });
        if (count >0) return false;
        
        taxModel.create();
    }
    
    taxModel.save({
        name: name,
        no: no,
        type: type,
        rate: rate,
        rate_type: rate_type,
        threshold: threshold
    });
      
    var id = taxModel.id;
    
    delete taxModel;
    
    return id;


};


/**
 * update an Tax<br/>
 * <br/>
 *
 * @public
 * @function
 * @param {String} name
 * @param {Object} data tax data
 * @return {Object} tax Object
 */
GeckoJS.TaxComponent.prototype.setTax = function(name, data) {

    name = name || null;
    data = data || null;

    if (name == null || data == null ) return false;

    var tax = this.getTax(name);

    if (tax == null) return false;

    var taxId = tax.id;

    var newTax = GREUtils.extend({}, tax, data);

    return this.addTax(name, newTax.no, newTax.type, newTax.rate, newTax.rate_type, newTax.threshold, taxId);

};



/**
 * Removes an Tax . If "cascade" is "true", its group membership is also
 * removed.<br/>
 * <br/>
 * Returns "true" if the Tax user has been successfully removed; "false"
 * otherwise.    
 *
 * @public
 * @function  
 * @param {String} name               This is the tax name
 * @param {Boolean} cascade           This flag indicates if the removal should cascade to combine tax
 * @return {Boolean}                  Whether the tax has been successfully removed
 */
GeckoJS.TaxComponent.prototype.removeTax = function(name, cascade) {
    
    name = name || null;
    cascade = cascade || false;
        
    // no roleName parameter return false
    if (name == null) return false;
         
    var taxModel = new this.taxModel;

    var tax = taxModel.find("first", {
        conditions: "name='"+name+"'"
    });
    if (tax == null) return false;

    var taxId = tax.id;
    
    taxModel.id = taxId;
    taxModel.del(taxId);
    
    if (cascade) {
        var combineTaxModel = new this.combineTaxModel;
        var childTaxes = combineTaxModel.find('all', {
            conditions: "tax_id='"+taxId+"'"
            });
        if(childTaxes.length > 0) {
            // remove childTaxes;
            childTaxes.forEach(function(ct) {
                combineTaxModel.del(ct.id);
            });
        }
    }
    
    delete taxModel;
    delete combineTaxModel;
    
    return true;

};


/**
 * Get an Tax<br/>
 * <br/>
 *
 * @public
 * @function
 * @param {String} name
 * @return {Object} tax Object
 */
GeckoJS.TaxComponent.prototype.getTax = function(name) {

    var taxModel = new this.taxModel;

    var tax = taxModel.find("first", {
        conditions: "name='"+name+"'"
    });

    if (tax == null) tax =  {};

    // reformat object for CombineTax
    if (tax.CombineTax) {

        var combineTaxes = GeckoJS.Array.objectExtract(tax.CombineTax, "{n}.combine_tax_id");
        var newCombineTaxes = [];

        combineTaxes.forEach(function(ctid) {
            var cTax = taxModel.findById(ctid);
            delete cTax['CombineTax'];
            if (cTax) newCombineTaxes.push(cTax);
        });

        tax['CombineTax'] = newCombineTaxes;
    }

    delete taxModel;

    return tax;

};


/**
 * Get an Tax by no<br/>
 * <br/>
 *
 * @public
 * @function
 * @param {String} no
 * @return {Object} tax Object
 */
GeckoJS.TaxComponent.prototype.getTaxByNo = function(no) {

    var taxModel = new this.taxModel;

    var tax = taxModel.find("first", {
        conditions: "no='"+no+"'"
    });

    if (tax == null) tax =  {};

    // reformat object for CombineTax
    if (tax.CombineTax) {

        var combineTaxes = GeckoJS.Array.objectExtract(tax.CombineTax, "{n}.combine_tax_id");
        var newCombineTaxes = [];
        
        combineTaxes.forEach(function(ctid) {
            var cTax = taxModel.findById(ctid);
            delete cTax['CombineTax'];
            if (cTax) newCombineTaxes.push(cTax);
        });

        tax['CombineTax'] = newCombineTaxes;
    }
    
    delete taxModel;

    return tax;

};


/**
 * Get an Tax List <br/>
 * <br/>
 *
 * @public
 * @function
 * @param {String} type         type or "" for all tax list
 * @return {Array} tax array
 */
GeckoJS.TaxComponent.prototype.getTaxList = function(type) {

    var taxModel = new this.taxModel;

    var params = {};

    if (GeckoJS.Array.inArray(type, ["ADDON", "TABLE", "COMBINE", "VAT"]) != -1) {
        params['conditions'] = "type='"+type+"'";
    }
    
    var taxes = taxModel.find("all", params);

    delete taxModel;

    return taxes || [];

};



/**
 * Add Combine Taxes , for performance , use uuid for taxes.
 * 
 * @public
 * @function  
 * @param {String} taxId
 * @param {Array} combineTaxes
 * @return {Boolean}
 */
GeckoJS.TaxComponent.prototype.addCombineTax = function(taxId, combineTaxes) {
    
    taxId = taxId || null;
    combineTaxes = combineTaxes || [];
        
    // no roleName parameter return false
    if (taxId == null || combineTaxes.length == 0 ) return false;
         
    this.removeCombineTax(taxId);

    var combineTaxModel = new this.combineTaxModel;

    combineTaxes.forEach(function(ctid){
        combineTaxModel.create();
        combineTaxModel.save({tax_id: taxId, combine_tax_id: ctid});
    });

    delete combineTaxModel;

    return true;

};


/**
 * remove Combine Taxes , for performance , use uuid for taxId.
 *
 * @public
 * @function
 * @param {String} taxId
 * @return {Boolean}
 */
GeckoJS.TaxComponent.prototype.removeCombineTax = function(taxId) {

    taxId = taxId || null;

    // no roleName parameter return false
    if (taxId == null) return false;

    var combineTaxModel = new this.combineTaxModel;
    var childTaxes = combineTaxModel.find('all', {
        conditions: "tax_id='"+taxId+"'"
        });

    if (childTaxes == null) return false;

    if(childTaxes.length > 0) {
        // remove childTaxes;
        childTaxes.forEach(function(ct) {
            combineTaxModel.del(ct.id);
        });
    }

    delete combineTaxModel;

    return true;

};


/**
 * calculate tax for parameter amount
 *
 *  return detail of calculate result
 *
 *  {taxname: {charge: tax charged, tax: taxObject}, combine: {taxname: {charge: tax charged, tax:taxObject}, taxname2: .....}}
 *  
 * @public
 * @function
 * @param {String} name
 * @param {Number} amount
 * @return {Object} 
 */
GeckoJS.TaxComponent.prototype.calcTaxAmount = function(name, amount) {

    var taxObject = null;
    amount = amount || 0;
    amount = parseFloat(amount);

    var taxAmount = {}; taxAmount[name] = {charge: 0, tax: taxObject};

    if (this._calcTaxCache[name]) {
        taxObject = this._calcTaxCache[name];
    }else {
        taxObject = this.getTax(name);
        if(taxObject) this._calcTaxCache[name] = taxObject;
    }

    if (taxObject == null || (isNaN(amount) || amount == Infinity) ) return taxAmount;

    taxAmount[name]['tax'] = taxObject;

    switch(taxObject['type']) {
        default:
        case "ADDON":
            if (amount > taxObject['threshold']) {
                var charge = 0;
                if (taxObject['rate_type'] == '$') {
                    charge = taxObject['rate'];
                }else {
                    charge = amount * (taxObject['rate'] / 100) ;
                }
                if (charge > 0) taxAmount[name]['charge'] = charge;
            }
            break;

        case "COMBINE":
            var totalCharge = 0;
            taxAmount['combine'] = {};
            if (amount > taxObject['threshold'] && taxObject.CombineTax != null) {

                // foreach combine taxes
                // this.log('Tax List:' + this.dump(taxObject.CombineTax));
                taxObject.CombineTax.forEach(function(cTaxObj){
                    if (amount > cTaxObj['threshold']) {

                        var charge = 0;
                        if (cTaxObj['rate_type'] == '$') {
                            charge = cTaxObj['rate'];
                        }else {
                            charge = amount * (cTaxObj['rate'] / 100) ;
                        }
                        
                        if (charge > 0) {
                            totalCharge += charge;
                            taxAmount['combine'][cTaxObj.name] = {charge: charge, tax: cTaxObj};
                        }
                    }
                });

                taxAmount[name]['charge'] = totalCharge;
            }
            break;

        case "VAT":
            var totalCharge = 0;
            taxAmount['combine'] = {};
            if (amount > taxObject['threshold'] && taxObject.CombineTax != null) {

                // foreach combine taxes
                taxObject.CombineTax.forEach(function(cTaxObj){
                    if (amount > cTaxObj['threshold']) {

                        var charge = 0;
                        if (cTaxObj['rate_type'] == '$') {
                            charge = cTaxObj['rate'];
                        }else {
                            charge = (amount + totalCharge) * (cTaxObj['rate'] / 100) ;
                        }

                        if (charge > 0) {
                            totalCharge += charge;
                            taxAmount['combine'][cTaxObj.name] = {charge: charge, tax: cTaxObj};
                        }
                    }
                });

                taxAmount[name]['charge'] = totalCharge;
            }
            break;
    }
    return taxAmount;
};


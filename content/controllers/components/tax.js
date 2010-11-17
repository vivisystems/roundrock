(function() {
    
    var __component__ = {

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

    };

    var TaxComponent = window.TaxComponent = GeckoJS.Component.extend(__component__);

/**
 * TaxComponent constructor
 */

    TaxComponent.prototype.init = function(controller) {
        this._controller = controller || null;

        // cache Taxs by no list
        if (GeckoJS.Session.get('taxesByNo') == null) {
            this.processCache();
        }
    /*
        var self = this;
        this.taxModel.addEventListener('onSave', function(evt) {
            var tax = evt.data;
            if(tax) self.processCache(tax);
        });
        */
    };


    TaxComponent.prototype.processCache = function(tax) {
        tax = tax || false;

        if(tax) {
            byNo[tax.no]= tax;
        }else {
            
            var taxes = this.getTaxList();
            var byNo = {}, byId = {};
            taxes.forEach(function(tax2){
                byNo[tax2.no]= tax2;
                byId[tax2.id]= tax2;
            });

            taxes.forEach(function(tax3){

                if(tax3.type != 'ADDON' && tax3.CombineTax != null) {

                   for (var i = 0; i <tax3.CombineTax.length; i++) {
                       var cbTaxed = tax3.CombineTax[i];
                       tax3.CombineTax[i] = GREUtils.extend({}, tax3.CombineTax[i], GREUtils.extend({}, byId[cbTaxed.combine_tax_id]));
                   }

                }
            });

        }

        // store in session
        GeckoJS.Session.set('taxes', GeckoJS.BaseObject.getValues(byNo));
        GeckoJS.Session.set('taxesById', byId);
        GeckoJS.Session.set('taxesByNo', byNo);
        
        

        //this.log(this.dump(GeckoJS.Session.get('taxesByNo')));
        //this.log(this.dump(GeckoJS.Session.get('taxes')));
    
    };

    /**
 * Adds an Tax<br/>
 * <br/>
 *
 * @public
 * @function  
 * @param {String} no
 * @param {String} name
 * @param {String} type               "ADDON" , "INCLUDED", "COMBINE" , "VAT"
 * @param {Number|Object} rate               percentage for example 05.00 of Object of INCLUDED
 * @param {String} rate_type               percentage (%) or value ($)
 * @param {Number} threshold
 * @param {String} updateId           tax's id for update , empty for add
 * @return {Boolean|String}           The new Tax uuid, or "false" if the user fails to be added
 */
    TaxComponent.prototype.addTax = function(no, name, type, rate, rate_type, threshold, updateId) {

        no = no || "";
        name = name || null;
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
                conditions: "no='"+no+"'"
            });
            if (count >0) return false;
        
            taxModel.create();
        }
    
        taxModel.save({
            no: no,
            name: name,
            type: type,
            rate: rate,
            rate_type: rate_type,
            threshold: threshold
        });
      
        var id = taxModel.id;
    
        delete taxModel;

        if(id) this.processCache();
        
        return id;
    };


    /**
 * update an Tax<br/>
 * <br/>
 *
 * @public
 * @function
 * @param {String} no
 * @param {Object} data tax data
 * @return {Object} tax Object
 */
    TaxComponent.prototype.setTax = function(no, data) {

        no = no || null;
        data = data || null;

        if (no == null || data == null ) return false;

        var tax = this.getTax(no);

        if (tax == null) return this.addTax(no, data.name, data.type, data.rate, data.rate_type, data.threshold, null);

        var taxId = tax.id;

        var newTax = GREUtils.extend({}, tax, data);

        return this.addTax(no, newTax.name, newTax.type, newTax.rate, newTax.rate_type, newTax.threshold, taxId);

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
 * @param {String} no               This is the tax no
 * @param {Boolean} cascade           This flag indicates if the removal should cascade to combine tax
 * @return {Boolean}                  Whether the tax has been successfully removed
 */
    TaxComponent.prototype.removeTax = function(no, cascade) {
    
        no = no || null;
        cascade = cascade || false;
        
        // no roleName parameter return false
        if (no == null) return false;
         
        var taxModel = new this.taxModel;


        var tax = this.getTax(no);
        if (tax == null) return false;

        var taxId = tax.id;
    
        taxModel.id = taxId;
        taxModel.del(taxId);
    
        if (cascade) {
            var combineTaxModel = new this.combineTaxModel;
            var childTaxes = combineTaxModel.find('all', {
                conditions: "tax_id='"+taxId+"'",
                recursive: 2
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

        if(taxId) this.processCache();
        
        return true;

    };


    /**
 * Get an Tax<br/>
 * <br/>
 *
 * @public
 * @function
 * @param {String} no
 * @return {Object} tax Object
 */
    TaxComponent.prototype.getTax = function(no) {

        // use cache first
        var taxesByNo = GeckoJS.Session.get('taxesByNo');
        if(taxesByNo != null) {
            if(taxesByNo[no]) {
                var taxResult = null;
                try {
                    // deep clone using uneval/eval object  GECKO ONLY
                    taxResult = eval(uneval(taxesByNo[no]));
                    return taxResult;
                }catch(e) {
                    taxResult = GREUtils.extend({}, taxesByNo[no]);
                }
                return taxResult;
            }
        }

        // find from model
        var taxModel = new this.taxModel;

        var tax = taxModel.find("first", {
            conditions: "no='"+no+"'",
            recursive: 2
        });

        // reformat object for CombineTax
        if (tax && tax.CombineTax) {

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
 * Get an Tax by id<br/>
 * <br/>
 *
 * @public
 * @function
 * @param {String} id
 * @return {Object} tax Object
 */
    TaxComponent.prototype.getTaxById = function(id) {

        // use cache first
        var taxesById = GeckoJS.Session.get('taxesById');
        if(taxesById != null) {
            if(taxesById[id]) {
                var taxResult = null;
                try {
                    // deep clone using uneval/eval object  GECKO ONLY
                    taxResult = eval(uneval(taxesById[id]));
                    return taxResult;
                }catch(e) {
                    taxResult = GREUtils.extend({}, taxesById[id]);
                }        
                return taxResult;
            }
        }

        // find from model
        var taxModel = new this.taxModel;

        var tax = taxModel.findById(id, 2);

        // reformat object for CombineTax
        if (tax && tax.CombineTax) {

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
 * Get an Tax by name<br/>
 * <br/>
 *
 * @public
 * @function
 * @param {String} name
 * @return {Object} tax Object
 */
    TaxComponent.prototype.getTaxByName = function(name) {

        // find from model

        var taxModel = new this.taxModel;

        var tax = taxModel.find("first", {
            conditions: "name='"+name+"'",
            recursive: 2
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
    TaxComponent.prototype.getTaxList = function(type) {

        var taxModel = new this.taxModel;

        var params = {};

        if (GeckoJS.Array.inArray(type, ["ADDON", "INCLUDED", "COMBINE", "VAT"]) != -1) {
            params['conditions'] = "type='"+type+"'";
        }
        params['recursive'] = 2;
    
        var taxes = taxModel.find("all", params);

        delete taxModel;

        return taxes || [];

    };



    /**
 * Add Combine Taxes.
 * 
 * @public
 * @function  
 * @param {String} taxNo
 * @param {Array} combineTaxes
 * @return {Boolean}
 */
    TaxComponent.prototype.addCombineTax = function(no, combineTaxes) {
    
        no = no || null;
        combineTaxes = combineTaxes || [];
 
        // no roleName parameter return false
        if (no == null || combineTaxes.length == 0 ) return false;

        var tax = this.getTax(no);
        if(tax == null) return false;

        var taxId = tax.id + "";

        this.removeCombineTax(no);

        var combineTaxModel = new this.combineTaxModel;

        var self = this;
        combineTaxes.forEach(function(cbNo){

            var cbTax = self.getTax(cbNo);

            if(cbTax == null) return;

            var cbId = cbTax.id +"";

            combineTaxModel.create();
            combineTaxModel.save({
                tax_id: taxId +"",
                combine_tax_id: cbId +""
            });
            
        });

        delete combineTaxModel;

        this.processCache();

        return true;

    };


    /**
 * remove Combine Taxes
 *
 * @public
 * @function
 * @param {String} no
 * @return {Boolean}
 */
    TaxComponent.prototype.removeCombineTax = function(no) {

        no = no || null;

        // no roleName parameter return false
        if (no == null) return false;

        var tax = this.getTax(no);
        
        if (tax == null) return false;
        var taxId = tax.id;

        var combineTaxModel = new this.combineTaxModel;
        var childTaxes = combineTaxModel.find('all', {
            conditions: "tax_id='"+taxId+"'",
            recursive: 2
        });

        if (childTaxes == null) return false;

        if(childTaxes.length > 0) {
            // remove childTaxes;
            childTaxes.forEach(function(ct) {
                combineTaxModel.del(ct.id);
            });
        }

        delete combineTaxModel;

        this.processCache();

        return true;

    };


    /**
 * calculate tax for parameter amount
 *
 *  return detail of calculate result
 *
 *  {taxNo: {charge: tax_charged, tax: taxObject}, combine: {taxNo: {charge: tax_charged, tax:taxObject}, taxNo2: .....}}
 *  
 * @public
 * @function
 * @param {String} no
 * @param {Number} amount
 * @return {Object} 
 */
    TaxComponent.prototype.calcTaxAmount = function(no, amount, unitprice, qty, precision, rounding) {

        function roundTax(amount) {
            var roundedAmount = GeckoJS.NumberHelper.round(Math.abs(amount), precision, rounding) || 0;
            if (roundedAmount < 0) roundedAmount = 0 - roundedAmount;
            return roundedAmount;

        }
        function roundNumber(num) {
                var result = Math.round(num*Math.pow(10,(precision+1)))/Math.pow(10,(precision+1));
                return result;
        }

        var taxObject = null;
        amount = amount || 0;
        amount = parseFloat(amount);

        unitprice = unitprice || 0;
        unitprice = parseFloat(unitprice);

        qty = qty || 0;
        qty = parseFloat(qty);

        var taxAmount = {}; taxAmount[no] = {
            charge: 0,
            included: 0,
            taxable: 0,
            tax: taxObject
        };

        taxObject = this.getTax(no);

        if (taxObject == null || (isNaN(amount) || amount == Infinity) ) return taxAmount;

        taxAmount[no]['tax'] = taxObject;

        switch(taxObject['type']) {
            default:
            case "INCLUDED":
                taxAmount[no]['charge'] = 0;
                var included = 0;
                if (unitprice >= taxObject['threshold']) {
                    if (taxObject['rate_type'] == '$') {
                        included = qty * taxObject['rate'];
                    }else {
                    	included = amount - ( amount / (100 + taxObject['rate']) * 100);
                        //included = amount * taxObject[ 'rate' ] / ( 100 + taxObject[ 'rate' ] );
                    }
                    if (included > 0) taxAmount[no]['included'] = roundTax(included);
                }
                taxAmount[no]['taxable'] = roundNumber(amount - taxAmount[no]['included']);
                break;
                
            case "ADDON":
                taxAmount[no]['included'] = 0;
                taxAmount[no]['taxable'] = amount;
                if (unitprice >= taxObject['threshold']) {
                    var charge = 0;
                    if (taxObject['rate_type'] == '$') {
                        charge = qty * taxObject['rate'];
                    }else {
                        charge = amount * (taxObject['rate'] / 100) ;
                    }
                    if (charge > 0) taxAmount[no]['charge'] = roundTax(charge);
                }
                break;

            case "COMBINE":
                var totalCharge = 0;
                var totalIncluded = 0;
                taxAmount[no]['combine'] = {};
                if (taxObject.CombineTax != null) {

                    // compute included tax
                    // @irving 2009-09-24:
                    // the threshold parameter is ignored for included tax within a combined tax
                    // we sum up all the included charges and rates
                    var includedChargeAmount = 0;
                    var includedRate = 0;
                    var includedRateTaxes = [];
                    var includedRateAmount = 0;

                    // first compute all included fixed charges
                    taxObject.CombineTax.forEach(function(cTaxObj){
                        if (cTaxObj.type == 'INCLUDED') {
                            var rate = parseFloat(cTaxObj['rate']);
                            if (cTaxObj['rate_type'] == '$') {
                                var taxCharge = qty * rate || 0;
                                taxAmount[no]['combine'][cTaxObj.no] = {
                                    charge: 0,
                                    included: taxCharge,
                                    tax: cTaxObj
                                }
                                includedChargeAmount += taxCharge;
                            }else {
                                includedRate += rate;
                                includedRateTaxes.push(cTaxObj);
                            }
                        }
                    }, this);

                    // compute amount of rate-based included taxes
                    if (includedRateTaxes.length > 0) {
                        var amount1 = amount - includedChargeAmount;

                        // compute total included tax charge
                        includedRateAmount = roundNumber(amount1 - ( amount1 / (100 + includedRate) * 100));

                        // allocate included tax amount to individual rate-based included taxes
                        var allocatedTaxAmount = 0;
                        for (var i = 0; i < includedRateTaxes.length - 1; i++) {
                            var cTaxObj = includedRateTaxes[i];
                            var partialIncludedAmount = roundTax(cTaxObj.rate * includedRateAmount / includedRate);
                            taxAmount[no]['combine'][cTaxObj.no] = {
                                charge: 0,
                                included: partialIncludedAmount,
                                taxable: roundNumber(amount1 - includedRateAmount),
                                tax: cTaxObj
                            }
                            allocatedTaxAmount += partialIncludedAmount;
                        }

                       var cTaxObj = includedRateTaxes[i];
                       taxAmount[no]['combine'][cTaxObj.no] = {
                           charge: 0,
                           included: roundNumber(includedRateAmount - allocatedTaxAmount),
                           taxable: roundNumber(amount1 - includedRateAmount),
                           tax: cTaxObj
                       }
                    }

                    totalIncluded = roundNumber(includedRateAmount + includedChargeAmount);
                    var pretaxAmount = roundNumber(amount - totalIncluded);

                    taxObject.CombineTax.forEach(function(cTaxObj){
                        // foreach component tax of type 'add-on', compute add on tax
                        if (cTaxObj.type == 'ADDON') {
                            var cTaxAmount = this.calcTaxAmount(cTaxObj['no'], pretaxAmount, unitprice, qty, precision, rounding);
                            taxAmount[no]['combine'][cTaxObj.no] = {
                                charge: cTaxAmount[cTaxObj.no].charge || 0,
                                included: cTaxAmount[cTaxObj.no].included || 0,
                                taxable: pretaxAmount,
                                tax: cTaxObj
                            }
                            totalCharge += cTaxAmount[cTaxObj.no].charge || 0;
                        }
                        else if (cTaxObj.type == 'INCLUDED') {
                            // foreach component tax of type 'included', update taxable amount
                            taxAmount[no]['combine'][cTaxObj.no].taxable = pretaxAmount;
                        }
                    }, this);
                }
                taxAmount[no]['charge'] = roundNumber(totalCharge);
                taxAmount[no]['included'] = roundNumber(totalIncluded);
                break;

            case "VAT":
                var totalCharge = 0;
                taxAmount[no]['combine'] = {};
                if (unitprice >= taxObject['threshold'] && taxObject.CombineTax != null) {

                    // foreach combine taxes
                    taxObject.CombineTax.forEach(function(cTaxObj){
                        if (unitprice >= cTaxObj['threshold']) {

                            var charge = 0;
                            if (cTaxObj['rate_type'] == '$') {
                                charge = qty * cTaxObj['rate'];
                            }else {
                                charge = (amount + totalCharge) * (cTaxObj['rate'] / 100) ;
                            }

                            if (charge > 0) {
                                totalCharge += charge;
                                taxAmount[no]['combine'][cTaxObj.no] = {
                                    charge: charge,
                                    tax: cTaxObj
                                };
                            }
                        }
                    });

                    taxAmount[no]['charge'] = totalCharge;
                }
                break;
        }
        taxAmount[no]['charge'] = roundTax(taxAmount[no]['charge']);
        taxAmount[no]['included'] = roundTax(taxAmount[no]['included']);

        taxAmount[no]['tax_details'] = this.calcTaxDetails(taxAmount, no, roundTax, roundNumber);

        return taxAmount;
    };

    TaxComponent.prototype.calcTaxDetails = function(taxChargeObj, no, roundTax, roundNumber) {

        var tax_details;

        if (taxChargeObj[no]['combine']) {
            tax_details = taxChargeObj[no]['combine'];

            // round individual tax components
            var includedCTaxes = [];
            var addonCTaxes = [];

            for (var key in tax_details) {
                var cTaxObj = tax_details[key];
                if (cTaxObj.tax.type == 'INCLUDED') {
                    includedCTaxes.push(cTaxObj);
                }
                else {
                    addonCTaxes.push(cTaxObj);
                }
            };
            // process add-on taxes
            if (addonCTaxes.length > 0) {
                var addonSum = 0;
                for (var i = 0; i < addonCTaxes.length - 1; i++) {
                    addonCTaxes[i].charge = roundTax(addonCTaxes[i].charge);
                    addonSum += addonCTaxes[i].charge;
                }

                addonCTaxes[i].charge = roundTax(taxChargeObj[no]['charge'] - addonSum);
            }

            // process included taxes
            if (includedCTaxes.length > 0) {
                var includedSum = 0;
                for (var j = 0; j < includedCTaxes.length - 1; j++) {
                    includedCTaxes[j].included = roundTax(includedCTaxes[j].included);
                    includedSum += includedCTaxes[j].included;
                }

                includedCTaxes[j].included = roundTax(taxChargeObj[no]['included'] - includedSum);
            }
        }
        else {
            tax_details = {};
            tax_details[no] = {
                charge: taxChargeObj[no].charge,
                included: taxChargeObj[no].included,
                taxable: taxChargeObj[no].taxable,
                tax: taxChargeObj[no].tax
            };
        }

        return tax_details;
    };

    TaxComponent.prototype.calcOpenTaxAmount = function(rate_type, rate, amount) {

        amount = amount || 0;
        amount = parseFloat(amount);

        var no = 'OP';

        var taxAmount = {}; taxAmount[no] = {
            charge: 0,
            tax: null
        };

        if ((isNaN(amount) || amount == Infinity) ) return taxAmount;
    
        taxAmount[no]['tax'] = {
            rate_type: rate_type,
            rate: rate
        };

        var charge = 0;
        if (rate_type == '$') {
            charge = rate;
        }else {
            charge = amount * (rate / 100) ;
        }
        if (charge > 0) taxAmount[no]['charge'] = charge;

        return taxAmount;

    };

})();

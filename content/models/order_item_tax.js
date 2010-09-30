( function() {
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'OrderItemTax',

        useDbConfig: 'order',

        belongsTo: ['Order'],
        
        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true,

        mappingTranToOrderItemTaxesFields: function(data) {

            var orderItemTaxes = [];

            // map taxes for individual items
            for (var iid in data.items) {

                let item = data.items[iid];

                for (let taxno in item.tax_details) {

                    let taxDetails = item.tax_details[taxno];
                    let tax = item.tax_details[taxno].tax;

                    let orderItemTax = {};
                    orderItemTax['id'] = GeckoJS.String.uuid();
                    orderItemTax['order_id'] = data.id;
                    orderItemTax['order_item_id'] = iid;
                    orderItemTax['promotion_id'] = '';
                    orderItemTax['tax_no'] = tax.no;
                    orderItemTax['tax_name'] = tax.name;
                    orderItemTax['tax_type'] = tax.type;
                    orderItemTax['tax_rate'] = tax.rate;
                    orderItemTax['tax_rate_type'] = tax.rate_type;
                    orderItemTax['tax_threshold'] = tax.threshold;
                    orderItemTax['tax_subtotal'] = taxDetails.charge;
                    orderItemTax['included_tax_subtotal'] = taxDetails.included;
                    orderItemTax['taxable_amount'] = taxDetails.taxable;

                    orderItemTaxes.push(orderItemTax);
                }
            }


            // map taxes for promotions
            for (var pid in data.promotion_apply_items) {

                let promotion = data.promotion_apply_items[pid];

                for (let taxno in promotion.tax_details) {

                    let taxDetails = promotion.tax_details[taxno];
                    let tax = taxDetails.tax;

                    let promotionTax = {};
                    promotionTax['id'] = GeckoJS.String.uuid();
                    promotionTax['order_id'] = data.id;
                    promotionTax['order_item_id'] = '';
                    promotionTax['promotion_id'] = promotion.id;
                    promotionTax['tax_no'] = tax.no;
                    promotionTax['tax_name'] = tax.name;
                    promotionTax['tax_type'] = tax.type;
                    promotionTax['tax_rate'] = tax.rate;
                    promotionTax['tax_rate_type'] = tax.rate_type;
                    promotionTax['tax_threshold'] = tax.threshold;
                    promotionTax['tax_subtotal'] = taxDetails.charge;
                    promotionTax['included_tax_subtotal'] = taxDetails.included;
                    promotionTax['taxable_amount'] = taxDetails.taxable;

                    orderItemTaxes.push(promotionTax);
                }
            }
            
            // map taxes for order
            for (let taxno in data.items_tax_details) {
                let taxDetails = data.items_tax_details[taxno];
                let tax = taxDetails.tax;

                let orderTax = {};
                orderTax['id'] = GeckoJS.String.uuid();
                orderTax['order_id'] = data.id;
                orderTax['order_item_id'] = '';
                orderTax['promotion_id'] = '';
                orderTax['tax_no'] = tax.no;
                orderTax['tax_name'] = tax.name;
                orderTax['tax_type'] = tax.type;
                orderTax['tax_rate'] = tax.rate;
                orderTax['tax_rate_type'] = tax.rate_type;
                orderTax['tax_threshold'] = tax.threshold;
                orderTax['tax_subtotal'] = taxDetails.tax_subtotal;
                orderTax['included_tax_subtotal'] = taxDetails.included_tax_subtotal;
                orderTax['item_count'] = taxDetails.item_count;
                orderTax['taxable_amount'] = taxDetails.taxable_amount;

                orderItemTaxes.push(orderTax);
            }

            return orderItemTaxes;

        },

        mappingOrderItemTaxesFieldsToTran: function(orderData, data) {

            if (!orderData.OrderItemTax || typeof orderData.OrderItemTax == 'undefined') {
                return;
            }

            var items_tax_details = {};
            var promotions_tax_details = {};

            for (var idx in orderData.OrderItemTax) {

                let taxDetailsData = orderData.OrderItemTax[idx];

                if (taxDetailsData.order_item_id == '' && taxDetailsData.promotion_id == '') {
                    // order tax details
                    let tax_details = {};

                    tax_details['tax_subtotal'] = parseFloat(taxDetailsData.tax_subtotal);
                    tax_details['included_tax_subtotal'] = parseFloat(taxDetailsData.included_tax_subtotal);
                    tax_details['item_count'] = parseInt(taxDetailsData.item_count);
                    tax_details['taxable_amount'] = parseFloat(taxDetailsData.taxable_amount);
                    tax_details['tax'] = {
                        no: taxDetailsData.tax_no,
                        name: taxDetailsData.tax_name,
                        type: taxDetailsData.tax_type,
                        rate: parseFloat(taxDetailsData.tax_rate),
                        rate_type: taxDetailsData.tax_rate_type,
                        threshold: parseFloat(taxDetailsData.tax_threshold)
                    }
                    items_tax_details[taxDetailsData.tax_no] = tax_details;
                }
                else if (taxDetailsData.order_item_id && data.items[taxDetailsData.order_item_id]) {
                    // item tax details
                    let item = data.items[taxDetailsData.order_item_id];
                    let item_tax_details = {};

                    item_tax_details['charge'] = parseFloat(taxDetailsData.tax_subtotal);
                    item_tax_details['included'] = parseFloat(taxDetailsData.included_tax_subtotal);
                    item_tax_details['taxable'] = parseFloat(taxDetailsData.taxable_amount);
                    item_tax_details['tax'] = {
                        no: taxDetailsData.tax_no,
                        name: taxDetailsData.tax_name,
                        type: taxDetailsData.tax_type,
                        rate: parseFloat(taxDetailsData.tax_rate),
                        rate_type: taxDetailsData.tax_rate_type,
                        threshold: parseFloat(taxDetailsData.tax_threshold)
                    }

                    if (!item.tax_details) {
                        item.tax_details = {};
                    }
                    item.tax_details[taxDetailsData.tax_no] = item_tax_details;
                }
                else if (taxDetailsData.promotion_id && data.promotion_apply_items && data.promotion_apply_items.length > 0) {
                    for (let i = 0; i < data.promotion_apply_items.length; i++) {
                        let promotion = data.promotion_apply_items[i];
                        if (taxDetailsData.promotion_id == promotion.promotion_id) {
                            // item tax details
                            let promo_tax_details = {};

                            promo_tax_details['charge'] = parseFloat(taxDetailsData.tax_subtotal);
                            promo_tax_details['included'] = parseFloat(taxDetailsData.included_tax_subtotal);
                            promo_tax_details['taxable'] = parseFloat(taxDetailsData.taxable_amount);
                            promo_tax_details['tax'] = {
                                no: taxDetailsData.tax_no,
                                name: taxDetailsData.tax_name,
                                type: taxDetailsData.tax_type,
                                rate: parseFloat(taxDetailsData.tax_rate),
                                rate_type: taxDetailsData.tax_rate_type,
                                threshold: parseFloat(taxDetailsData.tax_threshold)
                            }

                            if (!promotion.tax_details) {
                                promotion.tax_details = {};
                            }
                            promotion.tax_details[taxDetailsData.tax_no] = promo_tax_details;

                            if (!promotions_tax_details[taxDetailsData.tax_no]) {
                                promotions_tax_details[taxDetailsData.tax_no] = {
                                    tax_subtotal: 0,
                                    included_tax_subtotal: 0,
                                    taxable_amount: 0,
                                    tax: promo_tax_details.tax
                                };
                            }
                            promotions_tax_details[taxDetailsData.tax_no].tax_subtotal += promo_tax_details.charge;
                            promotions_tax_details[taxDetailsData.tax_no].included_tax_subtotal += promo_tax_details.included;
                            promotions_tax_details[taxDetailsData.tax_no].taxable_amount += promo_tax_details.taxable_amount;

                        }
                    }
                }
            }
            
            data.items_tax_details = items_tax_details;
            data.promotions_tax_details = promotions_tax_details;

        },

        // XXX not yet!
        rebuildDisplaySequences: function(data) {

        }
        
    };

    var OrderItemTaxModel = window.OrderItemTaxModel =  AppModel.extend(__model__);

} )();

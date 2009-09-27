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

                for (var taxno in item.tax_details) {

                    let taxDetails = item.tax_details[taxno];
                    let tax = item.tax_details[taxno].tax;

                    let orderItemTax = {};
                    orderItemTax['id'] = '';
                    orderItemTax['order_id'] = data.id;
                    orderItemTax['order_item_id'] = iid;
                    orderItemTax['tax_no'] = tax.no;
                    orderItemTax['tax_name'] = tax.name;
                    orderItemTax['tax_type'] = tax.type;
                    orderItemTax['tax_rate'] = tax.rate;
                    orderItemTax['tax_rate_type'] = tax.rate_type;
                    orderItemTax['tax_threshold'] = tax.threshold;
                    orderItemTax['tax_subtotal'] = taxDetails.charge;
                    orderItemTax['included_tax_subtotal'] = taxDetails.included;

                    orderItemTaxes.push(orderItemTax);
                }
            }

            // map taxes for order
            for (var taxno in data.items_tax_details) {
                let taxDetails = data.items_tax_details[taxno];
                let tax = taxDetails.tax;

                let orderTax = {};
                orderTax['id'] = '';
                orderTax['order_id'] = data.id;
                orderTax['order_item_id'] = '';
                orderTax['tax_no'] = tax.no;
                orderTax['tax_name'] = tax.name;
                orderTax['tax_type'] = tax.type;
                orderTax['tax_rate'] = tax.rate;
                orderTax['tax_rate_type'] = tax.rate_type;
                orderTax['tax_threshold'] = tax.threshold;
                orderTax['tax_subtotal'] = taxDetails.tax_subtotal;
                orderTax['included_tax_subtotal'] = taxDetails.included_tax_subtotal;

                orderItemTaxes.push(orderTax);
            }
            return orderItemTaxes;

        },

        mappingOrderItemTaxesFieldsToTran: function(orderData, data) {

            if (!orderData.OrderItemTax || typeof orderData.OrderItemTax == 'undefined') {
                return tax_details;
            }

            var items_tax_details = {};

            for (var idx in orderData.OrderItemTax) {

                let taxDetailsData = orderData.OrderItemTax[idx];

                if (taxDetailsData.order_item_id == '') {
                    // order tax details
                    let tax_details = {};

                    tax_details['tax_subtotal'] = taxDetailsData.tax_subtotal;
                    tax_details['included_tax_subtotal'] = taxDetailsData.included_tax_subtotal;
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
                else {
                    // item tax details
                    let item = data.items[taxDetailsData.order_item_id];
                    let item_tax_details = {};

                    item_tax_details['charge'] = taxDetailsData.tax_subtotal;
                    item_tax_details['included'] = taxDetailsData.included_tax_subtotal;
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
            }
            data.items_tax_details = items_tax_details;
        },

        // XXX not yet!
        rebuildDisplaySequences: function(data) {

        }
        
    };

    var OrderItemTaxModel = window.OrderItemTaxModel =  AppModel.extend(__model__);

} )();

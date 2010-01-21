( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'OrderObject',

        useDbConfig: 'order',
        
        belongsTo: ['Order'],

        behaviors: ['Sync', 'Training'],

        mappingTranToOrderObjectsFields: function(data) {

            try {

                var s = GeckoJS.BaseObject.serialize(data);
                // clone data
                var d2 = GeckoJS.BaseObject.unserialize(s);

                //delete d2.id;
                delete d2.seq;

                delete d2.items;
                delete d2.items_summary;
                //delete d2.items_count;

                delete d2.trans_discounts;
                delete d2.trans_surcharges;
                delete d2.trans_payments;

                // delete calculate fields
                /*
                delete d2.total;
                delete d2.remain;
                delete d2.qty_subtotal;
                delete d2.tax_subtotal;
                delete d2.item_subtotal;
                delete d2.included_tax_subtotal;
                delete d2.item_surcharge_subtotal;
                delete d2.item_discount_subtotal;
                delete d2.trans_surcharge_subtotal;
                delete d2.trans_discount_subtotal;
                delete d2.payment_subtotal;
                delete d2.discount_subtotal;
                delete d2.surcharge_subtotal;
                */

                // rounding 
                delete d2.rounding_prices;
                delete d2.precision_prices;
                delete d2.rounding_taxes;
                delete d2.precision_taxes;

                // clerk
                delete d2.service_clerk;
                delete d2.service_clerk_displayname;
                delete d2.proceeds_clerk;
                delete d2.proceeds_clerk_displayname;

                // member id
                delete d2.member;
                delete d2.member_displayname;
                delete d2.member_email;
                delete d2.member_cellphone;

                // invoice
                delete d2.invoice_type;
                delete d2.invoice_title;
                delete d2.invoice_no;

                delete d2.destination;
                delete d2.table_no;
                delete d2.check_no;
                delete d2.no_of_customers;
                delete d2.terminal_no;

                var s2 = btoa(GREUtils.Gzip.deflate(GeckoJS.BaseObject.serialize(d2)));

                //dump(s2.length + '\n');
                
                var orderObj = {};
                orderObj['id'] = data.id;
                orderObj['order_id'] = data.id;
                orderObj['object'] = s2;

            }catch(e) {
            }

            return orderObj;

        },

        mappingOrderObjectsFieldsToTran: function(orderData, data) {
            
            if (!orderData.OrderObject || typeof orderData.OrderObject == 'undefined') return {};

            var obj = GeckoJS.BaseObject.unserialize(GREUtils.Gzip.inflate(atob(orderData.OrderObject.object)));

            if (!obj.display_sequences) return {};

            // use createDisplaySeq
            var items = {};
            for (let seqIdx in obj.display_sequences) {

                let seqData = obj.display_sequences[seqIdx];

                if (seqData.type == 'item' || seqData.type == 'setitem') {
                    items[seqData.index] = {id: seqData.id,
                                            type: 'item',
                                            no: seqData.no,
                                            name: seqData.name,
                                            alt_name1: seqData.alt_name1,
                                            alt_name2: seqData.alt_name2,
                                            destination: seqData.destination,
                                            parent_index: seqData.parent_index ||'',
                                            age_verification: seqData.age_verification,
                                            price_level: seqData.price_level,
                                            price_modifier: seqData.price_modifier};
                }
            }
            obj.items = items;

            return obj;
            
        }

    };

    var OrderObjectModel = window.OrderObjectModel = AppModel.extend(__model__);

} )();

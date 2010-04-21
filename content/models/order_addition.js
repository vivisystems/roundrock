( function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'OrderAddition',

        useDbConfig: 'order',

        belongsTo: ['Order'],

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true,

        mappingTranToOrderAdditionsFields: function(data) {

            var orderAdditions = [];

            for (var iid in data.trans_discounts) {

                let discount = data.trans_discounts[iid];

                let orderAddition = GREUtils.extend({}, discount);

                orderAddition['id'] = iid;
                orderAddition['order_id'] = data.id;
                orderAddition['order_item_count'] = data.item_count;
                orderAddition['order_item_total'] = data.item_count;

                orderAdditions.push(orderAddition);

            }

            for (var iid2 in data.trans_surcharges) {

                let surcharge = data.trans_surcharges[iid2];

                let orderAddition = GREUtils.extend({}, surcharge);

                orderAddition['id'] = iid2;
                orderAddition['order_id'] = data.id;

                orderAdditions.push(orderAddition);

            }

            return orderAdditions;

        },

        mappingOrderAdditionsFieldsToTran: function(orderData, data) {

            var surcharges = {}, discounts={};
            
            data['trans_discounts'] = discounts;
            data['trans_surcharges'] = surcharges;

            if (!orderData.OrderAddition || typeof orderData.OrderAddition == 'undefined') return false;

            for (var idx in orderData.OrderAddition) {

                let addition = orderData.OrderAddition[idx];
                let additionIndex = addition.id;

                let additionType = (addition.discount_name && addition.discount_name.length > 0) ? 'discount' : 'surcharge';

                if (additionType == 'discount') {
                    discounts[additionIndex] = {
                        'discount_name': addition.discount_name,
                        'discount_rate': addition.discount_rate,
                        'discount_type': addition.discount_type,
                        'hasMarker': true,
                        'current_discount': addition.current_discount
                    };
                }else {
                    surcharges[additionIndex] = {
                        'surcharge_name': addition.surcharge_name,
                        'surcharge_rate': addition.surcharge_rate,
                        'surcharge_type': addition.surcharge_type,
                        'hasMarker': true,
                        'current_surcharge': addition.current_surcharge
                    };
                }

            }

            data['trans_discounts'] = discounts;
            data['trans_surcharges'] = surcharges;

            this.rebuildDisplaySequences(data);

            return true;

        },


        rebuildDisplaySequences: function(data) {

            if(!data.rebuildedDisplaySequences) return ;

            try {

                var transaction = new Transaction(true, true);

                for (var itemIndex in data.trans_discounts) {
                    let dsp_seq = transaction.createDisplaySeq(itemIndex, data.trans_discounts[itemIndex], 'trans_discount');
                    data.display_sequences.push(dsp_seq);
                }

                for (var itemIndex in data.trans_surcharges) {
                    let dsp_seq = transaction.createDisplaySeq(itemIndex, data.trans_surcharges[itemIndex], 'trans_surcharge');
                    data.display_sequences.push(dsp_seq);
                }

            }catch(e) {
                this.log('WARN', 'rebuildDisplaySequences failure.', e);
            }

            
        }

    };

    var OrderAdditionModel = window.OrderAdditionModel =  AppModel.extend(__model__);

} )();

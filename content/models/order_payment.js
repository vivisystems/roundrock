(function() {

    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'OrderPayment',

        useDbConfig: 'order',

        belongsTo: ['Order'],

        behaviors: ['Sync', 'Training'],

        autoRestoreFromBackup: true,
        
        mappingTranToOrderPaymentsFields: function(data) {

            var orderPayments = [];
            var i = 0;
            var batch = data.batchCount;
            var len = GeckoJS.BaseObject.getKeys(data.trans_payments).length;
            
            for (var iid in data.trans_payments) {
                i++;
                let payment = data.trans_payments[iid];
                if (payment.batch == batch) {

                    let orderPayment = GREUtils.extend({}, payment);

                    orderPayment['id'] = iid;
                    orderPayment['order_id'] = data.id;
                    orderPayment['order_items_count'] = payment.current_qty;
                    orderPayment['order_total'] = data.total;

                    orderPayment['service_clerk'] = data.service_clerk;
                    orderPayment['proceeds_clerk'] = data.proceeds_clerk;

                    orderPayment['service_clerk_displayname'] = data.service_clerk_displayname;
                    orderPayment['proceeds_clerk_displayname'] = data.proceeds_clerk_displayname;

                    orderPayment['sale_period'] = data.sale_period;
                    orderPayment['shift_number'] = data.shift_number;
                    orderPayment['terminal_no'] = data.terminal_no;

                    // calculate change only if the order is being finalized
                    if (i == len && data.status == 1) {
                        orderPayment['change'] = Math.abs(data.remain);
                    } else {
                        orderPayment['change'] = 0;
                    }

                    orderPayments.push(orderPayment);
                }
            }

            return orderPayments;

        },

        mappingOrderPaymentsFieldsToTran: function(orderData, data) {

            var payments = {};

            data['trans_payments'] = payments;

            if (!orderData.OrderPayment || typeof orderData.OrderPayment == 'undefined') return payments;

            for (var idx in orderData.OrderPayment) {

                let payment = orderData.OrderPayment[idx];
                let paymentIndex = payment.id;

                payments[paymentIndex] = {
                    'id': payment.id,
                    'name': payment.name,
                    'amount': payment.amount,
                    'origin_amount': payment.origin_amount,
                    'memo1': payment.memo1,
                    'memo2': payment.memo2,
                    'current_qty': payment.order_items_count
                };
                
            }
            
            data['trans_payments'] = payments;

            return payments;
        }

    };
    
    var OrderPaymentModel = window.OrderPaymentModel =  AppModel.extend(__model__);

})();

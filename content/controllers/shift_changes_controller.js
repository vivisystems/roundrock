(function(){

    /**
     * ShiftChangesController
     */

    GeckoJS.Controller.extend( {
        name: 'ShiftChanges',

        _listObj: null,
        _listDatas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('supplierscrollablepanel');
            }
            return this._listObj;
        },

        load: function(data) {
            //
        },

        shiftChange: function() {
            //
            var shiftChangeModel = new ShiftChangeModel();
            var lastChange = shiftChangeModel.find('first', {
                order: 'starttime desc'
            });

            if (lastChange)
                var start = lastChange.endtime;
            else
                var start = (new Date(2000,1,1)).getTime();
            var end = (new Date()).getTime();

            var fields = ['order_payments.modified',
                            'order_payments.name',
                            'order_payments.memo1',
                            'SUM("order_payments"."amount" - "order_payments"."change") as "OrderPayment.amount"'];
            var conditions = "order_payments.modified > '" + start + "' AND order_payments.modified < '" + end + "'";
            var groupby = '"order_payments"."name" , "order_payments"."memo1"';
            var orderby = 'order_payments.name';
            var orderPayment = new OrderPaymentModel();
            var detail = orderPayment.find('all', {
                fields: fields,
                
                group: groupby,
                order: orderby
            });

            if (detail.length == 0) {
                NotifyUtils.warn(_('shift change is not needed!'));
                return;
            }
            var amount = orderPayment.find('all', {
                fields: ['SUM("order_payments"."amount" - "order_payments"."change") as "OrderPayment.amount"'],
                conditions: conditions,
            });

            var amount = amount[0].amount;

            var clerk = '';
            var user = new GeckoJS.AclComponent().getUserPrincipal();
            if ( user != null ) {
                clerk = user.username;
            }
            
            var data = {
                starttime: start,
                endtime: end,
                amount: amount,
                clerk: clerk,
                note: '',
                detail: detail
            }

            var aURL = "chrome://viviecr/content/prompt_doshiftchange.xul";
            var features = "chrome,titlebar,toolbar,centerscreen,modal,width=500,height=450";
            var inputObj = {
                input0:null,
                input1:null,
                topics:null,
                shiftchange:data
            };

            var accountTopic = new AccountTopicModel();
            inputObj.topics = accountTopic.find('all');

            window.openDialog(aURL, "prompt_shiftchange", features, inputObj);

            var amt = parseFloat(inputObj.amount);
            if (inputObj.ok) {
                data.note = inputObj.description;

                if ( amt != 0) {
                    inputObj.type = "OUT";
                    this.requestCommand('accounting', inputObj, 'Cart');

                    data.amount = data.amount - amt;
                    data.endtime = (new Date()).getTime();
                    data.detail.push({name:inputObj.topic, memo1: 'OUT', amount: amt * (-1)});

                    // @todo ugly wait...
                    this.sleep(100);

                    inputObj.type = "IN";
                    this.requestCommand('accounting', inputObj, 'Cart');

                    
                }
                data.terminal_no = GeckoJS.Session.get('terminal_no');

                shiftChangeModel.saveShiftChange(data);

                NotifyUtils.warn(_('shift change has been finished!'));
            }
        },

        select: function(index){
            if (index >= 0) {
                var supplier = this._listDatas[index];
                this.requestCommand('view', supplier.id);
                this._listObj.selectedIndex = index;
            }
        }

    });

})();

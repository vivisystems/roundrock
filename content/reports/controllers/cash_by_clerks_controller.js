(function(){

    /**
     * Class ViviPOS.ProductSalesController
     */

    GeckoJS.Controller.extend( {
        name: 'CashByClerks',

        _listObj: null,
        _listDatas: null,
        _panelView: null,
        _selectedIndex: 0,
        _datas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('datascrollablepanel');
            }
            return this._listObj;
        },

        list: function() {
            /*
            var productModel = new ProductModel();
            var products = productModel.find('all', {
                order: 'no'
            });
            this._listDatas = products;
            */
        },

        execute: function() {
            //
            this.load();

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();

            var data = {
                head: {title:_('Product Sales Report'), start_date: start_str, end_date: end_str},
                body: this._datas,
                foot: {summary: 120}
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/cash_by_clerk.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

            result = tpl.process(data);

            var doc = document.getElementById('preview_div');
            doc.innerHTML = result;

        },

        exportCsv: function() {

            this.load();

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();
            //var start_str = (new Date(start)).toLocaleString();
            //var end_str = (new Date(end)).toLocaleString();

            var data = {
                head: {title:_('Product Sales Report'), start_date: start_str, end_date: end_str},
                body: this._datas,
                foot: {summary: 120}
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/cash_by_clerk.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

            result = tpl.process(data);

            var doc = document.getElementById('preview_div');
            doc.innerHTML = result;

        },

        load: function() {
            this._selectedIndex = -1;

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            var orderPayment = new OrderPaymentModel();
            var fields = [  'order_payments.created',
                            'order_payments.name',
                            'SUM("order_payments"."amount") as "OrderPayment.amounts"',
//                            'SUM("order_payments"."origin_amount") as "OrderPayment.origin_amounts"',
                            'order_payments.memo1'];
            var conditions = "order_payments.created>='" + start +
                            "' AND order_payments.created<='" + end +
//                            "' AND order_payments.clerk='" + clerk +
                            "'";

            var groupby = 'order_payments.name,order_payments.memo1';
            var orderby = 'order_payments.name';

            var datas = orderPayment.find('all',{fields: fields, conditions: conditions, group: groupby, order: orderby});

            this._datas = datas;
// this.log(this.dump(datas));
        }

    });


})();
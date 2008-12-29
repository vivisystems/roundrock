(function(){

    /**
     * Class ViviPOS.ProductSalesController
     */

    GeckoJS.Controller.extend( {
        name: 'ProductSales',
	
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
                head: {title:_('Product Sales Report'), start_date: start_str, end_date: end_str, department: department},
                body: this._datas,
                foot: {summary: 120}
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/product_sales.tpl");

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

            var department = document.getElementById('department').value;

            var data = {
                head: {title:_('Product Sales Report'), start_date: start_str, end_date: end_str, department: department},
                body: this._datas,
                foot: {summary: 120}
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/product_sales.tpl");

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
            var department = document.getElementById('department').value;
            department = '';
            var orderItem = new OrderItemModel();
            var fields = ['order_items.created',
                            'order_items.product_no',
                            'order_items.product_name',
                            'SUM("order_items"."current_qty") as "OrderItem.qty"',
                            'SUM("order_items"."current_subtotal") as "OrderItem.total"',
                            'order_items.current_tax'];
            if (department.length > 0) {
                var conditions = "order_items.created>='" + start +
                            "' AND order_items.created<='" + end +
                            "' AND order_items.cate_no='" + department + "'";
            } else {
                var conditions = "order_items.created>='" + start +
                            "' AND order_items.created<='" + end + "'";
            }
            var groupby = 'order_items.product_no';
            var orderby = 'order_items.product_no';
            
            var datas = orderItem.find('all',{fields: fields, conditions: conditions, group: groupby, order: orderby});

            this._datas = datas;
        }
	
    });


})();


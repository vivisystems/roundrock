(function(){

    /**
     * Class ViviPOS.ProductSalesController
     */

    GeckoJS.Controller.extend( {
        name: 'Inventories',
	
        _listObj: null,
        _listDatas: null,
        _panelView: null,
        _selectedIndex: 0,
        _datas: null,

        getListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('datascrollablepanel');
                // this._productsById = GeckoJS.Session.get('productsById');
                // this._barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
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

            var data = {
                head: {title:_('Inventories Report'), start_date: start, end_date: end},
                body: this._datas,
                foot: {summary: 120}
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/inventory.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);

            result = tpl.process(data);

            var doc = document.getElementById('preview_div');
            doc.innerHTML = result;

/*
            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;

            var ran = Math.random();
            var url = "chrome://viviecr/content/reports/product_sales_template.xul?start_date=2008-12&i=" + ran;
            // var url = "chrome://viviecr/content/reports/product_sales_template.xul";

            var path = "/home/achang/workspace/vivipos_app/content/reports/product_sales.xml";

            var self = this;
            var xml = '';
            xml = '<product_sales>\n';
            xml = xml + '<filter start_date="' + start + '" end_date="' + end + '"/>\n';
            // self.log(self.dump(this._datas));
            this._datas.forEach(function(o){
                // var str = '<data product_no="' + o.product_no + '" product_name="' + o.product_name + '" qty="' + o.qty + '" total="' + o.total + '"/>\n';
                // self.log(self.dump(o));
                var str = '';
                    for (key in o) {
                        str = str + ' ' + key + '="' + o[key] + '"';
                    }
                str = '<data' + str + '/>\n';
                xml = xml + str;
            });

            xml = xml + '</product_sales>';
            // alert(xml);

            var parser = new DOMParser();
            var dom = parser.parseFromString(xml, "text/xml");

            document.getElementById('preview').builder.datasource = dom;
            document.getElementById('preview').builder.rebuild();

            document.getElementById('product_sales_datas').builder.datasource = dom;
            document.getElementById('product_sales_datas').builder.rebuild();
            // document.getElementById('preview').setAttribute('src', url);
            // document.getElementById('preview').setAttribute('datasources', 'product_sales.xml');
*/

        },

        exportCsv: function() {
            
            this.load();

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            var start_str = document.getElementById('start_date').datetimeValue.toLocaleString();
            var end_str = document.getElementById('end_date').datetimeValue.toLocaleString();
            
            var department = document.getElementById('department').value;

            var data = {
                head: {title:_('Inventories Report'), start_date: start_str, end_date: end_str, department: department},
                body: this._datas,
                foot: {summary: 120}
            }

            var path = GREUtils.File.chromeToPath("chrome://viviecr/content/reports/tpl/inventory.tpl");

            var file = GREUtils.File.getFile(path);
            var tpl = GREUtils.File.readAllBytes(file);
            
            result = tpl.process(data);

            var doc = document.getElementById('preview_div');
            doc.innerHTML = result;

/*
            var iframe = document.getElementById('preview');

            // iframe = (iframe.contentWindow) ? iframe.contentWindow : (iframe.contentDocument.document) ? iframe.contentDocument.document : iframe.contentDocument;
            iframe.contentDocument.getElementById("abody").innerHTML = result;
//            iframe.document.open();
//            iframe.document.write(result);
//            iframe.document.close();
this.log(this.dump(result));

            // var aURL = "chrome://viviecr/content/jstemplate/jstemplate.xul";
            var aURL = "chrome://viviecr/content/reports/product_sales_template.xul";
            var aName = "testjstemplate";
            var aArguments = "";
            var width = 800;
            var height = 600;
            var posX = 0;
            var posY = 0;
            //var width = this.screenwidth;
            //var height = this.screenheight;
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
*/
        },

        load: function() {
            this._selectedIndex = -1;

            var start = document.getElementById('start_date').value;
            var end = document.getElementById('end_date').value;
            var department = document.getElementById('department').value;
            department = '';
            var cate = new CategoryModel();
            var cateDatas = cate.find('all', {fields: ['no','name']});
// this.log(this.dump(cateDatas));
            var self = this;
            var datas = [];
            cateDatas.forEach(function(o){
                datas[o.no] = {no:o.no, name:o.name};
            });

            var prod = new ProductModel();
            var prodDatas = prod.find('all', {fields: ['cate_no', 'no','name','stock','min_stock'], order:'cate_no'});
// this.log(this.dump(prodDatas));
            prodDatas.forEach(function(o){
                if (datas[o.cate_no]) {
                    if (datas[o.cate_no].plu == null) {
                        datas[o.cate_no].plu = [];
                    }
                    datas[o.cate_no].plu.push( {cate_no:o.cate_no, no:o.no, name:o.name, stock:o.stock, min_stock:o.min_stock});
                }
            });

// this.log(this.dump(datas));
/*
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
*/
            this._datas = datas;
            //this._panelView = new GeckoJS.NSITreeViewArray(this._datas);
            //this.getListObj().datasource = this._panelView;
        }

    });


})();


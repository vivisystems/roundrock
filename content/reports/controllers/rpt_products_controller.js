(function(){

    /**
     * RptProducts Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptProducts',
        
        _fileName: "rpt_products",

        _set_reportRecords: function() {
            var department = document.getElementById('department').value;

            var fields = [];

            var conditions = null;

            if (department != "all") {
                var cate = new CategoryModel();
                var cateRecords = cate.find('all', {
                    fields: ['no','name'],
                    conditions: "categories.no LIKE '" + department + "%'"
                    });
            } else {
                var cate = new CategoryModel();
                var cateRecords = cate.find('all', {
                    fields: ['no','name']
                    });
            }

            var records = [];
            cateRecords.forEach(function(o){
                records[o.no] = {
                    no:o.no,
                    name:o.name
                    };
            });

            var groupby;

			var sortby = document.getElementById( 'sortby' ).value;
            var orderby = 'products.cate_no, products.no';
            
            if ( sortby != 'all' )
            	orderby = 'products.' + sortby + ', products.cate_no';

            var prod = new ProductModel();
            var prodRecords = prod.find('all', { fields: fields, conditions: conditions, order: orderby });

            prodRecords.forEach(function(o){
                if (records[o.cate_no]) {
                    if (records[o.cate_no].plu == null) {
                        records[o.cate_no].plu = [];
                    }
                    records[o.cate_no].plu.push(GREUtils.extend({}, o));
                }
            });

            this._reportRecords.head.title = _( 'Product List' );
            this._reportRecords.body = records;
        },

        load: function() {
            var cate = new CategoryModel();
            var cateRecords = cate.find('all', {
                fields: ['no','name']
                });
            var dpt = document.getElementById('department_menupopup');

            cateRecords.forEach(function(record){
                var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                menuitem.setAttribute('value', record.no);
                menuitem.setAttribute('label', record.no + "-" + record.name);
                dpt.appendChild(menuitem);
            });

            this._enableButton(false);
        }
    });
})();

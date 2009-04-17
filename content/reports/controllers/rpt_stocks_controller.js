(function(){

    /**
     * RptStocks Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    RptBaseController.extend( {
        name: 'RptStocks',
        
        _fileName: "rpt_stocks",

        _set_reportRecords: function() {
            var department = document.getElementById('department').value;
            var sortby = document.getElementById( 'sortby' ).value;

            var fields = [ 'cate_no', 'no', 'name', 'stock', 'min_stock' ];

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
            
            var orderby = 'products.cate_no,products.' + sortby;
            
            if ( sortby != 'all' )
            	orderby = 'products.' + sortby;

            var prod = new ProductModel();
            var prodRecords = prod.find('all', { fields: fields, conditions: conditions, order: orderby });

            prodRecords.forEach(function(o){
                if (records[o.cate_no]) {
                    if (records[o.cate_no].plu == null) {
                        records[o.cate_no].plu = [];
                    }
                    records[o.cate_no].plu.push( {
                        cate_no:o.cate_no,
                        no:o.no,
                        name:o.name,
                        stock:o.stock,
                        min_stock:o.min_stock
                        });
                }
            });

			this._reportRecords.head.title = _( 'Product Stock List' );
			this._reportRecords.body = records;
        },

        load: function() {
            var cate = new CategoryModel();
            var cateRecords = cate.find('all', {
                fields: ['no','name']
                });
            var dpt = document.getElementById('department_menupopup');

            cateRecords.forEach( function( record ){
                var menuitem = document.createElementNS("http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul","xul:menuitem");
                menuitem.setAttribute('value', record.no);
                menuitem.setAttribute('label', record.no + "-" + record.name);
                dpt.appendChild(menuitem);
            });

            this._enableButton(false);
        }
    });
})();

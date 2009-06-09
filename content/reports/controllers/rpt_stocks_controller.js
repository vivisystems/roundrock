(function(){

    /**
     * RptStocks Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptStocks',
        
        _fileName: "rpt_stocks",

        _set_reportRecords: function(limit) {

            limit = parseInt(limit);
            if (isNaN(limit) || limit <= 0) limit = this._stdLimit;

            var department = document.getElementById('department').value;
            var sortby = document.getElementById( 'sortby' ).value;

            var fields = [ 'cate_no', 'no', 'name', 'stock', 'min_stock' ];

            var conditions = null;

            if (department != "all") {
                var cate = new CategoryModel();
                var cateRecords = cate.find('all', {
                    fields: ['no','name'],
                    conditions: "categories.no LIKE '" + this._queryStringPreprocessor( department ) + "%'",
                    order: 'no, name'
                    });
            } else {
                var cate = new CategoryModel();
                var cateRecords = cate.find('all', {
                    fields: ['no','name'],
                    order: 'no, name'
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
            
            var orderby = 'products.cate_no';
            
            if ( sortby != 'all' )
                switch(sortby) {
                    case 'no':
                    case 'name':
                        orderby += ',products.' + sortby;
                        break;
                    case 'stock':
                    case 'min_stock':
                        orderby += ',products.' + sortby + ' DESC';
                        break;
                }

            var prod = new ProductModel();
            var prodRecords = prod.find('all', { fields: fields, conditions: conditions, order: orderby, limit: this._csvLimit });

            prodRecords.forEach(function(o){
                if (!(o.cate_no in records) && department == 'all') {
                    records[o.cate_no] = {
                        no: o.cate_no,
                        name: _('(rpt)Obsolete Department')
                    };
                }
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

			this._reportRecords.head.title = _( 'Product Stock Report' );
			this._reportRecords.body = records;
        },

        exportCsv: function() {
            this._super(this, true);
        },

        load: function() {
            var cate = new CategoryModel();
            var cateRecords = cate.find('all', {
                fields: ['no','name'],
                order: 'no, name'
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
    };

    RptBaseController.extend(__controller__);
})();

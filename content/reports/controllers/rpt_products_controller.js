(function(){

    /**
     * RptProducts Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptProducts',
        
        _fileName: "rpt_products",

        _set_reportRecords: function(limit) {

            limit = parseInt(limit);
            if (isNaN(limit) || limit <= 0) limit = this._stdLimit;

            var department = document.getElementById('department').value;
            var sortby = document.getElementById( 'sortby' ).value;

            var fields = [];

            var conditions = null;

            if (department != "all") {
                var cate = new CategoryModel();
                var cateRecords = cate.find('all', {
                    fields: ['no','name'],
                    conditions: "categories.no LIKE '" + this._queryStringPreprocessor( department ) + "%'",
                    order: 'no',
                    limit: this._csvLimit
                    });
            } else {
                var cate = new CategoryModel();
                var cateRecords = cate.find('all', {
                    fields: ['no','name'],
                    order: 'no',
                    limit: this._csvLimit
                    });
            }

            var records = [];
            cateRecords.forEach(function(o){
                records[o.no] = {
                    no:o.no,
                    name:o.name
                    };
            });

            var orderby = 'products.cate_no, products.no';
            
            if ( sortby != 'all' )
            	orderby = 'products.cate_no, products.' + sortby;

            var prod = new ProductModel();
            var prodRecords = prod.find('all', { fields: fields, conditions: conditions, order: orderby, limit: this._csvLimit });

            prodRecords.forEach(function(o){
                // does category exist?
                if (!(o.cate_no in records) && department == 'all') {
                    records[o.cate_no] = {
                        no: o.cate_no,
                        name: _('(rpt)Obsolete Department')
                    }
                }
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

        exportCsv: function() {
            this._super(this, true);
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
    };

    RptBaseController.extend(__controller__);
})();

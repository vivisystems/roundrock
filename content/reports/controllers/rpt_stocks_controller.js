( function() {
    /**
     * RptStocks Controller
     */
     
    include( 'chrome://viviecr/content/reports/controllers/rpt_base_controller.js' );

    var __controller__ = {

        name: 'RptStocks',
        
        _fileName: "rpt_stocks",

        _set_reportRecords: function( limit ) {

            limit = parseInt( limit );
            if ( isNaN( limit ) || limit <= 0 ) limit = this._stdLimit;

            var department = document.getElementById( 'department' ).value;
            var sortby = document.getElementById( 'sortby' ).value;
            var show_low_stock = document.getElementById( 'show_low_stock' ).checked;
            var show_maintained_ones = document.getElementById( 'show_maintained_ones' ).checked;
            
            var conditions = "1 = 1";
            if ( show_low_stock == true )
                conditions += " AND s.quantity < p.min_stock";
            if ( show_maintained_ones == true )
                conditions += " AND p.auto_maintain_stock = 1"

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
            cateRecords.forEach( function( o ) {
                records[ o.no ] = {
                    no: o.no,
                    name: o.name,
                    plu: []
                };
            } );

            var groupby;
            
            var orderby = 'p.cate_no';
            
            if ( sortby != 'all' )
                switch(sortby) {
                    case 'no':
                    case 'name':
                        orderby += ', p.' + sortby;
                        break;
                    case 'stock':
                    case 'min_stock':
                        orderby += ', p.' + sortby + ' DESC';
                        break;
                }

            var fields = [
                'p.cate_no',
                'p.no',
                'p.name',
                'p.min_stock',
                'p.auto_maintain_stock',
                's.quantity'
            ];
            
            var sql =
                "SELECT " + fields.join( ", " ) + " FROM products p LEFT JOIN stock_records s ON ( p.no = s.id ) " +
                "WHERE " + conditions + " ORDER BY " + orderby + " LIMIT " + this._csvLimit + ";";
            
            var prod = new ProductModel();
            var prodRecords = prod.getDataSource().fetchAll( sql );

            prodRecords.forEach( function( o ) {
                if ( !( o.cate_no in records ) && department == 'all' ) {
                    records[ o.cate_no ] = {
                        no: o.cate_no,
                        name: _( '(rpt)Obsolete Department' )
                    };
                }
                if ( records[ o.cate_no ] ) {
                    if ( records[ o.cate_no ].plu == null ) {
                        records[ o.cate_no ].plu = [];
                    }
                    records[o.cate_no].plu.push( {
                        cate_no:o.cate_no,
                        no:o.no,
                        name:o.name,
                        stock:o.quantity,
                        min_stock:o.min_stock
                    } );
                }
            } );

			this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.stocks.label' );
			this._reportRecords.body = records;
        },

        exportCsv: function() {
            this._super(this, true);
        },

        load: function() {
            this._super();
            
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
        }
    };

    RptBaseController.extend( __controller__ );
} )();

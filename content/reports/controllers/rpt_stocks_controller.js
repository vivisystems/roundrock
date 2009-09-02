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
            if ( isNaN( limit ) || limit <= 0 )
                limit = this._stdLimit;

            var department = document.getElementById( 'department' ).value;
            var sortby = document.getElementById( 'sortby' ).value;
            var show_low_stock = document.getElementById( 'show_low_stock' ).checked;
            var show_maintained_ones = document.getElementById( 'show_maintained_ones' ).checked;
            
            var conditions = "1 = 1";
            if ( show_low_stock == true )
                conditions += " AND s.quantity < p.min_stock";
            if ( show_maintained_ones == true )
                conditions += " AND p.auto_maintain_stock = 1"

            if ( department != "all" ) {
                var cate = new CategoryModel();
                var cateRecords = cate.find( 'all', {
                    fields: [ 'no', 'name' ],
                    conditions: "categories.no LIKE '" + this._queryStringPreprocessor( department ) + "%'",
                    order: 'no, name'
                } );
            } else {
                var cate = new CategoryModel();
                var cateRecords = cate.find( 'all', {
                    fields: [ 'no', 'name' ],
                    order: 'no, name'
                } );                
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
                'p.max_stock',
                'p.auto_maintain_stock',
                'p.link_group',
                's.quantity'
            ];
            
            var prod = new ProductModel();
            
            // attach inventory DB file.
            var stockRecordModel = new StockRecordModel();
            var stockRecordDB = stockRecordModel.getDataSource().path + '/' + stockRecordModel.getDataSource().database;
            var sql = "ATTACH '" + stockRecordDB + "' AS inventory;";
            prod.execute( sql );
            
            // Calculate the number of rows in the database.
            sql = "SELECT COUNT( p.id ) AS numRows " + " FROM products p LEFT JOIN stock_records s ON ( p.no = s.id ) " +
                "WHERE " + conditions + " ORDER BY " + orderby + ";";
            var numRows = prod.getDataSource().fetchAll( sql );
            numRows = numRows[ 0 ].numRows;
            
            sql =
                "SELECT " + fields.join( ", " ) + " FROM products p LEFT JOIN stock_records s ON ( p.no = s.id ) " +
                "WHERE " + conditions + " ORDER BY " + orderby + " LIMIT " + limit + ";";
            var prodRecords = prod.getDataSource().fetchAll( sql );
            
            sql = "DETACH inventory;";
            prod.execute( sql );
            
            // retrieve all product groups.
            /*var pluGroupModel = new PlugroupModel();
            var pluGroups = pluGroupModel.find( "all", {
                fields: [ "id", "name" ]
            } );
            
            var pluGroupRecords = {};
            
            pluGroups.forEach( function( pluGroup ) {
                pluGroupRecords[ pluGroup.id ] = {
                    no: "Linking Group",
                    name: pluGroup.name,
                    plu: []
                };
            } );
            
            var otherLinkGroup = "others";
            pluGroupRecords[ otherLinkGroup ] = {
                no: "Linking Group",
                name: "Others",
                plu: []
            };*/

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
                        cate_no: o.cate_no,
                        no: o.no,
                        name: o.name,
                        stock: o.quantity,
                        min_stock: o.min_stock,
                        max_stock: o.max_stock,
                        delta: (o.max_stock == 0) ? '' : Math.max(0, o.max_stock - o.quantity)
                    } );
                }
                
                /*var product = {
                    cate_no:o.cate_no,
                    no:o.no,
                    name:o.name,
                    stock:o.quantity,
                    min_stock:o.min_stock
                };
                
                if ( o.link_group ) {
                    var linkGroups = o.link_group.split( ',' );
                    linkGroups.forEach( function( linkGroup ) {
                        pluGroupRecords[ linkGroup ].plu.push( product );
                    } );
                } else {
                    pluGroupRecords[ otherLinkGroup ].plu.push( product );
                }*/
            }, this );

			this._reportRecords.head.title = _( 'vivipos.fec.reportpanels.stocks.label' );
			this._reportRecords.body = records;//pluGroupRecords;
			this._reportRecords.rowLimitExcess = numRows > limit;
        },

        exportCsv: function() {
            this._super(this);
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

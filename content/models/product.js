( function() {
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }
        
    // GREUtils.define('ViviPOS.ProductModel');
    // ViviPOS.ProductModel = AppModel.extend({
    var ProductModel = window.ProductModel = AppModel.extend({
        name: 'Product',
        useDbConfig: 'default',

        hasOne: [{name: 'StockRecord', 'primaryKey': 'no', 'foreignKey': 'id'}],
        
        checkUnique: function() {
	    return 	this.items;
        },

        getProductsWithSession: function(cached) {

            cached = cached || false;

            var startTime = Date.now().getTime();

            var products = null;

            if (cached) {
                products = GeckoJS.Session.get('products');
            }

            if (products == null) {

                products = this.getDataSource().fetchAll("SELECT id,cate_no,no,barcode,visible,append_empty_btns,link_group FROM products ORDER BY cate_no, display_order, name, no ");
                if (products && products.length > 0) GeckoJS.Session.add('products', products);

                dump('find all product:  ' + (Date.now().getTime() - startTime) + '\n');
            }

            return products;

        },

        prepareProductCached: function(products) {

            products = products || this.getProductsWithSession(true);

            var byId ={}, indexCate = {}, indexCateAll={}, indexLinkGroup = {}, indexLinkGroupAll={}, indexBarcode = {};

            var startTime = Date.now().getTime();

            if (!products) return ;

            products.forEach(function(product) {

                // load set items
                /*
                var setItemModel = new SetItemModel();
                var setitems = setItemModel.findByIndex('all', {
                    index: 'pluset_no',
                    value: product.no,
                    order: 'sequence'
                });

                product.SetItem = setitems;
                */

                product._full_object_ = false;

                if (product.barcode == null) {
                    product.barcode = "";
                }

                if (product.id.length > 0) {
                    byId[product.id] = product;
                }

                if (product.barcode.length > 0) {
                    indexBarcode[product.barcode] = product.id;
                }

                if (product.no.length > 0 && (product.barcode != product.no) ) {
                    indexBarcode[product.no] = product.id;
                }
                if (product.cate_no.length > 0) {
                    if (typeof indexCate[product.cate_no] == 'undefined') {
                        indexCate[product.cate_no] = [];
                        indexCateAll[product.cate_no] = [];
                    }
                    indexCateAll[(product.cate_no+"")].push((product.id+""));

                    /* administractor dont display empty button
                    if (product.append_empty_btns > 0) {
                        for (var ii=0; ii<product.append_empty_btns; ii++ ) {
                            indexCateAll[(product.cate_no+"")].push("");
                        }
                    }*/

                    if(GeckoJS.String.parseBoolean(product.visible)) {
                        indexCate[(product.cate_no+"")].push((product.id+""));
                        if (product.append_empty_btns && product.append_empty_btns > 0) {
                            for (var jj=0; jj<product.append_empty_btns; jj++ ) {
                                indexCate[(product.cate_no+"")].push("");
                            }
                        }
                    }
                }

                if (product.link_group && product.link_group.length > 0) {
                    var groups = product.link_group.split(',');

                    groups.forEach(function(group) {

                        if (typeof indexLinkGroup[group] == 'undefined') {
                            indexLinkGroup[group] = [];
                            indexLinkGroupAll[group] = [];
                        }
                        indexLinkGroupAll[(group+"")].push((product.id+""));
                        if(GeckoJS.String.parseBoolean(product.visible)) indexLinkGroup[(group+"")].push((product.id+""));

                    });
                }
            });

            dump('after product.forEach:  ' + (Date.now().getTime() - startTime) + '\n');

            GeckoJS.Session.add('productsById', byId);
            GeckoJS.Session.add('barcodesIndexes', indexBarcode);
            GeckoJS.Session.add('productsIndexesByCate', indexCate);
            GeckoJS.Session.add('productsIndexesByCateAll', indexCateAll);
            GeckoJS.Session.add('productsIndexesByLinkGroup', indexLinkGroup);
            GeckoJS.Session.add('productsIndexesByLinkGroupAll', indexLinkGroupAll);

            /*
            this.log(this.dump(GeckoJS.Session.get('productsById')));
            this.log(this.dump(GeckoJS.Session.get('productsIndexesByCate')));
            this.log(this.dump(GeckoJS.Session.get('productsIndexesByCateAll')));
            this.log(this.dump(GeckoJS.Session.get('barcodesIndexes')));
            this.log(this.dump(GeckoJS.Session.get('productsIndexesByLinkGroup')));
            this.log(this.dump(GeckoJS.Session.get('productsIndexesByLinkGroupAll')));
            */
            
        },

        setProductToSession: function (id, new_product) {
            
            // var products = this.getProductsWithSession(true);
            var productsById = GeckoJS.Session.get('productsById');
            var product = null;

            if (new_product) {
                if(!productsById[id]) productsById[id] = {};
                product = GREUtils.extend(productsById[id], new_product);
                delete product._full_object_;
            }

            return product;
        },
        
        getProductById: function(id, useDb) {
            useDb = useDb || false;

            // var products = this.getProductsWithSession(true);
            var productsById = GeckoJS.Session.get('productsById');
            var product = null;

            if (!useDb) {
                
                product = productsById[id];

                if (!product || product._full_object_ === false) {
                    useDb = true;
                }
            }

            if (useDb) {
                var productObj = this.findById(id, {recursive: 0});

                if (productObj) {
                    product = this.setProductToSession(id, productObj.Product);
                }
            }

            return product;
            
        },

        getProductByNo: function(no, useDb) {
            useDb = useDb || false;

            // var products = this.getProductsWithSession(true);
            var productsById = GeckoJS.Session.get('productsById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var product = null;

            if (!useDb) {
                if(barcodesIndexes[no]) {
                    product = productsById[barcodesIndexes[no]];

                    if (!product || product._full_object_ === false) {
                        useDb = true;
                    }
                }else {
                    useDb = true;
                }
            }

            if (useDb) {
                var productObj = this.find('first', {conditions: "no='"+no+"'", recursive: 0});
                if (productObj) {
                    var id = productObj.id;
                    if(!productsById[id]) productsById[id] = {};
                    product = GREUtils.extend(productsById[id], productObj.Product);
                    delete product._full_object_;
                }
            }

            return product;
        },

        getProductByBarcode: function(barcode, useDb) {

            useDb = useDb || false;

            // var products = this.getProductsWithSession(true);
            var productsById = GeckoJS.Session.get('productsById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var product = null;

            if (!useDb) {
                if(barcodesIndexes[barcode]) {
                    product = productsById[barcodesIndexes[barcode]];

                    if (!product || product._full_object_ === false) {
                        useDb = true;
                    }
                }else {
                    useDb = true;
                }
            }

            if (useDb) {
                var productObj = this.find('first', {conditions: "barcode='"+barcode+"'", recursive: 0});
                if (productObj) {
                    var id = productObj.id;
                    if(!productsById[id]) productsById[id] = {};
                    product = GREUtils.extend(productsById[id], productObj.Product);
                    delete product._full_object_;
                }
            }

            return product;
        }



    });
} )();

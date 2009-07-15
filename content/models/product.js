( function() {
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'Product',

        useDbConfig: 'default',

        hasOne: [{name: 'StockRecord', 'primaryKey': 'no', 'foreignKey': 'id'}],

        checkUnique: function() {
	    return 	this.items;
        },

        getProducts: function(cached) {

            cached = cached || false;

            var startTime = Date.now().getTime();

            var products = null;

            if (cached) {
                products = GeckoJS.Session.get('products');
            }

            if (products == null) {

                products = this.getDataSource().fetchAll("SELECT id,cate_no,no,barcode,visible,append_empty_btns,link_group FROM products ORDER BY cate_no, display_order, name, no ");

                dump('find all product:  ' + (Date.now().getTime() - startTime) + '\n');
            }

            return products;

        },

        prepareProductsSession: function(products) {

            products = products || this.getProducts(true);

            if (products && products.length > 0) {
                GeckoJS.Session.add('products', products);
            }

            var byId ={}, indexId={}, indexCate = {}, indexCateAll={}, indexLinkGroup = {}, indexLinkGroupAll={}, indexBarcode = {};

            var startTime = Date.now().getTime();

            if (!products) return ;

            products.forEach(function(product, idx) {

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
                    indexId[product.id] = idx;
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
            GeckoJS.Session.add('productsIndexesById', indexId);
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

        setProduct: function (id, new_product, useDb) {

            useDb = useDb || false;

            var productsById = GeckoJS.Session.get('productsById');
            var products = GeckoJS.Session.get('products');
            var indexesById = GeckoJS.Session.get('productsIndexesById');
            
            var product = null;

            if (new_product) {
                if(!productsById[id]) {

                    productsById[id] = {};
                    var newLength = products.push(productsById[id]);
                    indexesById[id] = (newLength-1);
                    
                }
                product = GREUtils.extend(productsById[id], new_product);
                delete product._full_object_;
            }

            if (useDb) {
                this.id = id;
                this.save(new_product);

                // return product || new_product as product
                // XXXX find by db ?
                product = product || new_product;
            }

            return product;
        },

        isExists: function(id, useDb) {
            return ((this.getProductById(id, useDb) == null) ? false : true );
        },

        deleteProduct: function (id, useDb) {

            useDb = useDb || false;

            var productsById = GeckoJS.Session.get('productsById');
            var products = GeckoJS.Session.get('products');
            var indexesById = GeckoJS.Session.get('productsIndexesById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');


            if (this.isExists(id, useDb)) {

                var oldProduct = this.getProductById(id);
                var oldNo = oldProduct['no'] + "";
                var oldBarcode = oldProduct['barcode'] + "";

                // remove products session.
                var index = indexesById[id];
                products.splice(index, 1);

                // remove byId
                delete productsById[id];
                delete indexesById[id];

                // remove barcode/no
                if (oldNo.length > 0) {
                    delete barcodesIndexes[oldNo];
                }
                if (oldBarcode.length > 0) {
                    delete barcodesIndexes[oldBarcode];
                }

                return true;
            }

            return false;
            
        },

        setProductById: function (id, new_product, useDb) {

            return this.setProduct(id, new_product, useDb);

        },

        getProductById: function(id, useDb) {
            useDb = useDb || false;

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
                    product = this.setProduct(id, productObj.Product);
                }
            }

            return product;

        },

        getProductByNo: function(no, useDb) {
            useDb = useDb || false;

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
                    product = this.setProduct(productObj.id, productObj.Product);
                }
            }

            return product;
        },

        getProductByBarcode: function(barcode, useDb) {

            useDb = useDb || false;

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
                    product = this.setProduct(productObj.id, productObj.Product);
                }
            }

            return product;
        }

    };

    // GREUtils.define('ViviPOS.ProductModel');
    // ViviPOS.ProductModel = AppModel.extend({
    var ProductModel = window.ProductModel = AppModel.extend(__model__);
} )();

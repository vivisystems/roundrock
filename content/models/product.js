( function() {
    if(typeof AppModel == 'undefined') {
        include( 'chrome://viviecr/content/models/app.js' );
    }

    var __model__ = {

        name: 'Product',

        useDbConfig: 'default',

        hasOne: [{
            name: 'StockRecord',
            'primaryKey': 'no',
            'foreignKey': 'id'
        }],

        checkUnique: function() {
            return 	this.items;
        },

        getProducts: function(useDb) {

            useDb = useDb || false;

            var startTime = Date.now().getTime();

            var products = null;

            if (!useDb) {
                products = GeckoJS.Session.get('products');
            }

            if (products == null) {

                products = this.getDataSource().fetchAll("SELECT id,cate_no,no,name,barcode,visible,icon_only,button_color,font_size,sale_unit,append_empty_btns,link_group,cond_group FROM products ORDER BY cate_no, display_order, name, no ");

            }
            dump('find all product:  ' + (Date.now().getTime() - startTime) + '\n');
            
            return products;

        },

        prepareProductsSession: function(products) {

            products = products || this.getProducts();

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
            /*
            // load set items
            var setItemModel = new SetItemModel();
            var setitemPlusets = setItemModel.getDataSource().fetchAll('select distinct pluset_no from set_items');
            setitemPlusets.forEach(function(setitemPluset){
                if (typeof indexBarcode[setitemPluset.pluset_no] != 'undefined') {
                    // mark product has set items;
                    byId[indexBarcode[setitemPluset.pluset_no]]._has_setitem_ = true;
                }
            });
            dump(this.dump(setitemPlusets));
            */

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

        updateProductSession: function(mode, product, oldProduct) {

            var products = GeckoJS.Session.get('products');
            var productsById = GeckoJS.Session.get('productsById');
            var indexesById = GeckoJS.Session.get('productsIndexesById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var indexCate = GeckoJS.Session.get('productsIndexesByCate');
            var indexCateAll = GeckoJS.Session.get('productsIndexesByCateAll');
            var indexLinkGroup = GeckoJS.Session.get('productsIndexesByLinkGroup');
            var indexLinkGroupAll = GeckoJS.Session.get('productsIndexesByLinkGroupAll');

            try {

                switch (mode) {

                    case 'create':

                        if (product.barcode.length > 0) {
                            barcodesIndexes[product.barcode] = product.id;
                        }

                        if (product.no.length > 0) {
                            barcodesIndexes[product.no] = product.id;
                        }

                        if (product.cate_no.length > 0) {

                            if (typeof indexCate[product.cate_no] == 'undefined') {
                                indexCate[product.cate_no] = [];
                                indexCateAll[product.cate_no] = [];
                            }
                            indexCateAll[(product.cate_no+"")].push((product.id+""));

                            if(GeckoJS.String.parseBoolean(product.visible)) {
                                indexCate[(product.cate_no+"")].push((product.id+""));

                                // if append_empty_btns
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
                        break;

                    case 'update':

                        // remove old barcode
                        if (oldProduct.barcode.length > 0) {
                            delete barcodesIndexes[oldProduct.barcode];
                        }

                        // add new barcode
                        if (product.barcode.length > 0) {
                            barcodesIndexes[product.barcode] = product.id;
                        }

                        var indexCateAllArray = indexCateAll[(oldProduct.cate_no+"")];
                        var indexCateArray = indexCate[(oldProduct.cate_no+"")];

                        if (oldProduct.cate_no != product.cate_no || oldProduct.visible != product.visible) {

                            // remove old category
                            var index = -1;
                            for (var i = 0; i < indexCateAllArray.length; i++) {
                                if (indexCateAllArray[i] == oldProduct.id) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index > -1)
                                indexCateAllArray.splice(index, 1);

                            var index = -1;
                            for (var i = 0; i < indexCateArray.length; i++) {
                                if (indexCateArray[i] == oldProduct.id) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index > -1) {
                                indexCateArray.splice(index, 1);
                            }

                            if (oldProduct.append_empty_btns && oldProduct.append_empty_btns > 0) {
                                indexCateArray.splice(index, oldProduct.append_empty_btns);
                            }

                            // add new category
                            if (product.cate_no.length > 0) {
                                if (typeof indexCate[product.cate_no] == 'undefined') {
                                    indexCate[product.cate_no] = [];
                                    indexCateAll[product.cate_no] = [];
                                }
                                indexCateAll[(product.cate_no+"")].push((product.id+""));
                                if(GeckoJS.String.parseBoolean(product.visible)) {
                                    indexCate[(product.cate_no+"")].push((product.id+""));

                                    // if append_empty_btns
                                    if (product.append_empty_btns && product.append_empty_btns > 0) {
                                        for (var jj=0; jj<product.append_empty_btns; jj++ ) {
                                            indexCate[(product.cate_no+"")].push("");
                                        }
                                    }
                                }
                            }
                        }

                        // support append empty buttons
                        if (oldProduct.append_empty_btns != product.append_empty_btns) {
                            var index = -1;
                            for (var i = 0; i < indexCateArray.length; i++) {
                                if (indexCateArray[i] == oldProduct.id) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index > -1) {
                                indexCateArray.splice(index+1, oldProduct.append_empty_btns);

                                for(var kk = 0; kk < product.append_empty_btns; kk++) {
                                    indexCateArray.splice(index+1, 0, "");
                                }

                            }

                        }

                        // always remove old product group(s) first
                        if (oldProduct.link_group && oldProduct.link_group.length > 0) {

                            var groups = oldProduct.link_group.split(',');

                            groups.forEach(function(group) {

                                var indexLinkGroupArray = indexLinkGroup[(group+"")];
                                var indexLinkGroupAllArray = indexLinkGroupAll[(group+"")];

                                var index = -1;
                                for (var i = 0; i < indexLinkGroupAllArray.length; i++) {
                                    if (indexLinkGroupAllArray[i] == oldProduct.id) {
                                        index = i;
                                        break;
                                    }
                                }
                                if (index > -1)
                                    indexLinkGroupAllArray.splice(index, 1);

                                var index = -1;
                                for (var i = 0; i < indexLinkGroupArray.length; i++) {
                                    if (indexLinkGroupArray[i] == oldProduct.id) {
                                        index = i;
                                        break;
                                    }
                                }
                                if (index > -1)
                                    indexLinkGroupArray.splice(index, 1);
                            });
                        }

                        // add new product group(s) if any
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
                        break;

                    case 'remove':

                        var oldNo = product['no'] + "";
                        var oldBarcode = product['barcode'] + "";

                        // remove barcode/no
                        if (oldNo.length > 0) {
                            delete barcodesIndexes[oldNo];
                        }
                        if (oldBarcode.length > 0) {
                            delete barcodesIndexes[oldBarcode];
                        }

                        // update department cache
                        if (product.cate_no.length > 0) {

                            var indexCateAllArray = indexCateAll[(product.cate_no+"")];
                            var indexCateArray = indexCate[(product.cate_no+"")];

                            var index = -1;
                            for (var i = 0; i < indexCateAllArray.length; i++) {
                                if (indexCateAllArray[i] == product.id) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index > -1)
                                indexCateAllArray.splice(index, 1);

                            var index = -1;
                            for (var i = 0; i < indexCateArray.length; i++) {
                                if (indexCateArray[i] == product.id) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index > -1) {
                                indexCateArray.splice(index, 1);
                                indexCateArray.splice(index, product.append_empty_btns);
                            }

                        }

                        // update product group cache
                        if (product.link_group && product.link_group.length > 0) {

                            var groups = product.link_group.split(',');

                            groups.forEach(function(group) {

                                var indexLinkGroupArray = indexLinkGroup[(group+"")];
                                var indexLinkGroupAllArray = indexLinkGroupAll[(group+"")];

                                var index = -1;
                                for (var i = 0; i < indexLinkGroupAllArray.length; i++) {
                                    if (indexLinkGroupAllArray[i] == product.id) {
                                        index = i;
                                        break;
                                    }
                                }
                                if (index > -1)
                                    indexLinkGroupAllArray.splice(index, 1);

                                var index = -1;
                                for (var i = 0; i < indexLinkGroupArray.length; i++) {
                                    if (indexLinkGroupArray[i] == product.id) {
                                        index = i;
                                        break;
                                    }
                                }
                                if (index > -1)
                                    indexLinkGroupArray.splice(index, 1);
                            });
                        }
                        break;
                }
            
            }catch(e) {
                this.log('ERROR', 'updateProductSession Error');
            }

        },


        setProduct: function (id, new_product, useDb) {

            useDb = useDb || false;

            var products = GeckoJS.Session.get('products');
            var productsById = GeckoJS.Session.get('productsById');
            var indexesById = GeckoJS.Session.get('productsIndexesById');

            var product = null;
            var oldProduct = null;
            
            var mode = 'create';


            if (useDb) {
                this.id = id;
                this.save(new_product);
            }
            
            // update session
            if (new_product) {

                // no product in session.
                if(!productsById[id]) {

                    productsById[id] = {};
                    var newLength = products.push(productsById[id]);
                    indexesById[id] = (newLength-1);

                    mode = 'create';
                    
                }else {
                    mode = 'update';
                    // clone old product
                    oldProduct = GREUtils.extend({}, productsById[id]);
                }

                product = GREUtils.extend(productsById[id], new_product);

                //  trick , maybe getproduct from db ?
                //  XXXX
                if(typeof product.modified != 'undefined') {
                    // delete full_object flag
                    if (typeof product._full_object_ != 'undefined'){
                        delete product._full_object_;
                    }
                }
            }

            // update product relative session
            if(product) {
                this.updateProductSession(mode, product, oldProduct);
            }

            return product;
        },

        isExists: function(id, useDb) {
            return ((this.getProductById(id, useDb) == null) ? false : true );
        },

        removeProduct: function (id, useDb) {

            useDb = useDb || false;

            var products = GeckoJS.Session.get('products');
            var productsById = GeckoJS.Session.get('productsById');
            var indexesById = GeckoJS.Session.get('productsIndexesById');

            if (this.isExists(id, useDb)) {

                var oldProduct = GREUtils.extend({}, this.getProductById(id));

                // remove product session.
                var index = indexesById[id];
                products.splice(index, 1);

                delete productsById[id];
                delete indexesById[id];

                // remove product relative session
                this.updateProductSession('remove', oldProduct);

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
                var productObj = this.findById(id, {
                    recursive: 0
                });

                if (productObj) {
                    // load set items on needed
                    var setItemModel = new SetItemModel();
                    var setitems = setItemModel.findByIndex('all', {
                        index: 'pluset_no',
                        value: productObj.no,
                        order: 'sequence',
                        recursive: 0
                    });
                    productObj.Product.SetItem = setitems;
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
                var productObj = this.find('first', {
                    conditions: "no='"+no+"'",
                    recursive: 0
                });

                if (productObj) {
                    // load set items on needed
                    var setItemModel = new SetItemModel();
                    var setitems = setItemModel.findByIndex('all', {
                        index: 'pluset_no',
                        value: productObj.no,
                        order: 'sequence',
                        recursive: 0
                    });
                    productObj.Product.SetItem = setitems;
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
                var productObj = this.find('first', {
                    conditions: "barcode='"+barcode+"'",
                    recursive: 0
                });

                if (productObj) {
                    // load set items on needed
                    var setItemModel = new SetItemModel();
                    var setitems = setItemModel.findByIndex('all', {
                        index: 'pluset_no',
                        value: productObj.no,
                        order: 'sequence',
                        recursive: 0
                    });
                    productObj.Product.SetItem = setitems;
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

(function(){

    /**
     * Class PlusController
     */
    var __controller__ = {

        name: 'Plus',
        screenwidth: 800,
        screenheight: 600,
        _selectedIndex: null,
        _selCateNo: null,
        _selCateName: null,
        _selCateIndex: null,
        components: ['Tax'],
        
        catePanelView: null,
        productPanelView: null,
        _pluset: [],
        _selectedPluSetIndex: null,


        createGroupPanel: function () {

            this.screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            this.screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            var pluGroupModel = new PlugroupModel();
            var groups = pluGroupModel.find('all');

            var group_listscrollablepanel = document.getElementById('group_listscrollablepanel');
            var plugroupPanelView = new NSIPluGroupsView(groups);
            group_listscrollablepanel.datasource = plugroupPanelView;

            var condGroups = GeckoJS.Session.get('condGroups');

            var condimentscrollablepanel = document.getElementById('condimentscrollablepanel');
            var condGroupPanelView = new NSICondGroupsView(condGroups);
            condimentscrollablepanel.datasource = condGroupPanelView;


            doSetOKCancel(
                function(){
                    return true;
                },
                function(){
                    return true;
                }
            );
        },

        createPluPanel: function () {
            // NSIDepartmentsView use rows and columns from preferences, so let's
            // save rows and columns attribute values here and restore them later
            var catpanel = document.getElementById('catescrollablepanel');
            var rows = catpanel.getAttribute('rows');
            var cols = catpanel.getAttribute('cols');

            this.catePanelView =  new NSIDepartmentsView('catescrollablepanel');

            // restore department panel rows and columns here
            catpanel.setAttribute('rows', rows);
            catpanel.setAttribute('cols', cols);
            catpanel.initGrid();

            var prodpanel = document.getElementById('prodscrollablepanel');
            rows = prodpanel.getAttribute('rows');
            cols = prodpanel.getAttribute('cols');

            this.productPanelView = new NSIPlusView('prodscrollablepanel');

            // restore department panel rows and columns here
            prodpanel.setAttribute('rows', rows);
            prodpanel.setAttribute('cols', cols);
            prodpanel.initGrid();

            this.catePanelView.hideInvisible = false;
            this.catePanelView.refreshView(true);

            this.productPanelView.hideInvisible = false;
            this.productPanelView.updateProducts();

            this.productPanelView.setCatePanelView(this.catePanelView);

            catpanel.selectedIndex = -1;
            catpanel.selectedItems = [];

            // set default tax rate
            var defaultRate = this.getDefaultRate();
            var rateName = (defaultRate == null) ? '' : this.getRateName(defaultRate);
            var rateNode = document.getElementById('rate');
            var rateNameNode = document.getElementById('rate_name');

            rateNode.setAttribute('default', defaultRate);
            rateNameNode.setAttribute('default', rateName);

            // initialize input field states
            this.validateForm(true);
        },

        changePluPanel: function(index) {

            this.productPanelView.setCatePanelIndex(index);
            var category = this.catePanelView.getCurrentIndexData(index);
            if (this._selCateIndex != index && category != null) {
                this._selCateNo = category.no;
                this._selCateName = category.name;
                this._selCateIndex = index;
                $('#cate_no').val(category.no);
                $('#cate_name').val(category.name);
                this.clickPluPanel(-1);
            }
        },

        getDefaultRate: function() {
            var defaultRate = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');
            if (defaultRate != null) return defaultRate;

            var taxes = GeckoJS.Session.get('taxes');
            if (taxes == null) taxes = this.Tax.getTaxList();
            if (taxes != null) return taxes[0].id;
            return null;
        },

        getRateName: function(rate) {
            if (rate == null) return '';

            var taxes = GeckoJS.Session.get('taxes');
            if (taxes == null) taxes = this.Tax.getTaxList();

            // look for rate name
            var ratename = rate;
            for (var i = 0; i < taxes.length; i++) {
                if (taxes[i].no == rate) {
                    ratename = taxes[i].name;
                    break;
                }
            }
            return ratename;
        },

        clickPluPanel: function(index) {
            var product = this.productPanelView.getCurrentIndexData(index);
            var plupanel = document.getElementById('prodscrollablepanel');

            this._selectedIndex = index;
            plupanel.selectedIndex = index;
            plupanel.selectedItems = [index];
            plupanel.ensureIndexIsVisible(index);
            
            if (product) {
                product.cate_name = this._selCateName;
                this.setInputData(product);

                var rate = product.rate;
                $('#rate').val(rate);
                $('#rate_name').val(this.getRateName(rate));
            }
            else {
                var valObj = this.getInputDefault();
                valObj.cate_no = this._selCateNo;
                valObj.cate_name = this._selCateName;
                this.setInputData(valObj);
            }
            
            this.validateForm(index == -1);
        },

        getDepartment: function () {
            var cate_no = $('#cate_no').val();
            var cates_data = GeckoJS.Session.get('categories');

            var aURL = 'chrome://viviecr/content/select_department.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            var inputObj = {
                cate_no: cate_no,
                depsData: cates_data,
                index: this._selCateIndex
            };
            window.openDialog(aURL, 'select_department', features, inputObj);

            if (inputObj.ok && inputObj.cate_no) {
                $('#cate_no').val(inputObj.cate_no);
                $('#cate_name').val(inputObj.cate_name);
            }
        },

        getRate: function () {
            var rate = $('#rate').val();
            var aURL = 'chrome://viviecr/content/select_tax.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            var inputObj = {
                rate: rate
            };

            var taxes = GeckoJS.Session.get('taxes');
            if(taxes == null) taxes = this.Tax.getTaxList();

            inputObj.taxes = taxes;
            
            window.openDialog(aURL, 'select_rate', features, inputObj);
            if (inputObj.ok && inputObj.rate) {
                $('#rate').val(inputObj.rate);
                $('#rate_name').val(inputObj.name);
            }
        },
        
        getPluSetListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('plusetscrollablepanel');
            }
            return this._listObj;
        },

        clickPluSetsPanel: function (index) {
            this._selectedPluSetIndex = index;
        },

        _searchPlu: function (barcode) {
            $('#plu').val('').focus();
            if (barcode == '') return;

            var productsById = GeckoJS.Session.get('productsById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var product;

            if (!barcodesIndexes[barcode]) {
                // barcode notfound
                return null;
            }else {
                var id = barcodesIndexes[barcode];
                product = productsById[id];
                return product;
            }
        },

        removePluSet: function (){
            if (this._selectedPluSetIndex == null) return;
            this._pluset.splice(this._selectedPluSetIndex, 1);
            var panelView =  new GeckoJS.NSITreeViewArray(this._pluset);
            this.getPluSetListObj().datasource = panelView;

            var setmenu = [];
            this._pluset.forEach(function(o){
                setmenu.push(encodeURI(o.no + '=' + o.qty));
            });
            $('#setmenu').val( setmenu.join('&'));
        },

        _setPluSet: function () {
            var productsById = GeckoJS.Session.get('productsById');
            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var str = $('#setmenu').val();

            var pluset = GeckoJS.String.parseStr(str);

            // this.log('pluset:' + this.dump(pluset));

            this._pluset = [];
            for (var key in pluset) {
                key = decodeURI(key);
                if (key == '') break;
                
                var qty = pluset[key];
                try {
                    var id = barcodesIndexes[key];
                    var name = productsById[id].name;
                    this._pluset.push({
                        no: key,
                        name: name,
                        qty: qty
                    });
                } catch (e) {
                    var id = '';
                    var name = '';
                }
                
            };

            var panelView =  new GeckoJS.NSITreeViewArray(this._pluset);
            this.getPluSetListObj().datasource = panelView;
        },

        /*
        getCondiment: function () {
            var cond_group = $('#cond_group').val();
            var aURL = 'chrome://viviecr/content/select_condgroup.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            var inputObj = {
                cond_group: cond_group
            };
            window.openDialog(aURL, 'select_cond_group', features, inputObj);

            if (inputObj.ok) {
                $('#cond_group').val(inputObj.cond_group);
                $('#cond_group_name').val(inputObj.cond_group_name);
            }
        },

        _setCondimentGroup: function () {
            var cond_group = document.getElementById('cond_group').value;
            var cond_group_name = '';

            if (cond_group != null) {
                var condGroupModel = new CondimentGroupModel();
                var condGroup = condGroupModel.findById(cond_group);
                if (condGroup) {
                    cond_group_name = condGroup.name;
                }
            }
            document.getElementById('cond_group_name').value = cond_group_name;
        },*/

        getPlu: function (){

            var aURL = 'chrome://viviecr/content/prompt_addpluset.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {
                input0:null, require0:true, alphaOnly0:true,
                input1:1, require1:true, numberOnly1:true
            };

            window.openDialog(aURL, _('Add New Product Set'), features, _('Product Set'), '', _('Product No.or Barcode'), _('Quantity'), inputObj);

            if (inputObj.ok && inputObj.input0 && inputObj.input1) {
                var product = this._searchPlu(inputObj.input0);
                if (product) {
                    // validate product - must not be a product set itself, must not be this product set
                    var formData = this.getInputData();
                    if (product.no == formData.no) {
                        //@todo OSD?
                        GREUtils.Dialog.alert(window,
                                              _('Product Set'),
                                              _('[%S] (%S) may not be a member of its own product set.', [product.name, inputObj.input0]));
                        return;
                    }

                    if (product.setmenu != null && product.setmenu.length > 0) {
                        GREUtils.Dialog.alert(window,
                                              _('Product Set'),
                                              _('[%S] (%S) is a product set and may not be a member of another product set.', [product.name, inputObj.input0]));
                        return;
                    }

                    var inputData = {
                        no: product.no,
                        name: product.name,
                        qty: inputObj.input1
                    };

                    var index = this.getPluSetListObj().currentIndex;

                    if (index < 0)
                        this._pluset.push(inputData);
                    else {
                        this._pluset.splice(index, 0, inputData);
                    }

                    var panelView =  new GeckoJS.NSITreeViewArray(this._pluset);
                    this.getPluSetListObj().datasource = panelView;
                    var setmenu = [];
                    this._pluset.forEach(function(o){
                        setmenu.push(encodeURI(o.no + '=' + o.qty));
                    });
                    $('#setmenu').val( setmenu.join('&'));
                }
                else {
                    GREUtils.Dialog.alert(window,
                                          _('Product Set'),
                                          _('Product not found [%S].', [inputObj.input0]));
                }
            }

        },

        initDefaultTax: function () {

            // make sure tax rate field is always populated
            var rate = '';
            var taxes = GeckoJS.Session.get('taxes');
            if (taxes == null) taxes = this.Tax.getTaxList();

            // set rate to system default
            var taxid = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');
            if (taxid == null) {
                if (taxes && taxes.length > 0) taxid = taxes[0].id;
            }

            // go from rate ID to rate no
            for (var i = 0; i < taxes.length; i++) {
                if (taxes[i].id == taxid) {
                    rate = taxes[i].no;
                    break;
                }
            }
            $('#rate')[0].setAttribute('default', rate);

            // look up rate_name from rate id
            var rate_name = rate;
            for (var i = 0; i < taxes.length; i++) {
                if (taxes[i].no == rate) {
                    rate_name = taxes[i].name;
                    break;
                }
            }
            $('#rate_name')[0].setAttribute('default', rate_name);

        },

        disableInputData: function (disabled) {
            this.query('[form=productForm]').each(function() {
                if (this.id == 'level_enable1') return;
                
                if (disabled)
                    this.setAttribute('disabled', true);
                else
                    this.removeAttribute('disabled');
            });
        },

        getInputDefault: function () {
            var valObj = {};
            this.query('[form=productForm]').each(function() {
                var n = this.name || this.getAttribute('name');
                if (!n) return;
                var v = this.getAttribute('default');
                if (typeof v != 'undefined') {
                    valObj[n] = v;
                }
            });
            return valObj;

        },

        getInputData: function () {
            return GeckoJS.FormHelper.serializeToObject('productForm', false);
        },

        resetInputData: function () {
            GeckoJS.FormHelper.reset('productForm');
        },

        setInputData: function (valObj) {
            GeckoJS.FormHelper.unserializeFromObject('productForm', valObj);
            this._setPluSet();
            // this._setCondimentGroup();
            if (valObj) {
                var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
                var sPluDir = datapath + "/images/pluimages/";
                if (!sPluDir) sPluDir = '/data/images/pluimages/';
                sPluDir = (sPluDir + '/').replace(/\/+/g,'/');
                var aDstFile = sPluDir + valObj.no + ".png";

                document.getElementById('pluimage').setAttribute("src", "file://" + aDstFile + "?" + Math.random());
            }
        },

        _checkData: function (data) {
            var prods = GeckoJS.Session.get('products');
            var result = 0;
            if (data.no.length <= 0) {
                // @todo OSD
                NotifyUtils.warn(_('Product No. must not be empty.'));
                result = 3;
            } else if (data.name.length <= 0) {
                NotifyUtils.warn(_('Product Name must not be empty.'));
                result = 4;
            } else {
                if (prods) {
                    for (var i = 0; i < prods.length; i++) {
                        var o = prods[i];
                        if (o.no == data.no && data.id == null) {
                            NotifyUtils.warn(_('The Product No. [%S] already exists; product not added', [data.no]));
                            return 1;
                        } else if (o.name == data.name && o.cate_no == data.cate_no) {
                            if (data.id == null) {
                                NotifyUtils.warn(_('The Product Name [%S] already exists in department [%S]; product not added', [data.name, data.cate_name]));
                                return 2;
                            }
                            else if (data.id != o.id) {
                                NotifyUtils.warn(_('The Product Name [%S] already exists in department [%S]; product not modified', [data.name, data.cate_name]));
                                return 2;
                            }
                            break;
                        }
                    }
                }
                // if condiment is required, make sure a condiment group has been selected
                if (data.force_condiment && !data.cond_group) {
                    NotifyUtils.warn(_('Condiment is required but no condiment group selected; product not modified'));
                    return 5;
                }

                // make sure prices are between LALO and HALO
                for (var i = 1; i < 10; i++) {
                    var price = parseFloat(data['price_level' + i]);
                    var enabled = data['level_enable' + i];
                    var halo = parseFloat(data['halo' + i]);
                    var lalo = parseFloat(data['lalo' + i]);

                    if (enabled || i == 1) {
                        if (halo > 0 && halo < price) {
                            NotifyUtils.warn(_('Price level %S preset price [%S] is larger than HALO [%S]; product not modified', [i, price, halo]));
                            return 6;
                        }
                        else if (lalo > 0 && lalo > price) {
                            NotifyUtils.warn(_('Price level %S preset price [%S] is less than LALO [%S]; product not modified', [i, price, lalo]));
                            return 7;
                        }
                    }
                }
            }
            return result;
        },

        add: function  () {
            if (this._selCateNo == null) return;

            // auto-generate?
            var autoProdNo = GeckoJS.Configure.read('vivipos.fec.settings.AutoGenerateProdNo');
            var prodNoLen = GeckoJS.Configure.read('vivipos.fec.settings.ProdNoLength');

            var inputData = this.getInputData();
            var prodNo = '';

            if (autoProdNo && !isNaN(this._selCateNo)) {
                var prodModel = new ProductModel();
                var result = prodModel.find('first', {
                        fields: 'max(no) as "prev"',
                        conditions: 'cate_no = "' + this._selCateNo + '"'});
                if (result != '' && result.prev != '') {
                    var prev = result.prev;

                    // remove department number
                    var prodPart;
                    if (prev.indexOf(this._selCateNo) == 0) {
                        prodPart = prev.substr(this._selCateNo.length, prev.length - this._selCateNo.length);
                    }
                    else {
                        prodPart = prev;
                    }
                    if (!isNaN(prodPart)) {
                        prodNo = this._selCateNo + GeckoJS.String.padLeft(++prodPart, prodNoLen, '0');
                    }
                }
            }

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {
                input0:prodNo, require0:true, alphaOnly0:true,
                input1:null, require1:true
            };
            window.openDialog(aURL, _('Add New Product'), features, _('New Product'), '', _('Product No.'), _('Product Name'), inputObj);

            if (inputObj.ok && inputObj.input0 && inputObj.input1) {
                var product = new ProductModel();
                inputData.no = inputObj.input0;
                inputData.name = inputObj.input1;
                inputData.id = null;

                if(this._checkData(inputData) == 0) {
                    if (inputData.cate_no.length == 0) inputData.cate_no = this._selCateNo;

                    // reset form to get product defaults
                    var prodData = this.getInputDefault();
                    //try {
                        prodData.id = '';
                        prodData.no = inputData.no;
                        prodData.name = inputData.name;
                        prodData.cate_no = inputData.cate_no;

                        product.save(prodData);

                        // need to retrieve product id
                        var newProduct = product.findByIndex('first', {
                            index: 'no',
                            value: prodData.no
                        });
                        if (newProduct != null) {
                            this.updateSession('add', newProduct);
                        }
                        
                        // newly added item is appended to end; jump cursor to end
                        var index = this.productPanelView.data.length - 1;

                        // index < 0 indicates that this category was previously empty
                        // we need to manually select it again to make the panel display
                        // the newly added product
                        if (index < 0) {
                            var catepanel = document.getElementById('catescrollablepanel');
                            this.changePluPanel(catepanel.selectedIndex);
                            index = 0;
                        }
                        this.clickPluPanel(index);

                        // @todo OSD
                        OsdUtils.info(_('Product [%S] added successfully', [inputData.name]));
                   // }
                    //catch (e) {
                        // @todo OSD
                        //NotifyUtils.error(_('An error occurred while adding Product [%S]; the product may not have been added successfully', [inputData.name]));
                    //}
                }
            }

        },

        _setMenuFromString: function (plu) {
            //GREUtils.log('setMenuStr: ' + setMenuStr);
            var entries = plu.setmenu.split('&');
            var setitems = [];
            //GREUtils.log('entries: ' + GeckoJS.BaseObject.dump(entries));
            if (entries.length > 0) {
                for (var i = 0; i < entries.length; i++) {
                    var entry = entries[i].split('=');
                    var plucode = entry[0];
                    var pluqty = entry[1];

                    //GREUtils.log('entry: ' + GeckoJS.BaseObject.dump(entry));
                    var product = this._searchPlu(plucode);

                    if (product != null) {
                        //GREUtils.log('product: ' + GeckoJS.BaseObject.dump(product));
                        var setitem = {product_id: plu.id,
                                       item_id: product.id,
                                       quantity: pluqty};
                        setitems.push(setitem);
                        //GREUtils.log('setitem: ' + GeckoJS.BaseObject.dump(setitem));
                    }
                }
            }
            return setitems;
        },

        modify: function  () {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            var inputData = this.getInputData();
            var product = this.productPanelView.getCurrentIndexData(this._selectedIndex);

            //GREUtils.log('modify <' + this._selectedIndex + '> ' + GeckoJS.BaseObject.dump(inputData));

            // need to make sure product name is unique
            if (this._checkData(inputData) == 0) {
                var prodModel = new ProductModel();
                //try {
                    var setitems = this._setMenuFromString(inputData);
                    
                    prodModel.id = inputData.id;
                    prodModel.save(inputData);
                    
                    // update set items

                    var setItemModel = new SetItemModel();

                    // first we delete old items
                    var oldSetItems = setItemModel.findByIndex('all', {
                        index: 'product_id',
                        value: prodModel.id
                    });

                    oldSetItems.forEach(function(item) {
                        setItemModel.del(item.id);
                    })

                    // then we add new set items

                    setitems.forEach(function(item) {
                        item.id = '';
                        setItemModel.save(item);
                    })
                    
                    this.updateSession('modify', inputData, product);
                    
                    var newIndex = this._selectedIndex;
                    if (newIndex > this.productPanelView.data.length - 1) newIndex = this.productPanelView.data.length - 1;

                    this.clickPluPanel(newIndex);

                    // @todo OSD
                    OsdUtils.info(_('Product [%S] modified successfully', [product.name]));
                    /*
                }
                catch (e) {
                    // @todo OSD
                    NotifyUtils.error(_('An error occurred while modifying Product [%S]. The product may not have been modified successfully', [product.name]));
                }
                    */
            }
        },

        RemoveImage: function(no) {
            // var no  = $('#product_no').val();

            var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
            var sPluDir = datapath + "/images/pluimages/";
            if (!sPluDir) sPluDir = '/data/images/pluimages/';
            sPluDir = (sPluDir + '/').replace(/\/+/g,'/');
            var aDstFile = sPluDir + no + ".png";

            GREUtils.File.remove(aDstFile);
                document.getElementById('pluimage').setAttribute("src", "");

            return aDstFile;
        },

        remove: function() {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            var prodModel = new ProductModel();
            var index = document.getElementById('prodscrollablepanel').selectedIndex;

            var product = this.productPanelView.getCurrentIndexData(index);
            
            if (product) {
                // check if product is included in set menu; if it is, don't allow removal
                var setItemModel = new SetItemModel();
                var setMenu = setItemModel.findByIndex('first', {
                    index: 'item_id',
                    value: product.id
                });
                if (setMenu != null) {
                    NotifyUtils.warn(_('Product [%S] is part of a product set [%S] and may not be removed', [product.name, setMenu.Product.name]));
                    return;
                }

                if (GREUtils.Dialog.confirm(null, _('confirm delete %S', [product.name]), _('Are you sure?'))) {
                
                    try {
                        prodModel.del(product.id);

                        // cascade delete set items

                        var setItemModel = new SetItemModel();

                        var oldSetItems = setItemModel.findByIndex('all', {
                            index: 'product_id',
                            value: product.id
                        });

                        oldSetItems.forEach(function(item) {
                            setItemModel.del(item.id);
                            try {
                                this.RemoveImage(item.no);
                            } catch (e) {}
                        })
                        
                        this.updateSession('remove', product);

                        var newIndex = this._selectedIndex;
                        if (newIndex > this.productPanelView.data.length - 1) newIndex = this.productPanelView.data.length - 1;

                        this.clickPluPanel(newIndex);

                        // @todo OSD
                        OsdUtils.info(_('Product [%S] removed successfully', [product.name]));
                    }
                    catch (e) {
                        // @todo OSD
                        NotifyUtils.error(_('An error occurred while removing Product [%S]. The product may not have been removed successfully', [product.name]));
                    }
                }
            }
        },

        updateSession: function(action, data, oldData) {
            /*
            var prodModel = new ProductModel();
            var products = prodModel.find('all', {
                order: 'cate_no'
            });
            GeckoJS.Session.add('products', products);
            */
            switch(action) {
                case 'add':
                    var products = GeckoJS.Session.get('products');
                    if (products == null) {
                        products = [data];
                        GeckoJS.Session.set('products', products);
                    }
                    else {
                        products.push(data);
                    }

                    var byId = GeckoJS.Session.get('productsById');
                    byId[data.id] = data;
                    
                    if (data.barcode.length > 0) {
                        var indexBarcode = GeckoJS.Session.get('barcodesIndexes');
                        indexBarcode[data.barcode] = data.id;
                    }
                    
                    if (data.no.length > 0) {
                        var indexBarcode = GeckoJS.Session.get('barcodesIndexes');
                        indexBarcode[data.no] = data.id;
                    }
                    
                    if (data.cate_no.length > 0) {
                        var indexCate = GeckoJS.Session.get('productsIndexesByCate');
                        var indexCateAll = GeckoJS.Session.get('productsIndexesByCateAll');
                        if (typeof indexCate[data.cate_no] == 'undefined') {
                            indexCate[data.cate_no] = [];
                            indexCateAll[data.cate_no] = [];
                        }
                        indexCateAll[(data.cate_no+"")].push((data.id+""));
                        if(GeckoJS.String.parseBoolean(data.visible)) indexCate[(data.cate_no+"")].push((data.id+""));
                    }
                    
                    if (data.link_group && data.link_group.length > 0) {
                        var indexLinkGroup = GeckoJS.Session.get('productsIndexesByLinkGroup');
                        var indexLinkGroupAll = GeckoJS.Session.get('productsIndexesByLinkGroupAll');
                        var groups = data.link_group.split(',');

                        groups.forEach(function(group) {

                            if (typeof indexLinkGroup[group] == 'undefined') {
                                indexLinkGroup[group] = [];
                                indexLinkGroupAll[group] = [];
                            }
                            indexLinkGroupAll[(group+"")].push((data.id+""));
                            if(GeckoJS.String.parseBoolean(data.visible)) indexLinkGroup[(group+"")].push((data.id+""));

                        });
                    }
                    break;

                case 'modify':
                    // remove old barcode
                    var indexBarcode = GeckoJS.Session.get('barcodesIndexes');
                    if (oldData.barcode.length > 0) {
                        delete indexBarcode[oldData.barcode];
                    }

                    // add new barcode
                    if (data.barcode.length > 0) {
                        indexBarcode[data.barcode] = data.id;
                    }

                    var indexCate = GeckoJS.Session.get('productsIndexesByCate');
                    var indexCateAll = GeckoJS.Session.get('productsIndexesByCateAll');
                    if (oldData.cate_no != data.cate_no || oldData.visible != data.visible) {

                        // remove old category

                        var indexCateAllArray = indexCateAll[(oldData.cate_no+"")];
                        var indexCateArray = indexCate[(oldData.cate_no+"")];

                        var index = -1;
                        for (var i = 0; i < indexCateAllArray.length; i++) {
                            if (indexCateAllArray[i] == oldData.id) {
                                index = i;
                                break;
                            }
                        }
                        if (index > -1)
                            indexCateAllArray.splice(index, 1);

                        var index = -1;
                        for (var i = 0; i < indexCateArray.length; i++) {
                            if (indexCateArray[i] == oldData.id) {
                                index = i;
                                break;
                            }
                        }
                        if (index > -1)
                            indexCateArray.splice(index, 1);

                        // add new category
                        if (data.cate_no.length > 0) {
                            if (typeof indexCate[data.cate_no] == 'undefined') {
                                indexCate[data.cate_no] = [];
                                indexCateAll[data.cate_no] = [];
                            }
                            indexCateAll[(data.cate_no+"")].push((data.id+""));
                            if(GeckoJS.String.parseBoolean(data.visible)) {
                                indexCate[(data.cate_no+"")].push((data.id+""));
                            }
                        }
                    }

                    // always remove old product group(s) first
                    var indexLinkGroup = GeckoJS.Session.get('productsIndexesByLinkGroup');
                    var indexLinkGroupAll = GeckoJS.Session.get('productsIndexesByLinkGroupAll');
                    if (oldData.link_group && oldData.link_group.length > 0) {

                        var groups = oldData.link_group.split(',');

                        groups.forEach(function(group) {

                            var indexLinkGroupArray = indexLinkGroup[(group+"")];
                            var indexLinkGroupAllArray = indexLinkGroupAll[(group+"")];

                            var index = -1;
                            for (var i = 0; i < indexLinkGroupAllArray.length; i++) {
                                if (indexLinkGroupAllArray[i] == oldData.id) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index > -1)
                                indexLinkGroupAllArray.splice(index, 1);

                            var index = -1;
                            for (var i = 0; i < indexLinkGroupArray.length; i++) {
                                if (indexLinkGroupArray[i] == oldData.id) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index > -1)
                                indexLinkGroupArray.splice(index, 1);
                            });
                    }

                    // add new product group(s) if any
                    if (data.link_group && data.link_group.length > 0) {
                        var indexLinkGroup = GeckoJS.Session.get('productsIndexesByLinkGroup');
                        var indexLinkGroupAll = GeckoJS.Session.get('productsIndexesByLinkGroupAll');
                        var groups = data.link_group.split(',');

                        groups.forEach(function(group) {

                            if (typeof indexLinkGroup[group] == 'undefined') {
                                indexLinkGroup[group] = [];
                                indexLinkGroupAll[group] = [];
                            }
                            indexLinkGroupAll[(group+"")].push((data.id+""));
                            if(GeckoJS.String.parseBoolean(data.visible)) indexLinkGroup[(group+"")].push((data.id+""));

                        });
                    }

                    var products = GeckoJS.Session.get('products');
                    // for now, let's loop
                    var index = -1;
                    for (var i = 0; i < products.length; i++) {
                        if (products[i].id == data.id) {
                            GREUtils.extend(products[i], data);
                            index = i;
                            break
                        }
                    }

                    break;

                case 'remove':

                    // update product cache
                    var products = GeckoJS.Session.get('products');
                    // for now, let's loop
                    var index = -1;
                    for (var i = 0; i < products.length; i++) {
                        if (products[i].id == data.id) {
                            index = i;
                            break
                        }
                    }
                    if (index > -1)
                        products.splice(index, 1);

                    // update products ID cache
                    var byId = GeckoJS.Session.get('productsById');
                    delete byId[data.id];

                    // update barcode cache
                    if (data.barcode.length > 0) {
                        var indexBarcode = GeckoJS.Session.get('barcodesIndexes');
                        delete indexBarcode[data.barcode];
                    }

                    if (data.no.length > 0) {
                        var indexBarcode = GeckoJS.Session.get('barcodesIndexes');
                        delete indexBarcode[data.no];
                    }

                    // update department cache
                    if (data.cate_no.length > 0) {
                        var indexCate = GeckoJS.Session.get('productsIndexesByCate');
                        var indexCateAll = GeckoJS.Session.get('productsIndexesByCateAll');

                        var indexCateAllArray = indexCateAll[(data.cate_no+"")];
                        var indexCateArray = indexCate[(data.cate_no+"")];

                        var index = -1;
                        for (var i = 0; i < indexCateAllArray.length; i++) {
                            if (indexCateAllArray[i] == data.id) {
                                index = i;
                                break;
                            }
                        }
                        if (index > -1)
                            indexCateAllArray.splice(index, 1);

                        var index = -1;
                        for (var i = 0; i < indexCateArray.length; i++) {
                            if (indexCateArray[i] == data.id) {
                                index = i;
                                break;
                            }
                        }
                        if (index > -1)
                            indexCateArray.splice(index, 1);
                    }
                    // update product group cache

                    if (data.link_group && data.link_group.length > 0) {
                        var indexLinkGroup = GeckoJS.Session.get('productsIndexesByLinkGroup');
                        var indexLinkGroupAll = GeckoJS.Session.get('productsIndexesByLinkGroupAll');

                        var groups = data.link_group.split(',');

                        groups.forEach(function(group) {

                            var indexLinkGroupArray = indexLinkGroup[(group+"")];
                            var indexLinkGroupAllArray = indexLinkGroupAll[(group+"")];

                            var index = -1;
                            for (var i = 0; i < indexLinkGroupAllArray.length; i++) {
                                if (indexLinkGroupAllArray[i] == data.id) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index > -1)
                                indexLinkGroupAllArray.splice(index, 1);

                            var index = -1;
                            for (var i = 0; i < indexLinkGroupArray.length; i++) {
                                if (indexLinkGroupArray[i] == data.id) {
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

            // @hack to make front end update itself
            var indexCateAll = GeckoJS.Session.get('productsIndexesByCateAll');
            GeckoJS.Session.add('productsIndexesByCateAll', indexCateAll);
        },

        // modified to handle the case where
        locateIndex: function (elem, list, path) {

            // locate elem in list using binary search
            var low = 0;
            var N = list.length;
            var high = N;
            while (low < high) {
                var mid = Math.floor((low - (- high))/2);
                (list[mid][path] < elem) ? low = mid + 1 : high = mid;
            }
            // high == low, using high or low depends on taste
            if ((low < N) && (list[low][path] == elem))
                return low // found
            else
                return -1 // not found             },
        },

        selectPlu: function(index) {
            var plusearchListObj = document.getElementById('plusearchscrollablepanel');
            var datas = plusearchListObj.datasource._data;

            var plu = datas[index];
            if (plu != null) {
                var categories = GeckoJS.Session.get('categories');

                // @todo optimize search
                // categories are now sorted by display_order, which aren't unique and may be null, so
                // for now we use simple linear search
                var catIndex = -1;
                for (var i = 0; i < categories.length; i++) {
                    if (categories[i].no == plu.cate_no) {
                        catIndex = i;
                        break;
                    }
                }
                this.changePluPanel(catIndex);

                var catepanel = document.getElementById('catescrollablepanel');
                catepanel.selectedIndex = catIndex;
                catepanel.selectedItems = [catIndex];

                var plus = this.productPanelView.tree.datasource.data;
                var pluIndex = plus.indexOf(plu.id);
                
                this.clickPluPanel(pluIndex);
            }
        },

        validateForm: function(resetTabs) {
            // category selected?
            document.getElementById('add_plu').setAttribute('disabled', (this._selCateNo == null || this._selCateNo == -1));

            // reset tab panel to first tab?
            if (resetTabs) document.getElementById('tabs').selectedIndex = 0;

            // plu selected?
            if (this._selectedIndex == null || this._selectedIndex == -1) {
                // disable Modify, Delete buttons
                document.getElementById('modify_plu').setAttribute('disabled', true);
                document.getElementById('delete_plu').setAttribute('disabled', true);

                // disable all tabs
                document.getElementById('tab1').setAttribute('disabled', true);
                document.getElementById('tab2').setAttribute('disabled', true);
                document.getElementById('tab3').setAttribute('disabled', true);
                document.getElementById('tab4').setAttribute('disabled', true);
                document.getElementById('tab5').setAttribute('disabled', true);
                document.getElementById('tab6').setAttribute('disabled', true);
                document.getElementById('tabCondGroups').setAttribute('disabled', true);

                // disable all fields
                this.disableInputData(true);
            }
            else {
                var productName = document.getElementById('product_name').value.replace(/^\s*/, '').replace(/\s*$/, '');

                // enable all tabs
                document.getElementById('tab1').removeAttribute('disabled');
                document.getElementById('tab2').removeAttribute('disabled');
                document.getElementById('tab3').removeAttribute('disabled');
                document.getElementById('tab4').removeAttribute('disabled');
                document.getElementById('tab5').removeAttribute('disabled');
                document.getElementById('tab6').removeAttribute('disabled');
                document.getElementById('tabCondGroups').removeAttribute('disabled');

                // enable all fields
                this.disableInputData(false);

                // conditionally enable Modify, Delete buttons
                document.getElementById('modify_plu').setAttribute('disabled', productName.length == 0);
                document.getElementById('delete_plu').setAttribute('disabled', false);
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();


(function(){

    var __controller__ = {

        name: 'Plus',

        uses: ['Product'],
        
        components: ['Tax'],

        screenwidth: 800,
        screenheight: 600,
        _selectedIndex: null,
        _selCateNo: null,
        _selCateName: null,
        _selCateIndex: -1,
        
        catePanelView: null,
        productPanelView: null,
        _pluset: [],
        _productGroups: null,
        _selectedPluSetIndex: null,
        _condGroupsById: null,
        _categoriesByNo: {},
        _categoryIndexByNo: {},

        createGroupPanel: function () {

            this.screenwidth = GeckoJS.Configure.read('vivipos.fec.mainscreen.width') || 800;
            this.screenheight = GeckoJS.Configure.read('vivipos.fec.mainscreen.height') || 600;

            var pluGroupModel = new PlugroupModel();
            var groups = pluGroupModel.find('all', {
                order: 'display_order, name'
            } );

            var group_listscrollablepanel = document.getElementById('group_listscrollablepanel');
            var plugroupPanelView = new NSIPluGroupsView(groups);
            group_listscrollablepanel.datasource = plugroupPanelView;

            //this._productGroups = groups;
            this._productGroups = GeckoJS.Session.get('categoriesIndexesAll').concat(GeckoJS.Session.get('allPlugroups'));

            var condGroups = GeckoJS.Session.get('condGroups');

            var condimentscrollablepanel = document.getElementById('condimentscrollablepanel');
            var condGroupPanelView = new NSICondGroupsView(condGroups);
            condimentscrollablepanel.datasource = condGroupPanelView;

           this._condGroupsById = GeckoJS.Session.get('condGroupsById');

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
            // construct categoryByNo lookup table
            var categories = GeckoJS.Session.get('categories');
            for (var i = 0; i < categories.length; i++) {
                this._categoriesByNo['' + categories[i].no] = categories[i];
                this._categoryIndexByNo['' + categories[i].no] = i;
            };
            
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

            // initialize PluSet form
            this.validatePluSetForm();
        },

        changePluPanel: function(index) {

            this.productPanelView.setCatePanelIndex(index);
            var category = this.catePanelView.getCurrentIndexData(index);
            if (this._selCateIndex != index && category != null) {
                if(category.no == null) {
                    document.getElementById('add_plu').setAttribute('hidden', 'true');
                    document.getElementById('link_plu').setAttribute('hidden', 'false');
                } else {
                    document.getElementById('link_plu').setAttribute('hidden', 'true');
                    document.getElementById('add_plu').setAttribute('hidden', 'false');
                }
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

        reorderCondimentGroup: function() {
            // re-arrange condiment groups
            var condimentscrollablepanel = document.getElementById('condimentscrollablepanel');
            var condGroupsById = this._condGroupsById;
            
            // build list of selection orders by group id
            var selectedGroups = condimentscrollablepanel.value.split(',');
            var count = 0;
            var selectedGroupsById = {};
            var selectedItems = [];
            for (var i = 0; i < selectedGroups.length; i++) {
                if (condGroupsById[selectedGroups[i]]) {
                    selectedGroupsById[selectedGroups[i]] = count;
                    selectedItems.push(count++);
                }
            }

            // split cond groups into two arrays
            var selectedList = [];
            var notSelectedList = [];

            for (var key in condGroupsById) {
                // if group is selected, we order it by its position in cond_group
                if (key in selectedGroupsById) {
                    selectedList[selectedGroupsById[key]] = condGroupsById[key];
                }

                // otherwise, the group is ordered by its position in condGroupsById
                else {
                    notSelectedList.push(condGroupsById[key]);
                }
            }

            // update condGroup view with ordered condiment group array
            var condGroupView = condimentscrollablepanel.datasource;
            condGroupView.data = selectedList.concat(notSelectedList);
            condimentscrollablepanel.selectedItems = selectedItems;
            condimentscrollablepanel.refresh();
        },

        clickPluPanel: function(index) {
            var plupanel = document.getElementById('prodscrollablepanel');
            var product = this.productPanelView.getCurrentIndexData(index);

            this._selectedIndex = index;
            plupanel.selectedIndex = index;
            plupanel.selectedItems = [index];
            plupanel.ensureIndexIsVisible(index);
            
            if (product) {
                var dep;
                if (this._selCateNo == null) {
                    dep = this._categoriesByNo[product.cate_no];
                    product.cate_name = dep.name;
                }
                else {
                    product.cate_name = this._selCateName;
                }
                // inherit unit of sale from category if scale department
                if (dep && dep.scale) {
                    if (!product.sale_unit) {
                        product.sale_unit = dep.sale_unit;
                    }
                }

                // for rendering stock quantity.
                var stockRecordModel = new StockRecordModel();
                var stockRecord = stockRecordModel.getStockRecordByProductNo( product.no );
                if (stockRecord) {
                    product.stock = stockRecord.quantity;
                } else {
                    product.stock = 0;
                }
                this.setInputData(product);

                this.reorderCondimentGroup();
                
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

            this.selectSetItem(-1);
        },

        getDepartment: function () {
            var cate_no = $('#cate_no').val();
            var cates_data = GeckoJS.Session.get('categories');
            var index = this._selCateIndex;

            if (this._selCateNo == null) {
                var product = this.productPanelView.getCurrentIndexData(this._selectedIndex);
                if (product) {
                    index = this._categoryIndexByNo[product.cate_no];
                }
            }
            
            var aURL = 'chrome://viviecr/content/select_department.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            var inputObj = {
                cate_no: cate_no,
                depsData: cates_data,
                index: index
            };
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, 'select_department', features, inputObj);

            if (inputObj.ok && inputObj.cate_no) {
                $('#cate_no').val(inputObj.cate_no);
                $('#cate_name').val(inputObj.cate_name);
            }
        },

        getRate: function () {
            var rate = $('#rate').val();
            var aURL = 'chrome://viviecr/content/select_tax.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            var inputObj = {
                rate: rate
            };

            var taxes = GeckoJS.Session.get('taxes');
            if(taxes == null) taxes = this.Tax.getTaxList();

            inputObj.taxes = taxes;
            
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, 'select_rate', aFeatures, inputObj);
            if (inputObj.ok && inputObj.rate) {
                $('#rate').val(inputObj.rate);
                $('#rate_name').val(inputObj.name);
            }
        },
        
        getPluSetListObj: function() {
            if(this._listObj == null) {
                this._listObj = document.getElementById('plusetscrollabletree');
            }
            return this._listObj;
        },

        removeSetItem: function () {
            var plusetscrollabletree = this.getPluSetListObj();
            var selectedIndex = plusetscrollabletree.selectedIndex;
            var selectedItems = plusetscrollabletree.selectedItems;
            if (selectedIndex > -1 && selectedItems.length > 0) {
                this._pluset.splice(selectedIndex, 1);
                plusetscrollabletree.treeBoxObject.rowCountChanged(this._pluset.length, -1);

                if (selectedIndex >= this._pluset.length) {
                    selectedIndex = this._pluset.length - 1;
                }
                this.selectSetItem(selectedIndex);
            }
        },

        moveSetItem: function (dir) {
            var plusetscrollabletree = this.getPluSetListObj();
            var selectedIndex = plusetscrollabletree.selectedIndex;
            var selectedItems = plusetscrollabletree.selectedItems;

            if (selectedIndex > -1 && selectedItems.length > 0) {
                var newIndex = selectedIndex + dir;
                if (newIndex >= this._pluset.length) {
                    newIndex = this._pluset.length - 1;
                }
                else if (newIndex < 0) {
                    newIndex = 0;
                }

                if (newIndex != selectedIndex) {
                    var currentItem = this._pluset[selectedIndex];
                    this._pluset[selectedIndex] = this._pluset[newIndex];
                    this._pluset[newIndex] = currentItem;

                    this.selectSetItem(newIndex);
                }
            }
        },

        _setPluSet: function () {

            var barcodesIndexes = GeckoJS.Session.get('barcodesIndexes');
            var categories = GeckoJS.Session.get('categoriesById');
            var groupsById = GeckoJS.Session.get('plugroupsById');

            // get current product no
            var productNo = document.getElementById('product_no').value;

            if (productNo != null && productNo != '') {
                // load set items from DB
                var setItemModel = new SetItemModel();
                this._pluset = setItemModel.findByIndex('all', {
                    index: 'pluset_no',
                    value: productNo,
                    order: 'sequence'
                });
            }
            else {
                this._pluset = [];
            }

            // retrieve current product and group names
            for (var i = 0; i < this._pluset.length; i++) {
                var preset_no = this._pluset[i].preset_no;
                var linkgroup_id = this._pluset[i].linkgroup_id;

                var product_id = barcodesIndexes[preset_no];
                var product = product_id ? this.Product.getProductById(product_id) : '';

                var group = groupsById[linkgroup_id];
                if (typeof group == 'undefined') {
                    // try department
                    group = categories[linkgroup_id];
                }

                this._pluset[i].preset = product ? product.name : '';
                this._pluset[i].linkgroup = group ? group.name : '';
            }
        
            var panelView =  new GeckoJS.NSITreeViewArray(this._pluset);
            this.getPluSetListObj().datasource = panelView;
        },

        addSetItem: function (){

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {
                input0:null, require0:true
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Set Item'), aFeatures, _('Set Item'), '', _('Label'), '', inputObj);

            if (inputObj.ok && inputObj.input0) {
                
                var newItem = {
                    label: inputObj.input0,
                    preset: '',
                    baseprice: '',
                    quantity: 1,
                    linkgroup: '',
                    reduction: 0,
                    reduction_label: _('N'),
                    preset_no: '',
                    linkgroup_id: ''
                };

                // splice into current data
                var plusetscrollabletree = this.getPluSetListObj();
                var index = plusetscrollabletree.selectedIndex;
                
                this._pluset.splice(++index, 0, newItem);
                
                plusetscrollabletree.treeBoxObject.rowCountChanged(this._pluset.length, 1);
                this.selectSetItem(index);
            }

        },

        modifySetItem: function() {
            var plusetscrollabletree = this.getPluSetListObj();
            var selectedIndex = plusetscrollabletree.selectedIndex;

            if (selectedIndex > -1) {
                var modifiedItem = GeckoJS.FormHelper.serializeToObject('setitemForm');
                modifiedItem.reduction_label = (modifiedItem.reduction) ? _('Y') : _('N');

                this._pluset[selectedIndex] = modifiedItem;
                plusetscrollabletree.treeBoxObject.ensureRowIsVisible(selectedIndex);
                plusetscrollabletree.refresh();
            }
        },
        
        selectSetItem: function(index) {

            var setItem = this._pluset[index];
            var plusetscrollabletree = this.getPluSetListObj();
            
            if (setItem) {
                GeckoJS.FormHelper.unserializeFromObject('setitemForm', setItem);
            }
            else {
                GeckoJS.FormHelper.reset('setitemForm');
            }

            plusetscrollabletree.selection.select(index);
            plusetscrollabletree.treeBoxObject.ensureRowIsVisible(index);
            plusetscrollabletree.refresh();

            this.validatePluSetForm();
        },

        selectProduct: function() {
            
            var aURL = "chrome://viviecr/content/plusearch.xul";
            var aName = _('Product Search');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            var pluNo = document.getElementById('setitem_preset_no').value;
            var productNo = document.getElementById('product_no').value;
            var inputObj = {buffer: pluNo, select: true};

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures, inputObj);
            if (inputObj.ok) {
                if (inputObj.item) {
                    if (inputObj.item.SetItem && inputObj.item.SetItem.length > 0) {
                        NotifyUtils.warn(_('[%S] (%S) is a product set and may not be a member of another product set.', [inputObj.item.name, inputObj.item.no]));
                    }
                    else if (inputObj.item.no == productNo) {
                        NotifyUtils.warn(_('[%S] (%S) may not be a member of its own product set.', [inputObj.item.name, inputObj.item.no]));
                    }
                    else {
                        document.getElementById('setitem_preset').value = inputObj.item.name;
                        document.getElementById('setitem_preset_no').value = inputObj.item.no;
                    }
                }
            }
            else {
                document.getElementById('setitem_preset').value = '';
                document.getElementById('setitem_preset_no').value = ''
            }

            this.validatePluSetForm();
        },

        selectProductGroup: function() {

            var aURL = "chrome://viviecr/content/select_product_group.xul";
            var aName = _('Product Group');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            var groupNameObj = document.getElementById('setitem_linkgroup');
            var groupIdObj = document.getElementById('setitem_linkgroup_id');

            var groupId = groupIdObj.value;

            // locate index of selected index
            var productGroups = this._productGroups;
            
            var index = -1;
            if (groupId != '' && productGroups != null) {
                for (var i = 0; i < productGroups.length; i++) {
                    if (productGroups[i].id == groupId) {
                        index = i;
                        break;
                    }
                }
            }
            var inputObj = {groupData: productGroups, index: index, plugroupOnly: false};

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures, inputObj);
            if (inputObj.ok && inputObj.group_id != '') {
                groupNameObj.value = inputObj.group_name;
                groupIdObj.value = inputObj.group_id;
            }
            else {
                groupNameObj.value = '';
                groupIdObj.value = '';
            }

            this.validatePluSetForm();
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
                var sPluDir = GeckoJS.Session.get('pluimage_directory');
                var aDstFile = sPluDir + valObj.no + ".png";

                document.getElementById('pluimage').setAttribute("src", "file://" + aDstFile + "?" + Math.random());
            }
        },

        _checkData: function (data) {
            var prods = GeckoJS.Session.get('products');
            var result = 0;
            if (data.no.length <= 0) {

                NotifyUtils.warn(_('Product number must not be empty.'));
                result = 3;
            } else if (data.name.length <= 0) {

                NotifyUtils.warn(_('Product name must not be empty.'));
                result = 4;
            } else {
                if (prods) {
                    for (var i = 0; i < prods.length; i++) {
                        var o = prods[i];
                        if (o.no == data.no && data.id == null) {
                            NotifyUtils.warn(_('Product number [%S] already exists; product not added', [data.no]));
                            return 1;
                        } else if (o.name.toLowerCase() == data.name.toLowerCase() && o.cate_no == data.cate_no) {
                            if ((data.id == null) || (data.id != o.id)) {
                                if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                                            _('Duplicate Product Name [%S]', [data.name]),
                                                            _('One or more products with name [%S] already exist in department [%S]. Are you sure this is the name you want?', [data.name, data.cate_name]))) {
                                    NotifyUtils.warn(_('Product name [%S] already exists in department [%S]; product not added', [data.name, data.cate_name]));
                                    return 2;
                                }
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

                // if set items are defined, make sure product is not the default iten of another prouct set
                if (this._pluset != null && this._pluset.length > 0) {
                    var setItemModel = new SetItemModel();

                    var pluSetItem = setItemModel.findByIndex('first', {
                        index: 'preset_no',
                        value: data.no
                    });
                    if (pluSetItem) {
                        NotifyUtils.warn(_('This product is part of product set [%S] and may not itself be a product set', [pluSetItem.pluset_no]));
                        return 8;
                    }

                    // also make sure each set item entry has either preset_no or linkgroup_id set
                    for (var i = 0; i < this._pluset.length; i++) {
                        var entry = this._pluset[i];
                        if ((entry.preset_no == null || entry.preset_no == '') &&
                            (entry.linkgroup_id == null || entry.linkgroup_id == '')) {
                            NotifyUtils.warn(_('Product set item [%S] does not have either default item or group configured', [entry.label]));
                            return 9;
                        }
                    }
                }
            }
            return result;
        },

        add: function  () {
            if (this._selCateNo == null) {
                if (this._selCateIndex == -1) return;

                var plugroup = this.catePanelView.getCurrentIndexData(this._selCateIndex);

                // product group selected, put up product picker and add the selected product to this product group
                this.addProductToGroup(plugroup);
                return;
            }

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
                if (result != '' && result.prev != null && result.prev != '') {
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
                else {
                    prodNo = this._selCateNo + GeckoJS.String.padLeft('1', prodNoLen, '0');
                }
            }

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=300';
            var inputObj = {
                input0:prodNo, require0:true, alphaOnly0:true,
                input1:null, require1:true
            };
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Add New Product'), aFeatures, _('New Product'), '', _('Product Number'), _('Product Name'), inputObj);
            
            if (inputObj.ok && (inputObj.input0.length > 0) && (inputObj.input1.length > 0)) {
                var product = new ProductModel();
                inputData.no = inputObj.input0;
                inputData.name = inputObj.input1;
                inputData.id = null;

                if(this._checkData(inputData) == 0) {
                    if (inputData.cate_no.length == 0) inputData.cate_no = this._selCateNo;

                    // reset form to get product defaults
                    var prodData = this.getInputDefault();

                    prodData.id = '';
                    prodData.no = inputData.no;
                    prodData.name = inputData.name;
                    prodData.cate_no = inputData.cate_no;

                    // inherit unit of sale from category if scale department
                    var dep = this._categoriesByNo[prodData.cate_no];
                    if (dep && dep.scale) {
                        prodData.sale_unit = dep.sale_unit;
                    }

                    var newProduct = product.save(prodData);

                    // need to retrieve product id
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

                    OsdUtils.info(_('Product [%S] added successfully', [inputData.name]));
                }
            }
        },

        modify: function  () {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            var inputData = this.getInputData();

            var product = this.productPanelView.getCurrentIndexData(this._selectedIndex);

            // need to make sure product name is unique
            if (this._checkData(inputData) == 0) {
                var prodModel = new ProductModel();
                prodModel.id = inputData.id;
                prodModel.save(inputData);

                // update set items
                var setItemModel = new SetItemModel();

                // first we delete old items
                var oldSetItems = setItemModel.findByIndex('all', {
                    index: 'pluset_no',
                    value: inputData.no
                });

                oldSetItems.forEach(function(setitem) {
                    setItemModel.del(setitem.id);
                })

                // then we add new set items

                if (this._pluset != null && this._pluset.length > 0) {

                    for (var i = 0; i < this._pluset.length; i++) {
                        var setitem = this._pluset[i];
                        setitem.id = '';
                        setItemModel.id = '';
                        setitem.sequence = i;
                        setitem.pluset_no = inputData.no;

                        setItemModel.save(setitem);
                    }
                    product.SetItem = this._pluset;
                }
                else {
                    product.SetItem = [];
                }
                this.updateSession('modify', inputData, product);

                var newIndex = this._selectedIndex;
                if (newIndex > this.productPanelView.data.length - 1) newIndex = this.productPanelView.data.length - 1;

                if (!this._setCateNo) {
                    // if current department is a product group, order may have changed so we need to re-scan
                    var data = this.productPanelView.data;
                    for (var i = 0; i < data.length; i++) {
                        if (data[i] == inputData.id) {
                            newIndex = i;
                            break;
                        }
                    }
                    this.clickPluPanel(newIndex);
                }
                
                // update stock_records
                var stockRecordModel = new StockRecordModel();
                stockRecordModel.id = inputData.no;
                if(stockRecordModel.exists()) {
                    stockRecordModel.set( {
                        id: inputData.no,
                        barcode: inputData.barcode
                    } );
                }
                OsdUtils.info(_('Product [%S] modified successfully', [product.name]));
            }
        },

        RemoveImage: function(no) {
            // var no  = $('#product_no').val();

            var sPluDir = GeckoJS.Session.get('pluimage_directory');
            var aDstFile = sPluDir + no + ".png";

            if (GREUtils.File.exists(aDstFile)) GREUtils.File.remove(aDstFile);
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
                var pluset = setItemModel.findByIndex('first', {
                    index: 'preset_no',
                    value: product.no
                });
                if (pluset != null) {
                    NotifyUtils.warn(_('Product [%S] is part of a product set [%S] and may not be removed', [product.name, pluset.pluset_no]));
                    return;
                }

                if (GREUtils.Dialog.confirm(this.topmostWindow, _('confirm delete %S', [product.name]), _('Are you sure?'))) {
                
                    prodModel.del(product.id);

                    // cascade delete set items

                    var setItemModel = new SetItemModel();

                    var oldSetItems = setItemModel.findByIndex('all', {
                        index: 'pluset_no',
                        value: product.no
                    });

                    oldSetItems.forEach(function(setitem) {
                        setItemModel.del(setitem.id);
                    })

                    this.RemoveImage(product.no);

                    this.updateSession('remove', product);

                    var newIndex = this._selectedIndex;
                    if (newIndex > this.productPanelView.data.length - 1) newIndex = this.productPanelView.data.length - 1;

                    this.clickPluPanel(newIndex);

                    OsdUtils.info(_('Product [%S] removed successfully', [product.name]));
                }
            }
        },

        addProductToGroup: function(plugroup) {

            var aURL = "chrome://viviecr/content/plusearch.xul";
            var aName = _('Product Search');
            var aFeatures = 'chrome,dialog,modal,centerscreen,dependent=yes,resize=no,width=' + this.screenwidth + ',height=' + this.screenheight;
            var inputObj = {buffer: '', seltype: 'multiple'};

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, aName, aFeatures, inputObj);
            if (inputObj.ok) {
                if (inputObj.selections && inputObj.selections.length > 0) {
                    var self = this;
                    inputObj.selections.forEach(function(product) {
                        if (product.link_group.indexOf(plugroup.id) > -1) {

                            NotifyUtils.warn(_('Product [%S] already linked to to product group [%S]',
                                               [product.name, plugroup.name]));
                        }
                        else {
                            product.link_group += ((product.link_group) ? ',' : '') + plugroup.id;

                            var productModel = new ProductModel();
                            productModel.id = product.id;
                            productModel.save(product);

                            self.updateSession('modify', product, product);
                        }
                    });

                    OsdUtils.info(_('Selected products successfully linked to product group [%S]',
                                    [plugroup.name]));
                }
            }
            this.validateForm();
        },

        updateSession: function(action, data, oldData, refreshUI) {

            refreshUI = (typeof refreshUI  == 'undefined') ? true : refreshUI;
           
            switch(action) {
                case 'add':
                    
                    var products = GeckoJS.Session.get('products');
                    if (products == null) {
                        products = [data];
                        GeckoJS.Session.set('products', products);
                    }
                    else {
                        //products.push(data);
                    }

                    // update session 
                    this.Product.setProduct(data.id, data);

                    break;

                case 'modify':

                    // set product to session
                    this.Product.setProduct(data.id, data);

                    break;

                case 'remove':

                    // delete product from session.
                    this.Product.removeProduct(data.id);

                    break;

            }

            // @hack to make front end update itself
            if(refreshUI) {
                GeckoJS.Session.add('productsIndexesByCateAll', GeckoJS.Session.get('productsIndexesByCateAll'));
            }
        },

        // locate where a new element should be inserted into a sorted list
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
                return -low // not found             },
        },

        selectPlu: function(index) {
            var plusearchListObj = document.getElementById('plusearchscrollablepanel');
            var datas = plusearchListObj.datasource._data;

            var plu = datas[index];
            if (plu != null) {
                var categoriesById = GeckoJS.Session.get('categoriesById');
                var categoryIDs = this.catePanelView.tree.datasource.data;

                // @todo optimize search
                // categories are now sorted by display_order, which aren't unique and may be null, so
                // for now we use simple linear search
                var catIndex = -1;
                for (var i = 0; i < categoryIDs.length; i++) {
                    var cat_id = categoryIDs[i];
                    if (cat_id && categoriesById[cat_id] && categoriesById[cat_id].no == plu.cate_no) {
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

        clonePlu: function() {
            if (this._selectedIndex != null && this._selectedIndex > -1) {
                // get source product
                var index = this._selectedIndex;
                var product = this.productPanelView.getCurrentIndexData(index);
                var productsById = GeckoJS.Session.get('productsById');
                var targets = [];
                var targetIndexes = [];
                var targetGroupName = '';

                var self = this;

                // get target
                if (this._selCateNo == null) {
                    if (this._selCateIndex == -1) {
                        return;
                    }

                    // target is product group
                    var plugroup = this.catePanelView.getCurrentIndexData(this._selCateIndex);
                    var productsIndexesByGroupAll = GeckoJS.Session.get('productsIndexesByLinkGroupAll');

                    targetGroupName = _('Product Group [%S]', [plugroup.name]);
                    targetIndexes = productsIndexesByGroupAll[plugroup.id];
                }
                else {
                    var cateIndex = this._selCateIndex;
                    var category = this.catePanelView.getCurrentIndexData(cateIndex);
                    var productsIndexesByCateAll = GeckoJS.Session.get('productsIndexesByCateAll');

                    targetGroupName = _('Department [%S (%S)]', [category.name, category.no]);
                    targetIndexes = productsIndexesByCateAll[category.no];
                }
                targetIndexes.map(function(index) {
                                      if (index != product.id) targets.push(productsById[index]);
                                  });
                
                // get data set to clone
                // a. basic data (Tax + switches)
                // b. appearance
                // c. condiments
                // d. prices
                // e. link groups
                var aURL = 'chrome://viviecr/content/prompt_clone_plu.xul';
                var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
                var inputObj = {
                    title: _('Product to Clone') + ' [' + product.name + ']',
                    targetsLabel: targetGroupName,
                    targets: targets
                };

                GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Clone Product'), aFeatures, inputObj);

                if (inputObj.ok && inputObj.selectedItems && inputObj.selectedItems.length > 0) {

                    var productModel = new ProductModel();

                    // use transactoin
                    productModel.begin();
                    for (var i = 0; i < inputObj.selectedItems.length; i++) {
                        // remove by rack , why need to update all fields ?
                        var oldData = targets[inputObj.selectedItems[i]];
                        //var newData = GREUtils.extend({}, oldData);
                        var newData = {id: oldData.id};

                        var modified = false;

                        if (inputObj.cloneSettings['basic-data']) {
                            modified = true;

                            newData.rate = product.rate;
                            newData.auto_maintain_stock = product.auto_maintain_stock;
                            newData.return_stock = product.return_stock;
                            newData.force_memo = product.force_memo;
                            newData.visible = product.visible;
                            newData.single = product.single;
                            newData.age_verification = product.age_verification;
                            newData.icon_only = product.icon_only;
                            newData.manual_adjustment_only = product.manual_adjustment_only;
                            newData.memo = product.memo;
                        }

                        if (inputObj.cloneSettings['appearance']) {
                            modified = true;

                            newData.button_color = product.button_color;
                            newData.font_size = product.font_size;
                        }

                        if (inputObj.cloneSettings['prices']) {
                            modified = true;

                            for (var level = 1; level <= 9; level++) {
                                newData['level_enable' + level] = product['level_enable' + level];
                                newData['price_level' + level] = product['price_level' + level];
                                newData['halo' + level] = product['halo' + level];
                                newData['lalo' + level] = product['lalo' + level];
                            }
                        }

                        if (inputObj.cloneSettings['condiments']) {
                            newData.force_condiment = product.force_condiment;
                            newData.cond_group = product.cond_group;
                            modified = true;
                        }

                        if (inputObj.cloneSettings['linkgroups']) {
                            newData.link_group = product.link_group;
                            modified = true;
                        }

                        if (modified) {
                            productModel.id = newData.id;
                            productModel.save(newData);

                            // dont refreshUI rightnow
                            this.updateSession('modify', newData, oldData, false);
                        }
                    }
                    productModel.commit();
                    // refresh UI
                    GeckoJS.Session.add('productsIndexesByCateAll', GeckoJS.Session.get('productsIndexesByCateAll'));

                    OsdUtils.info(_('Product [%S] cloned successfully', [product.name]));
                }
            }
        },

        validatePluSetForm: function() {
            // input elements
            var selectedIndex = this.getPluSetListObj().selectedIndex;
            var label = document.getElementById('setitem_label').value;
            var preset = document.getElementById('setitem_preset_no').value;
            var linkgroup = document.getElementById('setitem_linkgroup_id').value;

            // action elements
            var modifyBtn = document.getElementById('modify_setitem');
            var presetObj = document.getElementById('setitem_preset');
            var groupObj = document.getElementById('setitem_linkgroup');

            // enable modify btn if:
            //
            // 1. an setitem has been selected
            // 2. label is not null
            // 3. either or both of preset and linkgroup are set
            // 4. qty > 0
            if (selectedIndex > -1) {
                if ((label != null && label != '') &&
                    ((preset != null && preset != '') || (linkgroup != null && linkgroup != ''))) {
                    modifyBtn.setAttribute('disabled', false);
                }
                else {
                    modifyBtn.setAttribute('disabled', true);
                }
                presetObj.removeAttribute('disabled');
                groupObj.removeAttribute('disabled');
            }
            else {
                modifyBtn.setAttribute('disabled', true);
                presetObj.setAttribute('disabled', true);
                groupObj.setAttribute('disabled', true);
            }
        },
        
        validateForm: function(resetTabs) {
            // category selected?
            if (this._selCateNo == null || this._selCateNo == -1) {
                if (this._selCateIndex != -1) {
                    document.getElementById('add_plu').setAttribute('disabled', false);
                }
                else {
                    document.getElementById('add_plu').setAttribute('disabled', true);
                }
            }
            else {
                document.getElementById('add_plu').setAttribute('disabled', false);
            }

            // reset tab panel to first tab?
            if (resetTabs) document.getElementById('tabs').selectedIndex = 0;

            // plu selected?
            if (this._selectedIndex == null || this._selectedIndex == -1) {
                // disable Modify, Delete buttons
                document.getElementById('modify_plu').setAttribute('disabled', true);
                document.getElementById('clone_plu').setAttribute('disabled', true);
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
                document.getElementById('clone_plu').setAttribute('disabled', false);
                document.getElementById('delete_plu').setAttribute('disabled', false);
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);

})();


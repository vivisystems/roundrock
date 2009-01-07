(function(){

    /**
     * Class PlusController
     */
    GeckoJS.Controller.extend( {

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
            var groups = pluGroupModel.find('all', {
            });
            var group_listscrollablepanel = document.getElementById('group_listscrollablepanel');
            var plugroupPanelView = new NSIPluGroupsView(groups);
            group_listscrollablepanel.datasource = plugroupPanelView;

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

            this.catePanelView =  new NSICategoriesView('catescrollablepanel');
            this.productPanelView = new NSIProductsView('prodscrollablepanel');
            
            this.productPanelView.setCatePanelView(this.catePanelView);

            var catpanel = document.getElementById('catescrollablepanel');
            catpanel.selectedIndex = -1;
            catpanel.selectedItems = [];

            // set default tax rate
            var defaultRate = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus') || '';
            var rateName = (defaultRate == '') ? '' : this.getRateName(defaultRate);
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

            if (category) {
                this._selCateNo = category.no;
                this._selCateName = category.name;
                this._selCateIndex = index;
                $('#cate_no').val(category.no);
                $('#cate_name').val(category.name);
                this.clickPluPanel(-1);
            }
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
            var rate;

            this._selectedIndex = index;
            plupanel.selectedIndex = index;
            plupanel.selectedItems = [index];

            if (product) {
                product.cate_name = this._selCateName;
                this.setInputData(product);
                rate = product.rate;
            }
            else {
                var valObj = this.getInputDefault();
                valObj.cate_no = this._selCateNo;
                valObj.cate_name = this._selCateName;
                this.setInputData(valObj);

                rate = null;
            }
            $('#rate').val(rate);
            $('#rate_name').val(this.getRateName(rate));
            
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
                // alert('Plu (' + barcode + ') Not Found!');
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
                //alert(key + ':' + decodeURI(key));
                key = decodeURI(key);
                if (key == '') break;
                
                var qty = pluset[key];
                //alert(qty + ':' + decodeURI(qty));
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
        },

        getPlu: function (){

            var aURL = 'chrome://viviecr/content/prompt_addpluset.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250';
            var inputObj = {
                input0:null, require0:true, alphaOnly0:true,
                input1:1, require1:true, numberOnly1:true
            };

            window.openDialog(aURL, _('Add New Product Set'), features, _('Product Set'), '', _('Product No.or Barcode'), _('Quantity'), inputObj);

            if (inputObj.ok && inputObj.input0 && inputObj.input1) {
                var product = this._searchPlu(inputObj.input0);
                if (product) {
                    var inputData = {
                        no: product.no,
                        name: product.name,
                        qty: inputObj.input1
                    };

                    this._pluset.push(inputData);

                    var panelView =  new GeckoJS.NSITreeViewArray(this._pluset);
                    this.getPluSetListObj().datasource = panelView;
                    var setmenu = [];
                    this._pluset.forEach(function(o){
                        setmenu.push(encodeURI(o.no + '=' + o.qty));
                    });
                    $('#setmenu').val( setmenu.join('&'));
                }
                else {
                    alert(_('Product not found [%S].', [inputObj.input0]));
                }
            }

        },

        initDefaultTax: function () {

            // make sure tax rate field is always populated
            var rate;
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
            this._setCondimentGroup();
            if (valObj) {
                document.getElementById('pluimage').setAttribute('src', 'chrome://viviecr/content/skin/pluimages/' + valObj.no + '.png?' + Math.random());
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
                            NotifyUtils.warn(_('The Product No. [%S] already exists; product not added.', [data.no]));
                            return 1;
                        } else if (o.name == data.name) {
                            if (data.id == null) {
                                NotifyUtils.warn(_('The Product Name [%S] already exists; product not added.', [data.name]));
                                return 2;
                            }
                            else if (data.id != o.id) {
                                NotifyUtils.warn(_('The Product Name [%S] already exists; product not modified.', [data.name]));
                                return 2;
                            }
                            break;
                        }
                    }
                }
                // if condiment is required, make sure a condiment group has been selected
                if (data.force_condiment && !data.cond_group) {
                    NotifyUtils.warn(_('Condiment is required but no condiment group selected; product not modified.'));
                    return 5;
                }
            }
            return result;
        },

        add: function  () {
            if (this._selCateNo == null) return;

            var inputData = this.getInputData();

            var aURL = 'chrome://viviecr/content/prompt_additem.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=400,height=250';
            var inputObj = {
                input0:null, require0:true, alphaOnly0:true,
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
                    try {
                        prodData.id = '';
                        prodData.no = inputData.no;
                        prodData.name = inputData.name;
                        prodData.cate_no = inputData.cate_no;

                        product.save(prodData);

                        this.updateSession();

                        // newly added item is appended to end; jump cursor to end
                        var index = this.productPanelView.data.length - 1;
                        this.clickPluPanel(index);

                        // @todo OSD
                        OsdUtils.info(_('Product [%S] added successfully', [inputData.name]));
                    }
                    catch (e) {
                        // @todo OSD
                        NotifyUtils.error(_('An error occurred while adding Product [%S]; the product may not have been added successfully', [inputData.name]));
                    }
                }
            }

        },

        modify: function  () {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            var inputData = this.getInputData();
            var product = this.productPanelView.getCurrentIndexData(this._selectedIndex);

            //GREUtils.log('modify <' + this._selectedIndex + '> ' + GeckoJS.BaseObject.dump(inputData));

            // need to make sure product name is unique
            if (this._checkData(inputData) == 0) {
                var prodModel = new ProductModel();

                try {
                    prodModel.id = inputData.id;
                    prodModel.save(inputData);

                    this.updateSession();

                    // @todo OSD
                    OsdUtils.info(_('Product [%S] modified successfully', [product.name]));
                }
                catch (e) {
                    // @todo OSD
                    NotifyUtils.error(_('An error occurred while modifying Product [%S]. The product may not have been modified successfully', [product.name]));
                }
            }
        },

        remove: function() {
            if (this._selectedIndex == null || this._selectedIndex == -1) return;

            var prodModel = new ProductModel();
            var index = document.getElementById('prodscrollablepanel').selectedIndex;

            var product = this.productPanelView.getCurrentIndexData(index);
            
            if (GREUtils.Dialog.confirm(null, _('confirm delete %S', [product.name]), _('Are you sure?'))) {
                
                if (product) {
                    try {
                        prodModel.del(product.id);

                        this.updateSession();

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

        updateSession: function() {
            var prodModel = new ProductModel();
            var products = prodModel.find('all', {
                order: 'cate_no'
            });
            GeckoJS.Session.add('products', products);
        },

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

            var categories = GeckoJS.Session.get('categories');
            var catIndex = this.locateIndex(plu.cate_no, categories, "no");
            this.changePluPanel(catIndex);

            var plus = this.productPanelView.tree.datasource.data;
            var pluIndex = plus.indexOf(plu.id);
            this.clickPluPanel(pluIndex);

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

                // enable all fields
                this.disableInputData(false);

                // conditionally enable Modify, Delete buttons
                document.getElementById('modify_plu').setAttribute('disabled', productName.length == 0);
                document.getElementById('delete_plu').setAttribute('disabled', false);
            }
        }
    });

})();


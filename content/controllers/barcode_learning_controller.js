(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }

    var __controller__ = {

        name: 'BarcodeLearning',

        components: ['Tax'],

        initial: function() {
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            cart.addEventListener('beforeBarcodeLearning', this.addBarcodeLearningItem, this);
        },

        addBarcodeLearningItem: function(evt) {
            try {
                this.dispatchEvent('beforeAddBarcodeLearningItem', evt);
                var department   = this.getFirstDepartment() || {};
                var barcode      = evt.data.barcode;
                var pluNumber    = evt.data.pluNumber || barcode;
                var productName  = evt.data.productName || department.name;
                var price        = evt.data.price || 0;
                var tax          = this.getDefaultRate() || {name: '', no: ''};
                var screenwidth  = GeckoJS.Session.get('screenwidth') || 800;
                var screenheight = GeckoJS.Session.get('screenheight') || 600;
                var aURL         = 'chrome://viviecr/content/prompt_addbarcodelearningitem.xul';
                var aFeatures    = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;

                var inputObj = {
                    barcode:barcode,
                    plu:pluNumber,
                    name:productName,
                    price:price,
                    tax:tax.name,
                    tax_rate: tax.no,
                    department:department.name,
                    department_no: department.no
                };

                GREUtils.Dialog.openWindow(
                    this.topmostWindow,
                    aURL,
                    _('Add Unknown Barcode Product'),
                    aFeatures,
                    _('New Product'),
                    _('Barcode'),
                    _('PLU'),
                    _('Product Name'),
                    _('Price'),
                    _('Tax'),
                    _('Department'),
                    inputObj
                );

                if(inputObj.ok == true) {
                    var productModel = new ProductModel();
                    var prodData = {};

                    prodData.id = '';
                    prodData.no = inputObj.plu;
                    prodData.name = inputObj.name;
                    prodData.cate_no = inputObj.department_no;
                    prodData.price_level1 = inputObj.price;
                    prodData.rate = inputObj.tax_rate;
                    prodData.barcode = inputObj.barcode;
                    prodData.visible = '0';

                    //validate PLU duplication
                    var prods = GeckoJS.Session.get('products');

                    if (prodData.no.length <= 0) {

                        NotifyUtils.warn(_('Product number must not be empty.'));
                        return;
                    } else if (prodData.name.length <= 0) {

                        NotifyUtils.warn(_('Product name must not be empty.'));
                        return;
                    } else {
                        if (prods) {
                            for (var i = 0; i < prods.length; i++) {
                                var o = prods[i];
                                if (o.no == prodData.no) {
                                    NotifyUtils.warn(_('Product number [%S] already exists; product not added', [prodData.no]));
                                    return;
                                } else if (o.name.toLowerCase() == prodData.name.toLowerCase() && o.cate_no == prodData.cate_no) {
                                    if (!GREUtils.Dialog.confirm(this.topmostWindow,
                                                                _('Duplicate Product Name [%S]', [prodData.name]),
                                                                _('One or more products with name [%S] already exist in department no. [%S]. Are you sure this is the name you want?', [prodData.name, prodData.cate_no]))) {
                                        NotifyUtils.warn(_('Product name [%S] already exists in department no. [%S]; product not added', [prodData.name, prodData.cate_no]));
                                        return;
                                    }
                                    break;
                                }
                            }
                        }
                    }

                    var learningGroup = GeckoJS.Configure.read('vivipos.fec.settings.BarcodeLearningPLUGroup');
                    if(learningGroup != 'none') {
                        prodData.link_group = learningGroup;
                    }

                    // inherit unit of sale from category if scale department
                    var departments = GeckoJS.Session.get('categories') || [];
                    for (var d in departments) {
                        if(departments[d].no == prodData.cate_no) {
                            var department = departments[d];
                            break;
                        }
                    }
                    if (department) {
                        prodData.sale_unit = department.sale_unit;
                    }

                    var newProduct = productModel.save(prodData);
                    // need to retrieve product id
                    if (newProduct != null) {
                        productModel.setProduct(newProduct.id, newProduct);
                    } else {
                    }
                } else {
                }
            }catch(e){
                this.log(e);
            }
        },

        getDefaultRate: function() {
            var defaultTax = GeckoJS.Configure.read('vivipos.fec.settings.DefaultTaxStatus');
            if (defaultTax != null) {
                let defaultRate = this.Tax.getTaxById(defaultTax);
                if (defaultRate) {
                    return defaultRate;
                }
            }

            var taxes = GeckoJS.Session.get('taxes');
            if (taxes == null) taxes = this.Tax.getTaxList();
            if (taxes != null && taxes.length > 0) return taxes[0];
            return null;
        },

        getFirstDepartment: function() {
            var data = GeckoJS.Session.get('categories');
            for (var d in data) {
                return data[d];
            }
        },

        getRate: function () {
            var rate = $('#tax_rate').val();
            var aURL = 'chrome://viviecr/content/select_tax.xul';
            var screenwidth  = GeckoJS.Session.get('screenwidth') || 800;
            var screenheight = GeckoJS.Session.get('screenheight') || 600;
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                rate: rate
            };

            var taxes = GeckoJS.Session.get('taxes');
            if(taxes == null) taxes = this.Tax.getTaxList() || [];

            inputObj.taxes = taxes;

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, 'select_rate', aFeatures, inputObj);
            if (inputObj.ok) {
                $('#tax_rate').val(inputObj.rate);
                $('#tax_value').val(inputObj.name);
            }
        },

        getDepartment: function () {
            var cate_no = $('#department_no').val();
            var cates_data = GeckoJS.Session.get('categories');
            var screenwidth  = GeckoJS.Session.get('screenwidth') || 800;
            var screenheight = GeckoJS.Session.get('screenheight') || 600;
            var aURL = 'chrome://viviecr/content/select_department.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + screenwidth + ',height=' + screenheight;
            var inputObj = {
                cate_no: cate_no,
                depsData: cates_data
            };
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, 'select_department', aFeatures, inputObj);

            if (inputObj.ok && inputObj.cate_no) {
                $('#department_no').val(inputObj.cate_no);
                $('#department_value').val(inputObj.cate_name);
            }
        }
    };

    AppController.extend(__controller__);


    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'BarcodeLearning');
                                      });

    }, false);
})();

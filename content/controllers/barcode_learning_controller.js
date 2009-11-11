(function(){

    var __controller__ = {

        name: 'BarcodeLearning',

        components: ['Tax'],

        initial: function() {
            var cart = GeckoJS.Controller.getInstanceByName('Cart');
            cart.addEventListener('beforeBarcodeLearning', this.addBarcodeLearningItem, this);
        },

        addBarcodeLearningItem: function(evt) {
            try {
                var barcode     = evt.data.barcode;
                var pluNumber   = barcode;
                var productName = barcode;
                var price       = 0;
                var tax         = this.getDefaultRate();
                var department  = this.getFirstDepartment();
                var aURL        = 'chrome://viviecr/content/prompt_addbarcodelearningitem.xul';
                var aFeatures   = 'chrome,titlebar,toolbar,centerscreen,modal,width=600,height=500';

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
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=600,height=450';
            var inputObj = {
                rate: rate
            };

            var taxes = GeckoJS.Session.get('taxes');
            if(taxes == null) taxes = this.Tax.getTaxList();

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

            var aURL = 'chrome://viviecr/content/select_department.xul';
            var features = 'chrome,titlebar,toolbar,centerscreen,modal,width=600,height=500';
            var inputObj = {
                cate_no: cate_no,
                depsData: cates_data
            };
            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, 'select_department', features, inputObj);

            if (inputObj.ok && inputObj.cate_no) {
                $('#department_no').val(inputObj.cate_no);
                $('#department_value').val(inputObj.cate_name);
            }
        }
    };

    GeckoJS.Controller.extend(__controller__);


    // register onload
    window.addEventListener('load', function() {
        var main = GeckoJS.Controller.getInstanceByName('Main');
        if(main) main.addEventListener('afterInitial', function() {
                                            main.requestCommand('initial', null, 'BarcodeLearning');
                                      });

    }, false);
})();

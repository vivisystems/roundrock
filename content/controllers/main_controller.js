(function(){

    /**
     * Class ViviPOS.MainController
     */
    GeckoJS.Controller.extend( {

        name: 'Main',
        screenwidth: 800,
        screenheight: 600,

        checkClerk: function () {

            var confs = GeckoJS.Configure.read('vivipos.fec.settings');

            // GREUtils.log(GeckoJS.BaseObject.dump(confs));
            if (confs.DefaultLogin) {
                this.Acl.securityCheck("achang", "1111")
            }

            var user = this.Acl.getUserPrincipal();

            if ( user == null) {
                $do('ChangeUserDialog', null, 'Main');
            } else {
                $('#clerk').val(user.username);
            }
        },

        SysConfigDialog: function () {
            var aURL = "chrome://viviecr/content/sysconfig.xul";
            var aName = "SysConfig";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
        },

        ControlPanelDialog: function () {
            var aURL = "chrome://viviecr/content/controlPanel.xul";
            var aName = "SysConfig";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
        },


        ChangeUserDialog: function () {
            var aURL = "chrome://viviecr/content/changeuser.xul";
            var aName = "ChangeUser";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;

            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
        },

        ClockInOutDialog: function () {
            var aURL = "chrome://viviecr/content/clockinout.xul";
            var aName = "Clock In/Out";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;

            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
        },

        PLUSearchDialog: function () {
            
            var aURL = "chrome://viviecr/content/plusearch.xul";
            var aName = "PLUSearch";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = 410;
            var height = 760;
            //$do('load', null, 'Categories');
            GREUtils.Dialog.openDialog(window, aURL, aName, aArguments, posX, posY, width, height);
        },

        SelectQueueDialog: function () {
            
            var aURL = "chrome://viviecr/content/selectqueue.xul";
            var aName = "SelectQueue";
            var aArguments = "";
            var posX = (this.screenwidth - 640) / 2;
            var posY = (this.screenheight - 480) / 2;
            var width = 640;
            var height = 480;

            var args = {
              result: false,
              data: null
            };
            args.wrappedJSObject = args;
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, args);
            
            if (args.result) {
                this.requestCommand('pushQueue',null,'Main');
                this.requestCommand('pullQueue',args.data, 'Cart');
            }

        },

        WizardDialog: function () {
            var aURL = "chrome://viviecr/content/firstuse.xul";
            var aName = "First Run";
            var aArguments = "";
            var posX = 0;
            var posY = 0;
            var width = this.screenwidth;
            var height = this.screenheight;
            GREUtils.Dialog.openWindow(window, aURL, aName, "chrome,dialog,modal,dependent=yes,resize=no,top=" + posX + ",left=" + posY + ",width=" + width + ",height=" + height, "");
        },

        createPluPanel: function () {

            var categories, products, barcodesIndexes = {}, productsIndexesByCate= {};

            var cateModel = new CategoryModel();
            categories = cateModel.find('all', {
                order: "no"
            });
            GeckoJS.Session.add('categories', categories);

            // bind categories data
            var catePanelView =  new NSICategoriesView();
            var catescrollablepanel = document.getElementById('catescrollablepanel');
            catescrollablepanel.setAttribute('rows', GeckoJS.Configure.read('vivipos.fec.settings.DepartmentRows'));
            catescrollablepanel.setAttribute('cols', GeckoJS.Configure.read('vivipos.fec.settings.DepartmentCols'));
            //catescrollablepanel.setAttribute('hideScrollbar', false);
            catescrollablepanel.initGrid();

            catescrollablepanel.datasource = catePanelView;


            var prodModel = new ProductModel();
            var products = prodModel.find('all', {
                order: "cate_no"
            });

            for (var pidx in products) {
                var product = products[pidx];
                var catno = product['cate_no'];
                if (typeof catno == 'undefined') continue;
                var barcode = product['barcode'];

                if (typeof productsIndexesByCate[catno] == 'undefined') {
                    productsIndexesByCate[catno] = [];
                }

                productsIndexesByCate[catno].push(pidx);


                barcodesIndexes[barcode] = pidx;

            };

            GeckoJS.Session.add('products', products);

            GeckoJS.Session.add('productsIndexesByCate', productsIndexesByCate);
            GeckoJS.Session.add('barcodesIndexes', barcodesIndexes);

            // bind plu data
            var firstCateNo = categories[0]['no'];
            var prodscrollablepanel = document.getElementById('prodscrollablepanel');
            prodscrollablepanel.setAttribute('rows', GeckoJS.Configure.read('vivipos.fec.settings.PluRows'));
            prodscrollablepanel.setAttribute('cols', GeckoJS.Configure.read('vivipos.fec.settings.PluCols'));
            prodscrollablepanel.initGrid();

            var productPanelView = new NSIProductsView(productsIndexesByCate[firstCateNo]);
            prodscrollablepanel.datasource = productPanelView;

        },

        changePluPanel: function(index) {

            var categories = GeckoJS.Session.get('categories');
            var productsIndexesByCate = GeckoJS.Session.get('productsIndexesByCate');
            var cateNo = categories[index]['no'];

            var prodscrollablepanel = document.getElementById('prodscrollablepanel');
            prodscrollablepanel.datasource = productsIndexesByCate[cateNo];

        },

        clickPluPanel: function(index) {

            var products = GeckoJS.Session.get('products');
            var prodscrollablepanel = document.getElementById('prodscrollablepanel');
            var productIndex = prodscrollablepanel.datasource.getCurrentIndexData(index);
            //            alert(index + "," + productIndex);
            return this.requestCommand('addItem',products[productIndex],'Cart');

        },

        pushQueue: function() {
            $do('pushQueue',$('#cartSimpleListBox')[0].selectedIndex,'Cart');
        
        },

        signOff: function () {
            if (GREUtils.Dialog.confirm(null, "confirm sign-off", "Are you sure to sign off?") == false) {
                return;
            }
            
            this.pushQueue();
            this.Acl.invalidate();
            this.ChangeUserDialog();
            // window.close();
        }

    });

})();


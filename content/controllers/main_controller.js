(function(){

    /**
     * Class ViviPOS.MainController
     */
    GeckoJS.Controller.extend( {

        name: 'Main',
        screenwidth: 800,
        screenheight: 600,

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

        signIn: function(user) {
            return this.Acl.securityCheck(user.username, user.password);
        },

        setClerk: function () {
            var user = this.Acl.getUserPrincipal();

            if (user) {
                // perform user login initialization
                // -> set price level
                //    - if user has role 'vivipos_fec_acl_override_system_price_level', use user default price level
                //    - otherwise use system price level
                var sysPriceLevel = GeckoJS.Configure.read('vivipos.fec.settings.DefaultPriceLevel');
                var userPriceLevel = user.default_price_level;
                var canOverride = (GeckoJS.Array.inArray('vivipos_fec_acl_override_system_price_level', user.Roles) != -1);

                if (userPriceLevel && canOverride) {
                    $do('setPriceLevel', userPriceLevel, 'Cart');
                }
                else {
                    $do('setPriceLevel', sysPriceLevel, 'Cart');
                }
            }
        },

        signOff: function () {
            var autoDiscardCart = GeckoJS.Configure.read('vivipos.fec.settings.autodiscardcart');
            var autoDiscardQueue = GeckoJS.Configure.read('vivipos.fec.settings.autodiscardqueue');
            var mustEmptyQueue = GeckoJS.Configure.read('vivipos.fec.settings.mustemptyqueue');

            var principal = this.Acl.getUserPrincipal();
            var username = principal.username;
            var canQueueOrder = (GeckoJS.Array.inArray('vivipos_fec_acl_queue_order', principal.Roles) != -1);

            var cart = GeckoJS.Session.get('cart');
            //GREUtils.log(GeckoJS.BaseObject.dump(cart));
            var itemCount = (cart == null) ? 0 : cart.getItemCount();

            var promptDiscardCart = (itemCount > 0 && !autoDiscardCart);
            var responseDiscardCart = 2;  // 0: queue, 1: discard, 2: cancel

            if (promptDiscardCart) {
                if (autoDiscardQueue || mustEmptyQueue || !canQueueOrder) {
                    if (!GREUtils.Dialog.confirm(null, 'Sign Off', 'Discard items that have been registered?')) return;
                    responseDiscardCart = 1;
                }
                else {
                    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                            .getService(Components.interfaces.nsIPromptService);
                    var check = {value: false};

                    var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                                prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +
                                prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_CANCEL;

                    var responseDiscardCart = prompts.confirmEx(null, "Sign Off", "What do you want to do with the registered items?",
                                                                flags, "Queue", "Discard", "", null, check);
                    if (responseDiscardCart == 2) return;
                }
            }
            else {
                responseDiscardCart = 1;
            }
            var orders = cart.orderQueue;
            var orderKeys = GeckoJS.BaseObject.getKeys(orders);
            var myOrders = [];
            var responseDiscardQueue = 1; // 0: keep; 1: discard'

            orderKeys.forEach(function (key) {
                var fields = key.split(':');
                var user = fields[fields.length - 1];
                if (username == user) myOrders.push(key);
                });

            var promptDiscardQueue = (!autoDiscardQueue && (responseDiscardCart != 0) && (myOrders.length > 0));

            if (promptDiscardQueue) {
                if (mustEmptyQueue || !canQueueOrder) {
                    if (GREUtils.Dialog.confirm(null, "Sign Off", "You have one or more queued orders. Discard them?") == false) {
                        return;
                    }
                }
                else {
                    var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                            .getService(Components.interfaces.nsIPromptService);
                    var check = {value: false};

                    var flags = prompts.BUTTON_POS_0 * prompts.BUTTON_TITLE_IS_STRING +
                                prompts.BUTTON_POS_1 * prompts.BUTTON_TITLE_IS_STRING  +
                                prompts.BUTTON_POS_2 * prompts.BUTTON_TITLE_CANCEL;

                    var responseDiscardQueue= prompts.confirmEx(null, "Sign Off", "You have one or more queued orders. What do you want to do with them?",
                                                                flags, "Keep", "Discard", "", null, check);
                    if (responseDiscardQueue == 2) return;
                }
            }
            else if (responseDiscardCart == 0) { // queue order
                responseDiscardQueue = 0;
            }

            if (!promptDiscardCart && !promptDiscardQueue)
                if (GREUtils.Dialog.confirm(null, "confirm sign-off", "Are you sure to sign off?") == false) {
                    return;
            }

            if (responseDiscardCart == 1) {
                 $do('clear', null, 'Cart');
            }
            else {
                this.pushQueue();
            }

            if (responseDiscardQueue == 1) {
                myOrders.forEach(function (key) {
                    cart.pullQueue(key);
                });
                delete cart.items;
                cart.items = [];
            }

            this.Acl.invalidate();
            this.ChangeUserDialog();
            // window.close();
        }

    });

})();


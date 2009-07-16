( function() {

    var __controller__ = {

        name: 'ProductImage',

        uses: ['Product'],

        _cartController: null,
        _cartTreeList: null,
        _image: null,

        initial: function() {
            var self = this;
            
            var cartController = this._cartController = GeckoJS.Controller.getInstanceByName('Cart');
            var cartTreeList = this._cartTreeList = document.getElementById('cartList');
            
            if (cartTreeList) {
                cartTreeList.addEventListener('select', function(evt){
                    self.updateImage(evt.target.selectedIndex);
                }, true);

                // initial if from restore.
                self.updateImage(cartTreeList.selectedIndex);
            }

            if(cartController) {
                cartController.addEventListener('onCartViewEmpty', function(evt){
                    self.updateImage(-1);
                });
            }

        },

        updateImage: function(index) {

            var image = this._image = document.getElementById('productImage');
            var defaultImage = image.getAttribute('defaultImage');
            
            var imageSrc = '';
            
            if (index == -1) {
                image.src = null;
            }

            var curTransaction = GeckoJS.Session.get('current_transaction');

            if (curTransaction) {

                var itemObj = curTransaction.getItemAt(index);
                if (itemObj) {
                    var itemId = itemObj.id ;

                    var item = this.Product.getProductById(itemId);

                    if (!itemId || !item) {
                        imageSrc = '';
                    }else {
                        imageSrc = this.getImageUrl(item);
                    }
                }

                if (imageSrc.length >0) {
                    //image.src = 'file://' + imageSrc;
                    image.setAttribute('style', 'background: transparent url(file://' + imageSrc + ') center center no-repeat');
                }else {
                    //image.src = defaultImage;
                    image.removeAttribute('style');
                }
            }
        },

        getImageUrl: function(item) {
            
            var cachedKey = 'pluimages' ;
            var aDstFile = '';

            if (item[cachedKey] === false ) {
                aDstFile = '' ;
            }else if (item[cachedKey]) {
                aDstFile = item[cachedKey];
            }else {

                var datapath = GeckoJS.Configure.read('CurProcD').split('/').slice(0,-1).join('/');
                var sPluDir = datapath + "/images/pluimages/";
                if (!sPluDir) sPluDir = '/data/images/pluimages/';
                sPluDir = (sPluDir + '/').replace(/\/+/g,'/');
                aDstFile = sPluDir + item.no + ".png";
                
                if (GREUtils.File.exists(aDstFile)) {
                    item[cachedKey] = aDstFile ;
                }else {
                    item[cachedKey] = false ;
                    aDstFile = '';
                }
            }
            
            return aDstFile;
            
        },

        destroy: function() {

            var cartTreeList = this._cartTreeList = document.getElementById('cartList');
            if(cartTreeList) {

                cartTreeList.removeEventListener('select', function(evt){
                }, true);

            }

        }

    };
    
    GeckoJS.Controller.extend( __controller__ );

    // mainWindow register stock initial
    var mainWindow = Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("Vivipos:Main");

    if (mainWindow === window) {
        window.addEventListener('load', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(false && main) {
                    main.requestCommand('initial', null, 'ProductImage');
            }
            main.requestCommand('initial', null, 'ProductImage');

        }, false);

        window.addEventListener('unload', function() {
            var main = GeckoJS.Controller.getInstanceByName('Main');
            if(main) {
                main.requestCommand('destroy', null, 'ProductImage');
            }

        }, false);

    }
    
} )();

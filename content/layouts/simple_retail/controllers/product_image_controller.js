( function() {

    var __controller__ = {

        name: 'ProductImage',

        uses: ['Product'],

        _sPluDir: null,
        _cartController: null,
        _cartTreeList: null,
        _image: null,
        _noPhotoImgCounter: 0,

        initial: function() {
            var self = this;

            this._sPluDir = GeckoJS.Session.get('pluimage_directory');
            
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
            
            var imageContainer = document.getElementById('productImagePanelContainer');

            var boxWidth = $(imageContainer).css('width').replace('px','');//.boxObject.width;
            var boxHeight = $(imageContainer).css('height').replace('px','');//.boxObject.height;
            if (boxHeight == 0) boxHeight = boxWidth ;  // xul bug ?

            var imageSrc = '';
            var item;
            var img ;

            var curTransaction = GeckoJS.Session.get('current_transaction');

            if (curTransaction) {

                var itemObj = curTransaction.getItemAt(index);
                if (itemObj) {
                    item = this.Product.getProductById(itemObj.id);

                }
            }
            imageSrc = this.getImageUrl(item);
            
            if (imageSrc.length >0) {
                // image.src = 'file://' + imageSrc;
                // image.setAttribute('style', 'background: transparent url(file://' + imageSrc + ') center center no-repeat');

                // use Image object and onload to resize image.
                img = new Image();
                img.onload = function() {
                    var imgWidth = img.width;
                    var imgHeight = img.height;

                    var wRatio = boxWidth / img.width;
                    var hRatio = boxHeight / img.height;
                    var maxRatio = (wRatio >= hRatio) ? hRatio : wRatio;

                    if (maxRatio < 1) {
                        imgWidth = Math.floor(img.width*maxRatio);
                        imgHeight = Math.floor(img.height*maxRatio);

                    }

                    //$(image).css({width: imgWidth, height: imgHeight, 'max-width': imgWidth, 'max-height': imgHeight});
                    image.style.width = imgWidth + 'px';
                    image.style.height = imgHeight + 'px';
//                        image.style['max-width'] = imgWidth + 'px';
//                        image.style['max-height'] = imgHeight + 'px';

                    image.src = 'file://' + imageSrc;

                }
                img.src = 'file://' + imageSrc;
                imageContainer.setAttribute('style', 'overflow: hidden');

            }else {
                //image.src = defaultImage;
                //image.removeAttribute('style');
                image.style.width = boxWidth + 'px';
                image.style.height = boxHeight + 'px';
//                    image.style['max-width'] = boxWidth + 'px';
//                    image.style['max-height'] = boxHeight + 'px';
                image.src = null;
                var noPhotoImg = 'file://' + this._sPluDir + 'no-photo.png?' + this._noPhotoImgCounter;
                imageContainer.setAttribute('style', 'overflow: hidden; background: transparent url(' + noPhotoImg + ') center center no-repeat');
            }
        },

        getImageUrl: function(item) {

            var cachedKey = 'pluimages' ;
            var aDstFile = '';

            if (item) {
                if (item[cachedKey] === false ) {
                    aDstFile = '' ;
                }else if (item[cachedKey]) {
                    aDstFile = item[cachedKey];
                }else {
                    aDstFile = this._sPluDir + item.no + ".png";

                    if (GREUtils.File.exists(aDstFile)) {

                        // get product image counter
                        var productsById = GeckoJS.Session.get('productsById');
                        var prod = productsById ? productsById[item.id] : null;

                        if (prod) {
                            aDstFile += '?' + prod['imageCounter'];
                        }

                        item[cachedKey] = aDstFile ;
                    }else {
                        item[cachedKey] = false ;
                        aDstFile = '';
                    }
                }
            }

            
            return aDstFile;
            
        },

        incrementNoPhotoImgCounter: function() {
            this._noPhotoImgCounter++;
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

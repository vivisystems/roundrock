(function(){

    if(typeof AppController == 'undefined') {
        include( 'chrome://viviecr/content/controllers/app_controller.js' );
    }
    if(typeof ImageFilesView == 'undefined') {
        include( 'chrome://viviecr/content/helpers/image_file_view.js' );
    }

    var __controller__ = {

       name: 'SelectTemplate',
       helpers: ['Number'],

       screenwidth: 800,
       screenheight: 600,

       _selectedFile : null,
       _selectedIndex : -1,
       _dir:'',
       imagefilesView:{},

       setTemplate: function(index){
         
         var templateName = document.getElementById('templateName');

         var imagePanel = document.getElementById('imagePanel');

         var tmpl = imagePanel.datasource.data[index].leafName.replace('.png','');

         var label = GeckoJS.Configure.read('vivipos.fec.registry.templates.' + tmpl + '.label');
         
            if (label.indexOf('chrome://') == 0) {
                var keystr = 'vivipos.fec.registry.templates.' + tmpl + '.label';
                label = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
            }
            else {
                label = _(label);
            }
                
         templateName.setAttribute('value', label);
       },

       selectBarcode: function(){

            var aURL = 'chrome://viviecr/content/select_tax.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            let barcodes = this.getBarcodeObj();
            var inputObj = {
                taxes: barcodes,
                titleName:_('Select Barcode Type')
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select Barcode Type'), aFeatures, inputObj);
            if (inputObj.ok) {
                this.query('#barcode').val(inputObj.name);
            }
       },
       
       loadBarcodePref: function(){

           
           let barcodes = GeckoJS.Configure.read('vivipos.fec.registry.devicemodels.argox-os-203.barcodetype');

           barcodes = barcodes.split(',');

           /* filter space character*/
           for(var i=0; i<barcodes.length; i++){

                barcodes[i] = jQuery.trim(barcodes[i]);
           }

           return barcodes;
       },

       getBarcodeObj: function(){

           let barcodes = this.loadBarcodePref();
           let barcodeObjList = [];

           for(var i=0; i<barcodes.length; i++){

                barcodeObjList.push({ name:barcodes[i]});
           }
           return barcodeObjList;
       },

       loadImage: function(dir) {

            var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                    .getService( Components.interfaces.nsIWindowMediator ).getMostRecentWindow( 'Vivipos:Main' );

            var deviceController = mainWindow.GeckoJS.Controller.getInstanceByName( 'Devices' );

            var templates = deviceController.getTemplates('label');

            var imageArray =[];

            for(var obj in templates){

                var tpl = { leafName: obj,
                            path: GREUtils.File.chromeToPath(templates[obj].image),
                            fileSize:0};

                imageArray.push(tpl);
            }
            
            this._selectedFile = null;
            this._selectedIndex = -1;
            this._dir = dir;

            this.imagefilesView = new ImageFilesArrayView(imageArray);

            var limitSetting = GeckoJS.Configure.read('vivipos.fec.settings.image.disklimit') || 0;
            if (limitSetting > this._disklimit) this._disklimit = limitSetting;

            this.query('#imagePanel')[0].datasource = this.imagefilesView;

            this.query("#currentUsage").val(this.Number.toReadableSize(this.imagefilesView._totalSize));
            this.query("#totalLimit").val(this.Number.toReadableSize(this._disklimit));
            var percent = Math.ceil(this.imagefilesView._totalSize / this._disklimit *100 );
            this.query("#usageProgressmeter").val(percent);
            this.query("#currentFiles").val(this.Number.format(this.imagefilesView.fileCount));

            this.query('#lblName').val('');
            this.query('#lblSize').val('');
        }
    };

    AppController.extend(__controller__);

})();
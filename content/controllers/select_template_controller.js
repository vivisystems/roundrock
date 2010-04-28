(function(){

    var __controller__ = {

       name: 'SelectTemplate',
       helpers: ['Number'],

       screenwidth: 800,
       screenheight: 600,

       _selectedFile : null,
       _selectedIndex : -1,
       _dir:'',

       setTemplate: function(index){

         var mainWindow = window.mainWindow = Components.classes[ '@mozilla.org/appshell/window-mediator;1' ]
                    .getService( Components.interfaces.nsIWindowMediator ).getMostRecentWindow( 'Vivipos:Main' );

         var deviceController = mainWindow.GeckoJS.Controller.getInstanceByName( 'Devices' );
                
         var templatePanel = document.getElementById('imagePanel');
         var templateName = document.getElementById('templateName');

         var tmpl = templatePanel.datasource.data[index].leafName.split('.')[0];

         let templates = deviceController.getTemplates('label');

                if(tmpl in templates) {
                    let newTemplate = GREUtils.extend({}, templates[tmpl]);
                    newTemplate.name = tmpl;

                    var label = newTemplate.label;
                    if (label.indexOf('chrome://') == 0) {
                        var keystr = 'vivipos.fec.registry.templates.' + tmpl + '.label';
                        label = GeckoJS.StringBundle.getPrefLocalizedString(keystr) || keystr;
                    }
                    else {
                        label = _(label);
                    }
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

            var dir = GREUtils.File.chromeToPath('chrome://viviecr/content/images/labels');
            this._selectedFile = null;
            this._selectedIndex = -1;
            this._dir = dir;

            this.imagefilesView = new ImageFilesView(dir);

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

    GeckoJS.Controller.extend(__controller__);

})();
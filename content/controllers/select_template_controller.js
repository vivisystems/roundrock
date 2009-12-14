(function(){

    var __controller__ = {

       name: 'SelectTemplate',

       screenwidth: 800,
       screenheight: 600,

       setTemplate: function(index){
        
         var templatePanel = document.getElementById('imagePanel');
         var templateName = document.getElementById('templateName');

         var name = templatePanel.datasource.data[index].leafName.split('.')[0] + '.tpl';

         templateName.setAttribute('value', name);
       },

       selectBarcode: function(){

            var aURL = 'chrome://viviecr/content/select_tax.xul';
            var aFeatures = 'chrome,titlebar,toolbar,centerscreen,modal,width=' + this.screenwidth + ',height=' + this.screenheight;
            var inputObj = {
                taxes: [{ name:'Code 39'}]
            };

            GREUtils.Dialog.openWindow(this.topmostWindow, aURL, _('Select Barcode'), aFeatures, inputObj);
            if (inputObj.ok) {}
       }
    };

    GeckoJS.Controller.extend(__controller__);

})();
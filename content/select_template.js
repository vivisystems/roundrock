(function(){

     var inputObj = window.arguments[0];
    /**
     * Window Startup
     */
    function startup() {

        doSetOKCancel(
            function(){

                var templatePanel = document.getElementById('imagePanel');
                var barcode = document.getElementById('barcode');

                if(templatePanel.selectedIndex == -1){

                    GREUtils.Dialog.alert(this.topmostWindow, _('Template'), _('please select a template'));
                    return;
                }
                      

                inputObj.selectedTemplate = templatePanel.datasource.data[templatePanel.selectedIndex].leafName.split('.')[0];
                inputObj.selectedBarcode = barcode.value;

                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return true;                
            }
            );

        var path = GREUtils.File.chromeToPath('chrome://viviecr/content/images/labels');

        $do('loadImage', path, 'ImageManager');

    };

    function setTemplate(){
        
         var templatePanel = document.getElementById('imagePanel');
         var templateName = document.getElementById('templateName');

         var name = templatePanel.datasource.data[templatePanel.selectedIndex].leafName.split('.')[0] + '.tpl';

         templateName.setAttribute('label', name);
    };

    window.addEventListener('load', startup, true);

})();
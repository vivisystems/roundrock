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

                    GREUtils.Dialog.alert(this.topmostWindow, _('Template'), _('Please select a template first'));
                    return;
                }

                if(barcode.value ==''){

                    GREUtils.Dialog.alert(this.topmostWindow, _('Barcode'), _('Please select a barcode type'));
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
        $do('loadImage', null, 'SelectTemplate');
    };

    window.addEventListener('load', startup, true);

})();
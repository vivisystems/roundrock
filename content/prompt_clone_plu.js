(function(){
    var inputObj = window.arguments[0];
    
    /**
     * Controller Startup
     */
    function startup() {
        if (inputObj) {
            $('#title-caption')[0].value = inputObj.title;
            $('#targets-label')[0].value = inputObj.targetsLabel;
            $('#total-count')[0].value = inputObj.targets.length;

            $('#targetscrollablepanel')[0].datasource = inputObj.targets;
        }
        doSetOKCancel(
            function(){
                inputObj.selectedItems = $('#targetscrollablepanel')[0].selectedItems;
                inputObj.cloneSettings = GeckoJS.FormHelper.serializeToObject('settingsForm');

                // make sure at least one settings group is selected
                var selected = false;
                var values = GeckoJS.BaseObject.getValues(inputObj.cloneSettings);
                for (var i = 0; i < values.length; i++) {
                    if (values[i]) {
                        selected = true;
                        break;
                    }
                }

                if (selected) {
                    inputObj.ok = true;
                    return true;
                }
                else {
                    GREUtils.Dialog.alert(window, _('Clone Product'), _('Please select at least one group of settings to clone'));
                    return false;
                }
            },
            function(){
                inputObj.ok = false;
                return true;
            }
        );

    };
  
    window.addEventListener('load', startup, false);

})();

(function(){
    var inputObj = window.arguments[0];
    
    /**
     * Controller Startup
     */
    function startup() {
        if (inputObj) {
            $('#title-caption')[0].label = inputObj.title;
            $('#targets-label')[0].value = inputObj.targetsLabel;

            $('#targetscrollablepanel')[0].datasource = inputObj.targets;
        }
        doSetOKCancel(
            function(){
                inputObj.selectedItems = $('#targetscrollablepanel')[0].selectedItems;
                inputObj.cloneSettings = GeckoJS.FormHelper.serializeToObject('settingsForm');

                inputObj.ok = true;
                return true;
            },
            function(){
                inputObj.ok = false;
                return true;
            }
        );

    };
  
    window.addEventListener('load', startup, false);

})();

(function(){

    var inputObj = window.arguments[0];

    /**
     * Controller Startup
     */
    function startup() {

        var backups = inputObj.backups;
        var panel = document.getElementById('sourcescrollablepanel');
        panel.datasource = backups
        
        panel.selectedIndex = -1;
        panel.selectedItems = [];

        doSetOKCancel(
            function(){

                var selectedIndex = panel.selectedIndex;
                
                if (selectedIndex > -1) {
                    inputObj.name = backups[selectedIndex].name;
                    inputObj.source = backups[selectedIndex].path;
                    inputObj.ok = true;
                }
                else {
                    inputObj.ok = false;
                }

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


(function(){

    var inputObj = window.arguments[0];
    // include controllers  and register itself

    /**
     * Controller Startup
     */
    function startup() {

        var taxes = inputObj.taxes;
        var rate = inputObj.rate;

        for (var selectedIndex=0; selectedIndex<taxes.length; selectedIndex++) {
            if(taxes[selectedIndex].no ==rate) break;
        }
        if(selectedIndex ==taxes.length) selectedIndex = 0;

        window.viewHelper = new opener.GeckoJS.NSITreeViewArray(taxes);

        document.getElementById('taxscrollablepanel').datasource = window.viewHelper ;
        document.getElementById('taxscrollablepanel').selectedIndex = selectedIndex;
        document.getElementById('taxscrollablepanel').selectedItems = [selectedIndex];

        doSetOKCancel(
            function(){

                var items = document.getElementById('taxscrollablepanel').selectedItems;

                if (items.length == 0) {
                    inputObj.rate = '';
                    inputObj.name = '';
                }
                else {
                    var index = items[0];
                    
                    inputObj.rate = taxes[index].no;
                    inputObj.name = taxes[index].name;
                }
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


